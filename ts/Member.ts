export default class Member {
	name: string
	participates: boolean
	lastSeen: number
	self: boolean

	constructor(name: string, participates = false, seen = 0) {
		this.name = name
		this.participates = participates
		this.lastSeen = seen
		this.self = false
	}

	seen(participates: boolean, time: number) {
		if (time >= this.lastSeen) {
			this.participates = participates
		}
	}
}
