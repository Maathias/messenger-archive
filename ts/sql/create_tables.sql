CREATE TABLE
	inboxes (
		id TEXT NOT NULL,
		category TEXT NOT NULL,
		title TEXT NOT NULL,
		thread_path TEXT NOT NULL,
		is_still_participant BOOLEAN NOT NULL,
		-- JSON
		image TEXT,
		participants TEXT NOT NULL,
		joinable_mode TEXT,
		magic_words TEXT,
		meta TEXT NOT NULL
	);

CREATE TABLE
	messages (
		id TEXT PRIMARY KEY,
		inbox TEXT NOT NULL,
		sender_name TEXT NOT NULL,
		timestamp_ms INTEGER NOT NULL,
		content TEXT NOT NULL,
		is_unsent BOOLEAN NOT NULL,
		-- optional
		ip TEXT,
		call_duration INTEGER,
		missed BOOLEAN,
		-- JSON
		photos TEXT,
		gifs TEXT,
		videos TEXT,
		audio_files TEXT,
		files TEXT,
		sticker TEXT,
		share TEXT,
		reactions TEXT
	);

-- META
CREATE TABLE
	stats (
		inbox TEXT NOT NULL,
		name TEXT NOT NULL,
		content TEXT NOT NULL
	);

CREATE TABLE
	meta (
		inbox TEXT NOT NULL,
		name TEXT NOT NULL,
		content TEXT NOT NULL
	);

-- MEDIA TABLES
CREATE TABLE
	group_photos (
		id TEXT PRIMARY KEY,
		inbox TEXT,
		name TEXT NOT NULL,
		data BLOB NOT NULL
	);

CREATE TABLE
	stickers_used (
		id TEXT PRIMARY KEY,
		inbox TEXT,
		name TEXT NOT NULL,
		data BLOB NOT NULL
	);

CREATE TABLE
	photos (
		id TEXT PRIMARY KEY,
		inbox TEXT NOT NULL,
		name TEXT NOT NULL,
		data BLOB NOT NULL
	);

CREATE TABLE
	videos (
		id TEXT PRIMARY KEY,
		inbox TEXT NOT NULL,
		name TEXT NOT NULL,
		data BLOB NOT NULL
	);

CREATE TABLE
	audio_files (
		id TEXT PRIMARY KEY,
		inbox TEXT NOT NULL,
		name TEXT NOT NULL,
		data BLOB NOT NULL
	);

CREATE TABLE
	files (
		id TEXT PRIMARY KEY,
		inbox TEXT NOT NULL,
		name TEXT NOT NULL,
		data BLOB NOT NULL
	);

CREATE TABLE
	gifs (
		id TEXT PRIMARY KEY,
		inbox TEXT NOT NULL,
		name TEXT NOT NULL,
		data BLOB NOT NULL
	);