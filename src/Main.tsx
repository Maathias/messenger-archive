import { createContext, useContext, useState } from 'react'

import Intro from './components/Intro/Intro'
import Menu from './components/Menu/Menu'

import './index.css'

const contextPane = createContext('')

function Pane({ children, id }: any) {
  const pane = useContext(contextPane)

  console.log(id, pane)

  return (
    <div className="pane" style={{ display: pane == id ? 'initial' : 'none' }}>
      {children}
    </div>
  )
}

function Main() {
  const [pane, setPane] = useState('import')

  // const panes: { [id: string]: JSX.Element } = {
  //   import: <Intro />,
  //   scanner: <Scanner />,
  // }

  return (
    <div>
      {/* {pane == 'intro' && }

      {pane == 'scanning' && } */}

      <Menu setPane={id => setPane(id)} />

      <div className="container">
        <contextPane.Provider value={pane}>
          <Pane id="import" children={<Intro />} />
        </contextPane.Provider>
      </div>
    </div>
  )
}

export default Main
