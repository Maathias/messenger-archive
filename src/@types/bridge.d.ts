import { events, invoke } from '../../electron/preload'

declare global {
	// eslint-disable-next-line
	interface Window {
		events: typeof events
		invoke: typeof invoke
	}
}
