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
    if (typeof label === "function") label();
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

  // Night mode: day mode by default; the visitor's pick is remembered.
  var themeBtn = document.getElementById("theme");
  function isDark() { return root.getAttribute("data-theme") === "dark"; }
  function label() {
    var replayName = root.lang === "en" ? "Replay the chat" : "إعادة تشغيل المحادثة";
    document.querySelectorAll(".chat-replay").forEach(function (b) { b.setAttribute("aria-label", replayName); });
    if (!themeBtn) return;
    var dark = isDark(), en = root.lang === "en";
    themeBtn.setAttribute("aria-label", dark ? (en ? "Day mode" : "الوضع النهاري") : (en ? "Night mode" : "الوضع الليلي"));
  }
  label();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      function apply() { root.setAttribute("data-theme", next); label(); }
      try { localStorage.setItem("theme", next); } catch (e) {}
      if (document.startViewTransition && !calm) document.startViewTransition(apply);
      else apply();
    });
  }

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

  // ---- The chats -------------------------------------------------------------
  // Short conversations typed in each assistant's own wording (products, prices, shipping,
  // the clinic's summary lines and the coach's confirmation come from the bots' real data
  // and instructions). Each plays once when it scrolls into view; a chat with a button
  // then waits for the visitor to press it.
  function both(ar, en) { return '<span data-lang="ar">' + ar + '</span><span data-lang="en">' + en + "</span>"; }
  function p(ar, en) { return "<p>" + both(ar, en) + "</p>"; }
  function rows(list) {
    return '<dl class="receipt">' + list.map(function (r) {
      return "<div" + (r[3] ? ' class="sum"' : "") + "><dt>" + both(r[0], r[1]) + "</dt><dd>" + r[2] + "</dd></div>";
    }).join("") + "</dl>";
  }
  function egp(v) { return both(v + " جنيه", v + " EGP"); }
  var HAND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>';
  var FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  // The clinic's example day: the next Wednesday at least two days away, so it never shows a past date.
  var AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  var EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  var EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var day = new Date(); day.setDate(day.getDate() + 2);
  while (day.getDay() !== 3) day.setDate(day.getDate() + 1);
  var DAY_AR = AR_DAYS[3] + " " + day.getDate() + " " + AR_MONTHS[day.getMonth()];
  var DAY_EN = EN_DAYS[3] + " " + day.getDate() + " " + EN_MONTHS[day.getMonth()];

  var CUSTOMER = both("العميل", "Customer"), PATIENT = both("المريض", "Patient"), TRAINEE = both("المتدرب", "Trainee"), BOT = both("المساعد", "Assistant");

  var CHATS = {
    order: {
      button: both("تأكيد الطلب", "Confirm order"),
      script: [
        { out: true, who: CUSTOMER, html: p("عايز قميص كتان بيج مقاس L", "I'd like the linen shirt in beige, size L") },
        { who: BOT, html: p("موجود. قميص الكتان البيج مقاس L بـ 950 جنيه. عشان أجهز الطلب ابعت الاسم ورقم التليفون والمحافظة والعنوان.",
                            "It's in stock. The beige linen shirt in size L is 950 EGP. To prepare the order, send your name, phone number, governorate and address.") },
        { out: true, html: p('أحمد سامي، <span dir="ltr">0100 123 4567</span>، الدقهلية، المنصورة، شارع الجمهورية', "Ahmed Samy, 0100 123 4567, Dakahlia, Mansoura, El-Gomhoria St.") },
        { who: BOT, button: true, html: "<p><b>" + both("ملخص الطلب", "Order summary") + "</b></p>" +
            rows([["قميص كتان، بيج، مقاس L", "Linen shirt, beige, size L", egp(950)], ["الشحن", "Shipping", egp(75)], ["الإجمالي", "Total", egp(1025), true]]) +
            '<p class="small">' + both("كاش عند الاستلام. راجع التفاصيل، ولو مظبوطة اضغط زرار التأكيد تحت.", "Cash on delivery. Check the details, and if they're right, press the confirm button below.") + "</p>" }
      ],
      after: [
        { out: true, html: p("تأكيد الطلب", "Confirm order") },
        { who: BOT, html: p('تم تسجيل الطلب رقم <span dir="ltr">GF-1042</span>.<br>الإجمالي 1025 جنيه كاش عند الاستلام، منهم 75 جنيه شحن.<br>متوقع يوصل خلال 5 أيام، والمندوب هيتصل قبل ما يوصل.',
                            "Order GF-1042 is placed.<br>The total is 1025 EGP, cash on delivery, including 75 EGP shipping.<br>Expected within 5 days; the courier will call before arriving.") }
      ]
    },
    store: {
      button: both("تأكيد الإلغاء", "Confirm cancellation"),
      auto: true,
      script: [
        { out: true, who: CUSTOMER, html: p("عندكم جاكيت جينز؟ عايز أشوف صوره", "Do you have a denim jacket? I'd like to see photos") },
        { who: BOT, html: p("أيوه، جاكيت الجينز بـ 1250 جنيه، متاح أزرق دنيم وأسود بمقاسات S لـ XXL. تحب أجهزهولك؟",
                            "Yes, the denim jacket is 1250 EGP, in denim blue and black, sizes S to XXL. Shall I prepare one for you?") },
        { who: null, photo: { src: "img/store-jacket.webp", ar: "جاكيت جينز، أزرق دنيم", en: "Denim jacket, denim blue" } },
        { out: true, html: p("وجاكيت الجينز بيتغسل إزاي عموما؟", "And how do you wash a denim jacket, generally?") },
        { who: BOT, html: p("نصيحة عامة: اقلبه على الوش التاني واغسله في مية باردة، ونشفه في الهوا بعيد عن الشمس عشان لونه يفضل ثابت.",
                            "A general tip: turn it inside out, wash it in cold water, and dry it in the air out of the sun so the colour holds.") },
        { out: true, html: p('طلبي اللي قبل كده <span dir="ltr">GF-1038</span> وصل لفين؟', "Where's my earlier order, GF-1038?") },
        { who: BOT, html: p('طلبك <span dir="ltr">GF-1038</span> اتشحن، وهيوصلك خلال يومين. المندوب هيتصل بيك قبل ما يوصل.',
                            "Your order GF-1038 has shipped and will reach you within 2 days. The courier will call you before arriving.") },
        { out: true, html: p('وعندي طلب تاني <span dir="ltr">GF-1041</span> عايز ألغيه', "And I have another order, GF-1041, that I want to cancel") },
        { who: BOT, button: true, html: p('طلب <span dir="ltr">GF-1041</span> لسه ما اتشحنش، فينفع يتلغي. لو متأكد اضغط زرار التأكيد تحت.',
                                          "Order GF-1041 hasn't shipped yet, so it can be cancelled. If you're sure, press the confirm button below.") }
      ],
      after: [
        { who: BOT, html: p('تم إلغاء الطلب رقم <span dir="ltr">GF-1041</span>', "Order GF-1041 is cancelled") },
        { out: true, html: p("طب عايز أكلم حد من المتجر", "I'd like to talk to someone at the shop") },
        { who: BOT, html: p('تقدر تكلم فريق المتجر على واتساب <span dir="ltr">01037800929</span>.', "You can reach the shop's team on WhatsApp at 01037800929.") }
      ]
    },
    clinic: {
      button: both("تأكيد الحجز", "Confirm booking"),
      auto: true, // only the home chat waits for the visitor; this one presses its own button
      script: [
        { out: true, who: PATIENT, html: p("تنظيف الجير بكام؟", "How much is a cleaning?") },
        { who: BOT, html: p("تنظيف الأسنان وإزالة الجير بالموجات فوق الصوتية مع تلميع بـ 350 جنيه للجلسة، ويفضل يتعمل كل 6 شهور.",
                            "Cleaning and scaling with ultrasound, plus polishing, is 350 EGP a session, and is best done every six months.") },
        { out: true, html: p("وبتفتحوا امتى؟", "And when are you open?") },
        { who: BOT, html: p("من السبت للخميس، من 11 الصبح لحد 9 بالليل. الجمعة إجازة إلا حالات الطوارئ بموعد مسبق.",
                            "Saturday to Thursday, 11 am to 9 pm. Friday is off except for emergencies by appointment.") },
        { out: true, html: p("طيب عايز أحجز يوم الأربعاء بعد العصر", "OK, I'd like to book on Wednesday afternoon") },
        { who: BOT, html: p("المتاح يوم " + DAY_AR + " بعد العصر: 4 مساء، 5 مساء، 7 مساء. تحب أنهي ميعاد؟ وابعتلي اسمك بالكامل وسنك ورقم تليفونك.",
                            "Free on " + DAY_EN + " afternoon: 4 pm, 5 pm and 7 pm. Which one suits you? And send me your full name, age and phone number.") },
        { out: true, html: p('5، محمد علي حسن، 34 سنة، <span dir="ltr">0100 765 4321</span>', "5 pm. Mohamed Ali Hassan, 34, 0100 765 4321") },
        { who: BOT, button: true, html: rows([
              ["الخدمة", "Service", both("تنظيف وإزالة الجير", "Cleaning and scaling")],
              ["اليوم", "Date", both(DAY_AR, DAY_EN)],
              ["الميعاد", "Time", both("5 مساء", "5 pm")],
              ["الاسم", "Name", both("محمد علي حسن", "Mohamed Ali Hassan")],
              ["السن", "Age", "34"],
              ["التليفون", "Phone", '<span dir="ltr">0100 765 4321</span>'],
              ["السعر التقديري", "Estimated price", egp(350), true]]) +
            '<p class="small">' + both("راجع البيانات واضغط زر تأكيد الحجز اللي تحت الرسالة، أو قولي لو عايز تعدل حاجة.", "Check the details and press the Confirm booking button below, or tell me if you'd like to change anything.") + "</p>" }
      ],
      after: [
        { card: true, html: '<p class="ok">' + CHECK + both("تم تأكيد الحجز", "Booking confirmed") + "</p>" +
            "<p><b>" + both("تنظيف وإزالة الجير", "Cleaning and scaling") + "</b><br>" + both(DAY_AR + "، 5 مساء", DAY_EN + ", 5 pm") + "</p>" },
        { out: true, html: p("العيادة فين بالظبط؟", "Where exactly is the clinic?") },
        { who: BOT, html: p("15 شارع التحرير، الدور الثالث، المهندسين، الجيزة، أمام محطة المترو.",
                            "15 El-Tahrir St., third floor, Mohandessin, Giza, opposite the metro station.") },
        { out: true, html: p("وابني عنده 7 سنين، كشف الأطفال بكام؟", "And my son is 7. How much is a children's check-up?") },
        { who: BOT, html: p("كشف الأطفال بـ 150 جنيه، وولي الأمر هو اللي بيحجز للطفل. تحب أحجزله؟",
                            "A children's check-up is 150 EGP, and a parent books it for the child. Shall I book one for him?") }
      ]
    },
    coach: {
      script: [
        { out: true, who: TRAINEE, html: p("أهلا", "Hi") },
        { who: BOT, html: p("أهلا بيك، أنا مساعد كوتش جالي. ابعتلي اسمك ووزنك الحالي بالكيلو وهدفك، تخسيس ولا بناء عضل، عشان أفتح ملفك وأجيبلك الخطة اللي الكوتش مجهزهالك.",
                            "Hi, I'm Coach Galy's assistant. Send me your name, your current weight in kg and your goal, fat loss or muscle gain, so I can open your file and get you the plan the coach prepared.") },
        { out: true, html: p("كريم، 82 كيلو، تخسيس", "Karim, 82 kg, fat loss") },
        { who: BOT, html: p("سجلت: كريم، 82 كيلو، تخسيس. صح كده؟", "Noted: Karim, 82 kg, fat loss. Is that right?") },
        { out: true, html: p("صح", "Yes") },
        { who: BOT, html: p("تمام يا كريم، لقيت الخطة اللي كوتش جالي مجهزهالك، ومبعوتالك في ملف تحت الرسالة.",
                            "Great, Karim. I found the plan Coach Galy prepared for you; it's in the file below this message.") },
        { who: null, file: { name: "coach_galy_plan_2000.pdf", size: "193 KB" } },
        { out: true, html: p("الـ Lat Pulldown بيتعمل إزاي؟", "How do I do the Lat Pulldown?") },
        { who: BOT, html: "<ol>" + [
            ["امسك البار أوسع من الكتف بشوية.", "Hold the bar a little wider than your shoulders."],
            ["اقعد وثبت فخادك تحت المسند.", "Sit and lock your thighs under the pad."],
            ["ميل لورا حاجة بسيطة.", "Lean back slightly."],
            ["اسحب البار لأعلى الصدر وكوعك نازل لتحت ولورا.", "Pull the bar to your upper chest, elbows down and back."],
            ["اعصر اللاتس تحت.", "Squeeze your lats at the bottom."],
            ["رجع البار بتحكم وما تسيبوش يشد دراعك.", "Let the bar back up under control; don't let it yank your arms."]
          ].map(function (s) { return "<li>" + both(s[0], s[1]) + "</li>"; }).join("") + "</ol>" },
        { out: true, html: p("مش بحب الفراخ، أبدلها بإيه؟", "I don't like chicken. What can I swap it for?") },
        { who: BOT, html: "<p>" + both("بدل كل 100 جرام صدور فراخ:", "Instead of every 100 g of chicken breast:") + "</p><ol>" + [
            ["100 جرام صدور رومي", "100 g turkey breast"],
            ["أو 130 جرام سمك أبيض", "or 130 g white fish"],
            ["أو 75 جرام لحمة مفرومة قليلة الدهن", "or 75 g lean minced beef"],
            ["أو 80 جرام سلمون", "or 80 g salmon"]
          ].map(function (s) { return "<li>" + both(s[0], s[1]) + "</li>"; }).join("") + "</ol>" },
        { out: true, html: p("لو فوتت حصة النهاردة أعوضها بكرة؟", "If I miss today's session, do I make it up tomorrow?") },
        { who: BOT, html: p("لا، ما تعوضهاش. كمل جدولك عادي، وقلل حوالي 150 جرام من الرز أو البطاطا من أكل النهاردة عشان ما حرقتش طاقة التمرين.",
                            "No, don't make it up. Carry on with your schedule, and cut about 150 g of rice or potatoes from today's food, since you didn't burn the training energy.") },
        { out: true, html: p("عايز أكلم الكوتش نفسه", "I'd like to talk to the coach himself") },
        { who: BOT, html: p('كلم كوتش جالي على واتساب <span dir="ltr">01037800929</span>.', "Message Coach Galy on WhatsApp at 01037800929.") }
      ]
    }
  };

  function inner(m) {
    if (m.photo) return '<figure class="bubble photo"><img src="' + m.photo.src + '" width="280" height="280" alt="' + m.photo.en + '"><figcaption>' + both(m.photo.ar, m.photo.en) + "</figcaption></figure>";
    if (m.file) return '<div class="bubble file"><span class="file-icon">' + FILE + '</span><span><b dir="ltr">' + m.file.name + '</b><span class="small" dir="ltr">PDF · ' + m.file.size + "</span></span></div>";
    return '<div class="bubble' + (m.card ? " card" : "") + '">' + (m.typing ? '<span class="typing" aria-hidden="true"><i></i><i></i><i></i></span>' : m.html) + "</div>";
  }
  function wait(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

  document.querySelectorAll("[data-chat]").forEach(function (chat) {
    var key = chat.getAttribute("data-chat");
    var data = CHATS[key];
    if (!data) return;
    var body = chat.querySelector(".chat-body");
    // Every chat can be scrolled back through.
    var scrolls = true;
    if (scrolls) body.classList.add("scroll");
    // Keeps the newest message in view while rows open, unless the visitor has scrolled up to read.
    var stuck = true, following = 0;
    if (scrolls) body.addEventListener("scroll", function () {
      if (!following) stuck = body.scrollHeight - body.scrollTop - body.clientHeight < 40;
    }, { passive: true });
    function follow() {
      if (!scrolls || !stuck) return;
      var until = performance.now() + 650;
      following += 1;
      (function step() {
        body.scrollTop = body.scrollHeight;
        if (performance.now() < until) requestAnimationFrame(step);
        else following -= 1;
      })();
    }
    var replay = chat.querySelector(".chat-replay");
    var run = 0;

    function add(m, instant) {
      var el = document.createElement("div");
      el.className = "msg" + (m.out ? " out" : "");
      var html = "<div>" + (m.who ? '<span class="who">' + m.who + "</span>" : "") + inner(m);
      if (m.button && data.auto) html += '<span class="chat-confirm pressed" aria-hidden="true">' + data.button + "</span>";
      else if (m.button) html += '<button class="chat-confirm" type="button">' + HAND + data.button + "</button>";
      el.innerHTML = html + "</div>";
      body.appendChild(el);
      follow();
      if (instant) el.classList.add("in", "open");
      else {
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("in"); }); });
        setTimeout(function () { el.classList.add("open"); }, 560);
      }
      return el;
    }

    // Plays a list of messages; the assistant "types" for a moment before each text reply.
    function play(list, mine) {
      var chain = Promise.resolve();
      list.forEach(function (m) {
        chain = chain.then(function () {
          if (mine !== run) return;
          if (m.out) return wait(900).then(function () { if (mine === run) add(m); });
          if (m.photo || m.file || m.card) return wait(m.card ? 700 : 450).then(function () { if (mine === run) add(m); });
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
              if (m.button && data.auto) {
                holder.insertAdjacentHTML("afterend", '<span class="chat-confirm shown" aria-hidden="true">' + data.button + "</span>");
                autoPress(dots.querySelector(".chat-confirm"), mine);
              } else if (m.button) {
                holder.insertAdjacentHTML("afterend", '<button class="chat-confirm waiting" type="button">' + HAND + data.button + "</button>");
                arm(dots.querySelector(".chat-confirm"), mine);
              }
              var after = box.offsetHeight;
              dots.classList.remove("open");
              box.style.height = before + "px";
              box.offsetHeight; // apply the starting height before the change
              box.style.transition = "height .5s var(--ease)";
              box.style.height = after + "px";
              follow();
              setTimeout(function () { box.style.height = ""; box.style.transition = ""; dots.classList.add("open"); }, 560);
            });
        });
      });
      return chain;
    }
    function done(mine) { if (mine === run) replay.classList.add("on"); }
    // Shows the press without the visitor: the button dips, greys out, and the chat carries on.
    function autoPress(btn, mine) {
      wait(1900).then(function () {
        if (mine !== run) return;
        btn.classList.add("pressing");
        return wait(260).then(function () {
          if (mine !== run) return;
          btn.classList.remove("pressing", "shown");
          btn.classList.add("pressed");
          return play(data.after, mine).then(function () { done(mine); });
        });
      });
    }
    function arm(btn, mine) {
      btn.addEventListener("click", function () {
        if (mine !== run) return;
        btn.disabled = true;
        btn.classList.remove("waiting");
        play(data.after, mine).then(function () { done(mine); });
      });
    }
    function start() {
      run += 1;
      var mine = run;
      body.innerHTML = "";
      stuck = true;
      replay.classList.remove("on");
      play(data.script, mine).then(function () { if (!data.after) done(mine); });
    }

    if (calm || !("IntersectionObserver" in window)) {
      // No motion: the whole chat is on the page at once, and a button still works.
      chat.classList.add("still");
      data.script.forEach(function (m) { add(m, true); });
      if (data.auto) { data.after.forEach(function (m) { add(m, true); }); return; }
      var still = body.querySelector("button.chat-confirm");
      if (still) {
        still.classList.add("waiting");
        still.addEventListener("click", function () {
          still.disabled = true;
          still.classList.remove("waiting");
          data.after.forEach(function (m) { add(m, true); });
        });
      }
      return;
    }
    replay.addEventListener("click", start);
    var first = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { first.disconnect(); setTimeout(start, 600); }
    }, { threshold: 0.35 });
    first.observe(chat);
  });
})();
