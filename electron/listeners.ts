import { BrowserWindow, dialog, ipcMain } from 'electron'
import utf8 from 'utf8'

import rawFacebookZipsToIndexedBlobs, { EntryTypes, FileType } from '../ts/zips'
import {
	connectDB,
	getInbox,
	getInboxes,
	getMedia,
	getMessages,
	getStats,
	importInbox,
	importRawEntry,
} from '../ts/Database'
import Inbox from '../ts/Inbox'

import { MAIN_TO_RENDERER, RENDERER_TO_MAIN } from '../ts/types/global'
import { pathOriginalToName } from '../ts/normalizers'

let listeners = (mainWindow: BrowserWindow) => {
	function send(channel: string, ...args: any[]) {
		mainWindow.webContents.send(channel, ...args)
	}

	let events = {}

	for (const chanel in events) ipcMain.on(chanel, events[chanel])

	let handles = {
		[RENDERER_TO_MAIN.GET_ZIP_PATHS]: e => {
			return dialog.showOpenDialog({
				properties: ['openFile', 'multiSelections'],
				filters: [{ name: 'Zip files', extensions: ['zip'] }],
			})
		},
		[RENDERER_TO_MAIN.GET_DB_PATH]: e => {
			return dialog.showSaveDialog({
				filters: [{ name: 'Database', extensions: ['db'] }],
			})
		},
		[RENDERER_TO_MAIN.IMPORT_ZIPS]: async (e, { paths, savePath }) => {
			let inboxes: { [key: string]: Inbox } = {}

			async function handler(entryName: string, blob: Buffer, type: EntryTypes) {
				let out = importRawEntry(entryName, blob, type)

				if (out) {
					let id = out.raw.thread_path.split('/')[1]

					if (id in inboxes) {
						inboxes[id].append(out.raw)
					} else {
						inboxes[id] = new Inbox(entryName, out.raw)
					}
				}
			}

			connectDB(savePath)

			return new Promise((resolve, reject) => {
				send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['main', 'Extraxting zip files', 1])
				// send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['sub', 'Extraxting zip files', 0])

				const progress = (title: string, percent: number) => {
					send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['sub', title, percent])
				}

				rawFacebookZipsToIndexedBlobs(paths, handler, progress).then(() => {
					send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['main', 'Analyzing conversations', 2])
					// send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['sub', 'Analyzing conversations', 0])

					const inboxList = Object.values(inboxes),
						totalInboxes = inboxList.length

					// estimate the owner between all inboxes,
					// by getting the most common participant
					let nameCount = Object.entries(
							inboxList
								// .filter(i => i.meta?.type == 'Regular') // ignore groups
								.reduce((sum, inbox) => {
									// count participant occurrences
									inbox.participants.forEach(({ name }) =>
										sum[name] ? sum[name]++ : (sum[name] = 1)
									)
									return sum
								}, {} as { [name: string]: number })
						),
						rawOwner = nameCount.reduce(
							// reduce to the most common participant
							([name, count], next) => (next[1] > count ? next : [name, count]),
							['', 0]
						)[0],
						owner = utf8.decode(rawOwner)

					console.log(`[owner] ${owner}`)

					inboxList.forEach((inbox, i) => {
						let overall = (i / totalInboxes) * 100
						send(MAIN_TO_RENDERER.UPDATE_PROGRESS, [
							'sub',
							`Analyzing (${inbox.title})`,
							overall,
						])
						inbox.finalize(owner)
					})

					send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['main', 'Saving conversations', 3])

					inboxList.forEach((inbox, i) => {
						importInbox(inbox, (title, percent) => {
							let overall = ((i + percent) / totalInboxes) * 100
							send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['sub', `Saving (${title})`, overall])
						})
					})

					send(MAIN_TO_RENDERER.UPDATE_PROGRESS, ['sub', 'Saving messages', 100])
					resolve(getInboxes())
				})
			})
		},
		[RENDERER_TO_MAIN.IMPORT_DB]: (e, path) => {
			connectDB(path)
			return getInboxes()
		},
		[RENDERER_TO_MAIN.GET_INBOXES]: e => {
			let payload = getInboxes()
			if (!payload) console.log(`[api] getInboxes() empty result`)
			return payload
		},
		[RENDERER_TO_MAIN.GET_INBOX]: (e, id) => {
			let payload = getInbox(id)
			if (!payload) console.log(`[api] getInbox(${id}) empty result`)
			return payload
		},
		[RENDERER_TO_MAIN.GET_MESSAGES]: (e, { id, from, to }) => {
			let payload = getMessages(id, from, to)
			if (!payload) console.log(`[api] getMessages(${id}, ${from}, ${to}) empty result`)
			return payload
		},
		[RENDERER_TO_MAIN.GET_MEDIA]: (e, { id, type, uri }) => {
			let segments = uri.split('/'),
				file = segments[segments.length - 1],
				inbox = segments[1]

			let payload = getMedia(type, file, inbox)
			if (!payload) console.log(`[api] getMedia(${type}, ${file}, ${inbox}) empty result`)
			return payload
		},
		[RENDERER_TO_MAIN.GET_STATS]: (e, { id, stat }) => {
			let payload = getStats(id, stat)
			if (!payload) console.log(`[api] getStats(${id}, ${stat}) empty result`)
			return payload
		},
	}

	for (const chanel in handles) ipcMain.handle(chanel, handles[chanel])
}

export default listeners
