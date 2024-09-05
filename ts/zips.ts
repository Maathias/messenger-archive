import StreamZip, { ZipEntry } from 'node-stream-zip'

import { ZipError } from './Erros'
import { E_PROGRESS, eProgress } from './emmiters'
import { checkForExisting, identifyEntryProperties } from './Database'

type DupeDb = {
	entries: { [entryName: string]: [number, string] }
	multiple: { [entryName: string]: string[] }
}
type Indexed = { [entryName: string]: string | string[] }
type Handler = (entryName: string, blob: Buffer, type: EntryTypes) => Promise<void>
export type Progress = (title: string, percent: number) => void

export type FileType = 'conversation' | 'group_photos' | 'stickers_used' | 'meta' | 'non-message'

export enum EntryTypes {
	GROUP_PHOTOS = 'group_photos',
	STICKERS_USED = 'stickers_used',
	META = 'meta',
	NON_MESSAGE = 'non-message',
	INBOX_JSON = 'inbox_json',
	INBOX_PHOTOS = 'photos',
	INBOX_VIDEOS = 'videos',
	INBOX_AUDIO = 'audio_files',
	INBOX_FILES = 'files',
	INBOX_GIFS = 'gifs',
}

enum StreamCodes {
	STREAM_INVALID,
	STREAM_SKIPPED,
	STREAM_HANDLED,
}

const knownDirs = {
	conversations: [
		'inbox',
		'e2ee_cutover',
		'archived_threads',
		'filtered_threads',
		'message_requests',
	],
	meta: [
		'autofill_information.json',
		'community_chats_settings.json',
		"messenger_contacts_you've_blocked.json",
		'secret_conversations.json',
		'support_messages.json',
		'your_chat_settings_on_web.json',
		'your_cross-app_messaging_settings.json',
	],
}

function duplicateCheck(entry: ZipEntry, zipPath: string, dupeDb: DupeDb) {
	let crc = entry.crc,
		existing = dupeDb.entries[entry.name]

	if (existing) {
		let [existingCrc, existingZipPath] = existing

		if (existingCrc != crc) {
			// existing is invalid, replace it
			if (existingCrc == 0) {
				existing[0] = crc
				existing[1] = zipPath
				return 'replaced-invalid-duplicate'
			}

			// new entry is invalid, ignore it
			if (crc == 0) return 'ignored-invalid-duplicate'

			if (!dupeDb.multiple[entry.name]) {
				dupeDb.multiple[entry.name] = [zipPath]
			} else {
				dupeDb.multiple[entry.name].push(zipPath)
			}
			return 'mismatched-duplicate-error'
		}

		// matching crcs, don't do anything
		if (existingCrc == crc) {
			return 'ignored-duplicate'
		}
	}

	dupeDb.entries[entry.name] = [crc, zipPath]
	return 'added-new-entry'
}

// function identifyFile(filepath: string) {
// 	let segments = filepath.split('/')

// 	// all zips should have only one directory at the top level
// 	// if after skipping directories, there is only one segment, then something is wrong
// 	if (segments.length < 2) {
// 		throw new ZipError(`Invalid zip structure: '${filepath}'`)
// 	}

// 	if (segments[1] != 'messages') return 'non-message'

// 	if (segments[2] == 'photos') return 'group_photos'
// 	if (segments[2] == 'stickers_used') return 'stickers_used'
// 	if (knownDirs.conversations.includes(segments[2])) return 'conversation'
// 	if (knownDirs.meta.includes(segments[2])) return 'meta'

// 	throw new ZipError(`Unknown zip entry: '${filepath}'`)
// }

