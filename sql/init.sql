PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

CREATE TABLE IF NOT EXISTS group_photos (
	uri varchar,
	creation timestamp,
	inbox char(10),
	PRIMARY KEY (uri),
	FOREIGN KEY (inbox) REFERENCES inboxes(id)
);

CREATE TABLE IF NOT EXISTS inboxes (
	id char(10),
	cat varchar,
	title varchar,
	thread varchar,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS participants (
	inbox char(10),
	uname int,
	participates boolean,
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	UNIQUE (inbox, uname)
);

-- 
-- MEDIA
-- 
-- 
CREATE TABLE IF NOT EXISTS photos (
	uri varchar,
	created timestamp,
	inbox char(10),
	message_sender varchar,
	message_created timestamp,
	PRIMARY KEY (uri),
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	FOREIGN KEY (message_sender) REFERENCES messages(sender),
	FOREIGN KEY (message_created) REFERENCES messages(created)
);

CREATE TABLE IF NOT EXISTS files (
	uri varchar,
	created timestamp,
	inbox char(10),
	message_sender varchar,
	message_created timestamp,
	PRIMARY KEY (uri),
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	FOREIGN KEY (message_sender) REFERENCES messages(sender),
	FOREIGN KEY (message_created) REFERENCES messages(created)
);

CREATE TABLE IF NOT EXISTS videos (
	uri varchar,
	created timestamp,
	inbox char(10),
	message_sender varchar,
	message_created timestamp,
	PRIMARY KEY (uri),
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	FOREIGN KEY (message_sender) REFERENCES messages(sender),
	FOREIGN KEY (message_created) REFERENCES messages(created)
);

CREATE TABLE IF NOT EXISTS audios (
	uri varchar,
	created timestamp,
	inbox char(10),
	message_sender varchar,
	message_created timestamp,
	PRIMARY KEY (uri),
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	FOREIGN KEY (message_sender) REFERENCES messages(sender),
	FOREIGN KEY (message_created) REFERENCES messages(created)
);

CREATE TABLE IF NOT EXISTS gifs (
	uri varchar,
	created timestamp,
	inbox char(10),
	message_sender varchar,
	message_created timestamp,
	PRIMARY KEY (uri),
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	FOREIGN KEY (message_sender) REFERENCES messages(sender),
	FOREIGN KEY (message_created) REFERENCES messages(created)
);

-- 
-- MESSAGES
-- 
-- 
CREATE TABLE IF NOT EXISTS messages (
	sender varchar,
	created timestamp(3),
	inbox char(10),
	content varchar,
	cat varchar,
	unsent boolean,
	UNIQUE (sender, created, inbox)
);

CREATE TABLE IF NOT EXISTS reactions (
	message_sender varchar,
	message_created timestamp(3),
	inbox char(10),
	reaction varchar,
	actor varchar,
	UNIQUE (message_sender, message_created, actor, inbox),
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	FOREIGN KEY (message_sender) REFERENCES messages(sender),
	FOREIGN KEY (message_created) REFERENCES messages(created)
);

CREATE TABLE IF NOT EXISTS shares (
	message_sender varchar,
	message_created timestamp(3),
	inbox char(10),
	link varchar,
	UNIQUE (message_sender, message_created, inbox),
	FOREIGN KEY (inbox) REFERENCES inboxes(id),
	FOREIGN KEY (message_sender) REFERENCES messages(sender),
	FOREIGN KEY (message_created) REFERENCES messages(created)
);