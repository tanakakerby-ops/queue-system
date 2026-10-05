# LEARN.md - Understand your QueueEase code (Supabase version)

We only use: variables, `if / else`, `for` loops, and normal `function`s.
No arrow functions (`=>`), no `.filter()`, `.find()`, `.forEach()`, `.map()`, and no `async/await`.

## 1. What changed over the versions
1. Version 1-2: queue saved in the browser (`localStorage`), so every phone had its own queue.
2. Now: the queue is saved in **Supabase**, an online database. All phones share it.

## 2. What is a database? (say this in your defense)
A shared online notebook that every device can read and write. Supabase gives us a **PostgreSQL** database, which stores data in **tables**, like a spreadsheet:

| number | name | service | priority | status |
|---|---|---|---|---|
| 1 | Ana | Payment | false | done |
| 2 | Ben | Consultation | true | serving |
| 3 | Cara | Documents | false | waiting |

- A **table** = the whole spreadsheet (ours is called `queue`).
- A **row** = one person.
- A **column** = one detail (name, status, ...).
- `number` is filled in by the database itself (1, 2, 3 ...). That is why two people can never get the same number.

## 3. The files
| File | What it is |
|---|---|
| `supabase-setup.sql` | Run ONCE in Supabase. Creates the table, safety rules, and staff buttons |
| `supabase-config.js` | Your project URL and key. Connects the website to your database |
| `script.js` | Shared code: talks to the database, and the queue rules |
| `book.html`, `queue.html`, `staff.html` | The pages that use the database |

## 4. The 4 database functions (in script.js)
| Function | What it does |
|---|---|
| `loadQueue(callback)` | Reads the whole queue once, smallest number first |
| `listenToQueue(callback)` | Loads the queue now, and again whenever anyone changes it (and every 5 seconds as a backup) |
| `addPerson(person, callback, failCallback)` | Saves a new row. The database gives back the saved row with its number |
| `staffAction(name, pin, callback)` | Runs a staff button in the database: `call_next`, `finish_current` or `clear_all` |

## 5. Callbacks and `.then` (the most important new idea)
Talking to an online database takes time, and JavaScript does not wait. So we say: "**when the answer arrives, run this function.**"

```js
db.from("queue").select("*").then(function (result) {
  // this runs when the answer arrives
});
```
Read it as: "From the table queue, select all columns. THEN, when it comes back, run my function with the answer in `result`."

`result` has two parts: `result.error` (a problem, or null) and `result.data` (the answer). Always check the error first.

## 6. Supabase words
- `db.from("queue")` = "the table called queue".
- `.select("*")` = get all columns. `.order("number", {ascending: true})` = sort by number.
- `.insert([person])` = add a new row. `.select()` after it = send the saved row back.
- `db.channel(...).on("postgres_changes", ...).subscribe()` = "tell me whenever the table changes" (live updates).
- `db.rpc("call_next", {p_pin: pin})` = run a function that lives INSIDE the database. `rpc` means "remote procedure call".

## 7. Security: why the PIN is in the database
In the earlier version the PIN was written in the web page, so anyone could view it. Now:
- **Row Level Security (RLS)**: rules written in `supabase-setup.sql`. The website may only READ the queue and ADD a new booking. It can NOT edit or delete directly.
- **Staff functions** (`call_next`, `finish_current`, `clear_all`) are the only way to change or delete. Each one checks the PIN first, inside the database.
- The PIN is stored in the `staff_settings` table, which the website is not allowed to read.
- The **anon key** in `supabase-config.js` is public by design. The RLS rules are what protect the data. The **service_role** key is a real secret. Never put it in the website.
- `escapeText` in script.js turns dangerous characters in typed names into harmless text, so nobody can inject HTML into the page.

## 8. Other built-in things
- `for (var i = 0; i < list.length; i++)` visits every item in a list. Item 0 is the first.
- `list.push(x)` adds to the end of a list.
- `document.getElementById("x")` grabs the element with `id="x"`. Then `.textContent` changes its text, `.innerHTML` its HTML, `.value` reads an input, `.checked` a checkbox, `.className` its CSS classes.
- `setInterval(function, ms)` repeats a function every `ms` milliseconds.
- `Number("5")` text to number, `String(5)` number to text.
- `alert(...)` pop-up. `confirm(...)` OK/Cancel pop-up that gives `true` or `false`.
- `onclick="callNext()"` = when clicked, run that function.
- `return false;` at the end of a form function stops the page from reloading.
- `=` stores a value. `===` compares two values.

## 9. How the queue order works
Status goes `waiting` -> `serving` -> `done`.

`getWaitingInOrder(queue)` in script.js:
1. Add waiting **priority** people (in number order).
2. Add waiting **regular** people (in number order).

The same rule is written in SQL inside `call_next`: `order by priority desc, number asc` ("priority first, then smallest number"). So what customers SEE (the line) and who staff CALL always match.

Wait estimate = people ahead x 10 minutes.

## Practice
1. Change 10 minutes per person to 5 (search `* 10` in book.html and queue.html).
2. Add a new service in the dropdown in book.html.
3. Change the slider's maximum from 5 to 10 (it is already allowed up to 10 in the database).
4. In the Supabase Table Editor, change a row's status by hand and watch the Queue page react.
