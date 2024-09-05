INSERT
	OR IGNORE INTO inboxes (
		id,
		category,
		title,
		thread_path,
		is_still_participant,
		image,
		participants,
		joinable_mode,
		magic_words,
		meta
	)
VALUES
	(?, ?, ?, ?, ?, ?, ?, ?, ?, ?);