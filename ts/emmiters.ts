import { EventEmitter } from 'events'

export const eProgress = new EventEmitter()
export enum E_PROGRESS {
	PROGRESS_ZIP = 'progress-zip',
}
