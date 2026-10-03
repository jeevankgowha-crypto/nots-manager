import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (str) => {
  if (!str || str === 'YOUR_SUPABASE_URL') return false
  try {
    const parsed = new URL(str)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://demo-project.supabase.co'
const supabaseAnonKey = (rawKey && rawKey !== 'YOUR_SUPABASE_ANON_KEY')
  ? rawKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.placeholder'

export const isSupabaseConfigured = isValidUrl(rawUrl) && Boolean(rawKey && rawKey !== 'YOUR_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
