/* KMU Web Studio – Interaktionen. Ohne Abhängigkeiten. */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Kopfzeile ---------- */

  var header = $("#header");
  var toggle = $(".menu-toggle");

  if (header) {
    var setSolid = function () {
      header.classList.toggle("is-solid", window.scrollY > 24);
    };
    setSolid();
    window.addEventListener("scroll", setSolid, { passive: true });
  }

  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    $$(".mobile-menu a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) setMenu(false);
    });
    window.matchMedia("(min-width: 1041px)").addEventListener("change", function () { setMenu(false); });
  }

  /* Aktiver Abschnitt in der Navigation */

  var navLinks = $$(".nav a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (link) { byId[link.getAttribute("href").slice(1)] = link; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) { link.removeAttribute("aria-current"); });
        var active = byId[entry.target.id];
        if (active) active.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Hintergrundvideo ---------- */

  var video = $(".hero video");
  var videoToggle = $(".video-toggle");
  var saveData = navigator.connection && navigator.connection.saveData;

  if (video && videoToggle) {
    var setVideoState = function (paused) {
      videoToggle.setAttribute("aria-pressed", String(paused));
      videoToggle.setAttribute("aria-label", paused ? "Hintergrundvideo abspielen" : "Hintergrundvideo pausieren");
    };
    var loadVideo = function () {
      if (video.getAttribute("src")) return;
      video.src = video.getAttribute("data-src");
    };
    var play = function () {
      loadVideo();
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () { setVideoState(true); });
    };

    videoToggle.hidden = false;
    video.addEventListener("play", function () { setVideoState(false); });
    video.addEventListener("pause", function () { setVideoState(true); });
    videoToggle.addEventListener("click", function () {
      if (video.paused) play(); else video.pause();
    });

    if (reduceMotion.matches || saveData) {
      setVideoState(true);
    } else {
      play();
      /* Video nur abspielen, solange der Hero sichtbar ist. */
      if ("IntersectionObserver" in window) {
        var userPaused = false;
        videoToggle.addEventListener("click", function () { userPaused = video.paused; });
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { if (!userPaused) play(); }
          else video.pause();
        }, { threshold: 0.05 }).observe(video);
      }
    }
  }

  /* ---------- Einblendungen ---------- */

  var revealItems = $$("[data-reveal], [data-reveal-line]");
  if ("IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach(function (item) { revealer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-in"); });
  }

  /* ---------- Referenzen ---------- */

  var references = {
    swisscarpoint: { domain: "swisscarpoint.ch", url: "https://swisscarpoint.ch" },
    logistikexperte: { domain: "logistikexperte.ch", url: "https://logistikexperte.ch" },
    selimi: { domain: "selimi.ch", url: "https://selimi.ch" }
  };

  var tablist = $(".ref-tabs");
  if (tablist) {
    var tabs = $$("[role='tab']", tablist);

    var selectTab = function (tab, focus) {
      var ref = references[tab.getAttribute("data-ref")];
      tabs.forEach(function (other) {
        var selected = other === tab;
        other.setAttribute("aria-selected", String(selected));
        other.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(other.getAttribute("aria-controls"));
        if (panel) panel.classList.toggle("is-active", selected);
      });
      if (ref) {
        $("[data-ref-domain]").textContent = ref.domain;
        $("[data-ref-link]").href = ref.url;
      }
      if (focus) tab.focus();
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectTab(tab, false); });
      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (next) { event.preventDefault(); selectTab(next, true); }
      });
    });
  }

  /* ---------- Konfigurator ---------- */

  var config = $("[data-config]");
  if (config) {
    var MAX_PAGES = 4;
    var state = { step: 0, industry: "", goal: "", pages: ["Startseite", "Leistungen", "Kontakt"] };
    var pageOrder = $$("[data-page]", config).map(function (button) { return button.getAttribute("data-page"); });
    var steps = $$(".config__step", config);
    var progress = $("[data-config-progress]", config);
    var nextButton = $("[data-config-next]", config);
    var sendLink = $("[data-config-send]", config);
    var mock = function (name) { return $("[data-mock='" + name + "']"); };
    var out = function (name) { return $("[data-out='" + name + "']", config); };

    var render = function () {
      /* Seiten in fester Reihenfolge halten */
      var pages = pageOrder.filter(function (page) { return state.pages.indexOf(page) !== -1; });
      state.pages = pages;

      $$("[data-page]", config).forEach(function (button) {
        button.setAttribute("aria-pressed", String(pages.indexOf(button.getAttribute("data-page")) !== -1));
      });
      $("[data-page-count]", config).textContent = pages.length + " von " + MAX_PAGES + " Seiten gewählt";
      nextButton.disabled = pages.length === 0;

      $$("i", progress).forEach(function (bar, index) { bar.classList.toggle("is-active", index <= state.step); });
      progress.setAttribute("aria-label", "Schritt " + (state.step + 1) + " von 4");

      out("industry").textContent = state.industry || "noch offen";
      out("goal").textContent = state.goal || "noch offen";
      out("pages").textContent = pages.join(" · ") || "noch offen";

      mock("brand").textContent = state.industry || "Dein KMU";
      mock("goal").textContent = state.goal || "Dein Ziel. Klar im Fokus.";
      mock("headline").innerHTML = state.industry ? "Ein Auftritt,<br>der zu Dir passt." : "Deine Website.<br>Professionell.";
      mock("text").textContent = state.goal
        ? state.goal + ". Klar geplant und hochwertig umgesetzt."
        : "Wähle links Deine Branche und Dein wichtigstes Ziel.";
      mock("count").textContent = String(pages.length || 3);

      var shown = pages.length ? pages : ["Startseite", "Leistungen", "Kontakt"];
      var pagesBox = mock("pages");
      var signature = shown.join("|");
      if (pagesBox.getAttribute("data-signature") !== signature) {
        pagesBox.setAttribute("data-signature", signature);
        pagesBox.textContent = "";
        shown.forEach(function (page, index) {
          var cell = document.createElement("span");
          var number = document.createElement("i");
          number.textContent = "0" + (index + 1);
          cell.appendChild(number);
          cell.appendChild(document.createTextNode(page));
          pagesBox.appendChild(cell);
        });
      }

      var body = "Hallo KWS\n\nIch interessiere mich für eine Website.\n\n" +
        "Branche: " + (state.industry || "noch offen") + "\n" +
        "Ziel: " + (state.goal || "noch offen") + "\n" +
        "Seiten: " + (pages.join(", ") || "noch offen") + "\n\n" +
        "Bitte nehmt mit mir Kontakt auf.";
      sendLink.href = "mailto:hallo@kmuwebstudio.ch?subject=" + encodeURIComponent("Meine Website-Idee") + "&body=" + encodeURIComponent(body);
    };

    var goTo = function (step) {
      state.step = step;
      steps.forEach(function (panel) {
        var active = Number(panel.getAttribute("data-step")) === step;
        panel.hidden = !active;
        panel.classList.toggle("is-entering", active);
        if (active) {
          var heading = $("h3", panel);
          if (heading) heading.focus({ preventScroll: true });
        }
      });
      render();
    };

    config.addEventListener("click", function (event) {
      var target = event.target.closest("button, a");
      if (!target || !config.contains(target)) return;

      if (target.hasAttribute("data-industry")) {
        state.industry = target.getAttribute("data-industry");
        goTo(1);
      } else if (target.hasAttribute("data-goal")) {
        state.goal = target.getAttribute("data-goal");
        goTo(2);
      } else if (target.hasAttribute("data-page")) {
        var page = target.getAttribute("data-page");
        var position = state.pages.indexOf(page);
        if (position !== -1) state.pages.splice(position, 1);
        else if (state.pages.length < MAX_PAGES) state.pages.push(page);
        render();
      } else if (target.hasAttribute("data-goto")) {
        goTo(Number(target.getAttribute("data-goto")));
      }
    });

    render();
  }

  /* ---------- FAQ ---------- */

  $$(".faq__q").forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest(".faq__item");
      var open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      item.classList.toggle("is-open", open);
    });
  });

  /* ---------- E-Mail kopieren ---------- */

  $$("[data-copy]").forEach(function (button) {
    var label = $("[data-copy-label]", button);
    var original = label.textContent;
    var timer = 0;
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy");
      var done = function () {
        button.classList.add("is-done");
        label.textContent = "Kopiert";
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          button.classList.remove("is-done");
          label.textContent = original;
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { window.location.href = "mailto:" + text; });
      } else {
        window.location.href = "mailto:" + text;
      }
    });
  });
})();
