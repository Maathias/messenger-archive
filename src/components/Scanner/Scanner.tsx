import Progress from '../Progress/Progress'
import './scanner.sass'

function Scanner() {
  // prepare
  // scan for inboxes
  // parsing inboxes
  // parsing parts

  return (
    <div>
      <div className="header">Processing messages</div>
      <Progress label="main" status={50} />
      <Progress label="sub" status={25} />
    </div>
  )
}

export default Scanner
