import { prepStatResults, statParser } from '../types/Stat'

export default {
	id: 'messagesPerWeekday',

	begin: ({ members }) =>
		prepStatResults(members, () => [0, 0, 0, 0, 0, 0, 0]),

	every: (message, member, convo, prev) => {
		prev[member.name][new Date(message.time / 1e3).getDay()] += 1
		return prev
	},

	end: (convo, prev) => prev,
} as statParser
