import utf8 from 'utf8'

import { pathOriginalToName, pathOriginalToShort, timestampSecToMs } from './normalizers'
import Message from './Message'

import mediaPerMember from './stats/mediaPerMember'
import messagesPerDay from './stats/messagesPerDay'
import messagesPerHour from './stats/messagesPerHour'
import messagesPerMember from './stats/messagesPerMember'
import messagesPerWeekday from './stats/messagesPerWeekday'
import mostUsedEmoji from './stats/mostUsedEmoji'
import mostUsedReactions from './stats/mostUsedReactions'
import mostUsedWords from './stats/mostUsedWords'
import wordsPerMember from './stats/wordsPerMember'
import { StatParser } from './stats/StatParser'

import RawTakeout from './types/takeout_schema'

const statParsers: (new (inbox: Inbox) => StatParser)[] = [
	mediaPerMember,
	// messagesPerDay,
	// FIXME: somethings wrong with preping
	messagesPerHour,
	messagesPerMember,
	messagesPerWeekday,
	mostUsedEmoji,
	mostUsedReactions,
	mostUsedWords,
	wordsPerMember,
]

export class Member {
	name: string
	participates: boolean
	self: boolean

	constructor(name: string) {
		this.name = name
		this.participates = true
		this.self = false
	}
}

class Inbox {
	id: string
	category: string

	title: string
	thread_path: string
	image?: {
		uri: string
		creation_timestamp: number
	}

	is_still_participant: boolean
	participants: Member[]

	joinable_mode?: {
		mode: number
		link: string
	}
	magic_words?: any[]

	messages: Message[]

	meta!: {
		firstMessage: number
		lastMessage: number
		owner: string
	}

	stats: { [statId: string]: StatParser['results'] }

	constructor(fileName: string, raw: RawTakeout) {
		let seg = raw.thread_path.split('/')
		this.id = seg[1]
		this.category = seg[0]

		if (raw.title != '') this.title = utf8.decode(raw.title)
		else this.title = 'Facebook User'
		this.thread_path = raw.thread_path

		this.is_still_participant = raw.is_still_participant
		this.participants = raw.participants.map(p => new Member(utf8.decode(p.name)))

		this.magic_words = raw.magic_words

		if (raw.image) {
			this.image = {
				uri: pathOriginalToName(raw.image.uri),
				creation_timestamp: timestampSecToMs(raw.image.creation_timestamp),
			}
		}

		if (raw.joinable_mode) {
			this.joinable_mode = {
				mode: raw.joinable_mode.mode,
				link: raw.joinable_mode.link,
			}
		}

		this.messages = raw.messages.map(message => new Message(message))

		this.stats = {}
	}

	append(raw: RawTakeout) {
		this.messages.push(...raw.messages.map(message => new Message(message)))
	}

	finalize(owner: string) {
		let seenMembers: string[] = this.participants.map(p => p.name),
			firstMessage = Infinity,
			lastMessage = -Infinity

		for (const message of this.messages) {
			// add missing participants
			if (!seenMembers.includes(message.sender_name)) {
				seenMembers.push(message.sender_name)
				this.participants.push(new Member(message.sender_name))
			}

			if (message.reactions) {
				for (const { actor } of message.reactions) {
					if (!seenMembers.includes(actor)) {
						seenMembers.push(actor)
						this.participants.push(new Member(actor))
					}
				}
			}

			// TODO: detect leaving members

			// find the first and last message
			if (message.timestamp_ms > lastMessage) lastMessage = message.timestamp_ms
			if (message.timestamp_ms < firstMessage) firstMessage = message.timestamp_ms
		}

		let ownerMember = this.participants.find(p => p.name == owner)
		if (ownerMember) ownerMember.self = true

		this.meta = {
			firstMessage,
			lastMessage,
			owner,
		}

		let stats = statParsers.map(parser => new parser(this))

		for (const message of this.messages) {
			stats.forEach(stat => stat.every(message))
		}

		stats.forEach(stat => (this.stats[stat.id] = stat.results))
	}

	export() {
		return {
			id: this.id,
			category: this.category,
			title: this.title,
			thread_path: this.thread_path,
			image: this.image,
			is_still_participant: this.is_still_participant,
			participants: this.participants,
			joinable_mode: this.joinable_mode,
			magic_words: this.magic_words,
			meta: this.meta,
			stats: this.stats,
			messageCount: this.messages.length,
		}
	}

	exportMessages(from: number, to: number) {
		return this.messages.filter(
			message => message.timestamp_ms >= from && message.timestamp_ms <= to
		)
	}
}

export default Inbox
