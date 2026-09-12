const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabase = createClient(config.supabase.url, config.supabase.key);

async function isDuplicate(fingerprint) {
  const { data } = await supabase
    .from('listings')
    .select('id')
    .eq('fingerprint', fingerprint)
    .maybeSingle();
  return !!data;
}

async function saveListing(item, fingerprint) {
  const { error } = await supabase
    .from('listings')
    .insert({ ...item, fingerprint, created_at: new Date().toISOString() });
  if (error) throw error;
}

module.exports = { isDuplicate, saveListing };
