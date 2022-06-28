import { BrowserWindow, dialog, ipcMain } from 'electron'
import { scan } from '../ts'
// import { scan } from '../ts'

let listeners = (mainWindow: BrowserWindow) => {
	let events = {
		'get-paths': (_, message) => {
			dialog
				.showOpenDialog({
					properties: ['openDirectory', 'multiSelections'],
				})
				.then(data => {
					mainWindow.webContents.send('add-paths', data)
				})
		},
		'scan': (_, { paths }: { paths: string[] }) => {
			scan(paths, {}, (...progress) => {
				mainWindow.webContents.send('update-progress', progress)
			})
		},
	}

	for (const chanel in events) ipcMain.on(chanel, events[chanel])
}

export default listeners
