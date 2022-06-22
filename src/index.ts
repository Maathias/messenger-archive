import sqlite from 'sqlite3'
import fs from 'fs'
import path from 'path'
import utf8 from 'utf8'

// TODO: some object can have better typing
// TODO: no modules, need to separate into files
// TODO: there for sure is an exception without a catch statement
// FIXME: also some rejections are purposley left uncaught
// the intention is to exit and for a user to intervene
// but I don't think that behaves consistently
// TODO: add electron
// TODO: add cra-typescript

import { messagesPart } from 'takeoutSchema'

function prepareDirs() {
	const dirs = [
		'data',
		'data/photos',
		'data/videos',
		'data/audio',
		'data/gifs',
		'data/files',
	]
	for (let dir of dirs) {
		if (!fs.existsSync(dir)) {
			console.info(` ✕ ${dir} not found, creating`)
			fs.mkdirSync(dir)
		}
	}

	console.info(` ✓ dirs ok`)

	if (!fs.existsSync(master)) {
		console.info(` ✕ supplied master dir doesn't exist`)
		process.exit(1)
	}
}

function prepareDb() {
	return new Promise((resolve, reject) => {
		const sqlInit = fs.readFileSync('sql/init.sql').toString()

		db.exec(sqlInit, err => {
			if (err) throw err
			else {
				resolve(true)
				console.info(` ✓ db ok `)
			}
		})
	})
}

async function getInboxes(master: string) {
	const scanDirs = [
			'archived_threads',
			'filtered_threads',
			'inbox',
			'message_requests',
		],
		availableDirs = fs.readdirSync(master).filter(d => scanDirs.includes(d)),
		inboxes: [string, string][] = []

	for (let dir of availableDirs) {
		let subs = fs.readdirSync(path.join(master, dir))
		for (let inbox of subs) {
			inboxes.push([path.join(dir, inbox), dir])
		}
	}

	console.info(` ⇒ found ${inboxes.length} inboxes`)

	return inboxes
}

function parseInbox(
	dir: string,
	cat: string
): Promise<{
	[inboxId: string]: { parts: string[]; dir: string; knownSenders: string[] }
}> {
	// FIXME: inconsistent string escaping
	// didn't check if all variables/inserts have escaped string
	return new Promise((resolve, reject) => {
		const inboxIdPattern = /_[^\/]*?$/,
			groupPhotoPattern = /messages\/.+\/(\S+\..+)$/,
			messagePartRegex = /message_\d+\.json/

		let inboxId = inboxIdPattern.exec(dir)![0].slice(-10)

		console.info(` ⇒ parsing inbox '${inboxId}'`)

		const messageParts = fs
			.readdirSync(path.join(master, dir))
			.filter(f => f.match(messagePartRegex))

		fs.readFile(path.join(master, dir, messageParts[0]), (err, buffer) => {
			let { title, thread_type, participants, image }: messagesPart =
				JSON.parse(buffer.toString())

			title = utf8.decode(title)

			let knownSenders = participants.map((p: { name: string }) => p.name)

			var inbox = {
				[inboxId]: { parts: messageParts, dir, knownSenders },
			}

			// console.info(
			// 	` ⇒ '${inboxId}' (${partData.title}) is a '${partData.thread_type}'  `
			// )

			// // update inbox metadata
			// db.run(
			// 	`UPDATE inboxes SET title="${partData.title}", thread="${partData.thread_type}" WHERE id="${inboxId}"`
			// )

			db.run(
				`INSERT or FAIL INTO inboxes VALUES ($inbox, $cat, $title, $thread)`,
				{
					$inbox: inboxId,
					$cat: cat,
					$title: title,
					$thread: thread_type,
				},
				(err: ErrorQuery) => {
					if (!err || err?.errno == 19) {
						console.info(
							` ✓ inbox '${inboxId}' ${
								err?.errno == 19 ? 'exists' : 'added'
							} "${title}" (${thread_type}) with ${
								knownSenders.length
							} participants`
						)

						if (image) {
							db.run(
								`INSERT or FAIL INTO group_photos VALUES ($uri, $creation, $inbox)`,
								{
									$uri:
										groupPhotoPattern.exec(image.uri)?.[1] ??
										image.uri,
									$creation: image.creation_timestamp,
									$inbox: inboxId,
								},
								(err: ErrorQuery) => {
									if (!err || err?.errno == 19) {
										console.info(` ✓ saved '${inboxId}' group photo `)
										resolve(inbox)
									} else reject(err)
								}
							)
						} else resolve(inbox)
					} else reject(err)
				}
			)
		})
	})
}

