const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Commas and parentheses are structural characters in PostgREST's .or() filter syntax —
// stripping them stops a search term from injecting extra filter conditions.
function sanitizeSearchTerm(term) {
  return String(term)
    .replace(/[,()]/g, '')
    .slice(0, 100)
    .trim()
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { category, search, featured } = req.query

  // Clamp limit/offset so a crafted request can't force a huge, expensive query.
  let limit = parseInt(req.query.limit, 10)
  if (!Number.isFinite(limit) || limit < 1) limit = 20
  if (limit > 100) limit = 100

  let offset = parseInt(req.query.offset, 10)
  if (!Number.isFinite(offset) || offset < 0) offset = 0

  try {
    let query = supabase
      .from('groups')
      .select('id, name, description, platform, category, link, members, featured, verified, type, image_url, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      const safeSearch = sanitizeSearchTerm(search)
      if (safeSearch) {
        query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`)
      }
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    const { data, error } = await query

    if (error) throw error

    res.status(200).json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}