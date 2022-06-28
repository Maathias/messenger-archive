import { useEffect, useReducer, useState } from 'react'
import Button from '../Button/Button'
import Progress from '../Progress/Progress'

import './intro.sass'

type status = {
	[step: string]: [string, number]
}

function beginScan(paths: string[]) {
	window.Main.send('scan', { paths })
}

function Intro() {
	const [paths, setPaths] = useState(['/home/mathias/Desktop/messages']),
		[status, setStatus] = useState({
			main: ['Preparing', 50],
			sub: ['Checking directories', 10],
		} as status),
		[log, addLog] = useState([] as any[])

	useEffect(() => {
		window.Main.on('add-paths', ({ canceled, filePaths }) => {
			!canceled &&
				setPaths(prev => [
					...prev,
					...filePaths.filter(p => !prev.includes(p)),
				])
		})

		window.Main.on('update-progress', (data: any) => {
			console.log(data)
			// setStatus(prev => ({ ...prev, ...data }))
			addLog(prev => [...prev, data])
		})
	}, [])

	return (
		<div className="intro">
			<span className="header">Select paths to scan</span>
			<p>
				Add folders with <code>filtered_threads</code>,{' '}
				<code>archived_threads</code>, <code>inbox</code> or{' '}
				<code>message_requests</code> inside
			</p>
			<div className="controls">
				<Button
					label="Open"
					action={() => window.Main.send('get-paths')}
					icon="plus-squared"
				/>
			</div>
			<div className="paths">
				{paths.map(p => (
					<div key={p}>{p}</div>
				))}
			</div>

			{paths.length > 0 && (
				<Button
					label="Scan"
					action={() => beginScan(paths)}
					icon="search"
				/>
			)}

			{status.main && (
				<div className="bars">
					<Progress label={status.main[0]} status={status.main[1]} />
					<Progress label={status.sub[0]} status={status.sub[1]} />
					{/* <div className="logs">
						{log.map((l, i) => (
							<div key={i}>
								{Object.keys(l).map((k, j) => {
									if (k == 'err')
										return (
											<span key={j}>
												{l[k]?.message ?? l[k]?.code ?? l[k]}
											</span>
										)
									else return `${k} ${l[k][0]} ${l[k][1]}%`
								})}
							</div>
						))}
					</div> */}
				</div>
			)}
		</div>
	)
}

export default Intro
