import './progress.sass'

function Progress({ label, status }: { label: string; status: number }) {
  return (
    <div className="progress">
      <span className="label">
        {label} [{status}%]
      </span>
      <div className="status" style={{ width: `${status}%` }}></div>
    </div>
  )
}

export default Progress
