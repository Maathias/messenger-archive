import utf8 from 'utf8'
import { join } from 'path'
import { message, messageMedia, messageWithMedia } from './types/takeout'

export default class Message {
	sender: string
	time: number
	content: string

	type?: string
	unsent?: boolean

	reactions?: {
		reaction: string
		actor: string
	}[]

	media?: {
		[type: string]: messageMedia[]
	}

	share?: {
		link?: string
		share_text?: string
	}

	sticker?: string

	call?: {
		duration?: number
		missed?: boolean
	}

	takenDown?: boolean

	constructor(raw: message & messageWithMedia, sourceInboxPath: string) {
		let rootInboxesPath =
			'/' + sourceInboxPath.split('/').slice(0, -2).join('/')

		this.sender = utf8.decode(raw.sender_name)
		this.time = raw.timestamp_ms
		this.content = utf8.decode(raw.content ?? '')

		raw.is_unsent && (this.unsent = raw.is_unsent)
		raw.type != 'Generic' && (this.type = raw.type)
		raw.share && (this.share = raw.share)
		raw.sticker &&
			(this.sticker = join(
				rootInboxesPath,
				raw.sticker.uri.split('/').slice(1).join('/')
			))

		raw.is_taken_down && (this.takenDown = raw.is_taken_down)

		raw.reactions &&
			(this.reactions = raw.reactions.map(r => ({
				actor: utf8.decode(r.actor),
				reaction: utf8.decode(r.reaction),
			})))

		// NOTICE: ignoring raw.ip

		var parseMediaPath = ({ uri, creation_timestamp }) => ({
			uri: join(sourceInboxPath, uri.split('/').slice(3).join('/')),
			creation_timestamp,
		})

		// media
		if (
			raw.photos ||
			raw.audio_files ||
			raw.files ||
			raw.gifs ||
			raw.videos
		) {
			this.media = {}

			raw.photos && (this.media.photos = raw.photos.map(parseMediaPath))
			raw.audio_files &&
				(this.media.audios = raw.audio_files.map(parseMediaPath))
			raw.files && (this.media.files = raw.files.map(parseMediaPath))
			raw.gifs && (this.media.gifs = raw.gifs.map(parseMediaPath))
			raw.videos && (this.media.videos = raw.videos.map(parseMediaPath))
		}

		if (raw.call_duration || raw.missed || raw.type == 'Call') {
			this.call = {
				duration: raw.call_duration,
				missed: raw.missed,
			}
		}

		this.extendTime()
	}

	extendTime() {
		let stringTime = this.time.toString()

		if (stringTime.length != 13) return

		let total = 0

		// sum all character codes
		for (let c = 0; c < this.content.length; c++)
			total += this.content.charCodeAt(c)

		// limit to 3 digits
		total %= 1000

		// append to end of current timestamp
		stringTime += total.toString().padStart(3, '0')

		this.time = parseInt(stringTime)
	}
}
