module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { path } = req.query

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing path' })
  }

  // Telegram file_path only ever contains letters, numbers, / . _ -
  // Reject anything else so this can't be used to fetch arbitrary URLs.
  if (!/^[a-zA-Z0-9/._-]+$/.test(path)) {
    return res.status(400).json({ success: false, error: 'Invalid path' })
  }

  try {
    const token = process.env.JOINUP_BOT_TOKEN
    const telegramUrl = `https://api.telegram.org/file/bot${token}/${path}`

    const response = await fetch(telegramUrl)

    if (!response.ok) {
      return res.status(404).json({ success: false, error: 'Image not found' })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400') // cache 1 day, cuts down on repeat Telegram calls
    res.status(200).send(buffer)
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load image' })
  }
}
