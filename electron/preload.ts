import { contextBridge, ipcRenderer } from 'electron'

export const api = {
	send: (channel: string, data?: any) => ipcRenderer.send(channel, data),

	on: (channel: string, callback: (data: any) => void) => {
		ipcRenderer.on(channel, (e, data) => callback(data))
	},

	off: (channel: string, callback: (_: any, data: any) => void) =>
		ipcRenderer.removeListener(channel, callback),
}

contextBridge.exposeInMainWorld('Main', api)
