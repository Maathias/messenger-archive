export enum MAIN_TO_RENDERER {
	UPDATE_PROGRESS = 'update-progress',
}

export enum RENDERER_TO_MAIN {
	// pre import
	GET_ZIP_PATHS = 'get-zip-paths',
	GET_DB_PATH = 'get-db-path',
	// import
	IMPORT_ZIPS = 'import-zips',
	IMPORT_DB = 'import-db',
	// queries
	GET_INBOXES = 'get-inboxes',
	GET_INBOX = 'get-inbox',
	GET_MESSAGES = 'get-messages',
	GET_MEDIA = 'get-media',
	GET_STATS = 'get-stats',
}
