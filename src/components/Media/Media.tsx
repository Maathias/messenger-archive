import { useContext, useEffect, useState } from 'react'

import './media.sass'
import contextCurrentInbox from '../../Contexts/contextCurrentInbox'
import { Inbox, Message } from '../../Sources'

function Entry({
	media,
	message,
	goto,
}: {
	media: {
		type: string
		uri: string
		creation_timestamp: number
	}
	message: Message
	goto: (number) => void
}) {
	const [open, setOpen] = useState(false)

	return (
		<div className="entry" data-open={open}>
			<div className="header" onClick={() => setOpen(o => !o)}>
				{
					{
						photos: <i className="icon-picture"></i>,
						gifs: <i className="icon-picture"></i>,
						videos: <i className="icon-video"></i>,
						audio_files: <i className="icon-mic"></i>,
						files: <i className="icon-attach"></i>,
					}[media.type]
				}
				{message.sender_name} &mdash;&nbsp;
				{new Date(message.timestamp_ms).toLocaleDateString()}
			</div>

			{open && (
				<div className="preview">
					{{
						photos: () => <img src={media.uri} alt="unable to load image" />,
						gifs: () => <img src={media.uri} alt="unable to load gif" />,
						audios: () => (
							<audio controls>
								<source src={media.uri} />
							</audio>
						),
						videos: () => (
							<video controls>
								<source src={media.uri} />
							</video>
						),
						files: () => <i className="icon-attach"></i>,
					}[media.type]()}

					<div className="info">
						<div>Time: {new Date(message.timestamp_ms).toLocaleTimeString()}</div>
						{media.creation_timestamp && (
							<div>Created: {new Date(media.creation_timestamp).toLocaleString()}</div>
						)}
						<div></div>
						<div></div>
						{message.reactions && (
							<div className="reactions">
								Reactions:
								{message.reactions.map(({ reaction, actor }) => (
									<span title={actor}>{reaction}</span>
								))}
							</div>
						)}
						<div>
							<a href="#" onClick={goto}>
								Go to conversation
							</a>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function Preview() {
	return <span>lmao</span>
}

// TODO: add optional grid view

export default function Media() {
	const [currentInbox, changeInbox, range] = useContext(contextCurrentInbox)

	return (
		<div className="media">
			{
				currentInbox &&
					currentInbox.messages
						.filter(
							message =>
								Object.keys(message).filter(key => Inbox.mediaKeys.includes(key)).length > 0
						)
						.map(message =>
							Object.entries(message)
								.filter(([key, value]) => Inbox.mediaKeys.includes(key))
								.map(([type, value]) => ({
									type,
									...value,
								}))
								.flat()
								.map(media => [media, message])
						)
						.flat(3)
						.map(([media, message]) => {
							return <Entry media={media} message={message} goto={() => {}} />
						})
				// .map(media =>
				// 	Object.entries(message.media!).map(([type, entries]) =>
				// 		entries.map(e => (
				// 			<Entry
				// 				key={e.uri}
				// 				type={type}
				// 				content={e}
				// 				message={message}
				// 				goto={() => {}} /* TODO: add goto in conversation feature */
				// 			/>
				// 		))
				// 	)
				// )
				// .flat()}
			}
		</div>
	)
}