function parsePart(
	inboxId: string,
	knownSenders: string[],
	dir: string,
	partName: string
): [
	number,
	Promise<{ [type: string]: { ok: number; dup: number; fail?: number } }>
] {
	var results = {
			messages: { ok: 0, dup: 0 },
			reactions: { ok: 0, dup: 0 },
			shares: { ok: 0, dup: 0 },
			media: { ok: 0, dup: 0, fail: 0 },
		},
		pending: Promise<{}>[] = []

	// new Promise((resolveFile) => {
	let buffer = fs.readFileSync(path.join(master, dir, partName))

	let partData: messagesPart = JSON.parse(buffer.toString())

	// console.info(` ✓ loaded ${inboxId}/${partName} `)

	const scanMedia = ['photos', 'audio_files', 'files', 'gifs', 'videos'],
		mediaLables: { [key: string]: [string, string] } = {
			// key: [dir, table]
			photos: ['photos', 'photos'],
			videos: ['videos', 'videos'],
			audio_files: ['audio', 'audios'],
			files: ['files', 'files'],
			gifs: ['gifs', 'gifs'],
		}

	let seenSenders: string[] = []

	for (let message of partData.messages) {
		// fix encoding
		message.sender_name = utf8.decode(message.sender_name)
		message.content = message.content ? utf8.decode(message.content) : ''

		// keep track of seen senders
		if (!seenSenders.includes(message.sender_name)) {
			seenSenders.push(message.sender_name)

			parseParticipant(
				message.sender_name,
				inboxId,
				knownSenders.includes(message.sender_name)
			)
		}

		// get media present in current message
		const availableMediaTypes = Object.keys(message).filter(k =>
			scanMedia.includes(k)
		)

		// FIXME: wrong type label
		// labels, dirs, and tables need to be organised better

		// override message category, based on included media
		message.type =
			availableMediaTypes.length > 0
				? availableMediaTypes.join('+')
				: message.type

		// insert message to db
		pending.push(
			new Promise((resolveMessage, rejectMessage) => {
				db.run(
					`INSERT INTO messages VALUES ($sender, $timestamp, $inbox, $content, $type, $unsent)`,
					{
						$unsent: message.is_unsent,
						$type: message.type,
						$timestamp: message.timestamp_ms,
						$inbox: inboxId,
						$sender: message.sender_name,
						$content: message.content,
					},
					(err: ErrorQuery) => {
						if (!err || err?.errno == 19) {
							err?.errno == 19
								? results.messages.dup++
								: results.messages.ok++
							resolveMessage(results)
						} else rejectMessage(err)
					}
				)
			})
		)

		// parse detected media
		for (let mediaType of availableMediaTypes)
			for (let { uri, creation_timestamp } of message[mediaType]!)
				pending.push(
					new Promise((resolveMedia, rejectMedia) => {
						const mediaFilenamePattern = /messages\/.+\/.+\/(\S+\..+)$/

						// get filename only
						uri = mediaFilenamePattern.exec(uri)![1]

						db.run(
							`INSERT INTO ${mediaLables[mediaType][1]} VALUES ($uri, $created, $inbox, $message_sender, $message_created)`,
							{
								$uri: uri,
								$created: creation_timestamp,
								$inbox: inboxId,
								$message_sender: message.sender_name,
								$message_created: message.timestamp_ms,
							},
							(dberr: ErrorQuery) => {
								if (!dberr || dberr?.errno == 19) {
									if (dberr?.errno == 19) {
										results.media.dup++
										logErrors(dberr, uri)
										resolveMedia(results)
									} else
										fs.rename(
											path.join(
												master,
												dir,
												mediaLables[mediaType][0],
												uri
											),
											path.join(
												'data',
												mediaLables[mediaType][0],
												uri
											),
											fserr => {
												if (fserr) {
													logErrors(fserr, uri)
													results.media.fail++
												} else {
													results.media.ok++
												}

												resolveMedia(results)
											}
										)
								} else rejectMedia(dberr)
							}
						)
					})
				)

		// parse reactions
		if ('reactions' in message)
			pending.push(
				new Promise((resolveReaction, rejectReaction) => {
					for (let { reaction, actor } of message.reactions!) {
						db.run(
							`INSERT INTO reactions VALUES ($sender, $timestamp, $inbox, $reaction, $actor)`,
							{
								$sender: message.sender_name,
								$timestamp: message.timestamp_ms,
								$inbox: inboxId,
								$reaction: reaction,
								$actor: actor,
							},
							(err: ErrorQuery) => {
								if (!err || err?.errno == 19) {
									err?.errno == 19
										? results.reactions.dup++
										: results.reactions.ok++
									resolveReaction(results)
								} else rejectReaction(err)
							}
						)
					}
				})
			)

		if ('share' in message)
			pending.push(
				new Promise((resolveShare, rejectShare) => {
					db.run(
						`INSERT INTO shares VALUES ($sender, $timestamp, $inbox, $link)`,
						{
							$sender: message.sender_name,
							$timestamp: message.timestamp_ms,
							$inbox: inboxId,
							$link: message.share?.link,
						},
						(err: ErrorQuery) => {
							if (!err || err?.errno == 19) {
								err?.errno == 19
									? results.shares.dup++
									: results.shares.ok++
								resolveShare(results)
							} else rejectShare(err)
						}
					)
				})
			)
	}

	// console.log(pending)

	// setTimeout(() => {
	// 	console.log(pending.map(p => p))
	// }, 5e3)

	// Promise.all(pending).then(() => console.log('lmao'))

	return [pending.length, Promise.all(pending).then(() => results)]
}

