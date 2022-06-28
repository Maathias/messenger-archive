import { useState } from 'react'
import './menu.sass'
import icon from '../../../assets/icon.png'

function Menu({ setPane }: { setPane: (id: string) => void }) {
	const [active, setActive] = useState('convo')

	const options = [
			['convo', 'chat-empty', 'View conversation'],
			['media', 'picture', 'View media'],
			['search', 'search', 'Search'],
			['stats', 'chart-bar', 'View statistics'],
		],
		bottomOptions = [
			['import', 'download', 'Import messages'],
			['settings', 'cog-alt', 'Settings'],
		]

	function change(id: string) {
		setActive(id)
		setPane(id)
	}

	return (
		// view convo
		// search
		// view media
		// stats
		<div className="menu">
			<img src={icon} alt="" />
			<div className="lists">
				<div className="list">
					{options.map(([id, icon, title]) => (
						<i
							key={id}
							data-active={id == active}
							className={`icon-${icon}`}
							title={title}
							onClick={() => change(id)}
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
					{/* <i className="icon-download import"></i>
          <i className="icon-cog-alt settings"></i> */}
				</div>
			</div>
		</div>
	)
}

export default Menu
