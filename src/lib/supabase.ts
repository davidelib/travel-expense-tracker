import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cuwrjbdldoubcnbpijxr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d3JqYmRsZG91YmNuYnBpanhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MzcwMzQsImV4cCI6MjA4NDQxMzAzNH0.4-VJOUd0btvj7cW3y0OT5SU1PqCx3DHH7P5Rj8tZvLE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
