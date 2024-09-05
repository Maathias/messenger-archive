import { RENDERER_TO_MAIN } from '../ts/types/global'

export class Member {
	name: string
	participates: boolean
	self: boolean

	constructor(raw) {
		this.name = raw.name
		this.participates = !!raw.participates
		this.self = !!raw.self
	}
}

export class Inbox {
	id: string
	category: string
	title: string
	thread_path: string
	image?: {
		uri: string
		creation_timestamp: number
	}
	is_still_participant: boolean
	participants: Member[]

	joinable_mode?: {
		mode: number
		link: string
	}
	magic_words?: any[]
	meta: any
	messageCount: number

	messages: Message[]
	range: [number, number]

	static mediaKeys = ['photos', 'gifs', 'videos', 'audio_files', 'files', 'sticker', 'share']

	constructor(raw) {
		this.id = raw.id
		this.category = raw.category
		this.title = raw.title
		this.thread_path = raw.thread_path
		this.is_still_participant = !!raw.is_still_participant
		this.messageCount = raw.messageCount
		this.messages = []
		this.range = [-1, -1]

		this.participants = JSON.parse(raw.participants).map(p => new Member(p))
		this.joinable_mode = JSON.parse(raw.joinable_mode)
		this.meta = JSON.parse(raw.meta)

		if (raw.image) this.image = JSON.parse(raw.image)
		if (raw.magic_words) this.magic_words = JSON.parse(raw.magic_words)
	}

	async setRange(range: [number, number]) {
		let [from, to] = range

		if (from < this.meta.firstMessage) from = this.meta.firstMessage
		if (to > this.meta.lastMessage) to = this.meta.lastMessage

		if (from > to || from == to) {
			from = this.meta.firstMessage
			to = this.meta.lastMessage
		}

		let rawMessages = await window.invoke(RENDERER_TO_MAIN.GET_MESSAGES, {
			id: this.id,
			from: range[0],
			to: range[1],
		})

		this.messages = rawMessages
			.map(m => new Message(m))
			.sort((a, b) => a.timestamp_ms - b.timestamp_ms)
		this.range = range
	}

	resetRange() {
		this.range = [-1, -1]
		this.messages = []
	}

	isOwner(name: string) {
		return this.participants.filter(p => p.name == name && p.self).length == 1
	}

	getStats(statName: string) {
		return window
			.invoke(RENDERER_TO_MAIN.GET_STATS, {
				id: this.id,
				stat: statName,
			})
			.then(raw => JSON.parse(raw.content))
	}
}

export class Message {
	inbox: string
	sender_name: string
	timestamp_ms: number
	is_geoblocked_for_viewer: boolean

	content: string
	is_unsent: boolean

	ip?: string
	call_duration?: number
	missed?: boolean

	photos?: { uri: string; creation_timestamp: number }[]
	gifs?: { uri: string }[]
	videos?: { uri: string; creation_timestamp: number }[]
	audio_files?: { uri: string; creation_timestamp: number }[]
	files?: { uri: string; creation_timestamp: number }[]
	sticker?: { uri: string; ai_stickers: { [k: string]: unknown }[] }
	share?: { link?: string; share_text?: string }
	reactions?: { reaction: string; actor: string }[]

	constructor(raw) {
		this.inbox = raw.inbox
		this.sender_name = raw.sender_name
		this.timestamp_ms = raw.timestamp_ms
		this.is_geoblocked_for_viewer = !!raw.is_geoblocked_for_viewer

		this.content = raw.content
		this.is_unsent = !!raw.is_unsent

		if (raw.ip) this.ip = raw.ip
		if (raw.call_duration) this.call_duration = raw.call_duration
		if (raw.missed) this.missed = raw.missed

		if (raw.photos) this.photos = JSON.parse(raw.photos)
		if (raw.gifs) this.gifs = JSON.parse(raw.gifs)
		if (raw.videos) this.videos = JSON.parse(raw.videos)
		if (raw.audio_files) this.audio_files = JSON.parse(raw.audio_files)
		if (raw.files) this.files = JSON.parse(raw.files)
		if (raw.sticker) this.sticker = JSON.parse(raw.sticker)
		if (raw.share) this.share = JSON.parse(raw.share)

		if (raw.reactions) {
			let parsed = JSON.parse(raw.reactions)

			// fix older black emojis for newer ones
			parsed.forEach(r => {
				if (r.reaction == '❤') r.reaction = '❤️'
			})

			this.reactions = parsed
		}
	}
}
