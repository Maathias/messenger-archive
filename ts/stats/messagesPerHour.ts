import Inbox from '../Inbox'
import Message from '../Message'
import { prepPerMember, StatParser } from './StatParser'

export default class messagesPerHour implements StatParser {
	id = 'messagesPerHour'
	results

	constructor(inbox: Inbox) {
		this.results = prepPerMember(inbox.participants, () => Array(24).fill(0))
	}

	every(message: Message) {
		this.results[message.sender_name][new Date(message.timestamp_ms / 1e3).getHours()] += 1
	}
}
