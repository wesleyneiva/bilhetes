import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tcxqeqdrwxtnlfhixnus.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHFlcWRyd3h0bmxmaGl4bnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTgwNjgsImV4cCI6MjA2MDk5NDA2OH0.e0u7MH1SVTxRZ5E-oqGOEiSE_T9W0rE99xY5qqCSIsU'
export const supabase = createClient(supabaseUrl, supabaseKey)
