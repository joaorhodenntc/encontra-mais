import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criar um cliente Supabase para o lado do cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
