import { contextBridge, ipcRenderer } from 'electron'

export const events = {
	send: (channel: string, data?: any) => ipcRenderer.send(channel, data),

	on: (channel: string, callback: (data: any) => void) => {
		ipcRenderer.on(channel, (e, data) => callback(data))
	},

	off: (channel: string, callback: (_: any, data: any) => void) =>
		ipcRenderer.removeListener(channel, callback),
}

contextBridge.exposeInMainWorld('events', events)

export const invoke = ipcRenderer.invoke

contextBridge.exposeInMainWorld('invoke', invoke)
