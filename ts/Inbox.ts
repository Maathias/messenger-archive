import fs from 'fs'
import { join } from 'path'

import { message, messagesPart, messageWithMedia } from './types/takeout'

const inboxIdRegex = /_[^\/]*?$/,
	inboxCatRegex = /\/([^\/])+\/[^\/]+$/,
	messagePartRegex = /message_\d+\.json/

const scanDirs = [
	'archived_threads',
	'filtered_threads',
	'inbox',
	'message_requests',
]

export var findInboxes = (path: string): Promise<Inbox[]> =>
	new Promise((resolve, reject) => {
		if (!fs.existsSync(path)) return reject("Directory doesn't exist")

		const availableDirs = fs
			.readdirSync(path)
			.filter(d => scanDirs.includes(d))

		const inboxes: Inbox[] = []

		for (let dir of availableDirs) {
			for (let inbox of fs.readdirSync(join(path, dir))) {
				inboxes.push(new Inbox(join(path, dir, inbox)))
			}
		}

		resolve(inboxes)
	})

export default class Inbox {
	path: string
	id: string
	category: string
	parts: string[]

	messages: (message & messageWithMedia)[]
	meta!: {
		title: string
		type: string
		participants: string[]
		participates: boolean
		image?: { uri: string; created: number }
		date: number
	}

	constructor(path: string) {
		this.path = path
		this.id = inboxIdRegex.exec(path)![0].slice(-10)
		this.category = inboxCatRegex.exec(path)![0]
		this.parts = []
		this.messages = []

		this.findParts()
	}

	private async findParts() {
		if (this.parts.length != 0) return this.parts

		const availableParts = fs
			.readdirSync(this.path)
			.filter(f => f.match(messagePartRegex))

		this.parts.push(
			...availableParts
				.filter(p => !this.parts.includes(p))
				.map(p => join(this.path, p))
		)
		return this.parts
	}

	async loadParts() {
		if (this.messages.length != 0) return this.messages

		let metas: typeof this.meta[] = []

		for (let partPath of this.parts) {
			let part: messagesPart = JSON.parse(
				fs.readFileSync(partPath).toString()
			)

			metas.push({
				title: part.title,
				type: part.thread_type,
				participants: part.participants.map(p => p.name),
				participates: part.is_still_participant,
				date: part.messages.at(-1)?.timestamp_ms ?? 0,
				image: part.image && {
					uri: part.image.uri,
					created: part.image.creation_timestamp,
				},
			})

			this.messages.push(...part.messages)
		}

		this.meta = metas.sort(({ date: a }, { date: b }) => a - b)[0]

		return this.messages
	}
}
