(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Hero crossfade */
  var slides = document.querySelectorAll(".slide");
  var current = 0;
  if (slides.length > 1 && !reduceMotion) {
    setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 6000);
  }

  /* Filters */
  var grid = document.getElementById("grid");
  var photos = Array.prototype.slice.call(grid.querySelectorAll(".photo"));
  var filters = document.querySelectorAll(".filter");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter;
      filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      photos.forEach(function (p) { p.hidden = f !== "all" && p.dataset.cat !== f; });
      grid.classList.remove("is-filtering");
      void grid.offsetWidth;
      grid.classList.add("is-filtering");
    });
  });

  /* Lightbox */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-caption");
  var lbIndex = 0;
  var lastFocus = null;

  function visiblePhotos() { return photos.filter(function (p) { return !p.hidden; }); }
  function show(i) {
    var list = visiblePhotos();
    lbIndex = (i + list.length) % list.length;
    var p = list[lbIndex];
    var img = p.querySelector("img");
    lbImg.src = img.src.replace("w=900", "w=2000");
    lbImg.alt = img.alt;
    lbCap.textContent = p.dataset.caption + "  (" + (lbIndex + 1) + " / " + list.length + ")";
  }
  function open(p) {
    lastFocus = p;
    show(visiblePhotos().indexOf(p));
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  photos.forEach(function (p) {
    p.setAttribute("aria-label", "Open " + p.dataset.caption);
    p.addEventListener("click", function () { open(p); });
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { show(lbIndex - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { show(lbIndex + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(lbIndex + 1);
    if (e.key === "ArrowLeft") show(lbIndex - 1);
    if (e.key === "Tab") {
      var focusables = lb.querySelectorAll("button");
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  /* Swipe on touch screens */
  var startX = null;
  lb.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
    startX = null;
  });

  /* Offer links preselect the contact subject */
  var subject = document.getElementById("f-subject");
  document.querySelectorAll("[data-subject]").forEach(function (a) {
    a.addEventListener("click", function () { subject.value = a.dataset.subject; });
  });

  /* Contact form */
  var form = document.getElementById("contact-form");
  var err = document.getElementById("f-error");
  var ok = document.getElementById("f-success");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = form.elements.email;
    var fields = [form.elements.name, email, form.elements.message];
    var bad = fields.filter(function (el) {
      var invalid = !el.value.trim() || (el === email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.classList.toggle("is-invalid", invalid);
      el.setAttribute("aria-invalid", String(invalid));
      return invalid;
    });
    if (bad.length) {
      err.textContent = bad[0] === email && email.value.trim() ? "That email address doesn't look right." : "Please fill in your name, email and message.";
      bad[0].focus();
      return;
    }
    err.textContent = "";
    ok.textContent = "Thanks, " + form.elements.name.value.trim().split(" ")[0] + ". Your message is on its way. I will reply to " + email.value.trim() + " within two working days.";
    ok.hidden = false;
    form.reset();
    ok.focus();
  });
})();
