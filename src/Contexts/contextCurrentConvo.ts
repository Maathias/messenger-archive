import { createContext } from 'react'
import Convo from '../../ts/Convo'

export default createContext<[[Convo | null, any], [[number, number], any]]>([
	[null, undefined],
	[[0, Infinity], undefined],
])
