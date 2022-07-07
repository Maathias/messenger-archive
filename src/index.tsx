import { createRoot } from 'react-dom/client'
import lorem from '../ts/lorem'
import Main from './Main'

if (!window.events)
	window.events = {
		send: () => {},
		on: () => {},
		// @ts-ignore
		off: () => {},
	}

if (!window.invoke) {
	window.invoke = async (chanel, data) => {
		if (chanel == 'get-convo') return JSON.stringify(lorem?.[data]) ?? null
		if (chanel == 'scan')
			return Object.keys(lorem).map(id => ({ id, title: lorem[id].title }))
	}
}

createRoot(document.getElementById('root')!).render(<Main />)
