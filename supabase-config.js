// ===== supabase-config.js =====
// Paste YOUR two Supabase values here (see SETUP.md, step 4).
// They are like the "address" and "key" that tell our website which online database to use.

var SUPABASE_URL = "https://elyepzakacqablezvqlg.supabase.co";
var SUPABASE_KEY = "sb_publishable_Z7JvUZm4YQElIRzFJK_Fnw_YsqF9CYe";

// "db" is our connection to the online database. All pages use it.
var db = null;

if (SUPABASE_URL === "PASTE_YOUR_PROJECT_URL") {
  // The settings were not pasted yet, so remind the user
  alert("Setup needed: open supabase-config.js and paste your Supabase values. See SETUP.md.");
} else {
  // "supabase" comes from the library we load in each page (a script tag)
  db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
