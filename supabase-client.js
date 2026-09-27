import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Format Nigerian Naira
export function formatNaira(amount) {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric).replace('NGN', '₦');
}

// Fetch cached site settings directly from Supabase
let cachedSettings = null;
export async function getSiteSettings(forceRefresh = false) {
  if (cachedSettings && !forceRefresh) return cachedSettings;

  const { data, error } = await supabase
    .from('site_settings')
    .select('*');

  if (error) {
    console.error('Error fetching site settings:', error);
    return {};
  }

  const map = {};
  data.forEach((row) => {
    map[row.key] = row.value;
  });
  cachedSettings = map;
  return map;
}

// Global UI Toast Helper for consistent feedback
export function showToast(message, type = 'info') {
  let container = document.getElementById('novexa-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'novexa-toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      left: 20px;
      max-width: 400px;
      margin: 0 auto;
      z-index: 99999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#0F5132' : type === 'error' ? '#842029' : '#0B2545';
  const border = type === 'success' ? '#198754' : type === 'error' ? '#dc3545' : '#134074';
  
  toast.style.cssText = `
    background: ${bg};
    color: #FFFFFF;
    border: 1px solid ${border};
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    animation: fadeIn 0.25s ease-out;
    pointer-events: auto;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
