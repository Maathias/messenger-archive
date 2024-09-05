import { useContext, useEffect, useState } from 'react'

import './browse.sass'
import contextCurrentInbox from '../../Contexts/contextCurrentInbox'
import { Message, Inbox } from '../../Sources'
import BlobMedia from '../BlobMedia/BlobMedia'
import { Alert, Button, Popover } from '@mui/material'

function Media({ message }: { message: Message }) {
	const { photos, gifs, videos, audio_files, files, sticker, share } = message

	let children: JSX.Element[] = []

	if (photos) {
		children.push(...photos.map(p => <BlobMedia uri={p.uri} mediaType="photos" />))
	}

	if (gifs) {
		children.push(...gifs.map(g => <BlobMedia uri={g.uri} mediaType="gifs" />))
	}

	if (videos) {
		children.push(...videos.map(v => <BlobMedia uri={v.uri} mediaType="videos" />))
	}

	if (audio_files) {
		children.push(...audio_files.map(a => <BlobMedia uri={a.uri} mediaType="audio_files" />))
	}

	if (files) {
		children.push(...files.map(f => <BlobMedia uri={f.uri} mediaType="files" />))
	}

	if (sticker) {
		children.push(<BlobMedia uri={sticker.uri} mediaType="sticker" />)
	}

	if (share) {
		children.push(<i>{share.link}</i>)
	}

	return <div className="media">{children}</div>
}

function MessageBubble({
	message,
	previous,
	next,
	inbox,
	highlight,
	n,
}: {
	message: Message
	previous: Message
	next: Message

	inbox: Inbox

	highlight: boolean
	n: number
}) {
	const { sender_name, timestamp_ms, is_unsent, content, reactions } = message

	const timeBetweenConversations = 9e5

	let type =
			sender_name == previous?.sender_name
				? sender_name == next?.sender_name
					? 'middle'
					: 'last'
				: sender_name == next?.sender_name
				? 'first'
				: 'alone',
		init = timestamp_ms - previous?.timestamp_ms > timeBetweenConversations || n == 0,
		close = next?.timestamp_ms - timestamp_ms > timeBetweenConversations

	let date = new Date(timestamp_ms),
		hasMedia = Object.keys(message).filter(item => Inbox.mediaKeys.includes(item)).length > 0,
		isSticker = message.sticker != null,
		hasReactions = message.reactions != null

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null),
		handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
			setAnchorEl(event.currentTarget)
		},
		handlePopoverClose = () => {
			setAnchorEl(null)
		},
		open = Boolean(anchorEl),
		unique = reactions ? [...new Set(reactions.map(r => r.reaction))] : []

	return (
		<div
			className={[
				'message',
				inbox.isOwner(sender_name) && 'self',
				type,
				init && 'init',
				close && 'close',
				is_unsent && 'unsent',
				hasMedia && 'media',
				isSticker && 'sticker',
				hasReactions && 'reactions',
				highlight && 'highlight',
			]
				.filter(c => c)
				.join(' ')}
			data-time={date.toLocaleString()}
			// data-media={media && Object.keys(media)}
			title={date.toISOString()}
		>
			<div className="sender">{sender_name}</div>
			<div className="content">
				{hasMedia || content}
				{hasMedia && (
					<div className="media">
						<Media message={message} />
					</div>
				)}

				{/* {sticker && <img src={'file://' + sticker} />} */}
				{reactions && (
					<>
						<div
							className="reactions"
							aria-owns={open ? 'mouse-over-popover' : undefined}
							aria-haspopup="true"
							onClick={open ? handlePopoverClose : handlePopoverOpen}
						>
							{unique.map(reaction => (
								<span key={reaction}>{reaction}</span>
							))}
							{<span>{reactions.length}</span>}
						</div>
						{/* popover */}
						<Popover
							id="mouse-over-popover"
							sx={{
								pointerEvents: 'none',
							}}
							open={open}
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							onClose={handlePopoverClose}
							disableRestoreFocus
						>
							<div className="reactors">
								{reactions.map(({ reaction, actor }) => (
									<div key={actor}>
										{reaction} {actor}
									</div>
								))}
							</div>
						</Popover>
					</>
				)}
			</div>
		</div>
	)
}

export function Chat({
	inbox,
	range,
	expand,
	goto,
}: {
	inbox: Inbox
	range: [number, number]
	expand: (days: number) => void
	goto?: number
}) {
	// TODO: scroll to goto
	// useEffect(() => {
	// 	document
	// 		.querySelector<HTMLElement>('.browse .message.highlight')
	// 		?.scrollIntoView({
	// 			behavior: 'smooth',
	// 		})
	// })

	const messages = inbox.messages.slice(0, 500)

	return (
		<div className="browse">
			<Button variant="outlined" size="small" onClick={() => expand(-1)}>
				Earlier
			</Button>
			<div className="timestamp">⇊ {new Date(range[0]).toLocaleDateString()} ⇊</div>
			{messages.map((m, i, all) => {
				const previous = all[i - 1],
					next = all[i + 1]

				return (
					<MessageBubble
						key={m.timestamp_ms + m.sender_name}
						message={m}
						inbox={inbox}
						previous={previous}
						next={next}
						n={i}
						highlight={m.timestamp_ms == goto}
					/>
				)
			})}
			{messages.length < 1 && (
				// <div className="timestamp">No messages in the selected range</div>
				<Alert severity="info">No messages in the selected range</Alert>
			)}
			<div className="timestamp">⇈ {new Date(range[1]).toLocaleDateString()}⇈</div>
			<Button variant="outlined" size="small" onClick={() => expand(1)}>
				Later
			</Button>
		</div>
	)
}

export default function Browse() {
	const [currentInbox, , range, setRange] = useContext(contextCurrentInbox)

	function expandRange(days: number) {
		let ms = days * 86400 * 1000
		if (ms > 0) setRange([range[0], range[1] + ms])
		else setRange([range[0] + ms, range[1]])
	}

	return (
		<>
			{!currentInbox && <div className="timestamp">Select a conversation</div>}
			{currentInbox && <Chat inbox={currentInbox} range={range} expand={expandRange} />}
		</>
	)
}
