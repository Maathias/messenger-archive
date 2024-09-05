import utf8 from 'utf8'

import { pathOriginalToShort, timestampSecToMs } from './normalizers'

import { RawTakeoutMessage } from './types/takeout_schema'

class Message {
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

	constructor(message: RawTakeoutMessage) {
		this.sender_name = utf8.decode(message.sender_name)
		this.timestamp_ms = message.timestamp_ms
		this.is_geoblocked_for_viewer = message.is_geoblocked_for_viewer

		if (message.content) this.content = utf8.decode(message.content)
		else this.content = ''

		if (message.is_unsent) this.is_unsent = message.is_unsent
		else this.is_unsent = false

		if (message.ip) this.ip = message.ip

		if (message.call_duration) this.call_duration = message.call_duration

		if (message.missed) this.missed = message.missed

		if (message.photos)
			this.photos = message.photos.map(photo => ({
				uri: pathOriginalToShort(photo.uri),
				creation_timestamp: timestampSecToMs(photo.creation_timestamp),
			}))

		if (message.gifs)
			this.gifs = message.gifs.map(gif => ({
				uri: pathOriginalToShort(gif.uri),
			}))

		if (message.videos)
			this.videos = message.videos.map(video => ({
				uri: pathOriginalToShort(video.uri),
				creation_timestamp: timestampSecToMs(video.creation_timestamp),
			}))

		if (message.audio_files)
			this.audio_files = message.audio_files.map(audio => ({
				uri: pathOriginalToShort(audio.uri),
				creation_timestamp: timestampSecToMs(audio.creation_timestamp),
			}))

		if (message.files)
			this.files = message.files.map(file => ({
				uri: pathOriginalToShort(file.uri),
				creation_timestamp: timestampSecToMs(file.creation_timestamp),
			}))

		if (message.sticker)
			this.sticker = {
				uri: pathOriginalToShort(message.sticker.uri),
				ai_stickers: message.sticker.ai_stickers,
			}

		if (message.share)
			this.share = {
				link: message.share.link,
				share_text: message.share.share_text,
			}

		if (message.reactions)
			this.reactions = message.reactions.map(reaction => ({
				reaction: utf8.decode(reaction.reaction),
				actor: utf8.decode(reaction.actor),
			}))

		if (this.content == '') {
			if (this.photos) {
				if (this.photos.length > 1) {
					this.content = `Sent ${this.photos.length} photos`
				} else this.content = 'Sent a photo'
			}
			if (this.gifs) {
				if (this.gifs.length > 1) {
					this.content = `Sent ${this.gifs.length} gifs`
				} else this.content = 'Sent a gif'
			}
			if (this.videos) {
				this.content = 'Sent a video'
			}
			if (this.audio_files) {
				this.content = 'Sent an audio file'
			}
			if (this.files) {
				if (this.files.length > 1) {
					this.content = `Sent ${this.files.length} files`
				} else this.content = 'Sent a file'
			}
			if (this.sticker) {
				this.content = 'Sent a sticker'
			}
			if (this.missed) {
				this.content = 'Unanswered call'
			}
			if (this.call_duration) {
				this.content = `Call lasted ${this.call_duration} seconds`
			}
		}
	}
}

export default Message
