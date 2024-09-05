import { Bar } from 'react-chartjs-2'

import { hueFromString } from '../common'
import Inbox from '../../../../ts/Inbox'

type stats = {
	[member: string]: {
		[word: string]: number
	}
}

function bar({
	inbox,
	rawStats,
	options: [stacked, year],
}: {
	inbox: Inbox
	rawStats: stats
	options: [boolean, number]
}) {
	let top = Object.values(rawStats).map(o =>
		Object.entries(o)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 25)
	)

	return (
		<>
			<h1>Most used words</h1>
			<div className="chart">
				{Object.keys(rawStats).map((member, i) => (
					<Bar
						data={{
							labels: top[i].map(([word]) => word),
							datasets: [
								{
									label: member,
									data: top[i].map(([, count]) => count),
									backgroundColor: `hsl(${hueFromString(member)}deg, 50%, 50%)`,
								},
							],
						}}
					/>
				))}
			</div>
		</>
	)
}

export default {
	renderers: { bar },
	label: 'Most used words',
	desc: 'Most used words by each member',
}
