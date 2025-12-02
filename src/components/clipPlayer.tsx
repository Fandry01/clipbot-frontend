import { forwardRef, useMemo, useEffect } from 'react'
import Player, { type PlayerHandle } from './Player'
import { useLatestClipAsset } from '../api/hooks'
import { fileOutUrl } from '../api/file'

type Props = {
  clipId: string
  ownerExternalSubject: string
  // Optioneel:
  aspect?: '16:9'|'9:16'|'1:1'
  startAt?: number
  onTime?: (t:number)=>void
  enableQuality?: boolean // future: voor HLS
}

const ClipPlayer = forwardRef<PlayerHandle, Props>(function ClipPlayer(
  { clipId,ownerExternalSubject, aspect='16:9', startAt, onTime, enableQuality: _enableQuality=false }: Props,
  ref
) {
  void _enableQuality
  // Haal assets op
  const { data: mp4 } = useLatestClipAsset(clipId, 'MP4', ownerExternalSubject)
  const { data: thumb } = useLatestClipAsset(clipId, 'THUMBNAIL', ownerExternalSubject)
  const { data: vtt } = useLatestClipAsset(clipId, 'SUB_VTT',ownerExternalSubject)

  // Construeer URLs voor output (S3/local)
  const src = useMemo(() => mp4 ? fileOutUrl(mp4.objectKey) : undefined, [mp4])
  const poster = useMemo(() => thumb ? fileOutUrl(thumb.objectKey) : undefined, [thumb])
  const captionsVttUrl = useMemo(() => vtt ? fileOutUrl(vtt.objectKey) : undefined, [vtt])

  useEffect(() => {
    // tijdelijke logging
    // eslint-disable-next-line no-console
    console.log('assets', { src, poster, captionsVttUrl, })
  }, [src, poster, captionsVttUrl ])

  // Download resolve (directe bestandslink via dezelfde out-url)
  const resolveDownloadUrl = () => src || ''

  return (
    <Player
      ref={ref}
      src={src}
      poster={poster}
      aspect={aspect}
      captionsVttUrl={captionsVttUrl}
      captionsLabel="Subtitles"
      startAt={startAt}
      onTime={onTime}
      resolveDownloadUrl={resolveDownloadUrl}
      downloadName="clip.mp4"
      // Je kunt hier ook loop/muted/autoPlay doorgeven indien gewenst
      // loop
      // muted
      // autoPlay
    />
  )
})

export default ClipPlayer
