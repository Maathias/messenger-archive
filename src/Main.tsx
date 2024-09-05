import { createContext, useContext, useEffect, useState } from 'react'

import Browse from './components/Browse/Browse'
import ConvoSelector from './components/ConvoSelector/ConvoSelector'
// import Media from './components/Media/Media'
// import Search from './components/Search/Search'
import Stats from './components/Stats/Stats'
import Intro from './components/Intro/Intro'
import Menu from './components/Menu/Menu'

import contextCurrentInbox from './Contexts/contextCurrentInbox'
import contextInboxes, { inboxList } from './Contexts/contextInboxes'

import './index.css'
import { RENDERER_TO_MAIN } from '../ts/types/global'
import { Inbox } from './Sources'
import { E_DATABASE, eDatabase } from './events'

const contextPane = createContext('')

function Pane({ children, id }: any) {
	const pane = useContext(contextPane)

	return (
		<div className="pane" style={{ display: pane == id ? 'initial' : 'none' }}>
			{children}
		</div>
	)
}

export default function Main() {
	const [pane, setPane] = useState('import')

	const [inboxes, setInboxes] = useState<inboxList>([]),
		[currentInbox, setCurrentInbox] = useState<Inbox | null>(null)

	let [range, setRange] = useState<[number, number]>([0, 0])

	useEffect(() => {
		if (currentInbox)
			setRange([currentInbox.meta.lastMessage - 86400, currentInbox.meta.lastMessage])
	}, [currentInbox])

	useEffect(() => {
		if (currentInbox) currentInbox.setRange(range)
	}, [range])

	useEffect(() => {
		eDatabase.addEventListener(E_DATABASE.DB_READY, (e: Event) => {
			let data = (e as CustomEvent).detail as inboxList
			setInboxes(data)
		})
	})

	async function changeInbox(id: string) {
		if (id == 'reset') {
			setCurrentInbox(null)
			setInboxes([])
			return
		}
		if (inboxes.filter(i => i.id == id).length != 1) return

		let raw = await window.invoke(RENDERER_TO_MAIN.GET_INBOX, id),
			inbox = new Inbox(raw)

		if (currentInbox) currentInbox.resetRange()
		inbox.setRange(range)

		console.log('Changing inbox', inbox)

		setCurrentInbox(inbox)
	}

	return (
		<div>
			<Menu setPane={id => setPane(id)} initial={pane} dbReady={currentInbox != null} />

			<div className="container">
				<contextInboxes.Provider value={[inboxes, setInboxes]}>
					<contextCurrentInbox.Provider value={[currentInbox, changeInbox, range, setRange]}>
						<contextPane.Provider value={pane}>
							<Pane id="convo" children={<Browse />} />
							{/* <Pane id="media" children={<Media />} /> */}
							{/* <Pane id="search" children={<Search />} /> */}
							<Pane id="stats" children={<Stats />} />

							<Pane id="import" children={<Intro />} />
							<Pane id="selector" children={<ConvoSelector />} />
							{/* TODO: settings */}
						</contextPane.Provider>
					</contextCurrentInbox.Provider>
				</contextInboxes.Provider>
			</div>
		</div>
	)
}
