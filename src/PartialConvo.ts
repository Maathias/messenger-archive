import Convo from '../ts/Convo'
import Message from '../ts/Message'

export function dateToUnixExtended(date: Date) {
	return date.getTime() * 1e3
}

export default class PartialConvo {
	from: number
	to: number
	messages: Message[]
	count: number

	constructor(convo: Convo, [from, to]: [number, number]) {
		this.from = from
		this.to = to

		this.messages = []

		let temp = {}

		for (const sender in convo.messages)
			for (const time in convo.messages[sender]) {
				let t = parseInt(time)
				if (t >= from && t <= to) temp[time] = convo.messages[sender][time]
			}

		for (let time of Object.keys(temp).sort(
			(a, b) => parseInt(a) - parseInt(b)
		))
			this.messages.push(temp[time])

		this.count = this.messages.length
	}
}
