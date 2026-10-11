(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header border once scrolled */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Hero: invoice goes Sent -> Viewed -> Paid */
  var status = document.getElementById("inv-status");
  var steps = document.querySelectorAll("#timeline li");
  var toast = document.getElementById("toast");
  var replay = document.getElementById("replay");
  var timers = [];

  function setState(state, label, upto) {
    status.dataset.state = state;
    status.textContent = label;
    steps.forEach(function (li, i) { li.classList.toggle("is-done", i <= upto); });
  }
  function play() {
    timers.forEach(clearTimeout);
    timers = [];
    toast.classList.remove("is-shown");
    replay.classList.remove("is-shown");
    setState("sent", "Sent", 0);
    if (reduceMotion) {
      setState("paid", "Paid", 2);
      toast.classList.add("is-shown");
      return;
    }
    timers.push(setTimeout(function () { setState("viewed", "Viewed", 1); }, 1400));
    timers.push(setTimeout(function () { setState("paid", "Paid", 2); }, 2900));
    timers.push(setTimeout(function () { toast.classList.add("is-shown"); }, 3300));
    timers.push(setTimeout(function () { replay.classList.add("is-shown"); }, 4300));
  }
  replay.addEventListener("click", play);
  play();

  /* Email sign-up forms (demo: no account is created) */
  function wireSignup(formId, msgId) {
    var form = document.getElementById(formId);
    var msg = document.getElementById(msgId);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      var value = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        msg.textContent = "Enter a valid email address to start.";
        msg.classList.add("is-error");
        input.focus();
        return;
      }
      msg.classList.remove("is-error");
      msg.textContent = "Check " + value + " for your sign-in link.";
      form.reset();
    });
  }
  wireSignup("hero-signup", "hero-msg");
  wireSignup("cta-signup", "cta-msg");

  /* Pricing toggle */
  var bills = document.querySelectorAll(".bill");
  var amounts = document.querySelectorAll(".amount");
  var note = document.getElementById("billing-note");
  bills.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var period = btn.dataset.period;
      bills.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      amounts.forEach(function (a) { a.textContent = "€" + a.dataset[period]; });
      note.textContent = period === "yearly"
        ? "Billed once a year. Two months free compared to monthly."
        : "Billed monthly. Cancel any time.";
    });
  });

  /* FAQ: keep one answer open at a time */
  var details = document.querySelectorAll(".faq-list details");
  details.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      details.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
