(function () {
  "use strict";

  /* Header: solid background after scrolling past the top */
  var header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* Menu tabs (with arrow-key support) */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); selectTab(next); next.focus(); }
    });
  });

  /* Booking form */
  var form = document.getElementById("book-form");
  var dateInput = document.getElementById("b-date");
  var errorBox = document.getElementById("book-error");
  var successBox = document.getElementById("book-success");

  function isoDate(d) {
    var tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
  }
  var today = new Date();
  dateInput.min = isoDate(today);
  dateInput.value = isoDate(today);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var required = form.querySelectorAll("[required]");
    var firstInvalid = null;
    required.forEach(function (el) {
      var bad = !el.value.trim() || (el === dateInput && el.value < dateInput.min);
      el.classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", String(bad));
      if (bad && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) {
      errorBox.textContent = "Please fill in your name, phone, date and time.";
      firstInvalid.focus();
      return;
    }
    errorBox.textContent = "";

    var data = new FormData(form);
    var date = new Date(data.get("date") + "T12:00:00");
    var dateText = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    var guests = data.get("guests");

    successBox.innerHTML = "";
    var h = document.createElement("h3");
    h.textContent = "Table requested";
    var p = document.createElement("p");
    p.textContent = "A table for " + guests + (guests === "1" ? " guest" : " guests") + " on " + dateText +
      " at " + data.get("time") + ". We will confirm by text message within the hour.";
    successBox.appendChild(h);
    successBox.appendChild(p);
    successBox.hidden = false;
    form.querySelector("button[type=submit]").textContent = "Request another table";
    successBox.focus();
  });

  form.addEventListener("input", function (e) {
    if (e.target.classList.contains("is-invalid") && e.target.value.trim()) {
      e.target.classList.remove("is-invalid");
      e.target.setAttribute("aria-invalid", "false");
    }
  });
})();
