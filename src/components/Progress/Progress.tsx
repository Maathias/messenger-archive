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
	return (
		<div className="progress">
			<span className="label">
				{label} [
				{typeof status != 'undefined'
					? `${status}%`
					: steps
					? `${steps[0]}/${steps[1]}`
					: `?`}
				]
			</span>
			<div
				className="status"
				style={{ width: `${status ?? (steps![0] / steps![1]) * 100}%` }}
			></div>
		</div>
	)
}

export default Progress