function identifyEntry(entryName: string) {
	let segments = entryName.split('/')

	// console.log(segments)

	if (segments.length < 2) {
		throw new ZipError(`Invalid zip structure: '${entryName}'`)
	}

	if (segments[1] != 'messages') return EntryTypes.NON_MESSAGE

	if (segments[2] == 'photos') return EntryTypes.INBOX_PHOTOS
	if (segments[2] == 'stickers_used') return EntryTypes.STICKERS_USED

	if (knownDirs.conversations.includes(segments[2])) {
		let category = segments[4]

		if (category == 'photos') return EntryTypes.INBOX_PHOTOS
		if (category == 'videos') return EntryTypes.INBOX_VIDEOS
		if (category == 'audio') return EntryTypes.INBOX_AUDIO
		if (category == 'files') return EntryTypes.INBOX_FILES
		if (category == 'gifs') return EntryTypes.INBOX_GIFS
		if (category.endsWith('.json')) return EntryTypes.INBOX_JSON
	}
	if (knownDirs.meta.includes(segments[2])) return EntryTypes.META

	throw new ZipError(`Unknown zip entry: '${entryName}'`)
}

function parseRawEntry(entry: ZipEntry, zipPath: string, dupeDb: DupeDb) {
	// ignore directories
	if (entry.isDirectory == true) return

	// const fileType = identifyFile(entry.name)
	const fileType = identifyEntry(entry.name)

	// ignore non-message files
	if (fileType == EntryTypes.NON_MESSAGE) return

	duplicateCheck(entry, zipPath, dupeDb)
}

function scanZips(filepaths: string[]) {
	let scanPromises: Promise<void>[] = []

	var dupeDb: DupeDb = {
		entries: {},
		multiple: {},
	}

	eProgress.emit(E_PROGRESS.PROGRESS_ZIP, 'Scanning zips', 0)
	console.log('[scanning] started')

	for (let zipPath of filepaths) {
		const zip = new StreamZip.async({ file: zipPath })

		let promise = zip
			.entries()
			.then(entries => {
				Object.values(entries).forEach(entry => parseRawEntry(entry, zipPath, dupeDb))
			})
			.catch(err => {
				console.error(err)
				throw new ZipError(`Error reading zip file: ${zipPath}`)
			})
			.finally(() => {
				zip.close()
			})

		scanPromises.push(promise)
	}

	Promise.all(scanPromises).then(() => console.log('[scanning] complete'))

	return Promise.all(scanPromises).then(() => dupeDb)
}

function streamEntry(zip: StreamZip, entry: ZipEntry) {
	return new Promise<[string, Buffer]>((resolve, reject) => {
		zip.stream(entry.name, (err, stream) => {
			if (err || !stream) {
				console.error(`Error streaming ${entry.name}:`, err)
				return reject(err)
			}

			let chunks: any = []
			stream.on('data', chunk => chunks.push(chunk))
			stream.on('end', () => resolve([entry.name, Buffer.concat(chunks)]))
		})
	})
}

function handleEntry([entryName, buffer]: [string, Buffer], handler: Handler) {
	handler(entryName, buffer, identifyEntry(entryName))
	// console.log(`[streaming] ${entryName} handled`)
	return StreamCodes.STREAM_HANDLED
}

function indexDupes(dupeDb: DupeDb) {
	console.log('[indexing] started')
	let indexedEntries: Indexed = {},
		totalEntries = Object.keys(dupeDb.entries).length

	eProgress.emit(E_PROGRESS.PROGRESS_ZIP, 'Indexing entries', 0)

	for (let [entryName, [, zipPath]] of Object.entries(dupeDb.entries)) {
		if (dupeDb.multiple[entryName]) {
			dupeDb.multiple[entryName].push(zipPath)
			indexedEntries[entryName] = dupeDb.multiple[entryName]
		} else indexedEntries[entryName] = zipPath

		let percent = Object.keys(indexedEntries).length / totalEntries
		eProgress.emit(E_PROGRESS.PROGRESS_ZIP, 'Indexing entries', percent)
	}

	// for (let [entryName] of Object.entries(indexedEntries)) {
	// 	const type = identifyEntry(entryName),
	// 		{ fileName, inbox } = identifyEntryProperties(entryName)

	// 	if (type == EntryTypes.INBOX_JSON || type == EntryTypes.META) continue

	// 	// const exists = checkForExisting(type, fileName, inbox)

	// 	// if (exists) {
	// 	// 	// console.log(`[indexing] ${fileName} already exists in the database`)
	// 	// 	delete indexedEntries[entryName]
	// 	// }

	// 	let percent = (Object.keys(indexedEntries).length / totalEntries) * 50 + 50
	// 	eProgress.emit(E_PROGRESS.PROGRESS_ZIP, 'Indexing entries', percent)
	// }

	console.log('[indexing] complete')
	return indexedEntries
}

