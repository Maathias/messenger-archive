import { useEffect, useState } from 'react'
import { RENDERER_TO_MAIN } from '../../../ts/types/global'

type mediaType = 'photos' | 'gifs' | 'videos' | 'audio_files' | 'files' | 'sticker' | 'group_photos'

function BlobMedia({ id, uri, mediaType }: { id?: string; uri: string; mediaType: mediaType }) {
	const [mediaUrl, setMediaUrl] = useState<string | null>(null)

	useEffect(() => {
		let isMounted = true

		async function fetchMediaBlob() {
			try {
				console.log('Requesting media', { uri, mediaType })

				const arrayBuffer = await window.invoke(RENDERER_TO_MAIN.GET_MEDIA, {
					type: mediaType,
					uri,
				})

				console.log('Got media', arrayBuffer)

				if (isMounted) {
					const blob = new Blob([arrayBuffer.data]),
						url = URL.createObjectURL(blob)

					setMediaUrl(url)
				}
			} catch (error) {
				setMediaUrl('')
				console.error('Failed to fetch media blob:', error)
			}
		}

		fetchMediaBlob()

		// Cleanup function to revoke the object URL
		return () => {
			isMounted = false
			if (mediaUrl)
				if (mediaUrl != '') {
					URL.revokeObjectURL(mediaUrl)
					setMediaUrl(null)
				}
		}
	}, [uri])

	return (
		<>
			{mediaUrl &&
				{
					photos: <img src={mediaUrl} alt="Photo" />,
					gifs: <img src={mediaUrl} alt="GIF" />,
					videos: <video src={mediaUrl} controls />,
					audio_files: <audio src={mediaUrl} controls />,
					files: (
						<a href={mediaUrl} download>
							Download File
						</a>
					),
					sticker: <img src={mediaUrl} alt="Sticker" />,
				}[mediaType]}
			{mediaUrl == null ? 'Loading...' : mediaUrl == '' && 'Failed'}
		</>
	)
}

export default BlobMedia
