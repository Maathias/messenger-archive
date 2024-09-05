import { Doughnut, Bar } from 'react-chartjs-2'

import { hueFromString } from '../common'
import Inbox from '../../../../ts/Inbox'

type stats = {
	[member: string]: {
		got: {
			[reaction: string]: number
		}
		used: {
			[reaction: string]: number
		}
	}
}

function donut({
	inbox,
	rawStats,
	options: [stacked, year],
}: {
	inbox: Inbox
	rawStats: stats
	options: [boolean, number]
}) {
	const members = Object.keys(rawStats)

	const nMembers = members.length

	let labels = Object.values(rawStats)
		.map(r => [Object.keys(r.got), Object.keys(r.used)])
		.flat(10)

	labels = Array.from(new Set(labels))

	return (
		<>
			<h1>Reactions</h1>
			<div className="chart">
				{nMembers == 2 && (
					<Bar
						about="asdf"
						data={{
							labels,
							datasets: members.map((n, i) => ({
								label: n,
								data: labels.map(l => rawStats[n].used[l] || 0),
								backgroundColor: `hsl(${hueFromString(n)}deg, 50%, 50%)`,
							})),
						}}
					/>
				)}

				{nMembers > 2 &&
					Object.entries(rawStats).map(([name, { got, used }]) => {
						let all = Array.from(
							new Set([
								...Object.keys(got).filter(emoji => got[emoji] > 10),
								...Object.keys(used).filter(emoji => used[emoji] > 10),
							])
						)

						return (
							<Bar
								options={{
									plugins: {
										title: {
											display: true,
											text: name,
										},
									},
								}}
								data={{
									labels: all,
									datasets: [
										{
											label: 'Used',
											data: all.map(l => used[l] || 0),
											// backgroundColor: `hsl(${hueFromString(name)}deg, 50%, 50%)`,
										},
										{
											label: `Received`,
											data: all.map(l => -got[l] || 0),
											// backgroundColor: `hsl(${hueFromString(name)}deg, 50%, 70%)`
										},
									],
								}}
							/>
						)
					})}
			</div>
		</>
	)
}

export default {
	renderers: { donut },
	label: 'Reactions',
	desc: 'Count of reactions used by each member',
}