function streamZips(filePaths: string[], index: Indexed, handler: Handler) {
	let zipPromises: Promise<void>[] = []

	var totalEntries = Object.keys(index).length,
		scope = Math.floor(totalEntries / 200),
		entriesDone = 0

	console.log(`[streaming] started`)

	for (let zipPath of filePaths) {
		let promise = new Promise<void>((resolve, reject) => {
			eProgress.emit(E_PROGRESS.PROGRESS_ZIP, 'Streaming entries', 0)

			const zip = new StreamZip({ file: zipPath, storeEntries: true })

			// Once the zip is ready, process each entry
			zip.on('ready', () => {
				let entryPromises = Object.values(zip.entries())
					// db handling
					.map(async entry => {
						if (entry.isDirectory) return StreamCodes.STREAM_SKIPPED

						// handle mismatched entries
						if (Array.isArray(index[entry.name])) {
							return streamEntry(zip, entry).then(([filename, buff]) => {
								if (buff.every(byte => byte == 0)) return StreamCodes.STREAM_INVALID
								else return handleEntry([filename, buff], handler)
							})
						} else if (index[entry.name] != zipPath) return StreamCodes.STREAM_SKIPPED

						return streamEntry(zip, entry).then(data => handleEntry(data, handler))
					})
					// progress tracking
					.map(p =>
						p.then(code => {
							if (code == StreamCodes.STREAM_HANDLED) entriesDone++

							if (entriesDone > 0)
								// if (entriesDone % scope == 0) {
								eProgress.emit(
									E_PROGRESS.PROGRESS_ZIP,
									'Streaming entries',
									(entriesDone / totalEntries) * 100
								)
							// }
						})
					)

				Promise.all(entryPromises).then(() => {
					zip.close()
					resolve()
				})
			})

			// Handle errors
			zip.on('error', err => {
				throw new ZipError(`Error reading zip file: ${zipPath}`)
			})
		})
		zipPromises.push(promise)
	}

	Promise.all(zipPromises).then(() => console.log(`[streaming] complete`))

	return Promise.all(zipPromises).then(() => totalEntries)
}

function rawFacebookZipsToIndexedBlobs(filePaths: string[], handler: Handler, progress: Progress) {
	let lastProgressTime = process.hrtime.bigint()

	eProgress.on(E_PROGRESS.PROGRESS_ZIP, (title, percent) => {
		let now = process.hrtime.bigint()

		if (Number(now - lastProgressTime) > 25e7) {
			lastProgressTime = now
			progress(title, percent)
		}
	})

	return scanZips(filePaths)
		.then(dupeDb => indexDupes(dupeDb))
		.then(index => streamZips(filePaths, index, handler))
		.finally(() => eProgress.off(E_PROGRESS.PROGRESS_ZIP, progress))
		.catch(err => {
			console.error(err)
			throw err
		})
}

export default rawFacebookZipsToIndexedBlobs

// rawFacebookZipsToIndexedBlobs(
// 	['/vault/Downloads/smol/all-json-no-media.zip'],
// 	async (entryName, blob, type) => {
// 		// handler
// 		// console.log(entryName, type)
// 	},
// 	(title, percent) => {
// 		// progress
// 	}
// )
