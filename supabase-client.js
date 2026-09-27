import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[NOVEXA] Supabase credentials not found in environment variables.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

// Format Nigerian Naira consistently
export function formatNaira(amount) {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric).replace('NGN', '₦');
}

// Fetch cached site settings from database
let cachedSettings = null;
export async function getSiteSettings(forceRefresh = false) {
  if (cachedSettings && !forceRefresh) return cachedSettings;

  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) {
    console.error('Error fetching site settings:', error.message);
    return {};
  }

  const map = {};
  (data || []).forEach((row) => {
    map[row.key] = row.value;
  });
  cachedSettings = map;
  return map;
}

// Verify a referral code with the database RPC
export async function verifyReferralCode(code) {
  if (!code || !code.trim()) {
    return { valid: false, message: 'Please enter a referral code.' };
  }

  try {
    const { data, error } = await supabase.rpc('verify_referral_code', {
      p_code: code.trim().toUpperCase()
    });

    if (error) {
      console.warn('verifyReferralCode RPC warning:', error.message);
      return { valid: false, message: 'Could not verify code at this time.' };
    }

    return data || { valid: false, message: 'Invalid referral code.' };
  } catch (err) {
    return { valid: false, message: 'Referral verification failed.' };
  }
}

// Global Auth Guard for Protected Pages (e.g., dashboard, wallet, deposit, withdraw)
export async function requireAuth() {
  const { data: { session }, error: sessionErr } = await supabase.auth.getSession();

  if (sessionErr || !session || !session.user) {
    window.location.replace('/login.html');
    return null;
  }

  // Fetch verified profile
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profErr || !profile) {
    console.warn('Profile not yet created or inaccessible:', profErr?.message);
    return { session, user: session.user, profile: null };
  }

  // Suspended or inactive account check
  if (profile.is_active === false) {
    await supabase.auth.signOut();
    window.location.replace('/login.html?error=suspended');
    return null;
  }

  return { session, user: session.user, profile };
}

// Auth Guard for Guest Pages (e.g. login.html, register.html)
export async function redirectIfAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && session.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', session.user.id)
      .single();

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      return;
    }

    window.location.replace('/dashboard.html');
  }
}

// Standard Logout Helper
export async function logoutUser() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Signout note:', e);
  } finally {
    window.location.replace('/login.html');
  }
}

// Production Toast Feedback Container
export function showToast(message, type = 'info') {
  let container = document.getElementById('novexa-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'novexa-toast-container';
    container.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 420px;
      z-index: 999999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  let bg = '#0F172A';
  let border = '#334155';
  let icon = 'ℹ️';

  if (type === 'success') {
    bg = '#064E3B';
    border = '#059669';
    icon = '✓';
  } else if (type === 'error') {
    bg = '#7F1D1D';
    border = '#DC2626';
    icon = '⚠️';
  }

  toast.style.cssText = `
    background: ${bg};
    color: #F8FAFC;
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    pointer-events: auto;
    animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  toast.innerHTML = `<span style="font-size:15px;">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 4200);
}
