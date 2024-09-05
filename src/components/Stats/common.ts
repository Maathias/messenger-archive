// TODO: add a function for groups with more uniform hue spread
export function hueFromString(s: string) {
	// TODO: offset character codes closer to 0
	return Array(...s).reduce((s, c) => s + c.charCodeAt(0), 0) % 360
}

export function nToMonthName(n: number) {
	return [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	][n]
}

export const monthsEmpty = (): 0[][] => [
	new Array(31).fill(0),
	new Array(29).fill(0), // FIXME: this will cause problems
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
	new Array(30).fill(0),
	new Array(31).fill(0),
]

export const monthsLabels = monthsEmpty().map((days, m) =>
	days.map((_, d) => `${nToMonthName(m)} ${d + 1}`)
)
