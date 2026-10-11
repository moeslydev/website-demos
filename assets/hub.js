(function () {
  "use strict";
  /* Scale each live preview so the full desktop layout fits its card */
  var previews = document.querySelectorAll(".preview");
  function fit() {
    previews.forEach(function (p) {
      p.style.setProperty("--scale", (p.clientWidth / 1440).toFixed(4));
    });
  }
  window.addEventListener("resize", fit);
  fit();
})();
