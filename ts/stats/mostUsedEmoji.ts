import Inbox from '../Inbox'
import Message from '../Message'
import { prepPerMember, StatParser } from './StatParser'

const emojiPattern =
	/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g

export default class mostUsedEmoji implements StatParser {
	id = 'mostUsedEmoji'
	results

	constructor(inbox: Inbox) {
		this.results = prepPerMember(inbox.participants, () => ({}))
	}

	every(message: Message) {
		let sender = message.sender_name

		if (message.content.length > 0) {
			let emojis = message.content.match(emojiPattern)
			if (emojis) {
				emojis.forEach(e => (this.results[sender][e] = (this.results[sender][e] + 1) | 1))
			}
		}
	}
}
