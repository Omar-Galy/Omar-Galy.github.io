(function () {
  // The Mostaql profile address. While it is empty, every Mostaql button stays hidden.
  var MOSTAQL_URL = "";

  var root = document.documentElement;
  function set(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    var title = document.querySelector('meta[name="title-' + lang + '"]');
    if (title) document.title = title.content;
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }
  // Arabic is the default; English only when the visitor chose it.
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  if (saved === "en") set("en");
  var button = document.getElementById("lang");
  if (button) button.addEventListener("click", function () { set(root.lang === "ar" ? "en" : "ar"); });

  document.querySelectorAll("[data-mostaql]").forEach(function (link) {
    if (MOSTAQL_URL) { link.href = MOSTAQL_URL; link.hidden = false; }
  });

  // A screenshot whose file is not in img/ yet: show its file name in the frame instead.
  document.querySelectorAll(".shot img, .work-cover img").forEach(function (img) {
    function missing() {
      var frame = img.closest(".shot, .work-cover");
      frame.classList.add("missing");
      frame.setAttribute("data-file", img.getAttribute("src"));
    }
    if (img.complete && img.naturalWidth === 0) missing();
    else img.addEventListener("error", missing);
  });
})();
