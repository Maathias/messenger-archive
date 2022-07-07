import { prepStatResults, statParser } from '../types/Stat'

export default {
	id: 'photosPerMember',

	begin: ({ members }) =>
		prepStatResults(members, () => ({
			photos: 0,
			videos: 0,
			audios: 0,
			files: 0,
			gifs: 0,
			stickers: 0,
		})),

	every: (message, member, convo, prev) => {
		if ('sticker' in message) prev[member.name].stickers += 1

		// FIXME: this probably can be done in 3 lines but i can't be bothered right now
		if (message.media) {
			if ('photos' in message.media)
				prev[member.name].photos += message.media.photos.length
			if ('videos' in message.media)
				prev[member.name].videos += message.media.videos.length
			if ('audios' in message.media)
				prev[member.name].audios += message.media.audios.length
			if ('files' in message.media)
				prev[member.name].files += message.media.files.length
			if ('gifs' in message.media)
				prev[member.name].gifs += message.media.gifs.length
		}
		return prev
	},

	end: (convo, prev) => prev,
} as statParser
