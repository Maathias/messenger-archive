import { prepStatResults, statParser } from '../types/Stat'

export default {
	id: 'messagesPerHour',

	begin: ({ members }) => prepStatResults(members, () => Array(24).fill(0)),

	every: (message, member, convo, prev, other) => {
		prev[member.name][new Date(message.time / 1e3).getHours()] += 1
		return prev
	},

	end: (convo, prev, other) => prev,
} as statParser
