// Proxies group photos from Telegram without ever exposing the bot token to the client.
// Groups store a Telegram file_id in `image_url` (file_ids don't expire). On each request
// this calls getFile to get a fresh, short-lived file_path, then fetches and streams the
// actual image bytes back. The bot token stays server-side the whole time.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { path } = req.query

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing path' })
  }

  // Telegram file_id only ever contains letters, numbers, and - _
  if (!/^[a-zA-Z0-9_-]+$/.test(path)) {
    return res.status(400).json({ success: false, error: 'Invalid path' })
  }

  try {
    const token = process.env.JOINUP_BOT_TOKEN

    // Step 1: turn the durable file_id into a fresh, temporary file_path
    const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${path}`)
    const getFileData = await getFileRes.json()

    if (!getFileData.ok) {
      return res.status(404).json({ success: false, error: 'Image not found' })
    }

    // Step 2: fetch the actual image bytes using that fresh path
    const telegramUrl = `https://api.telegram.org/file/bot${token}/${getFileData.result.file_path}`
    const response = await fetch(telegramUrl)

    if (!response.ok) {
      return res.status(404).json({ success: false, error: 'Image not found' })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600') // cache 1hr; file_path itself expires around then anyway
    res.status(200).send(buffer)
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load image' })
  }
}
