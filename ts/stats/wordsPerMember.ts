import { prepStatResults, statParser } from '../types/Stat'

export default {
	id: 'wordsPerMember',

	begin: ({ members }) => prepStatResults(members, () => 0),

	every: (message, member, convo, prev) => {
		if (message.content.length > 0)
			prev[member.name] += message.content.split(' ').length
		return prev
	},

	end: (convo, prev) => prev,
} as statParser
