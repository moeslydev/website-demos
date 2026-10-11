(function () {
  "use strict";

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
  }
  toggle.addEventListener("click", function () { setNav(toggle.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });

  /* Booking widget */
  var state = { service: null, price: 0, barber: null, day: null, time: null };
  var out = {
    service: document.getElementById("s-service"),
    barber: document.getElementById("s-barber"),
    when: document.getElementById("s-when"),
    price: document.getElementById("s-price")
  };

  function makeGroup(container, onPick) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      container.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      onPick(btn);
    });
    container.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
  }

  makeGroup(document.getElementById("pick-service"), function (btn) {
    state.service = btn.dataset.value;
    state.price = Number(btn.dataset.price);
    render();
  });
  makeGroup(document.getElementById("pick-barber"), function (btn) {
    state.barber = btn.dataset.value;
    buildTimes();
    render();
  });

  /* Next 7 days (Sunday closed) */
  var dayBox = document.getElementById("pick-day");
  var timeBox = document.getElementById("pick-time");
  var days = [];
  var now = new Date();
  for (var i = 0; i < 7; i++) {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    days.push(d);
    var b = document.createElement("button");
    b.type = "button";
    b.className = "day";
    b.dataset.index = String(i);
    var name = i === 0 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" });
    b.innerHTML = "<span>" + name + "</span><strong>" + d.getDate() + "</strong>";
    b.setAttribute("aria-label", d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + (d.getDay() === 0 ? ", closed" : ""));
    if (d.getDay() === 0) b.disabled = true;
    dayBox.appendChild(b);
  }
  makeGroup(dayBox, function (btn) {
    state.day = days[Number(btn.dataset.index)];
    state.time = null;
    buildTimes();
    render();
  });

  /* Time slots: a fake but stable "already booked" pattern per day and barber */
  function buildTimes() {
    timeBox.innerHTML = "";
    if (!state.day) {
      timeBox.innerHTML = "<p class=\"hint\">Choose a day to see free times.</p>";
      return;
    }
    var close = state.day.getDay() === 6 ? 18 : 20;
    var seed = state.day.getDate() + (state.barber ? state.barber.length : 0);
    var isToday = state.day.toDateString() === now.toDateString();
    for (var h = 9; h < close; h++) {
      for (var m = 0; m < 60; m += 30) {
        var label = (h < 10 ? "0" : "") + h + ":" + (m === 0 ? "00" : "30");
        var slot = document.createElement("button");
        slot.type = "button";
        slot.className = "chip";
        slot.dataset.value = label;
        slot.textContent = label;
        var past = isToday && (h < now.getHours() + 1);
        var taken = (h * 7 + m + seed) % 5 === 0;
        if (past || taken) { slot.disabled = true; slot.setAttribute("aria-label", label + ", unavailable"); }
        slot.setAttribute("aria-pressed", String(label === state.time && !slot.disabled));
        timeBox.appendChild(slot);
      }
    }
  }
  timeBox.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn || btn.disabled) return;
    timeBox.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === btn)); });
    state.time = btn.dataset.value;
    render();
  });
  buildTimes();

  function render() {
    out.service.textContent = state.service || "Not chosen";
    out.barber.textContent = state.barber || "Not chosen";
    out.when.textContent = state.day && state.time
      ? state.day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + ", " + state.time
      : state.day ? "Choose a time" : "Not chosen";
    out.price.textContent = "€" + state.price;
  }

  /* Confirm */
  var form = document.getElementById("confirm-form");
  var err = document.getElementById("c-error");
  var done = document.getElementById("confirmed");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var missing = [];
    if (!state.service) missing.push("a service");
    if (!state.barber) missing.push("a barber");
    if (!state.day || !state.time) missing.push("a day and time");
    var name = document.getElementById("c-name");
    var phone = document.getElementById("c-phone");
    [name, phone].forEach(function (el) { el.classList.toggle("is-invalid", !el.value.trim()); });
    if (missing.length) { err.textContent = "Please choose " + missing.join(", ") + "."; return; }
    if (!name.value.trim() || !phone.value.trim()) { err.textContent = "Please add your name and mobile number."; (name.value.trim() ? phone : name).focus(); return; }
    err.textContent = "";

    form.hidden = true;
    done.innerHTML = "";
    var h = document.createElement("h4");
    h.textContent = "You're booked";
    var p = document.createElement("p");
    p.textContent = "See you " + out.when.textContent + " for a " + state.service.toLowerCase() +
      " with " + (state.barber === "Any barber" ? "the first available barber" : state.barber) +
      ". A confirmation text is on its way to " + phone.value.trim() + ".";
    var again = document.createElement("button");
    again.type = "button";
    again.className = "link-btn";
    again.textContent = "Make another booking";
    again.addEventListener("click", function () { done.hidden = true; form.hidden = false; });
    done.appendChild(h); done.appendChild(p); done.appendChild(again);
    done.hidden = false;
    done.focus();
  });
})();
