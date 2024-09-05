import { useContext, useEffect, useState } from 'react'
import { DateRangePicker } from 'react-date-range'

import contextCurrentInbox from '../../Contexts/contextCurrentInbox'
import contextInboxes from '../../Contexts/contextInboxes'

import './convoselector.sass'

import 'react-date-range/dist/styles.css' // picker main style file
import 'react-date-range/dist/theme/default.css' // picker theme css file
import { Avatar, FormControl, InputLabel, ListSubheader, MenuItem, Select } from '@mui/material'
import BlobMedia from '../BlobMedia/BlobMedia'
import { stringAvatar } from '../universal'

const categoryLookup = {
		e2ee_cutover: 'Inboxes Encrypted',
		inbox: 'Inboxes',
		archived_threads: 'Archived',
		message_requests: 'Requests',
		filtered_threads: 'Filtered',
	},
	categoryOrder = [
		'e2ee_cutover',
		'inbox',
		'archived_threads',
		'message_requests',
		'filtered_threads',
	]

function ConvoSelector() {
	const [inboxes] = useContext(contextInboxes),
		[currentInbox, changeInbox, , setRange] = useContext(contextCurrentInbox)

	const [picker, setPicker] = useState({
		startDate: new Date(new Date().getTime() - 3.024e9),
		endDate: new Date(),
		key: 'selection',
	})

	let separator = label => <ListSubheader color="primary">{label}</ListSubheader>

	useEffect(() => {
		setRange([picker.startDate.getTime(), picker.endDate.getTime() + 8.64e7])
	}, [picker])

	return (
		<div className="selector">
			<div className="select">
				<FormControl fullWidth>
					<InputLabel id="select-label">Select an inbox</InputLabel>
					<Select
						labelId="select-label"
						value={currentInbox?.id || ''}
						label="Inbox"
						onChange={({ target: { value } }) => changeInbox(value)}
					>
						{inboxes
							// .sort((a, b) => a.category.localeCompare(b.category))
							// .sort((a, b) => a.title.localeCompare(b.title))
							.sort((a, b) => {
								let category =
										categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
									title = a.title.localeCompare(b.title)

								return category || title
							})
							.map((current, i, all) => {
								let children = [
									<MenuItem value={current.id} key={current.id}>
										{current.title}
									</MenuItem>,
								]

								if (i == 0) children.unshift(separator(categoryLookup[current.category]))
								else {
									if (all[i - 1].category != current.category)
										children.unshift(separator(categoryLookup[current.category]))
								}
								return children
							})}
					</Select>
				</FormControl>
			</div>

			{currentInbox && (
				<div className="preview">
					<h2>{currentInbox.title}</h2>
					<div className="desc">
						<div className="photo">
							{currentInbox.image ? (
								<div className="img">
									<BlobMedia uri={currentInbox.image.uri} mediaType="group_photos" />
								</div>
							) : (
								<Avatar {...stringAvatar(currentInbox.title)} />
							)}
						</div>

						<table>
							<tbody>
								<tr>
									<td>Title</td>
									<td>{currentInbox.title}</td>
								</tr>
								{/* <tr>
									<td>Type</td>
									<td>{currentConvo.type}</td>
								</tr> */}
								<tr>
									<td>Category</td>
									<td>{currentInbox.category}</td>
								</tr>
								<tr>
									<td>First Message</td>
									<td>{new Date(currentInbox.meta.firstMessage).toLocaleString()}</td>
								</tr>
								<tr>
									<td>Last Message</td>
									<td>{new Date(currentInbox.meta.lastMessage).toLocaleString()}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<h2>Members</h2>
					<div className="members">
						<ul>
							{currentInbox.participants.map(m => (
								<li
									key={m.name + currentInbox.id}
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

			{currentInbox && (
				<div className="picker">
					<h1>Select a range for displayed messages:</h1>
					<DateRangePicker
						onChange={item => setPicker(item.selection)}
						showSelectionPreview={true}
						moveRangeOnFirstSelection={false}
						minDate={new Date(currentInbox.meta.firstMessage)}
						maxDate={new Date(currentInbox.meta.lastMessage)}
						ranges={[picker]}
						direction="vertical"
					/>
				</div>
			)}
		</div>
	)
}

export default ConvoSelector
