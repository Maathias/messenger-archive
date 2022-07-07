import 'chart.js/auto'

import { useContext, useEffect, useState } from 'react'
import contextCurrentConvo from '../../Contexts/contextCurrentConvo'

import './stats.sass'

import messagesPerDay from './messages-per-day'
import messagesPerMember from './messages-per-member'

// TODO: add missing renderers

const renderers = {
	messagesPerDay,
	messagesPerMember,
}

export default function Stats() {
	const [[currentConvo]] = useContext(contextCurrentConvo)

	const [statName, setStatName] = useState(''),
		[chartStyle, setChartStyle] = useState('')

	const [stacked, setStacked] = useState(true),
		[year, setYear] = useState(new Date().getFullYear()) // TODO: add an input for this

	useEffect(() => setChartStyle(''), [statName])

	return (
		<div className="stats">
			<div className="settings">
				<select onChange={e => setStatName(e.target.value)}>
					<option value="">select a stat</option>
					{Object.entries(renderers).map(([id, { label }]) => (
						<option key={id} value={id}>
							{label}
						</option>
					))}
				</select>

				{statName && (
					<select onChange={e => setChartStyle(e.target.value)}>
						<option value="">select a chart</option>

						{Object.entries(renderers[statName])
							.filter(([, renderer]) => typeof renderer == 'function')
							.map(([id]) => (
								<option key={id} value={id}>
									{id}
								</option>
							))}
					</select>
				)}

				{chartStyle && (
					<div>
						Stacked:&nbsp;
						<input
							type="checkbox"
							defaultChecked={stacked}
							onChange={e => setStacked(e.target.checked)}
						/>
					</div>
				)}
			</div>
			<div className="view">
				{currentConvo ? (
					statName ? (
						chartStyle ? (
							currentConvo.stats[statName] ? (
								renderers[statName][chartStyle] ? (
									//
									renderers[statName][chartStyle]({
										// FIXME: charts often overflow offscreen
										convo: currentConvo,
										data: currentConvo.stats[statName],
										options: [stacked, year],
									})
								) : (
									<span>Selected chart is unavailable</span>
								)
							) : (
								<span>Selected stat is unavailable</span>
							)
						) : (
							<span>Select a chart</span>
						)
					) : (
						<span>Select a stat</span>
					)
				) : (
					<span>Select a conversation</span>
				)}
			</div>
		</div>
	)
}
