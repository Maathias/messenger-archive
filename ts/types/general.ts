type updateProgress = (
	level: string,
	message: string,
	status: number,
	err?: Error
) => void
