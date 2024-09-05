import { Bar } from 'react-chartjs-2'

import { hueFromString, monthsLabels } from '../common'
import { Inbox } from '../../../Sources'

function bar({
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
			<h1>Messages per day</h1>
			<div className="chart">
				<Bar
					about="asdf"
					data={{
						labels: monthsLabels.flat(),
						datasets: inbox.participants.map(({ name }) => ({
							label: name,
							stack: stacked ? 'stack' : name,
							data: rawStats[name][year].flat(),
							backgroundColor: `hsl(${hueFromString(name)}deg, 50%, 50%)`,
						})),
					}}
				/>
			</div>
		</>
	)
}

export default {
	renderers: { bar },
	label: 'Messages per day',
	desc: 'Number of messages sent by each member during a day',
}
