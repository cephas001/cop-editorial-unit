const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize the Supabase client using your environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

module.exports = supabase;
