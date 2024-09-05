import { createContext } from 'react'

export type inboxList = { id: string; title: string; category: string }[]

export default createContext<[inboxList, any]>([[], undefined])
