import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase credentials unconfigured' });
  }

  // 1. Verify caller user identity using user token
  const userClient = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await userClient.auth.getUser(token);

  if (authErr || !user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // 2. Verify admin permission in admin_users table
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  const { data: adminRecord, error: adminErr } = await adminClient
    .from('admin_users')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (adminErr || !adminRecord || !adminRecord.is_active) {
    return res.status(403).json({ error: 'Access denied: Admin credentials required' });
  }

  const { action, payload } = req.body || {};

  return res.status(200).json({
    success: true,
    message: `Admin action [${action || 'PING'}] authorized`,
    adminId: user.id,
    timestamp: new Date().toISOString()
  });
}
