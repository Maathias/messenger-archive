import Inbox from '../Inbox'
import Message from '../Message'
// import { prepStatResults, statParser } from '../types/Stat'
import { prepPerMember, StatParser } from './StatParser'

export default class MediaPerMember implements StatParser {
	id = 'mediaPerMember'
	results

	constructor(inbox: Inbox) {
		this.results = prepPerMember(inbox.participants, () => ({
			photos: 0,
			gifs: 0,
			videos: 0,
			audio_files: 0,
			files: 0,
			stickers: 0,
		}))
	}

	every(message: Message) {
		let sender = message.sender_name
		if (message.photos) this.results[sender].photos += message.photos.length
		if (message.gifs) this.results[sender].gifs += message.gifs.length
		if (message.videos) this.results[sender].videos += message.videos.length
		if (message.audio_files) this.results[sender].audio_files += message.audio_files.length
		if (message.files) this.results[sender].files += message.files.length
		if (message.sticker) this.results[sender].stickers += 1
	}
}
