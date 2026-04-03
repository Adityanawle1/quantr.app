const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmAllUsers() {
  console.log('Fetching users...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError);
    process.exit(1);
  }

  const unconfirmed = users.filter(u => !u.email_confirmed_at);

  if (unconfirmed.length === 0) {
    console.log('No unconfirmed users found.');
    return;
  }

  console.log(`Found ${unconfirmed.length} unconfirmed user(s). Confirming now...`);

  for (const user of unconfirmed) {
    console.log(`Confirming ${user.email} (${user.id})...`);
    // Note: in older versions of supabase-js it was { email_confirm: true }
    // but in newer versions it's { email_confirm: true } or using update
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );
    if (updateError) {
      console.error(`Failed to confirm ${user.email}:`, updateError);
    } else {
      console.log(`Successfully confirmed ${user.email}.`);
    }
  }

  console.log('Done.');
}

confirmAllUsers();
