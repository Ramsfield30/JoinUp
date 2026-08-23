const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Called once a day by Vercel Cron. Does the smallest possible real query against
// Supabase so the free-tier project registers activity and never hits the
// 7-day inactivity pause. Not user-facing — no auth needed, nothing sensitive returned.
module.exports = async (req, res) => {
  try {
    const { error } = await supabase.from('groups').select('id').limit(1)
    if (error) throw error
    res.status(200).json({ success: true, ping: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Keep-alive ping failed' })
  }
}
