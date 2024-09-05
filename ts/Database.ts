import sqlite, { Database } from 'better-sqlite3'
import fs from 'fs'

import { EntryTypes, FileType, Progress } from './zips'
import Inbox from './Inbox'
import Message from './Message'

import RawTakeout from './types/takeout_schema'
import { createMediaId, createMessageId } from './normalizers'
import { DbError } from './Erros'

type ConversationFileTypes = 'audio_files' | 'files' | 'gifs' | 'photos' | 'videos' | 'json'

let sql: { [key: string]: string } = {}

fs.readdirSync('./ts/sql').forEach(
	file => (sql[file.split('.')[0]] = fs.readFileSync(`./ts/sql/${file}`).toString())
)

let database: Database

function connectDB(path: string): Database {
	let exists = fs.existsSync(path)

	// connect to the database
	database = sqlite(path)

	if (exists) {
		// TODO: verify the schema
	} else {
		database.exec(sql.create_tables)
		database.pragma('journal_mode = WAL')
	}

	return database
}

function closeDB() {
	if (database) database.close()
}

// function identifyConversaionFile(entryName: string): {
// 	mediaType: ConversationFileTypes
// 	fileName: string
// } {
// 	let segments = entryName.split('/')

// 	if (segments.length == 5)
// 		if (segments[4].endsWith('.json')) return { mediaType: 'json', fileName: segments[4] }

// 	let type = segments[4] as ConversationFileTypes

// 	if (segments[4] == 'audio') type = 'audio_files'

// 	return { mediaType: type, fileName: identifyFileName(entryName) }
// }

function identifyEntryProperties(entryName: string): { fileName: string; inbox: string | null } {
	let segments = entryName.split('/'),
		fileName = segments[segments.length - 1],
		inbox: string | null = null

	if (segments.length > 3) {
		inbox = segments[3]
	}

	return { fileName, inbox }
}

// function identifyFileName(entryName: string) {
// 	let segments = entryName.split('/')
// 	return segments[segments.length - 1]
// }

// function identifyInbox(entryName: string) {
// 	return entryName.split('/')[3]
// }

function insertInbox(inbox: Inbox) {
	{
		// inbox
		const stmt = database.prepare(sql.insert_inbox)

		const data = [
			inbox.id,
			inbox.category,
			inbox.title,
			inbox.thread_path,
			~~inbox.is_still_participant,
			JSON.stringify(inbox.image) || null,
			JSON.stringify(inbox.participants),
			JSON.stringify(inbox.joinable_mode) || null,
			JSON.stringify(inbox.magic_words) || null,
			JSON.stringify(inbox.meta),
		]

		stmt.run(...data)
	}
	{
		// stats
		const stmt = database.prepare(sql.insert_stats)

		for (let stat in inbox.stats) {
			const data = [inbox.id, stat, JSON.stringify(inbox.stats[stat])]

			stmt.run(...data)
		}
	}
}

function insertMessage(inbox: string, message: Message, salt?: number) {
	try {
		const stmt = database.prepare(sql.insert_message)

		const data = [
			createMessageId(inbox, message, salt),
			inbox,
			message.sender_name,
			message.timestamp_ms,
			message.content,
			~~message.is_unsent,
			message.ip || null,
			message.call_duration || null,
			message.missed ? ~~message.missed : null,
			JSON.stringify(message.photos) || null,
			JSON.stringify(message.gifs) || null,
			JSON.stringify(message.videos) || null,
			JSON.stringify(message.audio_files) || null,
			JSON.stringify(message.files) || null,
			JSON.stringify(message.sticker) || null,
			JSON.stringify(message.share) || null,
			JSON.stringify(message.reactions) || null,
		]
		stmt.run(...data)
	} catch (e) {
		if (e instanceof sqlite.SqliteError && e.code == 'SQLITE_CONSTRAINT_PRIMARYKEY') {
			return insertMessage(inbox, message, salt ? salt + 1 : 1)
		}

		throw new DbError(`Failed to insert message (${inbox} - ${message.timestamp_ms})`)
	}
}

