// Runs before the page is drawn: marks that scripts work, and applies the visitor's saved
// language and day/night choice so the page never flashes the wrong one.
(function (d) {
  d.classList.add("js");
  try {
    if (localStorage.getItem("lang") === "en") { d.lang = "en"; d.dir = "ltr"; }
    var t = localStorage.getItem("theme");
    if (t === "dark" || t === "light") d.setAttribute("data-theme", t);
  } catch (e) {}
  // If the main script fails to load or stops with an error, fall back to the plain page
  // (everything visible, no chats) instead of leaving parts of it hidden.
  addEventListener("error", function (e) {
    var t = e.target;
    if ((t && t.tagName === "SCRIPT") || /site\.js/.test(e.filename || "")) d.classList.remove("js");
  }, true);
})(document.documentElement);
