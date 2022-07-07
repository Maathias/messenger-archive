import {
	prepStatResults,
	sortObjectbyValueNumber,
	statParser,
} from '../types/Stat'

export default {
	id: 'mostUsedReactions',

	begin: ({ members }) =>
		prepStatResults(members, () => ({ got: {}, used: {} })),

	every: (message, member, convo, prev) => {
		if (message.reactions) {
			for (let { reaction, actor } of message.reactions) {
				const got = prev[member.name].got,
					used = prev[actor].used

				got[reaction] = got[reaction] + 1 || 1
				used[reaction] = used[reaction] + 1 || 1
			}
		}

		return prev
	},

	end: (convo, prev) => {
		for (let { name } of convo.members) {
			prev[name].got = sortObjectbyValueNumber(prev[name].got)
			prev[name].used = sortObjectbyValueNumber(prev[name].used)
		}
		return prev
	},
} as statParser
