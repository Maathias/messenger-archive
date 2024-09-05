INSERT INTO
	messages (
		id,
		inbox,
		sender_name,
		timestamp_ms,
		content,
		is_unsent,
		ip,
		call_duration,
		missed,
		photos,
		gifs,
		videos,
		audio_files,
		files,
		sticker,
		share,
		reactions
	)
VALUES
	(
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?,
		?
	);