import { Doughnut } from 'react-chartjs-2'

import { hueFromString } from '../common'
import Inbox from '../../../../ts/Inbox'

function donut({
	inbox,
	rawStats,
	options: [stacked, year],
}: {
	inbox: Inbox
	rawStats: any
	options: [boolean, number]
}) {
	let labels = Object.keys(rawStats),
		data = Object.values(rawStats),
		backgroundColor = Object.keys(rawStats).map(n => `hsl(${hueFromString(n)}deg, 50%, 50%)`)

	return (
		<>
			<h1>Words per member</h1>
			<div className="chart">
				<Doughnut
					about="asdf"
					data={{
						labels,
						datasets: [
							{
								label: 'Words',
								data,
								backgroundColor,
							},
						],
					}}
				/>
			</div>
		</>
	)
}

export default {
	renderers: { donut },
	label: 'Words per member',
	desc: 'Total number of words typed by each member',
}
