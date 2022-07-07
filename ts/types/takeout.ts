export type timestampSeconds = number
export type timestampMs = number

export type unescapedString = string

export type messagesPart = {
	title: unescapedString
	thread_path: string
	thread_type: string
	participants: { name: unescapedString }[]
	magic_words: []
	messages: (message & messageWithMedia)[]
	image?: {
		uri: string
		creation_timestamp: timestampSeconds
	}
	is_still_participant: boolean
	joinable_mode: {
		mode: number
		link: string
	}
}

export type message = {
	sender_name: unescapedString
	timestamp_ms: timestampMs
	content?: unescapedString
	type: string // 'Generic' | 'Call' | 'Share' | 'Subscribe' | 'Unsubscribe'
	is_unsent: boolean
	is_taken_down: boolean
	bumped_message_metadata: {
		bumped_message: unescapedString
		is_bumped: boolean
	}

	call_duration?: number
	missed?: boolean

	ip?: string

	reactions?: messageReaction[]

	users?: { name: unescapedString }[]

	share?: {
		link?: string
		share_text?: unescapedString
	}

	sticker?: {
		uri: string
	}
}

export type messageWithMedia = {
	photos?: messageMedia[]
	audio_files?: messageMedia[]
	files?: messageMedia[]
	gifs?: (messageMedia & { creation_timestamp: never })[]
	videos?: (messageMedia & { thumbnail: { uri: string } })[]
	[mediaType: string]: messageMedia[] | undefined
}

export type messageMedia = {
	uri: string
	creation_timestamp: number
}

export type messageReaction = {
	reaction: unescapedString
	actor: unescapedString
}

// all keys present in facebook takeouts

// "title":
// "thread_path":
// "thread_type":
// "participants":
// 		"name":
// "magic_words":
// "messages":
// "image":
// "is_still_participant":
// "joinable_mode":

// 	"link":
// 	"mode":
// 	"uri":
// 	"creation_timestamp":

// 		"sender_name":
// 		"timestamp_ms":
// 		"content":
// 		"type":
// 		"is_unsent":
// 		"is_taken_down":
// 		"bumped_message_metadata":
// 			"bumped_message":
// 			"is_bumped":

// 		"photos":
// 		"videos":
// 		"audio_files":
// 		"gifs":
// 		"files":
// 				"uri":
// 				"creation_timestamp":
// 				"thumbnail":
// 					"uri":

// 		"call_duration":
// 		"missed":

// 		"ip":

// 		"reactions":
// 				"reaction":
// 				"actor":

// 		"users":
// 				"name":

// 		"share":
// 			"link":
// 			"share_text":

// 		"sticker":
// 			"uri":
