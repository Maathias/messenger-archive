export interface Views {
	[view: string]: {
		renderers: {
			[renderer: string]: (data: any) => JSX.Element
		}
		label: string
		desc: string
	}
}

export { default as messagesPerDay } from './messages-per-day'
export { default as messagesPerMember } from './messages-per-member'
export { default as mediaPerMember } from './media-per-member'
export { default as wordsPerMember } from './words-per-member'
export { default as mostUsedWords } from './most-used-words'
export { default as mostUsedReactions } from './most-used-reactions'
