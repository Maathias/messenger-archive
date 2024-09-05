import crypto from 'crypto'
import Message from './Message'

export function pathOriginalToShort(path: string): string {
	if (path.startsWith('http')) return path
	if (!path.startsWith('your_facebook_activity')) throw new Error('Invalid path ' + path)

	let segments = path.split('/')

	return segments.slice(2).join('/')
}

export function pathShortToOriginal(path: string): string {
	return `your_facebook_activity/messages/${path}`
}

export function pathOriginalToName(path: string): string {
	let segments = path.split('/')
	return segments[segments.length - 1]
}

export function timestampSecToMs(timestamp: number): number {
	return timestamp * 1000
}

export function timestampMsToSec(timestamp: number): number {
	return Math.floor(timestamp / 1000)
}

export function createMessageId(
	inbox: string,
	{ sender_name, timestamp_ms, content }: Message,
	salt?: number
): string {
	let hash = crypto
		.createHash('sha1')
		.update(inbox + sender_name + timestamp_ms)
		.digest('hex')

	if (salt) {
		hash += '_' + salt
	}

	return hash
}

export function createMediaId({ inbox, fileName }, salt?: number): string {
	let hash = crypto
		.createHash('sha1')
		.update(inbox + fileName)
		.digest('hex')

	if (salt) {
		hash += '_' + salt
	}

	return hash
}
