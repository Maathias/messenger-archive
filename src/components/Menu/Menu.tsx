import { useState } from 'react'
import './menu.sass'
import icon from '../../../assets/icon.png'

function Menu({
	setPane,
	initial,
	dbReady,
}: {
	setPane: (id: string) => void
	initial: string
	dbReady: boolean
}) {
	const [active, setActive] = useState(initial)

	const options = [
			['convo', 'chat-empty', 'View conversation'],
			['media', 'picture', 'View media'],
			['search', 'search', 'Search'],
			['stats', 'chart-bar', 'View statistics'],
		],
		bottomOptions = [
			['selector', 'th-list', 'Select conversation'],
			['import', 'download', 'Import messages'],
			['settings', 'cog-alt', 'Settings'],
		]

	function change(id: string) {
		setActive(id)
		setPane(id)
	}

	return (
		<div className="menu">
			<img src={icon} alt="" />
			<div className="lists">
				<div className="list">
					{options.map(([id, icon, title]) => (
						<i
							key={id}
							data-active={id == active}
							data-disabled={!dbReady}
							className={`icon-${icon}`}
							title={title}
							onClick={() => dbReady && change(id)}
						></i>
					))}
				</div>
				<div className="list bottom">
					{bottomOptions.map(([id, icon, title]) => (
						<i
							key={id}
							data-active={id == active}
							className={`icon-${icon}`}
							title={title}
							onClick={() => change(id)}
						></i>
					))}
				</div>
			</div>
		</div>
	)
}

export default Menu
