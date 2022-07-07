import Fuse from 'fuse.js'
import { useContext, useEffect, useState } from 'react'
import Convo from '../../../ts/Convo'
import Message from '../../../ts/Message'
import { chunkRange } from '../../ChunkConvo'
import contextCurrentConvo from '../../Contexts/contextCurrentConvo'
import PartialConvo from '../../PartialConvo'
import { Chat } from '../Browse/Browse'

import './search.sass'

function runSearch(convo: Convo, query: string, options: {}) {
	let fullPartial = new PartialConvo(convo, [0, Infinity])
	const fuse = new Fuse(fullPartial.messages, {
		keys: ['content'],
		...options,
	})

	return fuse.search(query)
}

export default function Search() {
	const [[currentConvo]] = useContext(contextCurrentConvo)

	let [query, setQuery] = useState(''),
		[accuracy, setAccuracy] = useState(0.6),
		[caseSensitive, setCaseSensitive] = useState(false),
		[range, setRange] = useState<[number, number]>()

	const [[results, n], setResults] = useState<
		[Fuse.FuseResult<Message>[], number]
	>([[], -1])

	function search() {
		setResults([
			runSearch(currentConvo!, query, {
				threshold: accuracy,
				caseSensitive,
			}),
			0,
		])
	}

	function browse(up: boolean) {
		if (up) {
			if (n < results.length - 1) setResults(([r, n]) => [r, ++n])
		} else {
			if (n > 0) setResults(([r, n]) => [r, --n])
		}
	}

	useEffect(() => {
		currentConvo &&
			n != -1 &&
			setRange(chunkRange(currentConvo, results[n].item.time, [6, 8]))
	}, [results, n])

	// TODO: add regex mode,
	// enter to search and next,
	// more search options

	return (
		<div className="search">
			<div className="criteria">
				Search criteria
				<div>
					<input
						type="search"
						name="query"
						placeholder="Search query"
						onChange={e => setQuery(e.target.value)}
					/>
					Case sensisite:{' '}
					<input
						type="checkbox"
						name="case"
						onChange={e => setCaseSensitive(e.target.checked)}
					/>
					<input
						type="range"
						name="accuracy"
						min={0}
						max={1}
						step="0.025"
						onChange={e => setAccuracy(parseInt(e.target.value))}
					/>
					<input
						type="button"
						value="Search"
						onClick={() => currentConvo && search()}
					/>
					<input
						type="button"
						value="Previous"
						onClick={() => browse(false)}
					/>
					<input type="button" value="Next" onClick={() => browse(true)} />
				</div>
				{n > -1 && <div>Results: {results.length}</div>}
			</div>
			<div>
				{currentConvo && range && results.length > 0 && (
					<Chat goto={results[n].item.time} range={range} />
				)}
			</div>
		</div>
	)
}
