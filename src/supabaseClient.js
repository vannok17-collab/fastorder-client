import { createClient } from '@supabase/supabase-js'

// 🔑 VOS CLÉS SUPABASE (à remplacer)
const supabaseUrl = 'https://lpelvruyjopyaslwqveq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZWx2cnV5am9weWFzbHdxdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MjgzMzgsImV4cCI6MjA4MDEwNDMzOH0.JJKwcEcwxrHOzMDj-KCFHGi_m3pxcZDzrbCjjaAnFjk'

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)