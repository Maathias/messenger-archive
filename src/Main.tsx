import { createContext, useContext, useEffect, useState } from 'react'

import Browse from './components/Browse/Browse'
import ConvoSelector from './components/ConvoSelector/ConvoSelector'
import Media from './components/Media/Media'
import Search from './components/Search/Search'
import Stats from './components/Stats/Stats'
import Intro from './components/Intro/Intro'
import Menu from './components/Menu/Menu'

import contextCurrentConvo from './Contexts/contextCurrentConvo'
import contextConvos from './Contexts/contextConvos'

import { dateToUnixExtended } from './PartialConvo'
import Convo from '../ts/Convo'

import './index.css'

const contextPane = createContext('')

function Pane({ children, id }: any) {
	const pane = useContext(contextPane)

	return (
		<div
			className="pane"
			style={{ display: pane == id ? 'initial' : 'none' }}
		>
			{children}
		</div>
	)
}

export default function Main() {
	const [pane, setPane] = useState('selector'),
		[convos, setConvos] = useState([])

	const [currentConvo, setCurrentConvo] = useState<Convo | null>(null)

	let [range, setRange] = useState<[number, number]>([
		dateToUnixExtended(new Date()) - 1.296e13,
		dateToUnixExtended(new Date()),
	])

	useEffect(() => {
		// TODO: check if there are any already scanned convos
		window.events.on('update-convos-ids', convos => setConvos(convos))
	}, [])

	async function changeConvo(id: string) {
		let data = await window.invoke('get-convo', id)
		data = JSON.parse(data)
		setCurrentConvo(data)
	}

	return (
		<div>
			<Menu setPane={id => setPane(id)} initial={pane} />

			<div className="container">
				<contextConvos.Provider value={convos}>
					<contextCurrentConvo.Provider
						value={[
							[currentConvo, changeConvo],
							[range, setRange],
						]}
					>
						<contextPane.Provider value={pane}>
							<Pane id="convo" children={<Browse />} />
							<Pane id="media" children={<Media />} />
							<Pane id="search" children={<Search />} />
							<Pane id="stats" children={<Stats />} />

							<Pane id="import" children={<Intro />} />
							<Pane id="selector" children={<ConvoSelector />} />
							{/* TODO: settings */}
						</contextPane.Provider>
					</contextCurrentConvo.Provider>
				</contextConvos.Provider>
			</div>
		</div>
	)
}
