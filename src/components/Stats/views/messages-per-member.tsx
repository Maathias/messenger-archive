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
	return (
		<>
			<h1>Messages per member</h1>
			<div className="chart">
				<Doughnut
					about="asdf"
					data={{
						labels: Object.keys(rawStats),
						datasets: [
							{
								label: 'Messages',
								data: Object.values(rawStats),
								backgroundColor: Object.keys(rawStats).map(
									n => `hsl(${hueFromString(n)}deg, 50%, 50%)`
								),
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
	label: 'Messages per member',
	desc: 'Total number of messages sent by each member',
}
