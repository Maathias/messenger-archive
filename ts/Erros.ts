// create a custom error class for  'zip scanning' errors

export class ZipError extends Error {
	constructor(message) {
		super(message)
		this.name = 'ZipError'

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor)
		}
	}
}

export class DbError extends Error {
	constructor(message) {
		super(message)
		this.name = 'DbError'

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor)
		}
	}
}
