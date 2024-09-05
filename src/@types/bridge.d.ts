import { events, invoke } from '../../electron/preload'
import { E_DATABASE } from '../events'

declare global {
	// eslint-disable-next-line
	interface Window {
		events: typeof events
		invoke: typeof invoke
	}
}
