import { useContext, useEffect, useReducer, useState } from 'react'
import Progress from '../Progress/Progress'

import RestartAltIcon from '@mui/icons-material/RestartAlt'

import './intro.sass'
import {
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	Button,
	Box,
	Stepper,
	StepLabel,
	Step,
	Chip,
	Alert,
} from '@mui/material'

import { MAIN_TO_RENDERER, RENDERER_TO_MAIN } from '../../../ts/types/global'
import { E_DATABASE, eDatabase } from '../../events'
import contextCurrentInbox from '../../Contexts/contextCurrentInbox'
import contextInboxes from '../../Contexts/contextInboxes'

type status = [string, number]

const totalMasterParts = 4

function Paths(paths: string[], setPaths?: React.Dispatch<React.SetStateAction<string[]>>) {
	return (
		<div className="paths">
			{(paths.length < 1 && <div style={{ textAlign: 'center' }}>-- none selected --</div>) ||
				paths.map(path => (
					<div key={path}>
						{path}
						{setPaths && (
							<i
								className="icon-cancel"
								onClick={() => setPaths(prev => prev.filter(p => p != path))}
							></i>
						)}
					</div>
				))}
		</div>
	)
}

var Reset: () => JSX.Element

function Intro() {
	const [activeStep, setActiveStep] = useState(0),
		[importType, setImportType] = useState('zip'),
		[paths, setPaths] = useState<string[]>(['/vault/takeout_zips/all-json-no-media.zip']),
		[savePath, setSavePath] = useState('/vault/takeout_zips/all-json2.db')

	const steps = ['Choose type of import', 'Select files', 'Import']

	const [, changeInbox] = useContext(contextCurrentInbox),
		[inboxes] = useContext(contextInboxes)

	const success = inboxes.length > 0

	Reset = function Reset() {
		function reset() {
			setActiveStep(0)
			setImportType('zip')
			setPaths([])
			setSavePath('')
			changeInbox('reset')
		}

		return (
			<Button
				fullWidth
				variant="contained"
				color="error"
				endIcon={<RestartAltIcon />}
				onClick={reset}
			>
				Reset
			</Button>
		)
	}

	return (
		<div className="intro">
			<Box sx={{ width: '100%' }}>
				<Stepper activeStep={activeStep} alternativeLabel>
					{steps.map(label => (
						<Step key={label}>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</Stepper>
			</Box>

			<Box display="flex" flexDirection="column" width="100%" height="100%">
				<Box flexGrow={1}>
					{
						{
							0: selectImport(setActiveStep, [importType, setImportType]),
							1: selectFiles(
								importType,
								[paths, setPaths],
								[savePath, setSavePath],
								setActiveStep
							),
							2: importZip(paths, savePath, success),
							3: importDb(savePath, success),
						}[activeStep]
					}
				</Box>

				<Box display="flex" flexDirection="column" justifyContent="flex-end">
					{activeStep < 2 && (
						<Button
							variant="contained"
							onClick={() => {
								if (activeStep == 0) setActiveStep(1)
								if (activeStep == 1) {
									if (importType == 'zip') setActiveStep(2)
									if (importType == 'db') setActiveStep(3)
								}
							}}
							disabled={
								activeStep > 1 &&
								((importType == 'zip' && paths.length < 1) ||
									(importType == 'db' && savePath == ''))
							}
							fullWidth
						>
							next
						</Button>
					)}

					<br />
					{Reset()}
				</Box>
			</Box>

			<br />
		</div>
	)
}

function selectImport(
	setActiveStep: React.Dispatch<React.SetStateAction<number>>,
	[importType, setImportType]: [string, React.Dispatch<React.SetStateAction<string>>]
) {
	return (
		<>
			<Typography variant="h4">Choose type of import</Typography>
			<br />
			<ToggleButtonGroup
				color="primary"
				value={importType}
				exclusive
				aria-label="Import Type"
				onChange={(e, v) => setImportType(v)}
				fullWidth
			>
				<ToggleButton value="zip" fullWidth>
					.ZIP
				</ToggleButton>
				<ToggleButton value="db" fullWidth>
					.DB
				</ToggleButton>
			</ToggleButtonGroup>
			<br />
			{importType == 'zip' && (
				<span>
					Imports from multiple .zip files, downloaded directly from Facebook's data export
					This converts the data into a single .db file, which can be used for viewing in this
					app. It's main benefit is ease of storage, and space saving (Meta includes multiple
					duplicates) Use this option if you're using the app for the first time, or if you
					want to import new data
				</span>
			)}
			{importType == 'db' && (
				<span>
					Imports from a single .db file, which can be used for viewing in this app. Use this
					option if you've already imported data, and want to continue working with it
				</span>
			)}
			<br />
			<br />
			{/* <Button variant="contained" onClick={() => setActiveStep(1)} fullWidth>
				next
			</Button>
			<br />
			{Reset()} */}
		</>
	)
}

function selectFiles(
	importType: string,
	[paths, setPaths]: [string[], React.Dispatch<React.SetStateAction<string[]>>],
	[savePath, setSavePath]: [string, React.Dispatch<React.SetStateAction<string>>],

	setActiveStep: React.Dispatch<React.SetStateAction<number>>
) {
	if (importType == 'zip')
		return (
			<>
				<Typography variant="h4" gutterBottom>
					Select .zip files
				</Typography>
				<Button
					variant="outlined"
					fullWidth
					onClick={() => {
						window.invoke(RENDERER_TO_MAIN.GET_ZIP_PATHS).then(e => {
							if (e.canceled) return
							setPaths(prev => [...prev, ...e.filePaths])
						})
					}}
				>
					Add
				</Button>
				<br />
				{Paths(paths, setPaths)}

				<Typography variant="h4" gutterBottom>
					Select .db save location
				</Typography>
				<Button
					variant="outlined"
					fullWidth
					onClick={() => {
						window.invoke(RENDERER_TO_MAIN.GET_DB_PATH).then(e => {
							if (e.canceled) return
							setSavePath(e.filePath)
						})
					}}
				>
					select
				</Button>
				<br />
				{Paths([savePath])}
				{/* <Button
					disabled={paths.length < 1 || savePath == ''}
					variant="contained"
					onClick={() => setActiveStep(2)}
					fullWidth
				>
					next
				</Button>
				<br />
				{Reset()} */}
			</>
		)
	else
		return (
			<>
				<Typography variant="h4" gutterBottom>
					Select a .db to import
				</Typography>
				<Button
					variant="outlined"
					fullWidth
					onClick={() => {
						window.invoke(RENDERER_TO_MAIN.GET_DB_PATH).then(e => {
							if (e.canceled) return
							setSavePath(e.filePath)
						})
					}}
				>
					Add
				</Button>
				<br />
				{Paths([savePath])}
				{/* <Button
					disabled={savePath == ''}
					variant="contained"
					onClick={() => setActiveStep(3)}
					fullWidth
				>
					next
				</Button>
				<br />
				{Reset()} */}
			</>
		)
}

function importZip(paths: string[], savePath: string, success: boolean) {
	function invokeImportZips() {
		window.invoke(RENDERER_TO_MAIN.IMPORT_ZIPS, { paths, savePath }).then(out => {
			eDatabase.dispatchEvent(new CustomEvent(E_DATABASE.DB_READY, { detail: out }))
		})
	}

	const [mainProgress, setMainProgress] = useState<status>(['Press start to begin', 0]),
		[subProgress, setSubProgress] = useState<status>(['---', 0]),
		[log, addLog] = useState<any[]>([])

	useEffect(() => {
		window.events.on(MAIN_TO_RENDERER.UPDATE_PROGRESS, ([level, message, status, err]) => {
			if (level == 'main') {
				setMainProgress([message, status])
				setSubProgress([message, 0])
			}
			if (level == 'sub') setSubProgress([message, status])
			addLog(prev => [...prev, [level, message, status, err]])
		})
	}, [])

	return (
		<>
			Selected files:
			{paths.map(path => (
				<Chip key={path} label={`${path}`} variant="outlined" />
			))}
			<br />
			<Button variant="contained" fullWidth onClick={() => invokeImportZips()}>
				start
			</Button>
			<div className="bars">
				<Progress label={mainProgress[0]} steps={[mainProgress[1], 3]} />
				<Progress label={subProgress[0]} status={subProgress[1]} />
				{/* TODO: display the logs */}
			</div>
			<br />
			{/* {Reset()} */}
			<br />
			{success && <Alert severity="success">Files succefuly imported</Alert>}
		</>
	)
}

function importDb(path: string, success: boolean) {
	function invokeImportDb() {
		window.invoke(RENDERER_TO_MAIN.IMPORT_DB, path).then(out => {
			eDatabase.dispatchEvent(new CustomEvent(E_DATABASE.DB_READY, { detail: out }))
		})
	}

	return (
		<>
			Selected file:
			<Chip label={`${path}`} variant="outlined" />
			<Button variant="contained" fullWidth onClick={() => invokeImportDb()}>
				import
			</Button>
			<br />
			{/* {Reset()} */}
			<br />
			{success && <Alert severity="success">File succefuly imported</Alert>}
		</>
	)
}

export default Intro
