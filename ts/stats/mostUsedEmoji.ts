import {
	prepStatResults,
	sortObjectbyValueNumber,
	statParser,
} from '../types/Stat'

const emojiPattern =
	/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g

export default {
	id: 'mostUsedEmoji',

	begin: ({ members }) => prepStatResults(members, () => ({})),

	every: (message, member, convo, prev) => {
		if (message.content.length > 0) {
			let emojis = message.content.match(emojiPattern)
			if (emojis) {
				emojis.forEach(
					e => (prev[member.name][e] = (prev[member.name][e] + 1) | 1)
				)
			}
		}
		return prev
	},

	end: (convo, prev) => {
		for (let name in prev) prev[name] = sortObjectbyValueNumber(prev[name])

		return prev
	},
} as statParser
