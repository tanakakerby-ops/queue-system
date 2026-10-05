// ===== script.js : shared code used by the pages =====
// Simple JavaScript only: variables, if/else, for loops, normal functions.
// Read LEARN.md to understand every part.
//
// IMPORTANT: "db" comes from supabase-config.js (our online database).

// ---------- 1. TALKING TO THE ONLINE DATABASE (Supabase) ----------

// Read the whole queue ONE time, sorted by queue number.
// The database takes time to answer, so we say: ".then(function...) = when the answer arrives, run this".
function loadQueue(callback) {
  if (db === null) { return; }

  db.from("queue")                      // the table called "queue"
    .select("*")                        // get all columns
    .order("number", { ascending: true }) // smallest number first
    .then(function (result) {
      if (result.error) {
        console.log("Could not load the queue:", result.error.message);
        return;
      }
      callback(result.data);            // result.data = a list of people
    });
}

// LIVE: load the queue now, and load it again every time anyone changes it.
// This is why the pages update by themselves on every phone.
function listenToQueue(callback) {
  if (db === null) { return; }

  loadQueue(callback); // first load

  // Supabase tells us when the table changes ("realtime")
  db.channel("queue-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, function () {
      loadQueue(callback);
    })
    .subscribe();

  // Backup: also reload every 5 seconds, in case the live connection drops
  setInterval(function () {
    loadQueue(callback);
  }, 5000);
}

// Add a new person to the table. The DATABASE gives the queue number,
// so two phones can never get the same number.
function addPerson(person, callback, failCallback) {
  if (db === null) { failCallback(); return; }

  db.from("queue")
    .insert([person])  // add one row
    .select()          // ask for the saved row back (it now has its number)
    .then(function (result) {
      if (result.error) {
        console.log("Could not save:", result.error.message);
        alert("Could not save your booking. Please try again.");
        failCallback();
        return;
      }
      callback(result.data[0]); // the saved person, including person.number
    });
}

// Run a staff action: "call_next", "finish_current" or "clear_all".
// These are functions inside the database. They check the PIN themselves.
function staffAction(actionName, pin, callback) {
  if (db === null) { return; }

  db.rpc(actionName, { p_pin: pin }).then(function (result) {
    if (result.error) {
      alert("Action failed: " + result.error.message);
      return;
    }
    callback(); // success
  });
}

// ---------- 2. SMALL HELPERS ----------

// Turn 5 into "A005"
function formatNumber(n) {
  var text = String(n);
  while (text.length < 3) {
    text = "0" + text;
  }
  return "A" + text;
}

// SAFETY: make typed text harmless before showing it on the page.
// Without this, someone could type HTML code as their "name" and break the page.
function escapeText(text) {
  text = String(text);
  text = text.split("&").join("&amp;");
  text = text.split("<").join("&lt;");
  text = text.split(">").join("&gt;");
  text = text.split("\"").join("&quot;");
  text = text.split("'").join("&#39;");
  return text;
}

// ---------- 3. QUEUE RULES ----------

// Count how many people have a certain status ("waiting", "serving" or "done").
function countStatus(queue, status) {
  var count = 0;
  for (var i = 0; i < queue.length; i++) {
    if (queue[i].status === status) {
      count = count + 1;
    }
  }
  return count;
}

// Find one person by queue number. Returns null if not found.
function findByNumber(queue, number) {
  for (var i = 0; i < queue.length; i++) {
    if (queue[i].number === number) {
      return queue[i];
    }
  }
  return null;
}

// Find the person who is being served right now. Returns null if nobody.
function findServing(queue) {
  for (var i = 0; i < queue.length; i++) {
    if (queue[i].status === "serving") {
      return queue[i];
    }
  }
  return null;
}

// Make the waiting line in the CORRECT ORDER:
// priority people first (senior, PWD, pregnant), then regular people.
// Inside each group, the smaller number goes first.
// (The database already sends people sorted by number.)
function getWaitingInOrder(queue) {
  var ordered = [];
  var i;

  for (i = 0; i < queue.length; i++) {
    if (queue[i].status === "waiting" && queue[i].priority === true) {
      ordered.push(queue[i]);
    }
  }
  for (i = 0; i < queue.length; i++) {
    if (queue[i].status === "waiting" && queue[i].priority === false) {
      ordered.push(queue[i]);
    }
  }
  return ordered;
}

// How many people are ahead of this queue number? Returns -1 if not waiting.
function peopleAhead(queue, number) {
  var line = getWaitingInOrder(queue);
  for (var i = 0; i < line.length; i++) {
    if (line[i].number === number) {
      return i; // position 0 means "you are next", so i people are ahead
    }
  }
  return -1;
}

// ---------- 4. SLIDER (used on Home and Services pages) ----------

var currentSlide = 0;

// Show slide number n and hide all the others.
function showSlide(n) {
  var slides = document.getElementsByClassName("slide");
  var dots = document.getElementsByClassName("dot");

  // go back to the start / end if we pass the last / first slide
  if (n >= slides.length) {
    n = 0;
  }
  if (n < 0) {
    n = slides.length - 1;
  }
  currentSlide = n;

  for (var i = 0; i < slides.length; i++) {
    if (i === n) {
      slides[i].style.display = "block";
      dots[i].className = "dot active";
    } else {
      slides[i].style.display = "none";
      dots[i].className = "dot";
    }
  }
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function previousSlide() {
  showSlide(currentSlide - 1);
}

// Only start the slider if this page has slides.
if (document.getElementsByClassName("slide").length > 0) {
  showSlide(0);
  setInterval(nextSlide, 4000); // change slide every 4000 milliseconds (4 seconds)
}
