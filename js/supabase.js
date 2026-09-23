import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://ueivjiimojvxxykflpbh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TzrW1BE2ixzmmeApyI5WQw_c10t-Zy0";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
