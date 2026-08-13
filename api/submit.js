const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { name, description, platform, category, link, members, type, email } = req.body

  // Basic validation
  if (!name || !platform || !category || !link || !type) {
    return res.status(400).json({ success: false, error: 'Missing required fields' })
  }

  // Validate link format
  const telegramLink = link.startsWith('https://t.me/') || link.startsWith('https://telegram.me/')
  const whatsappLink = link.startsWith('https://chat.whatsapp.com/')

  if (platform === 'telegram' && !telegramLink) {
    return res.status(400).json({ success: false, error: 'Invalid Telegram link' })
  }

  if (platform === 'whatsapp' && !whatsappLink) {
    return res.status(400).json({ success: false, error: 'Invalid WhatsApp link' })
  }

  try {
    const { error } = await supabase
      .from('groups')
      .insert([{
        name,
        description,
        platform,
        category,
        link,
        members: members ? parseInt(members) : null,
        type,
        email: email || null,
        status: 'pending',
        featured: false,
        verified: false,
        created_at: new Date().toISOString()
      }])

    if (error) throw error

    res.status(200).json({ success: true, message: 'Group submitted successfully! We will review it shortly.' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}