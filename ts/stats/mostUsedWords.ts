import {
	prepStatResults,
	sortObjectbyValueNumber,
	statParser,
} from '../types/Stat'

export default {
	id: 'mostUsedWords',

	begin: ({ members }) => prepStatResults(members, () => ({})),

	every: (message, member, convo, prev) => {
		if (message.content.length > 0)
			message.content.split(' ').forEach(word => {
				if (prev[member.name][word]) prev[member.name][word] += 1
				else prev[member.name][word] = 1
			})
		return prev
	},

	end: (convo, prev) => {
		for (let name in prev) prev[name] = sortObjectbyValueNumber(prev[name])

		return prev
	},
} as statParser
