// TEMPORARY DEBUG VERSION — traces the getFile step to diagnose the failure

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { path } = req.query

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing path' })
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(path)) {
    return res.status(400).json({ success: false, error: 'Invalid path', debug: { path } })
  }

  try {
    const token = process.env.JOINUP_BOT_TOKEN
    const hasToken = !!token
    const tokenPreview = token ? `${token.slice(0, 6)}...${token.slice(-4)}` : null

    const getFileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${path}`)
    const getFileData = await getFileRes.json()

    if (!getFileData.ok) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        debug: { step: 'getFile', hasToken, tokenPreview, getFileStatus: getFileRes.status, getFileData }
      })
    }

    const telegramUrl = `https://api.telegram.org/file/bot${token}/${getFileData.result.file_path}`
    const response = await fetch(telegramUrl)

    if (!response.ok) {
      const body = await response.text()
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        debug: { step: 'fileDownload', status: response.status, body, filePath: getFileData.result.file_path }
      })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(buffer)
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load image', debug: { message: err.message } })
  }
}
