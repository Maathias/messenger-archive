import { Doughnut, Bar } from 'react-chartjs-2'

import { hueFromString } from '../common'
import Inbox from '../../../../ts/Inbox'

function stacked_bar({
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
			<h1>Media per member</h1>
			<div className="chart">
				<Bar
					data={{
						labels: ['photos', 'gifs', 'videos', 'audio_files', 'files', 'sticker'],
						datasets: Object.entries(rawStats).map(([name, data]) => ({
							label: name,
							data: data,
							backgroundColor: `hsl(${hueFromString(name)}deg, 50%, 50%)`,
						})),
					}}
				/>
			</div>
		</>
	)
}

export default {
	renderers: { stacked_bar },
	label: 'Media per member',
	desc: 'Total count of media, by type, sent by each member',
}
