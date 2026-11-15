(function () {
  // The Mostaql profile address. While it is empty, every Mostaql button stays hidden.
  var MOSTAQL_URL = "";

  var root = document.documentElement;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  if (button) button.addEventListener("click", function () {
    var next = root.lang === "ar" ? "en" : "ar";
    // Where the browser can, the two languages cross-fade instead of snapping.
    if (document.startViewTransition && !calm) document.startViewTransition(function () { set(next); });
    else set(next);
  });

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

  // The header gets its bottom line once the page has moved under it.
  var header = document.querySelector("header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
  if (header) { onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); }

  // Sections: the rule above each one is drawn as it comes into view (once).
  var sections = document.querySelectorAll("section");
  if (!("IntersectionObserver" in window) || calm) {
    sections.forEach(function (s) { s.classList.add("seen"); });
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("seen"); seen.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    sections.forEach(function (s) { seen.observe(s); });

    // The menu marks the section being read.
    var links = {};
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = links[e.target.id];
        if (link) link.classList.toggle("current", e.isIntersecting);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (links[s.id]) spy.observe(s); });
  }

  // ---- The chat in the hero ------------------------------------------------
  // A shortened example of an order with the Galy Fashion assistant. The product, price,
  // shipping fee and the wording of the summary and the confirmation are the shop's real ones.
  var chat = document.querySelector("[data-chat]");
  if (!chat) return;
  var body = chat.querySelector(".chat-body");
  var replay = chat.querySelector(".chat-replay");
  var run = 0;

  function both(ar, en) { return '<span data-lang="ar">' + ar + '</span><span data-lang="en">' + en + "</span>"; }
  function row(ar, en, v, cls) {
    return '<div' + (cls ? ' class="' + cls + '"' : "") + "><dt>" + both(ar, en) + "</dt><dd>" + both(v + " جنيه", v + " EGP") + "</dd></div>";
  }
  var CUSTOMER = both("العميل", "Customer"), BOT = both("المساعد", "Assistant");
  var SCRIPT = [
    { out: true, who: CUSTOMER, html: "<p>" + both("عايز قميص كتان بيج مقاس L", "I'd like the linen shirt in beige, size L") + "</p>" },
    { who: BOT, html: "<p>" + both(
        "موجود. قميص الكتان البيج مقاس L بـ 950 جنيه. عشان أجهز الطلب ابعت الاسم ورقم التليفون والمحافظة والعنوان.",
        "It's in stock. The beige linen shirt in size L is 950 EGP. To prepare the order, send your name, phone number, governorate and address.") + "</p>" },
    { out: true, html: "<p>" + both(
        'أحمد سامي، <span dir="ltr">0100 123 4567</span>، الدقهلية، المنصورة، شارع الجمهورية',
        "Ahmed Samy, 0100 123 4567, Dakahlia, Mansoura, El-Gomhoria St.") + "</p>" },
    { who: BOT, confirm: true, html:
        "<p><b>" + both("ملخص الطلب", "Order summary") + "</b></p>" +
        '<dl class="receipt">' +
          row("قميص كتان، بيج، مقاس L", "Linen shirt, beige, size L", 950) +
          row("الشحن", "Shipping", 75) +
          row("الإجمالي", "Total", 1025, "sum") +
        "</dl>" +
        '<p class="small">' + both("كاش عند الاستلام. راجع التفاصيل، ولو مظبوطة اضغط زرار التأكيد تحت.",
                                   "Cash on delivery. Check the details, and if they're right, press the confirm button below.") + "</p>" }
  ];
  var AFTER = [
    { out: true, html: "<p>" + both("تأكيد الطلب", "Confirm order") + "</p>" },
    { who: BOT, html: "<p>" + both(
        "تم تسجيل الطلب رقم <span dir=\"ltr\">GF-1042</span>.<br>الإجمالي 1025 جنيه كاش عند الاستلام، منهم 75 جنيه شحن.<br>متوقع يوصل خلال 5 أيام، والمندوب هيتصل قبل ما يوصل.",
        "Order GF-1042 is placed.<br>The total is 1025 EGP, cash on delivery, including 75 EGP shipping.<br>Expected within 5 days; the courier will call before arriving.") + "</p>" }
  ];
  var CONFIRM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>' +
    both("تأكيد الطلب", "Confirm order");

  function add(m, instant) {
    var el = document.createElement("div");
    el.className = "msg" + (m.out ? " out" : "");
    var html = "<div>" + (m.who ? '<span class="who">' + m.who + "</span>" : "") +
      '<div class="bubble">' + (m.typing ? '<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>' : m.html) + "</div>";
    if (m.confirm) html += '<button class="chat-confirm" type="button">' + CONFIRM + "</button>";
    el.innerHTML = html + "</div>";
    body.appendChild(el);
    if (instant) el.classList.add("in");
    else requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("in"); }); });
    return el;
  }
  function wait(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

  // Plays a list of messages; the assistant "types" for a moment before each of its replies.
  function play(list, mine) {
    var chain = Promise.resolve();
    list.forEach(function (m) {
      chain = chain.then(function () {
        if (mine !== run) return;
        if (m.out) return wait(900).then(function () { if (mine === run) add(m); });
        var dots;
        return wait(500)
          .then(function () { if (mine === run) dots = add({ who: m.who, typing: true }); })
          .then(function () { return wait(1100); })
          .then(function () {
            if (mine !== run) return;
            // The typing bubble becomes the reply, and its row grows to fit instead of jumping.
            var box = dots.firstElementChild, holder = dots.querySelector(".bubble");
            var before = box.offsetHeight;
            holder.innerHTML = m.html;
            holder.classList.add("fresh");
            if (m.confirm) {
              holder.insertAdjacentHTML("afterend", '<button class="chat-confirm waiting" type="button">' + CONFIRM + "</button>");
              arm(dots.querySelector(".chat-confirm"), mine);
            }
            var after = box.offsetHeight;
            box.style.height = before + "px";
            box.offsetHeight; // apply the starting height before the change
            box.style.transition = "height .5s var(--ease)";
            box.style.height = after + "px";
            setTimeout(function () { box.style.height = ""; box.style.transition = ""; dots.classList.add("open"); }, 560);
          });
      });
    });
    return chain;
  }
  function arm(btn, mine) {
    btn.addEventListener("click", function () {
      if (mine !== run) return;
      btn.disabled = true;
      btn.classList.remove("waiting");
      play(AFTER, mine).then(function () { if (mine === run) replay.classList.add("on"); });
    });
  }
  function start() {
    run += 1;
    body.innerHTML = "";
    replay.classList.remove("on");
    play(SCRIPT, run);
  }

  if (calm || !("IntersectionObserver" in window)) {
    // No motion: the whole example is on the page at once, and the button still works.
    chat.classList.add("still");
    SCRIPT.forEach(function (m) { add(m, true); });
    var still = body.querySelector(".chat-confirm");
    still.classList.add("waiting");
    body.querySelectorAll(".msg").forEach(function (m) { m.classList.add("open"); });
    still.addEventListener("click", function () {
      still.disabled = true;
      still.classList.remove("waiting");
      AFTER.forEach(function (m) { add(m, true); });
    });
    return;
  }
  replay.addEventListener("click", start);
  var first = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { first.disconnect(); setTimeout(start, 700); }
  }, { threshold: 0.35 });
  first.observe(chat);
})();
