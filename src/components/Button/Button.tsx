import './button.sass'

function Button({
  label,
  action,
  icon,
}: {
  label: string
  action: () => any
  icon?: string
}) {
  return (
    <span className="button" onClick={action}>
      {icon && <i className={`icon-${icon}`}></i>}
      {label}
    </span>
  )
}

export default Button
