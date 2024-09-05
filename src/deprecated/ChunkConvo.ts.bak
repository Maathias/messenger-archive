import Convo from '../ts/Convo'
import PartialConvo from './PartialConvo'

export function chunkRange(
	convo: Convo,
	at: number,
	[before, after]: [number, number]
) {
	function getKeys() {
		let keys: [number, string][] = []

		for (const sender in convo.messages) {
			let tooLate = 0
			for (const time in convo.messages[sender]) {
				keys.push([parseInt(time), sender])
				if (parseInt(time) > at) tooLate++
				if (tooLate >= after) break
			}
		}

		return keys.sort(([a], [b]) => a - b)
	}

	let keys = getKeys()

	let middle = keys.findIndex(([time]) => time == at)

	keys = keys.slice(middle > before ? middle - before : 0, middle + after + 1)

	return [keys.at(0)?.[0], keys.at(-1)?.[0] ?? at] as [number, number]
}

export default (
	convo: Convo,
	at: number,
	[before, after]: [number, number]
) => {
	return new PartialConvo(convo, chunkRange(convo, at, [before, after]))
}
