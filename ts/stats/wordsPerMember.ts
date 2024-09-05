import { prepPerMember, StatParser } from './StatParser'

export default class wordsPerMember implements StatParser {
	id = 'wordsPerMember'
	results

	constructor(inbox) {
		this.results = prepPerMember(inbox.participants, () => 0)
	}

	every(message) {
		if (message.content.length > 0)
			this.results[message.sender_name] += message.content.split(' ').length
	}
}
