import { app, BrowserWindow } from 'electron'
import path from 'path'
import listeners from './listeners'

let mainWindow: Electron.BrowserWindow | null

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 700,
		icon: 'assets/icon.png',
		backgroundColor: '#efe9f4',
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	mainWindow.loadFile('build/index.html')

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

app.on('ready', createWindow)
	.whenReady()
	.then(() => listeners(mainWindow!))
	.catch(e => console.error(e))

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
