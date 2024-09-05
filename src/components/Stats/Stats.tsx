import 'chart.js/auto'

import { useContext, useEffect, useState } from 'react'

import './stats.sass'

import * as _views from './views'

import contextCurrentInbox from '../../Contexts/contextCurrentInbox'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

// TODO: add missing renderers
const views = _views as _views.Views

export default function Stats() {
	const [currentInbox] = useContext(contextCurrentInbox),
		[rawStats, setRawStats] = useState<object | null>(null)

	const [statName, setStatName] = useState(''),
		[chartStyle, setChartStyle] = useState('')

	const [stacked, setStacked] = useState(true),
		[year, setYear] = useState(new Date().getFullYear()) // TODO: add an input for this

	useEffect(() => setChartStyle(''), [statName])

	useEffect(() => {
		if (currentInbox && statName) {
			currentInbox.getStats(statName).then(setRawStats)
		}
	}, [currentInbox, statName])

	return (
		<div className="stats">
			<div className="settings">
				<FormControl fullWidth>
					<InputLabel id="select-stat">Select a statistic</InputLabel>
					<Select
						labelId="select-stat"
						value={statName}
						label="Select a statistic"
						onChange={e => setStatName(e.target.value)}
					>
						{Object.entries(_views).map(([id, view]) => (
							<MenuItem key={id} value={id}>
								{view.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<br />

				<FormControl fullWidth>
					{statName && (
						<>
							<InputLabel id="select-chart">Select a chart</InputLabel>
							<Select
								labelId="select-chart"
								value={chartStyle}
								label="Select a chart"
								onChange={e => setChartStyle(e.target.value)}
							>
								{Object.keys(views[statName].renderers)
									// .filter(([name, renderer]) => typeof renderer == 'function')
									.map(id => (
										<MenuItem key={id} value={id}>
											{id}
										</MenuItem>
									))}
							</Select>
						</>
					)}

					{chartStyle && (
						<>
							{/* <div>
									Stacked:&nbsp;
									<input
										type="checkbox"
										defaultChecked={stacked}
										onChange={e => setStacked(e.target.checked)}
									/>
								</div> */}
						</>
					)}
				</FormControl>
			</div>

			<div className="view">
				{currentInbox ? (
					statName ? (
						chartStyle ? (
							rawStats ? (
								views[statName].renderers[chartStyle] ? (
									views[statName].renderers[chartStyle]({
										inbox: currentInbox,
										rawStats,
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
