import { BrowserWindow, dialog, ipcMain } from 'electron'
import { Convos, scan } from '../ts'

import { readFileSync } from 'fs'

let listeners = (mainWindow: BrowserWindow) => {
	let events = {}

	for (const chanel in events) ipcMain.on(chanel, events[chanel])

	let handles = {
		'get-paths': async e => {
			return await dialog.showOpenDialog({
				properties: ['openDirectory', 'multiSelections'],
			})
		},
		'scan': async (e, { paths }) => {
			return await scan(paths, {}, (...progress) => {
				mainWindow.webContents.send('update-progress', progress)
			}).then(convosIds => {
				mainWindow.webContents.send('update-convos-ids', convosIds)

				return convosIds
			})
		},
		'get-convo': async (e, id) => {
			if (id in Convos) return JSON.stringify(Convos[id])
			else return null
		},
	}

	for (const chanel in handles) ipcMain.handle(chanel, handles[chanel])
}

export default listeners
