export function stringToColor(string: string) {
	let hash = 0
	let i

	/* eslint-disable no-bitwise */
	for (i = 0; i < string.length; i += 1) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash)
	}

	let color = '#'

	for (i = 0; i < 3; i += 1) {
		const value = (hash >> (i * 8)) & 0xff
		color += `00${value.toString(16)}`.slice(-2)
	}
	/* eslint-enable no-bitwise */

	return color
}

export function stringAvatar(title: string) {
	let segments = title.split(' '),
		initials = ''

	if (segments.length > 1) {
		initials = segments[0][0] + segments[1][0]
	} else initials = segments[0][0]

	return {
		sx: {
			bgcolor: stringToColor(title),
		},
		children: initials,
	}
}