function insertMedia(
	mediaType: EntryTypes,
	fileName: string,
	inbox: string | null,
	buffer: Buffer,
	salt?: number
) {
	try {
		const stmt = database.prepare(
			`INSERT INTO ${mediaType} (id, name, inbox, data) VALUES (?, ?, ?, ?)`
		)

		const data = [
			createMediaId(
				{
					inbox: inbox || '',
					fileName,
				},
				salt
			),
			fileName,
			inbox || null,
			buffer,
		]

		stmt.run(...data)
	} catch (e) {
		if (e instanceof sqlite.SqliteError && e.code == 'SQLITE_CONSTRAINT_PRIMARYKEY') {
			return insertMedia(mediaType, fileName, inbox, buffer, salt ? salt + 1 : 1)
		}

		throw new DbError(`Failed to insert media (${mediaType} - ${fileName})`)
	}
}

// function insertGeneral(table: 'group_photos' | 'stickers_used', fileName: string, buffer: Buffer) {
// 	try {
// 		const stmt = database.prepare(`INSERT INTO ${table} (name, data) VALUES (?, ?)`)
// 		stmt.run(fileName, buffer)
// 	} catch (e) {
// 		console.error(e)
// 	}
// }

function insertMeta(name: string, meta: string) {
	try {
		const stmt = database.prepare(`INSERT INTO meta (name, data) VALUES (?, ?)`)

		const data = [name, meta]

		stmt.run(name, data)
	} catch (e) {
		throw new DbError(`Failed to insert meta (${name})`)
	}
}

function importRawEntry(entryName: string, buffer: Buffer, type: EntryTypes) {
	const { fileName, inbox } = identifyEntryProperties(entryName)

	if (type == EntryTypes.INBOX_JSON) {
		return {
			raw: JSON.parse(buffer.toString()) as RawTakeout,
			inbox: inbox,
		}
	}

	if (type == EntryTypes.META) {
		insertMeta(fileName, buffer.toString())
		return
	}

	if (type == 'non-message') throw new Error('non-message type not implemented')

	insertMedia(type, fileName, inbox, buffer)
}

function importInbox(inbox: Inbox, progress: Progress) {
	progress(`Saving inbox ${inbox.title}`, 0)
	insertInbox(inbox)

	const totalMessages = inbox.messages.length

	const scope = Math.floor(totalMessages / 200)

	inbox.messages.forEach((message, i) => {
		let percent = i / totalMessages
		if (i % scope == 0) {
			progress(inbox.title, percent)
		}
		insertMessage(inbox.id, message)
	})
}

function getMedia(type: string, uri: string, inbox?: string) {
	if (type == 'group_photos' || type == 'stickers_used') {
		const stmt = database.prepare(`SELECT * FROM ${type} WHERE name = ?`)
		const row = stmt.get(uri)

		return row
	} else {
		const stmt = database.prepare(`SELECT * FROM ${type} WHERE name = ? AND inbox = ?`)
		const row = stmt.get(uri, inbox)

		return row
	}
}

function getInboxes() {
	const stmt = database.prepare(`SELECT id, title, category FROM inboxes`)
	const rows = stmt.all()

	return rows
}

function getInbox(id: string) {
	const stmt = database.prepare(`SELECT * FROM inboxes WHERE id = ?`)
	const row = stmt.get(id)

	return row
}

function getMessages(id: string, from: number, to: number) {
	const stmt = database.prepare(
		`SELECT * FROM messages WHERE inbox = ? AND timestamp_ms BETWEEN ? AND ?`
	)
	const rows = stmt.all(id, from, to)

	return rows
}

function getStats(inbox: string, stat: string) {
	const stmt = database.prepare(`SELECT content FROM stats WHERE inbox = ? AND name = ?`)
	const row = stmt.get(inbox, stat)

	return row
}

function checkForExisting(table: string, name: string, inbox: string | null) {
	const stmt = database.prepare(
		inbox
			? `SELECT name FROM ${table} WHERE name = ? AND inbox = ?`
			: `SELECT name FROM ${table} WHERE name = ?`
	)

	const row = stmt.get(name, inbox)

	return !!row
}

export { connectDB, closeDB }

export { importRawEntry, importInbox }

export { getInboxes, getInbox, getMessages, getMedia, getStats }

export { identifyEntryProperties, checkForExisting }
