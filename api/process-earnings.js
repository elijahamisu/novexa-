import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authorize scheduled execution via bearer token
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized invocation' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Missing Supabase service environment credentials' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.rpc('process_midnight_earnings', {
      p_target_date: targetDate
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, result: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