function parseParticipant(
	name: string,
	inboxId: string,
	participates: boolean
) {
	return new Promise((resolve, reject) => {
		db.run(
			`INSERT INTO participants VALUES ($inbox, $uname, $participates) ON CONFLICT(inbox, uname) DO UPDATE SET participates=$participates`,
			{
				$inbox: inboxId,
				$uname: name,
				$participates: participates,
			},
			err => {
				if (err) reject(err)
				else resolve(true)
			}
		)
	})

	// db.all(
	// 	`SELECT uname FROM participants WHERE uname="${name}" and inbox="${inboxId}"`,
	// 	(err, names) => {
	// 		if (names.length < 1)
	// 			db.run(
	// 				`INSERT INTO participants VALUES ("${inboxId}", "${name}", ${participates})`
	// 			)
	// 		else
	// 			db.run(
	// 				`UPDATE participants SET participates=${participates} WHERE uname="${name}" AND inbox="${inboxId}"`
	// 			)
	// 	}
	// )
}

function logErrors({ errno, code }: any, subject: string) {
	errors.write(`${errno} ${code} ${subject} \n`)
}

// TODO: initialization is a mess, all vars are in a random order
// works but ugly

const db = new sqlite.Database('data.db')

const master = './messages'

type ErrorQuery = (Error & { errno: number }) | null // TODO: tf is this doing here

const start = process.hrtime.bigint(),
	errors = fs.createWriteStream('errors.log', { flags: 'w' })

prepareDirs()

await prepareDb()

getInboxes(master)
	.then(inboxes =>
		Promise.all(inboxes.map(([dir, cat]) => parseInbox(dir, cat)))
	)
	.then(inboxParts =>
		inboxParts.reduce((namedParts, part) => {
			return { ...namedParts, ...part }
		}, {})
	)
	.then(inboxParts => {
		// FIXME: those types are a total mess
		var totalResults: { [key: string]: { [key: string]: {} } } = {
				messages: { ok: 0, dup: 0 },
				reactions: { ok: 0, dup: 0 },
				shares: { ok: 0, dup: 0 },
				media: { ok: 0, dup: 0, fail: 0 },
			},
			totalPending: Promise<any>[] = []

		for (let inboxId in inboxParts) {
			const { dir, parts, knownSenders } = inboxParts[inboxId]
			parts
				.map(part => parsePart(inboxId, knownSenders, dir, part))
				.map(([nPending, pending], i) => {
					console.info(
						` ⇒ in '${inboxId}'/${i + 1} ${nPending} pending actions`
					)
					totalPending.push(pending)
					return pending
				})
				.map((pending, i) =>
					pending.then(() => {
						console.info(` ✓ resolved '${inboxId}'/${i + 1}`)
					})
				)
		}

		Promise.all(totalPending).then(allResults => {
			allResults.forEach(results => {
				for (let type in results) {
					for (let status in results[type])
						totalResults[type][status] += results[type][status]
				}
			})
			// TODO: this can be done in a prettier way, right...?
			console.info(` ⇒ all parts resolved`)
			console.info(`             ✓ ok   ⇊ dup  ✕ fail `)
			console.info(
				`   media     ${totalResults.media.ok
					.toString()
					.padEnd(6, ' ')} ${totalResults.media.dup
					.toString()
					.padEnd(6, ' ')} ${totalResults.media
					.fail!.toString()
					.padEnd(6, ' ')}`
			)
			console.info(
				`   messages  ${totalResults.messages.ok
					.toString()
					.padEnd(6, ' ')} ${totalResults.messages.dup
					.toString()
					.padEnd(6, ' ')}`
			)
			console.info(
				`   shares    ${totalResults.shares.ok
					.toString()
					.padEnd(6, ' ')} ${totalResults.shares.dup
					.toString()
					.padEnd(6, ' ')}`
			)
			console.info(
				`   reactions ${totalResults.reactions.ok
					.toString()
					.padEnd(6, ' ')} ${totalResults.reactions.dup
					.toString()
					.padEnd(6, ' ')}`
			)

			console.info(
				`\n ⏲  Total time: ${(
					Number(process.hrtime.bigint() - start) / 1e9
				).toFixed(2)} seconds`
			)
		})
	})
