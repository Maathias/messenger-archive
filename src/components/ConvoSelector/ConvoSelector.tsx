import { useContext, useEffect, useState } from 'react'
import { DateRangePicker } from 'react-date-range'

import { dateToUnixExtended } from '../../PartialConvo'

import contextCurrentConvo from '../../Contexts/contextCurrentConvo'
import contextConvos from '../../Contexts/contextConvos'

import './convoselector.sass'

import 'react-date-range/dist/styles.css' // picker main style file
import 'react-date-range/dist/theme/default.css' // picker theme css file

function ConvoSelector() {
	const convos = useContext(contextConvos),
		[[currentConvo, setCurrentConvo], [range, setRange]] =
			useContext(contextCurrentConvo)

	const [picker, setPicker] = useState({
		startDate: new Date(new Date().getTime() - 3.024e9),
		endDate: new Date(),
		key: 'selection',
	})

	useEffect(() => {
		setRange([
			dateToUnixExtended(picker.startDate),
			dateToUnixExtended(picker.endDate) + 8.64e10,
		])
	}, [picker])

	return (
		<div className="selector">
			<div className="select">
				<span>Select an inbox: </span>
				<select
					onChange={({ target: { value } }) => setCurrentConvo(value)}
					defaultValue={currentConvo?.id}
				>
					{convos
						.sort((a, b) => a.title.localeCompare(b.title))
						.map(c => (
							<option key={c.id} value={c.id}>
								{c.title}
							</option>
						))}
				</select>
			</div>

			{currentConvo && (
				<div className="preview">
					<h2>{currentConvo.title}</h2>
					<div className="desc">
						<img src={currentConvo.image ?? ''} alt="photo unavailable" />
						<table>
							<tbody>
								<tr>
									<td>Title</td>
									<td>{currentConvo.title}</td>
								</tr>
								<tr>
									<td>Type</td>
									<td>{currentConvo.type}</td>
								</tr>
								<tr>
									<td>Category</td>
									<td>{'inbox'}</td>
									{/* TODO: pass category to convo from inbox */}
								</tr>
								<tr>
									<td>First Message</td>
									<td>
										{new Date(
											currentConvo.firstMessage / 1e3
										).toLocaleString()}
									</td>
								</tr>
								<tr>
									<td>Last Message</td>
									<td>
										{new Date(
											currentConvo.lastMessage / 1e3
										).toLocaleString()}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<h2>Members</h2>
					<div className="members">
						<ul>
							{currentConvo.members.map(m => (
								<li
									key={m.name}
									data-left={!m.participates}
									data-self={m.self}
								>
									{m.name}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{currentConvo && (
				<div className="picker">
					<h1>Select a range for displayed messages:</h1>
					<DateRangePicker
						onChange={item => setPicker(item.selection)}
						showSelectionPreview={true}
						moveRangeOnFirstSelection={false}
						minDate={new Date(currentConvo.firstMessage / 1e3)}
						maxDate={new Date(currentConvo.lastMessage / 1e3)}
						ranges={[picker]}
						direction="vertical"
					/>
				</div>
			)}
		</div>
	)
}

export default ConvoSelector
