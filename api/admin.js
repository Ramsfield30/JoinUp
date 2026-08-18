const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const ADMIN_SECRET = process.env.ADMIN_SECRET
console.log('Secret from env:', process.env.ADMIN_SECRET)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // Check admin secret
  const secret = req.headers['x-admin-secret']
  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { action } = req.query

  try {
    // Get all pending groups
    if (action === 'pending') {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json({ success: true, data })
    }

    // Get all groups
    if (action === 'all') {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json({ success: true, data })
    }

    // Approve group
    if (action === 'approve' && req.method === 'POST') {
      const { id } = req.body
      const { error } = await supabase
        .from('groups')
        .update({ status: 'approved' })
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ success: true, message: 'Group approved' })
    }

    // Reject group
    if (action === 'reject' && req.method === 'POST') {
      const { id } = req.body
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ success: true, message: 'Group rejected and deleted' })
    }

    // Feature/unfeature group
    if (action === 'feature' && req.method === 'POST') {
      const { id, featured } = req.body
      const { error } = await supabase
        .from('groups')
        .update({ featured })
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ success: true, message: `Group ${featured ? 'featured' : 'unfeatured'}` })
    }

    // Verify/unverify group
    if (action === 'verify' && req.method === 'POST') {
      const { id, verified } = req.body
      const { error } = await supabase
        .from('groups')
        .update({ verified })
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ success: true, message: `Group ${verified ? 'verified' : 'unverified'}` })
    }
    // Edit group
if (action === 'edit' && req.method === 'POST') {
  const { id, name, description } = req.body
  const { error } = await supabase
    .from('groups')
    .update({ name, description })
    .eq('id', id)
  
  if (error) throw error
  return res.status(200).json({ success: true, message: 'Group updated' })
}


    // Stats
    if (action === 'stats') {
      const { data: total } = await supabase.from('groups').select('count').single()
      const { data: pending } = await supabase.from('groups').select('count').eq('status', 'pending').single()
      const { data: approved } = await supabase.from('groups').select('count').eq('status', 'approved').single()

      return res.status(200).json({
        success: true,
        data: {
          total: total?.count || 0,
          pending: pending?.count || 0,
          approved: approved?.count || 0
        }
      })
    }

    res.status(400).json({ success: false, error: 'Invalid action' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}