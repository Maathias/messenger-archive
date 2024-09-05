import Inbox from '../Inbox'
import Message from '../Message'
import { prepPerMember, StatParser } from './StatParser'

export default class messagesPerWeekday implements StatParser {
	id = 'messagesPerWeekday'
	results

	constructor(inbox: Inbox) {
		this.results = prepPerMember(inbox.participants, () => new Array(7).fill(0))
	}

	every(message: Message) {
		this.results[message.sender_name][new Date(message.timestamp_ms).getDay()] += 1
	}
}
