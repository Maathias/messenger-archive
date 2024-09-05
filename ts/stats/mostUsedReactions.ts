import Message from '../Message'
import { prepPerMember, StatParser } from './StatParser'

export default class mostUsedReactions implements StatParser {
	id = 'mostUsedReactions'
	results

	constructor(inbox) {
		this.results = prepPerMember(inbox.participants, () => ({ got: {}, used: {} }))
	}

	every(message: Message) {
		if (message.reactions) {
			for (let { reaction, actor } of message.reactions) {
				const got = this.results[message.sender_name].got,
					used = this.results[actor].used

				got[reaction] = got[reaction] + 1 || 1
				used[reaction] = used[reaction] + 1 || 1
			}
		}
	}
}
