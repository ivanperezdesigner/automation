/* Ivan Perez - landing page behaviour.
   Plain browser JavaScript, no framework, no build step, no external request. */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STRINGS = {
    fr: {
      htmlLang: "fr-CA",
      switchTo: "Switch to English",
      menuOpen: "Ouvrir le menu",
      menuClose: "Fermer le menu",
      top: "Revenir en haut",
      copied: "Copié",
      copyPrompt: "Copiez l'adresse :",
      needName: "Votre nom, s'il vous plaît.",
      needMail: "Une adresse courriel valide, pour que nous puissions répondre.",
      needTask: "Décrivez la tâche en une phrase au moins.",
      missing: "Il manque encore quelque chose ci-dessus.",
      sent: "Votre logiciel de courriel s'ouvre avec le message prêt. Il ne part que quand vous l'envoyez.",
      noClient: "Rien ne s'est ouvert : ce navigateur n'a pas de logiciel de courriel.",
      copyMessage: "Message copié",
      subjectLine: "Objet :",
      subject: "Une tâche à automatiser",
      greeting: "Bonjour Ivan,"
    },
    en: {
      htmlLang: "en",
      switchTo: "Passer en français",
      menuOpen: "Open the menu",
      menuClose: "Close the menu",
      top: "Back to top",
      copied: "Copied",
      copyPrompt: "Copy the address:",
      needName: "Your name, please.",
      needMail: "A valid email address, so that we can answer.",
      needTask: "Describe the task in at least one sentence.",
      missing: "Something is still missing above.",
      sent: "Your email program opens with the message ready. It only goes when you send it.",
      noClient: "Nothing opened: this browser has no email program attached.",
      copyMessage: "Message copied",
      subjectLine: "Subject:",
      subject: "A task to automate",
      greeting: "Hello Ivan,"
    }
  };

  var lang = "fr";
  function t(key) { return STRINGS[lang][key]; }

  /* ------------------------------------------------------------- header */

  var nav = document.getElementById("nav");
  var navMenu = document.getElementById("navMenu");
  var navToggle = document.getElementById("navToggle");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", t("menuOpen"));
  }

  navToggle.addEventListener("click", function () {
    var open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? t("menuClose") : t("menuOpen"));
  });

  navMenu.addEventListener("click", function (event) {
    if (event.target.closest("a")) { closeMenu(); }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") { closeMenu(); }
  });

  /* -------------------------------------------------------- language */

  var langToggle = document.getElementById("langToggle");
  var langPair = langToggle.querySelector(".lang__pair");

  function setLang(next, remember) {
    lang = (next === "en") ? "en" : "fr";

    document.documentElement.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", t("htmlLang"));

    langPair.innerHTML = (lang === "fr")
      ? "<b>FR</b><i>/</i><s>EN</s>"
      : "<s>FR</s><i>/</i><b>EN</b>";
    langToggle.setAttribute("aria-label", t("switchTo"));
    navToggle.setAttribute("aria-label", t("menuOpen"));
    document.getElementById("toTop").setAttribute("aria-label", t("top"));

    if (remember) {
      try { window.localStorage.setItem("ip-lang", lang); } catch (error) { /* private mode */ }
    }
    refreshOpenAnswers();
    refreshErrors();
  }

  langToggle.addEventListener("click", function () {
    setLang(lang === "fr" ? "en" : "fr", true);
  });

  /* ----------------------------------------- scroll: header, bar, to-top */

  var progressBar = document.getElementById("progressBar");
  var toTop = document.getElementById("toTop");
  var ticking = false;

  function onScroll() {
    var top = window.pageYOffset;
    var height = document.documentElement.scrollHeight - window.innerHeight;

    nav.classList.toggle("is-stuck", top > 8);
    toTop.classList.toggle("is-visible", top > 900);
    progressBar.style.transform = "scaleX(" + (height > 0 ? top / height : 0).toFixed(4) + ")";

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  onScroll();

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  /* ------------------------------------------------------- reveal on view */

  var revealables = document.querySelectorAll("[data-reveal]");
  var wipes = document.querySelectorAll("[data-wipe]");

  function reveal(node) { node.classList.add("is-in"); }

  if (!("IntersectionObserver" in window) || reduced) {
    Array.prototype.forEach.call(revealables, reveal);
    Array.prototype.forEach.call(wipes, reveal);
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    Array.prototype.forEach.call(revealables, function (node) { revealer.observe(node); });

    /* A heading clipped to zero width reports no intersection area of its
       own, so the observer would never see it. The wipe watches the
       heading's container instead and uncovers every heading inside it. */
    var wipeWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        wipeWatch.unobserve(entry.target);
        Array.prototype.forEach.call(entry.target.querySelectorAll("[data-wipe]"), reveal);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    var hosts = [];
    Array.prototype.forEach.call(wipes, function (node) {
      var host = node.parentElement;
      if (!host || hosts.indexOf(host) !== -1) { return; }
      hosts.push(host);
      wipeWatch.observe(host);
    });
  }

  /* --------------------------------------------------- counting figures */

  /* The proof figures count up once, the first time they are seen. The final
     value is already in the HTML, so a browser without IntersectionObserver
     and a reader with reduced motion both see the right number immediately. */
  var counters = document.querySelectorAll("[data-count]");

  function runCount(node) {
    var target = parseInt(node.getAttribute("data-count"), 10);
    if (isNaN(target)) { return; }

    var duration = 1100;
    var started = null;

    var frame = function (now) {
      if (started === null) { started = now; }
      var ratio = Math.min((now - started) / duration, 1);
      var eased = 1 - Math.pow(1 - ratio, 3);
      node.textContent = String(Math.round(target * eased));
      if (ratio < 1) { window.requestAnimationFrame(frame); }
    };

    node.textContent = "0";
    window.requestAnimationFrame(frame);
  }

  if (counters.length && "IntersectionObserver" in window && !reduced) {
    var counterWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        counterWatch.unobserve(entry.target);
        runCount(entry.target);
      });
    }, { threshold: 0.6 });

    Array.prototype.forEach.call(counters, function (node) { counterWatch.observe(node); });
  }

  /* --------------------------------------------------------- parallax img */

  var parallax = document.querySelectorAll("[data-parallax]");

  if (parallax.length && !reduced) {
    Array.prototype.forEach.call(parallax, function (image) {
      image.style.height = "128%";
      image.style.position = "relative";
      image.style.top = "-14%";
    });

    var moving = false;

    var movePar = function () {
      Array.prototype.forEach.call(parallax, function (image) {
        var box = image.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) { return; }
        var progress = (box.top + box.height / 2 - window.innerHeight / 2) / window.innerHeight;
        image.style.transform = "translateY(" + (progress * -60).toFixed(1) + "px)";
      });
      moving = false;
    };

    window.addEventListener("scroll", function () {
      if (!moving) {
        moving = true;
        window.requestAnimationFrame(movePar);
      }
    }, { passive: true });

    movePar();
  }

  /* ---------------------------------------------------- scrollspy on nav */

  var spied = document.querySelectorAll("main section[id]");
  var navLinks = navMenu.querySelectorAll("a[href^='#']");

  if ("IntersectionObserver" in window && spied.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        Array.prototype.forEach.call(navLinks, function (link) {
          link.classList.toggle("is-current", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    Array.prototype.forEach.call(spied, function (section) { spy.observe(section); });
  }

  /* ----------------------------------------------------- tabs and steps */

  function wirePanels(buttonSelector, buttonKey, panelKey, activeClass) {
    var buttons = document.querySelectorAll(buttonSelector);
    if (!buttons.length) { return; }

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        var index = button.getAttribute(buttonKey);

        Array.prototype.forEach.call(buttons, function (other) {
          var on = other === button;
          other.classList.toggle(activeClass, on);
          other.setAttribute("aria-selected", on ? "true" : "false");
        });

        var panels = document.querySelectorAll("[" + panelKey + "]");
        Array.prototype.forEach.call(panels, function (panel) {
          var on = panel.getAttribute(panelKey) === index;
          panel.hidden = !on;
          panel.classList.toggle(activeClass, on);
          panel.classList.remove("is-entering");
          if (on && !reduced) {
            void panel.offsetWidth;
            panel.classList.add("is-entering");
          }
        });
      });

      button.addEventListener("keydown", function (event) {
        var keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"];
        if (keys.indexOf(event.key) === -1) { return; }
        event.preventDefault();
        var list = Array.prototype.slice.call(buttons);
        var step = (event.key === "ArrowRight" || event.key === "ArrowDown") ? 1 : -1;
        var next = list[(list.indexOf(button) + step + list.length) % list.length];
        next.focus();
        next.click();
      });
    });
  }

  wirePanels(".tab", "data-tab", "data-panel", "is-active");
  wirePanels(".step", "data-step", "data-spanel", "is-active");

  /* --------------------------------------------------------- faq accordion */

  var faqItems = document.querySelectorAll(".faq__item");

  function setOpen(item, open) {
    var answer = item.querySelector(".faq__a");
    var button = item.querySelector(".faq__q");

    item.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
    answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0px";
  }

  function refreshOpenAnswers() {
    Array.prototype.forEach.call(faqItems, function (item) {
      if (item.classList.contains("is-open")) {
        var answer = item.querySelector(".faq__a");
        answer.style.maxHeight = "none";
        var height = answer.scrollHeight;
        answer.style.maxHeight = height + "px";
      }
    });
  }

  Array.prototype.forEach.call(faqItems, function (item) {
    var button = item.querySelector(".faq__q");

    setOpen(item, item.classList.contains("is-open"));

    button.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      Array.prototype.forEach.call(faqItems, function (other) {
        setOpen(other, other === item && willOpen);
      });
    });
  });

  window.addEventListener("resize", refreshOpenAnswers);

  /* ------------------------------------------------------------ copy mail */

  var copyButton = document.getElementById("copyMail");

  if (copyButton) {
    var labels = copyButton.querySelectorAll(".copy__label");
    var originals = Array.prototype.map.call(labels, function (node) { return node.textContent; });

    copyButton.addEventListener("click", function () {
      var address = copyButton.getAttribute("data-mail");

      var done = function () {
        Array.prototype.forEach.call(labels, function (node) { node.textContent = t("copied"); });
        window.setTimeout(function () {
          Array.prototype.forEach.call(labels, function (node, index) { node.textContent = originals[index]; });
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(done, function () { window.prompt(t("copyPrompt"), address); });
      } else {
        window.prompt(t("copyPrompt"), address);
      }
    });
  }

  /* ----------------------------------------------------------------- form */

  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  var fallback = document.getElementById("formFallback");
  var fallbackText = document.getElementById("formFallbackText");
  var fallbackOpened = document.getElementById("fallbackOpened");
  var fallbackNone = document.getElementById("fallbackNone");
  var mailTo = "joseivanperezdiaz1@gmail.com";

  function showError(input, key) {
    var field = input.closest(".field");
    var slot = field.querySelector(".error");
    field.classList.add("has-error");
    if (slot) {
      slot.setAttribute("data-error-key", key);
      slot.textContent = t(key);
    }
  }

  function clearError(input) {
    var field = input.closest(".field");
    var slot = field.querySelector(".error");
    field.classList.remove("has-error");
    if (slot) {
      slot.removeAttribute("data-error-key");
      slot.textContent = "";
    }
  }

  /* An error slot holds one language at a time, so it is rewritten when the
     visitor switches. Notes do not need this: each one carries both
     languages in its own spans and the stylesheet hides the wrong one. */
  function refreshErrors() {
    var slots = document.querySelectorAll(".error[data-error-key]");
    Array.prototype.forEach.call(slots, function (slot) {
      slot.textContent = t(slot.getAttribute("data-error-key"));
    });
  }

  /* Writing to note.textContent would delete the two <span lang> children
     and leave the note stuck in whichever language was current. */
  function showNote(key, ok) {
    note.classList.toggle("is-ok", !!ok);
    Array.prototype.forEach.call(note.querySelectorAll("span[lang]"), function (slot) {
      slot.textContent = STRINGS[slot.getAttribute("lang") === "en" ? "en" : "fr"][key];
    });
  }

  function revealFallback(text, opened) {
    if (!fallback) { return; }
    fallbackText.value = text;
    fallbackOpened.hidden = !opened;
    fallbackNone.hidden = opened;
    fallback.hidden = false;
  }

  if (form) {
    Array.prototype.forEach.call(form.querySelectorAll("input, textarea"), function (input) {
      input.addEventListener("input", function () { clearError(input); });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements.name;
      var email = form.elements.email;
      var task = form.elements.task;
      var company = form.elements.company;
      var problems = [];

      [name, email, task].forEach(clearError);

      if (!name.value.trim()) { showError(name, "needName"); problems.push(name); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, "needMail"); problems.push(email); }
      if (task.value.trim().length < 10) { showError(task, "needTask"); problems.push(task); }

      if (problems.length) {
        showNote("missing", false);
        problems[0].focus();
        return;
      }

      var subject = t("subject") + (company.value.trim() ? " — " + company.value.trim() : "");
      var body = [
        t("greeting"),
        "",
        task.value.trim(),
        "",
        "--",
        name.value.trim(),
        company.value.trim(),
        email.value.trim()
      ].filter(function (line) { return line !== ""; }).join("\r\n");

      /* A browser with no mail handler drops a mailto: without a word: no
         error, no dialog, nothing at all, so the button reads as broken.
         Losing focus is the only sign a client really opened. Either way the
         message goes on the page, and the lead says which happened. */
      var opened = false;
      function markOpened() { opened = true; }
      window.addEventListener("blur", markOpened, { once: true });

      window.location.href = "mailto:" + mailTo +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.setTimeout(function () {
        window.removeEventListener("blur", markOpened);
        if (document.visibilityState === "hidden") { opened = true; }
        showNote(opened ? "sent" : "noClient", opened);
        revealFallback(t("subjectLine") + " " + subject + "\r\n\r\n" + body, opened);
      }, 1500);
    });
  }

  /* --------------------------------------------------- copy the message */

  var copyMessage = document.getElementById("copyMessage");

  if (copyMessage) {
    var msgLabels = copyMessage.querySelectorAll(".copy__label");
    var msgOriginals = Array.prototype.map.call(msgLabels, function (node) { return node.textContent; });

    copyMessage.addEventListener("click", function () {
      var done = function () {
        Array.prototype.forEach.call(msgLabels, function (node) { node.textContent = t("copyMessage"); });
        window.setTimeout(function () {
          Array.prototype.forEach.call(msgLabels, function (node, index) { node.textContent = msgOriginals[index]; });
        }, 2000);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fallbackText.value).then(done, function () { fallbackText.select(); });
      } else {
        fallbackText.select();
      }
    });
  }

  /* ------------------------------------------------- start in a language */

  var stored = null;
  try { stored = window.localStorage.getItem("ip-lang"); } catch (error) { stored = null; }

  /* French is the default for everyone; the browser language never decides it. */
  if (stored !== "fr" && stored !== "en") { stored = "fr"; }

  setLang(stored, false);

  /* ----------------------------------------------------------------- year */

  var year = document.getElementById("year");
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
