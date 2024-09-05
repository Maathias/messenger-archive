import { createContext } from 'react'
import { Inbox } from '../Sources'

export default createContext<[Inbox | null, any, [number, number], any]>([
	null,
	undefined,
	[-1, -1],
	undefined,
])
