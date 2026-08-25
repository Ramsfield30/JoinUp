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
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const { group_id } = req.body || {}
  const id = parseInt(group_id, 10)

  if (!Number.isFinite(id)) {
    return res.status(400).json({ success: false, error: 'Invalid group_id' })
  }

  try {
    const { error } = await supabase.from('link_reports').insert({ group_id: id })
    if (error) throw error
    res.status(200).json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to record report' })
  }
}
