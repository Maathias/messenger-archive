import { prepStatResults, statParser } from '../types/Stat'

export default {
	id: 'messagesPerMember',

	begin: ({ members }) => prepStatResults(members, () => 0),

	every: (message, member, convo, prev) => {
		prev[member.name] += 1
		return prev
	},

	end: (convo, prev) => prev,
} as statParser
