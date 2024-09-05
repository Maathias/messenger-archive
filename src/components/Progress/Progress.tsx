import './progress.sass'

function Progress({
	label,
	status,
	steps,
}: {
	label: string
	status?: number
	steps?: [number, number]
}) {
	let progress = '',
		hide = false

	if (status) {
		progress = `[${status.toPrecision(3)}%]`
		if (status == 0) hide = true
	} else if (steps) {
		progress = `[${steps[0]}/${steps[1]}]`
		if (steps[0] == 0) hide = true
	}

	return (
		<div className="progress">
			<span className="label">
				{label} {!hide && progress}
			</span>
			<div
				className="status"
				style={{ width: `${status ?? (steps![0] / steps![1]) * 100}%` }}
			></div>
		</div>
	)
}

export default Progress
