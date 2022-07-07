import { Doughnut } from 'react-chartjs-2'

import { hueFromString, statRendererProps } from '../../../ts/types/Stat'

export function donut({ data }: statRendererProps) {
	return (
		<>
			<h1>Messages per member</h1>
			<div className="chart">
				<Doughnut
					about="asdf"
					data={{
						labels: Object.keys(data),
						datasets: [
							{
								label: 'Messages',
								data: Object.values(data),
								backgroundColor: Object.keys(data).map(
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
	label: 'Messages per member',
	desc: 'Total number of messages sent by each member',
	donut,
}
