import Inbox from '../Inbox'
import Message from '../Message'
import { prepPerMember, StatParser } from './StatParser'

export default class mostUsedWords implements StatParser {
	id = 'mostUsedWords'
	results

	constructor(inbox: Inbox) {
		this.results = prepPerMember(inbox.participants, () => ({}))
	}

	every(message: Message) {
		if (message.content.length > 0) {
			let sender = message.sender_name
			message.content.split(' ').forEach(word => {
				if (this.results[sender][word]) this.results[sender][word] += 1
				else this.results[sender][word] = 1
			})
		}
	}
}
