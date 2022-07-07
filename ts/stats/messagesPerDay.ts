import { monthsEmpty, prepStatResults, statParser } from '../types/Stat'

export default {
	id: 'messagesPerDay',

	begin: ({ firstMessage, lastMessage, members }) => {
		let firstYear = new Date(firstMessage / 1e3).getFullYear(),
			lastYear = new Date(lastMessage / 1e3).getFullYear()

		return prepStatResults(members, () => {
			let prep: {
				[year: string]: number[][]
			} = {}
			for (let i = firstYear; i <= lastYear; i++) {
				prep[i] = monthsEmpty()
			}
			return prep
		})
	},

	every: (message, member, convo, prev) => {
		let date = new Date(message.time / 1e3),
			y = date.getFullYear(),
			m = date.getMonth(),
			d = date.getDate()

		prev[member.name][y][m][d - 1] += 1

		return prev
	},

	end: (convo, prev) => prev,
} as statParser
