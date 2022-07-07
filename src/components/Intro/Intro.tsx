import { useEffect, useReducer, useState } from 'react'
import Button from '../Button/Button'
import Progress from '../Progress/Progress'

import './intro.sass'

type status = [string, number]

const totalMasterParts = 4

function Intro() {
	const [paths, setPaths] = useState<string[]>([]),
		[mainProgress, setMainProgress] = useState<status>([
			'Waiting for paths',
			0,
		]),
		[subProgress, setSubProgress] = useState<status>(['', 0]),
		[log, addLog] = useState<any[]>([])

	function beginScan(paths: string[]) {
		window.invoke('scan', { paths }).then(convosIds => {
			console.log(convosIds)
		})
	}

	useEffect(() => {
		window.events.on('update-progress', ([level, message, status, err]) => {
			if (level == 'main') setMainProgress([message, status])
			if (level == 'sub') setSubProgress([message, status])
			addLog(prev => [...prev, [level, message, status, err]])
		})
	}, [])

	return (
		<div
			className="intro"
			style={{
				cursor:
					mainProgress[1] > 0 && mainProgress[1] < totalMasterParts
						? 'wait'
						: 'default',
			}}
		>
			<span className="header">Select paths to scan</span>
			<p>
				Add folders with <code>filtered_threads</code>,{' '}
				<code>archived_threads</code>, <code>inbox</code> or{' '}
				<code>message_requests</code> inside
			</p>
			<div className="controls">
				<Button
					label="Open"
					action={() =>
						window.invoke('get-paths').then(({ canceled, filePaths }) => {
							!canceled &&
								setPaths(prev => [
									...prev,
									...filePaths.filter(p => !prev.includes(p)),
								])
						})
					}
					icon="plus-squared"
				/>
			</div>
			<div className="paths">
				{paths.map(path => (
					<div key={path}>
						{path}
						<i
							className="icon-cancel"
							onClick={() =>
								setPaths(prev => prev.filter(p => p != path))
							}
						></i>
					</div>
				))}
			</div>

			{paths.length > 0 && (
				<Button
					label="Scan"
					action={() => beginScan(paths)}
					icon="search"
				/>
			)}

			{log.length > 0 && (
				<div className="bars">
					<Progress
						label={mainProgress[0]}
						steps={[mainProgress[1], totalMasterParts]}
					/>
					<Progress label={subProgress[0]} status={subProgress[1]} />
					{/* TODO: display the logs */}
				</div>
			)}
		</div>
	)
}

export default Intro
