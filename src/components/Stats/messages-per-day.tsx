import { Bar } from 'react-chartjs-2'
import {
	hueFromString,
	monthsLabels,
	statRendererProps,
} from '../../../ts/types/Stat'

function bar({ data, convo, options: [stacked, year] }: statRendererProps) {
	return (
		<>
			<h1>Messages per day</h1>
			<div className="chart">
				<Bar
					about="asdf"
					data={{
						labels: monthsLabels.flat(),
						datasets: convo.members.map(({ name }) => ({
							label: name,
							stack: stacked ? 'stack' : name,
							data: data[name][year].flat(),
							backgroundColor: `hsl(${hueFromString(
								name
							)}deg, 50%, 50%)`,
						})),
					}}
				/>
			</div>
		</>
	)
}

export default {
	label: 'Messages per day',
	desc: 'Number of messages sent by each member during a day',
	bar,
}
