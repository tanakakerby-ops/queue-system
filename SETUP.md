# SETUP.md - Put QueueEase online with Supabase + GitHub Pages

You need: a GitHub account. (Supabase lets you sign in with GitHub.) Everything is free.

## Step 1: Create a Supabase project
1. Go to https://supabase.com and click **Start your project**. Sign in with GitHub.
2. Click **New project**. Pick any name (e.g. `queueease`).
3. Set a **database password** and save it somewhere. You will not need it for this project, but do not lose it.
4. Region: choose **Southeast Asia (Singapore)**. Click **Create new project** and wait 1-2 minutes.

## Step 2: Create the table and rules (one copy-paste)
1. In the left menu click **SQL Editor** -> **New query**.
2. Open `supabase-setup.sql` from this folder, copy ALL of it, and paste it in.
3. **Before running**, find the line `insert into staff_settings (id, pin) values (1, '1234');` and change `1234` to your own staff PIN.
4. Click **Run**. You should see "Success. No rows returned".
5. Check: left menu **Table Editor** -> you should see a table called `queue` (empty) and `staff_settings`.

## Step 3: Check that live updates are on
If step 2 ran with no error, this is already done (the last line of the SQL does it). If you got an error on the last line only, go to **Database -> Replication** (or **Publications**) and switch on the `queue` table for `supabase_realtime`. The site still works without it, only slower (it refreshes every 5 seconds).

## Step 4: Connect your website to Supabase
1. Click the gear icon -> **Project Settings** -> **API** (it may be named **API Keys** / **Data API**; menu names change a little).
2. Copy the **Project URL** (looks like `https://abcdxyz.supabase.co`).
3. Copy the **anon public** key (or the **publishable** key in newer projects). It is safe to put in a website.
4. Open `supabase-config.js` and paste them in place of the two `PASTE_...` texts. Keep the quotation marks.

**Never** paste the `service_role` / `secret` key anywhere in your website. That one is a real password.

## Step 5: Test on your computer
Open `book.html` in your browser, book yourself, then open `staff.html`, type your PIN, and press **Call Next**. Check the **Table Editor** in Supabase: your booking should appear as a row.

If something fails, press **F12** in the browser and look at the **Console** tab for red messages.

## Step 6: Publish with GitHub Pages
1. On github.com click **New repository**. Name: `queueease`. Set to **Public**. Create it.
2. Click **uploading an existing file**. Drag in the files **inside** this folder (not the folder itself), so `index.html` is at the top level. You do not need to upload the `.md` files or `supabase-setup.sql`.
3. Click **Commit changes**.
4. Go to **Settings -> Pages**. Under **Branch** choose `main` and `/ (root)`, then **Save**.
5. After 1-2 minutes your site is at `https://YOURUSERNAME.github.io/queueease/`. Open it on any phone.

If you edit a file later, open it on GitHub, click the pencil icon, change it, and commit. The site updates in a minute or two.

## Step 7: Before your presentation
- Open your site 1-2 days before. **Free Supabase projects pause after about a week with no activity.** If it is paused, click **Restore** in the Supabase dashboard (takes a few minutes).
- Press **Clear All** on the Staff page to remove test data (numbers restart at 1).
- Test with 2 phones at the same time.

## Troubleshooting
| Problem | Fix |
|---|---|
| Pop-up says "Setup needed" | You did not paste the values in `supabase-config.js` |
| Console: `supabase is not defined` | The Supabase script line is missing or the internet is blocked |
| Booking fails, console says "row-level security" | Step 2 SQL did not fully run. Run it again on a fresh project |
| "Wrong PIN" with the correct PIN | You changed the PIN in the wrong place. Run `update staff_settings set pin = 'yourpin' where id = 1;` in the SQL Editor |
| "Could not find the function check_pin" | Step 2 SQL did not fully run |
| Pages only update after about 5 seconds | Live updates (Step 3) are off. It still works |
| Site not updating on GitHub | Wait 2 minutes, then hard refresh (Ctrl+Shift+R) |
