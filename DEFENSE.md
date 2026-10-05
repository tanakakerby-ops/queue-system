# DEFENSE.md - Cheat sheet for presenting QueueEase

## 1. One-sentence pitch
"QueueEase lets people book an appointment online, get a queue number, and watch the line live from their phone, while staff call the next person from one panel."

## 2. The problem we solve
- Long physical lines and crowded waiting areas.
- People do not know when it is their turn.
- Staff have no simple way to manage who is next.

## 3. Our 6 pages
| Page | Who uses it | What it does |
|---|---|---|
| Home | Everyone | Banner slider, quick links |
| Services | Customers | Slider of services offered |
| Book | Customers | Form (name, service, number-of-people slider, date, time, priority). Gives a queue ticket and estimated wait |
| Queue | Customers | Live "now serving", next-in-line boxes, "check my number" |
| Staff | Staff | PIN login, Call Next, Finish Current, Clear All, counters |
| About | Everyone | What the system is, how it works, the team |

## 3b. Demo script (3 minutes)
1. Phone A opens Book and books "Ana" (regular). Ticket shows A001.
2. Phone B books "Ben" and ticks **Priority lane**. Show he is placed before Ana.
3. Show the Queue page on a big screen: the boxes appear without refreshing.
4. On the Staff page enter the PIN and press **Call Next**. The big number changes on every phone.
5. On a phone, use **Check my number** to show people ahead and the wait time.
6. (Bonus) Open Supabase Table Editor and show the rows changing live. This proves the data is really in a database.

## 4. How it works (the flow)
1. Customer submits the form.
2. The website inserts a new row in the `queue` table. The database gives the queue number.
3. Status starts as `waiting`.
4. Staff press Call Next: the database marks the current person `done` and the next person `serving`.
5. Every open page is watching the table, so all phones update automatically.

## 5. Explaining the database simply
"A database is a shared online notebook. We used **Supabase**, which gives us a PostgreSQL database with tables, like a spreadsheet. Our table is called `queue`: each row is a person and each column is a detail like name and status. Every phone and the staff computer read and write the same table, so they always see the same queue. In our first version we saved data inside each browser, so every phone had a different queue. That is why we moved to a database."

Why Supabase? Free, real SQL database, built-in live updates, and built-in security rules.

## 6. The queue logic (the part that is really ours)
- Status flow: `waiting` -> `serving` -> `done`.
- Order: priority people (senior, PWD, pregnant) first, then regular people, each group first come first served.
- Wait estimate: people ahead x 10 minutes.
- In the code: `getWaitingInOrder` (script.js) shows the line; `call_next` (supabase-setup.sql) picks who is called. Both use the same rule.

## 7. Likely questions and answers
**Why a database instead of saving in the browser?**
Browser storage belongs to one device. A queue has to be shared by all devices.

**How do you stop two people getting the same number?**
The database creates the number itself (`generated always as identity`), one at a time, like a ticket machine.

**How do you update without refreshing?**
Supabase Realtime announces every change to the table, and our page reloads the queue when it hears it. We also reload every 5 seconds as a backup.

**How do you decide who goes next?**
Priority first, then smallest number. `order by priority desc, number asc`.

**Is it secure?**
- Row Level Security: the website may only read the queue and add a booking. It cannot edit or delete directly.
- Staff actions (call next, finish, clear) run as database functions that check the PIN on the server. The PIN is not in the website code and the website cannot read it.
- Typed names are cleaned (`escapeText`) so nobody can inject code.
- Database checks: name length, valid status values.
Honest limitation: a 4-digit PIN could be guessed by someone who keeps trying. A real system would use Supabase Auth (staff accounts) and a limit on attempts.

**Is the key in your code a secret?**
No. It is the public (anon/publishable) key, designed to be in websites. The security comes from the RLS rules. The secret `service_role` key is never used in the website.

**Does it store personal data?**
Name, service, preferred date and time. Names are visible on the public queue page. A real system would show only first names or initials, ask for consent, and delete old records.

**What if the internet is down?**
It needs internet.

**Why GitHub Pages?**
Our website is only HTML, CSS and JavaScript files, so it can be hosted for free as a static site. Supabase handles the data part.

**What did each member do?**
(Prepare this: who did design, coding, testing, documentation.)

**Did you write all the code yourselves?**
Be honest: say which parts you wrote and understand, and that you used an AI tool for guidance and learned from the explanations in LEARN.md. Be ready to explain any function the panel points to.

## 8. Limitations (say them yourself, it looks confident)
- Staff PIN is basic, not real login.
- Wait time is an estimate (fixed 10 minutes per person).
- No SMS or notification when the turn is near.
- No cancel or "no-show / skip" option.
- One queue only (no separate counters per service).
- Free Supabase projects pause after a week of no use.

## 9. Future improvements
- Staff accounts with Supabase Auth.
- SMS or push notification ("you are next").
- Separate queues per service/counter.
- Skip / cancel buttons, daily reset, reports (average waiting time).
- Appointment slots with a limit per hour.

## 10. If you get stuck on a technical question
Say: "We used Supabase to store the data, and our main work was the queue logic and the user interface. Let me show you in the code." Then open `script.js` and point to `getWaitingInOrder` or `addPerson`. Staying calm and honest scores better than guessing.
