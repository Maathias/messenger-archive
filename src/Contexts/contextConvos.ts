import { createContext } from 'react'
import Convo from '../../ts/Convo'

export default createContext([] as { id: Convo['id']; title: Convo['title'] }[])
