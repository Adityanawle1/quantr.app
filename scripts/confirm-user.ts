import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function confirmUser() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: ts-node scripts/confirm-user.ts <email>')
    process.exit(1)
  }

  console.log(`Searching for user with email: ${email}...`)

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError)
    process.exit(1)
  }

  const user = users.find(u => u.email === email)

  if (!user) {
    console.error(`User with email ${email} not found.`)
    process.exit(1)
  }

  console.log(`Found user: ${user.id}. Confirming email...`)

  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  )

  if (error) {
    console.error('Error confirming user:', error)
    process.exit(1)
  }

  console.log(`Successfully confirmed email for ${email}! You can now login.`)
}

confirmUser()
