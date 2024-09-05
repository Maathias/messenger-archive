import { Member } from '../Inbox'
import Message from '../Message'

export interface StatParser {
	id: string

	results: any

	every(message: Message): void
}

export function prepPerMember(members: Member[], initial: () => any) {
	let out: {
		[memberName: string]: ReturnType<typeof initial>
	} = {}

	for (let { name } of members) {
		out[name] = initial()
	}

	return out
}
