// composables/useSupabase.js
import { createClient } from "@supabase/supabase-js";

// Keep a single instance in memory so we don't recreate it on every component mount
let supabaseInstance = null;

export const useSupabase = () => {
  if (!supabaseInstance) {
    const config = useRuntimeConfig();
    supabaseInstance = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey,
    );
  }
  return supabaseInstance;
};
