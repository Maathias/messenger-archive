import { useContext, useEffect, useState } from 'react'
import Message from '../../../ts/Message'
import { messageMedia } from '../../../ts/types/takeout'
import contextCurrentConvo from '../../Contexts/contextCurrentConvo'
import PartialConvo from '../../PartialConvo'

import './media.sass'

function Entry({
	type,
	content,
	message,
	goto,
}: {
	type: string
	content: messageMedia
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
						audios: <i className="icon-mic"></i>,
						videos: <i className="icon-video"></i>,
						files: <i className="icon-attach"></i>,
					}[type]
				}
				{message.sender} &mdash;&nbsp;
				{new Date(message.time / 1e3).toLocaleDateString()}
			</div>

			{open && (
				<div className="preview">
					{
						{
							photos: (
								<img src={content.uri} alt="unable to load image" />
							),
							gifs: <img src={content.uri} alt="unable to load gif" />,
							audios: (
								<audio controls>
									<source src={content.uri} />
								</audio>
							),
							videos: (
								<video controls>
									<source src={content.uri} />
								</video>
							),
							files: <i className="icon-attach"></i>,
						}[type]
					}

					<div className="info">
						<div>
							Time: {new Date(message.time / 1e3).toLocaleTimeString()}
						</div>
						{content.creation_timestamp && (
							<div>
								Created:{' '}
								{new Date(
									content.creation_timestamp * 1e3
								).toLocaleString()}
							</div>
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
	const [[currentConvo], [range, setRange]] = useContext(contextCurrentConvo)

	const [partial, setPartial] = useState<PartialConvo>()

	useEffect(() => {
		if (currentConvo) setPartial(new PartialConvo(currentConvo, range))
	}, [currentConvo, range])

	return (
		<div className="media">
			{partial &&
				partial.messages
					.filter(({ media }) => media)
					.map(message =>
						Object.entries(message.media!).map(([type, entries]) =>
							entries.map(e => (
								<Entry
									key={e.uri}
									type={type}
									content={e}
									message={message}
									goto={() => {}} /* TODO: add goto in conversation feature */
								/>
							))
						)
					)
					.flat()}
		</div>
	)
}
