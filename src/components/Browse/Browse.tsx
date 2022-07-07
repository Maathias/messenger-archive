import { useContext, useEffect, useState } from 'react'
import Convo from '../../../ts/Convo'
import Message from '../../../ts/Message'
import { messageMedia } from '../../../ts/types/takeout'
import contextCurrentConvo from '../../Contexts/contextCurrentConvo'
import PartialConvo from '../../PartialConvo'

import './browse.sass'

function Media({ type, contents }: { type: string; contents: messageMedia[] }) {
	// TODO: add image preview
	return (
		<div className={'media ' + type}>
			{{
				photos: contents.map(p => (
					<img key={p.uri} src={'file://' + p.uri} />
				)),
				gifs: contents.map(g => (
					<img key={g.uri} src={'file://' + g.uri} />
				)),
				videos: contents.map(v => (
					<video controls>
						<source src={v.uri} />
					</video>
				)),
				audios: contents.map(a => (
					<audio controls>
						<source src={a.uri} />
					</audio>
				)),
			}[type] ?? (
				<span>
					{type}: {JSON.stringify(contents)}
				</span>
			)}
		</div>
	)
}

function MessageBubble({
	message: { sender, content, time, media, unsent, sticker, reactions },
	convo,
	type,
	init,
	close,
	reactions: hasReactions,
	highlight,
}: {
	message: Message
	convo: Convo
	type: 'first' | 'middle' | 'last' | 'alone'
	init: boolean
	close: boolean
	reactions: boolean
	highlight: boolean
}) {
	let date = new Date(time / 1e3)
	return (
		<div
			className={[
				'message',
				sender == convo.owner && 'self',
				type,
				init && 'init',
				close && 'close',
				unsent && 'unsent',
				media && 'media',
				sticker && 'sticker',
				hasReactions && 'reactions',
				highlight && 'highlight',
			]
				.filter(c => c)
				.join(' ')}
			data-time={date.toLocaleString()}
			data-media={media && Object.keys(media)}
			title={date.toISOString()}
		>
			<div className="sender">{sender}</div>
			<div className="content">
				{content}
				{media && (
					<div className="media">
						{Object.entries(media).map(([type, contents]) => (
							<Media key={type} type={type} contents={contents} />
						))}
					</div>
				)}
				{sticker && <img src={'file://' + sticker} />}
				{reactions && (
					<div className="reactions">
						{reactions.map(({ reaction, actor }) => (
							<span key={actor} title={actor}>
								{reaction}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

export function Chat({
	range,
	goto,
}: {
	range: [number, number]
	goto?: number
}) {
	const [[currentConvo]] = useContext(contextCurrentConvo)

	const [partial, setPartial] = useState<PartialConvo>()

	useEffect(() => {
		if (currentConvo) setPartial(new PartialConvo(currentConvo, range))
	}, [currentConvo, range])

	useEffect(() => {
		document
			.querySelector<HTMLElement>('.browse .message.highlight')
			?.scrollIntoView({
				behavior: 'smooth',
			})
	})

	return (
		(partial && currentConvo && (
			<div className="browse">
				<div className="timestamp">
					{/* TODO: add expand range buttons */}⇊{' '}
					{new Date(range[0] / 1e3).toLocaleString()} ⇊
				</div>
				{partial.messages.slice(0, 500).map((m, i, all) => (
					<MessageBubble
						key={m.time}
						message={m}
						convo={currentConvo}
						type={
							m.sender == all[i - 1]?.sender
								? m.sender == all[i + 1]?.sender
									? 'middle'
									: 'last'
								: m.sender == all[i + 1]?.sender
								? 'first'
								: 'alone'
						}
						init={m.time - all[i - 1]?.time > 9e8 || i == 0}
						close={all[i + 1]?.time - m.time > 9e8}
						reactions={!!m.reactions}
						highlight={m.time == goto}
					/>
				))}
				{partial.count < 1 && (
					<div className="timestamp">
						No messages in the selected range
					</div>
				)}
				<div className="timestamp">
					⇈ {new Date(range[1] / 1e3).toLocaleString()} ⇈
				</div>
			</div>
		)) || <></>
	)
}

export default function Browse() {
	const [[currentConvo], [range]] = useContext(contextCurrentConvo)

	const [partial, setPartial] = useState<PartialConvo>()

	useEffect(() => {
		if (currentConvo) setPartial(new PartialConvo(currentConvo, range))
	}, [currentConvo, range])

	return (
		<>
			{(partial && currentConvo && <Chat range={range} />) || (
				<div className="timestamp">Select a conversation</div>
			)}
		</>
	)
}
