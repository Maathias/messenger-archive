import Inbox from '../Inbox'
import Message from '../Message'
import { prepPerMember, StatParser } from './StatParser'

export default class messagesPerMember implements StatParser {
	id = 'messagesPerMember'
	results

	constructor(inbox: Inbox) {
		this.results = prepPerMember(inbox.participants, () => 0)
	}

	every(message: Message) {
		this.results[message.sender_name] += 1
	}
}
