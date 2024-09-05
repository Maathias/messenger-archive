import Inbox from '../Inbox'
import Message from '../Message'
import { prepPerMember, StatParser } from './StatParser'

const monthsEmpty = (): 0[][] => [
	new Array(31).fill(0),
	new Array(29).fill(0), // FIXME: this will cause problems
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
]

export default class messagesPerDay implements StatParser {
	id = 'messagesPerDay'
	results

	constructor(inbox: Inbox) {
		let firstYear = new Date(inbox.meta.firstMessage).getFullYear(),
			lastYear = new Date(inbox.meta.lastMessage).getFullYear()
		// FIXME: dynamic year range

		this.results = prepPerMember(inbox.participants, () => {
			let prep: {
				[year: string]: number[][]
			} = {}
			for (let i = firstYear; i <= lastYear; i++) {
				prep[i] = monthsEmpty()
			}
			return prep
		})
	}

	every(message: Message) {
		let date = new Date(message.timestamp_ms),
			y = date.getFullYear(),
			m = date.getMonth(),
			d = date.getDate()

		this.results[message.sender_name][y][m][d - 1] += 1
	}
}
