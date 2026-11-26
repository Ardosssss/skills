/* KMU Web Studio – Interaktionen. Ohne Abhängigkeiten. */
(function () {
  "use strict";

  /* ==========================================================
     Versand des Anfrageformulars – hier einrichten
     ----------------------------------------------------------
     endpoint:  Adresse, an die das Formular gesendet wird,
                z. B. "https://api.web3forms.com/submit".
     accessKey: Schlüssel des Formular-Dienstes (bei Web3Forms
                der «Access Key»). Leer lassen, wenn der Dienst
                keinen braucht.
     Solange endpoint leer ist, öffnet das Formular stattdessen
     das Mailprogramm der Besucherin oder des Besuchers.
     ========================================================== */
  var ANFRAGE = {
    endpoint: "",
    accessKey: "",
    email: "hallo@kmuwebstudio.ch",
    subject: "Neue Anfrage über kmuwebstudio.ch"
  };

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

  var tablist = $(".ref-tabs");
  if (tablist) {
    var tabs = $$("[role='tab']", tablist);
    var refNote = $("[data-ref-note]");

    /* In der waagrechten Reihe (Tablet, Handy) die gewählte Referenz ganz zeigen */
    var revealTab = function (tab) {
      if (tablist.scrollWidth <= tablist.clientWidth) return;
      var pad = parseFloat(window.getComputedStyle(tablist).paddingLeft) || 0;
      var box = tablist.getBoundingClientRect();
      var rect = tab.getBoundingClientRect();
      if (rect.left >= box.left + pad && rect.right <= box.right - pad) return;
      tablist.scrollBy({ left: rect.left - box.left - pad, behavior: reduceMotion.matches ? "auto" : "smooth" });
    };

    var selectTab = function (tab, focus) {
      tabs.forEach(function (other) {
        var selected = other === tab;
        other.setAttribute("aria-selected", String(selected));
        other.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(other.getAttribute("aria-controls"));
        if (panel) panel.classList.toggle("is-active", selected);
      });
      var domain = tab.getAttribute("data-domain");
      $("[data-ref-domain]").textContent = domain;
      $("[data-ref-link]").href = "https://" + domain;
      if (refNote) refNote.textContent = tab.getAttribute("data-note");
      if (focus) tab.focus({ preventScroll: true });
      revealTab(tab);
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

  /* ---------- Referenzen (Startseite) ----------
     Alle Referenzen liegen verteilt auf einer Fläche.
     – Mit Maus: Maus auf eine Referenz und scrollen, dann läuft deren
       Seite von oben nach unten durch Browser und Handy; die Seite selbst
       bleibt stehen. Am Ende der Referenz scrollt die Seite weiter. Gewählt
       wird nur durch echte Mausbewegung: Schiebt das Scrollen eine Referenz
       unter den stehenden Zeiger, scrollt die Seite einfach weiter.
     – Ohne Maus (Handy, Tablet): Jede Seite läuft beim Vorbeiscrollen
       durch. Bei «Bewegung reduzieren» bleibt sie stehen. */

  var showcase = $("[data-showcase]");
  if (showcase) {
    var board = $("[data-showcase-stage]", showcase);
    var devices = $$(".device", board);
    var mouseQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    var clamp01 = function (value) { return Math.max(0, Math.min(1, value)); };
    var shot = function (view) { return { view: view, img: $("img", view), max: 0 }; };
    var cards = devices.map(function (device) {
      var views = $$(".view", device);
      return {
        el: device,
        desk: shot(views[0]),
        phone: shot(views[1]),
        thumb: $(".device__thumb b", device),
        current: 0,
        target: 0,
        max: 0
      };
    });
    var mode = "";
    var live = null;
    var liveByKey = false;
    var frame = 0;
    var followFrame = 0;
    var lastX = -1;
    var lastY = -1;

    var measure = function () {
      cards.forEach(function (card) {
        card.desk.max = Math.max(0, card.desk.img.offsetHeight - card.desk.view.clientHeight);
        card.phone.max = Math.max(0, card.phone.img.offsetHeight - card.phone.view.clientHeight);
        card.max = card.desk.max;
        card.target = Math.min(card.target, card.max);
      });
    };

    var apply = function (card) {
      var progress = card.max ? card.current / card.max : 0;
      card.desk.img.style.transform = "translate3d(0," + (-card.current).toFixed(1) + "px,0)";
      card.phone.img.style.transform = "translate3d(0," + (-progress * card.phone.max).toFixed(1) + "px,0)";
      /* Der Balken ist 24 % so hoch wie seine Spur: Weg = 76/24 seiner Höhe. */
      if (card.thumb) card.thumb.style.transform = "translateY(" + (progress * 316.67).toFixed(1) + "%)";
    };

    var paint = function () {
      var moving = false;
      cards.forEach(function (card) {
        var delta = card.target - card.current;
        if (reduceMotion.matches || Math.abs(delta) < 0.5) card.current = card.target;
        else { card.current += delta * 0.22; moving = true; }
        apply(card);
      });
      frame = moving ? window.requestAnimationFrame(paint) : 0;
    };

    var kick = function () {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    /* ---- Mit Maus ---- */

    var setLive = function (card, byKey) {
      liveByKey = Boolean(card && byKey);
      if (card === live) return;
      if (live) {
        live.el.classList.remove("is-live", "is-moved");
        live.target = 0; /* gleitet zurück an den Anfang */
      }
      live = card;
      board.classList.toggle("has-live", Boolean(card));
      if (card) {
        card.el.classList.add("is-live");
        measure();
      }
      kick();
    };

    var cardAt = function (node) {
      var el = node && node.closest ? node.closest(".device") : null;
      var index = el ? devices.indexOf(el) : -1;
      return index === -1 ? null : cards[index];
    };

    var scrollCard = function (card, amount) {
      var next = Math.max(0, Math.min(card.max, card.target + amount));
      if (next === card.target) return false;
      card.target = next;
      card.el.classList.add("is-moved");
      kick();
      return true;
    };

    board.addEventListener("pointermove", function (event) {
      if (mode !== "mouse" || event.pointerType === "touch") return;
      if (event.clientX === lastX && event.clientY === lastY) return;
      lastX = event.clientX;
      lastY = event.clientY;
      setLive(cardAt(event.target), false);
    });

    board.addEventListener("pointerleave", function (event) {
      if (mode === "mouse" && !liveByKey && event.pointerType !== "touch") setLive(null);
    });

    board.addEventListener("wheel", function (event) {
      if (mode !== "mouse" || !live || event.ctrlKey || !live.el.contains(event.target)) return;
      var dy = event.deltaY;
      if (event.deltaMode === 1) dy *= 32;
      else if (event.deltaMode === 2) dy *= window.innerHeight;
      if (!dy) return;
      /* Am Anfang oder am Ende der Referenz scrollt die Seite weiter. */
      if (scrollCard(live, dy)) event.preventDefault();
    }, { passive: false });

    /* Tastatur: Referenz mit Tab wählen, mit Pfeilen, Bild auf/ab, Pos1 und Ende scrollen. */
    cards.forEach(function (card) {
      card.el.addEventListener("focus", function () {
        if (mode === "mouse" && card.el.matches(":focus-visible")) setLive(card, true);
      });
      card.el.addEventListener("blur", function () {
        if (mode === "mouse" && liveByKey && live === card) setLive(null);
      });
      card.el.addEventListener("keydown", function (event) {
        if (mode !== "mouse" || event.target !== card.el) return;
        var page = card.desk.view.clientHeight * 0.9;
        var steps = { ArrowDown: 80, ArrowUp: -80, PageDown: page, PageUp: -page, Home: -Infinity, End: Infinity };
        if (!Object.prototype.hasOwnProperty.call(steps, event.key)) return;
        event.preventDefault();
        if (live !== card) setLive(card, true);
        scrollCard(card, steps[event.key]);
      });
    });

    /* ---- Ohne Maus: Die Seite in der Referenz folgt dem Scrollen ---- */

    var follow = function () {
      followFrame = 0;
      if (mode !== "touch") return;
      var height = window.innerHeight;
      cards.forEach(function (card) {
        var rect = card.el.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > height + 80) return;
        /* 0, wenn die Referenz ganz unten hereingekommen ist; 1, wenn sie oben ankommt. */
        var range = Math.max(1, height - rect.height);
        card.target = card.current = clamp01((height - rect.height - rect.top) / range) * card.max;
        apply(card);
      });
    };

    var requestFollow = function () {
      if (!followFrame) followFrame = window.requestAnimationFrame(follow);
    };

    window.addEventListener("scroll", function () {
      if (mode === "touch") { requestFollow(); return; }
      if (mode !== "mouse" || !live || liveByKey) return;
      /* Fährt die Seite die gewählte Referenz unter dem Zeiger weg, ist sie nicht mehr gewählt. */
      var rect = live.el.getBoundingClientRect();
      if (lastX < rect.left || lastX > rect.right || lastY < rect.top || lastY > rect.bottom) setLive(null);
    }, { passive: true });

    /* ---- Darstellung wählen ---- */

    var applyMode = function () {
      var next = mouseQuery.matches ? "mouse" : reduceMotion.matches ? "still" : "touch";
      if (next === mode) return;
      setLive(null);
      mode = next;
      showcase.classList.toggle("is-mouse", mode === "mouse");
      showcase.classList.toggle("is-touch", mode === "touch");
      devices.forEach(function (device) {
        if (mode === "mouse") {
          device.tabIndex = 0;
          device.setAttribute("aria-describedby", "showcase-hint");
        } else {
          device.removeAttribute("tabindex");
          device.removeAttribute("aria-describedby");
        }
      });
      cards.forEach(function (card) {
        card.current = card.target = 0;
        apply(card);
      });
      measure();
      if (mode === "touch") requestFollow();
    };

    var remeasure = function () {
      measure();
      if (mode === "touch") requestFollow();
    };

    window.addEventListener("resize", remeasure);
    cards.forEach(function (card) {
      card.desk.img.addEventListener("load", remeasure);
      card.phone.img.addEventListener("load", remeasure);
    });
    mouseQuery.addEventListener("change", applyMode);
    reduceMotion.addEventListener("change", applyMode);
    applyMode();
  }

  /* ---------- Konfigurator ---------- */

  var configSummary = "";
  var config = $("[data-config]");
  if (config) {
    var MAX_PAGES = 4;
    var state = { step: 0, industry: "", goal: "", pages: ["Startseite", "Leistungen", "Kontakt"] };
    var pageOrder = $$("[data-page]", config).map(function (button) { return button.getAttribute("data-page"); });
    var steps = $$(".config__step", config);
    var progress = $("[data-config-progress]", config);
    var nextButton = $("[data-config-next]", config);
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

      /* Auswahl für das Anfragefenster */
      configSummary = "Meine Website-Idee\n" +
        "Branche: " + (state.industry || "noch offen") + "\n" +
        "Ziel: " + (state.goal || "noch offen") + "\n" +
        "Seiten: " + (pages.join(", ") || "noch offen") + "\n\n";
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
      var target = event.target.closest("button");
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

  /* ---------- Lichtpunkt unter dem Mauszeiger ---------- */

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
    $$(".price-card, .contact__box").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (event.clientX - rect.left).toFixed(0) + "px");
        card.style.setProperty("--my", (event.clientY - rect.top).toFixed(0) + "px");
        card.classList.add("is-lit");
      });
      card.addEventListener("pointerleave", function () { card.classList.remove("is-lit"); });
    });
  }

  /* ---------- E-Mail kopieren ---------- */

  function bindCopy(root) {
    $$("[data-copy]", root).forEach(function (button) {
      if (button.hasAttribute("data-copy-bound")) return;
      button.setAttribute("data-copy-bound", "");
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
  }
  bindCopy(document);

  /* ==========================================================
     Anfrageformular und Anfragefenster
     ========================================================== */

  var direct = Boolean(ANFRAGE.endpoint);
  var formCount = 0;

  function icon(name, extra) {
    return '<svg class="icon' + (extra ? " " + extra : "") + '"><use href="#i-' + name + '"/></svg>';
  }

  function formMarkup(id) {
    return '' +
      '<form class="form" novalidate>' +
        '<div class="form__row">' +
          '<div class="field">' +
            '<label for="' + id + '-name">Name</label>' +
            '<input id="' + id + '-name" name="name" type="text" autocomplete="name" required aria-describedby="' + id + '-name-error">' +
            '<p class="field__error" id="' + id + '-name-error" hidden>Bitte gib Deinen Namen an.</p>' +
          '</div>' +
          '<div class="field">' +
            '<label for="' + id + '-email">E-Mail</label>' +
            '<input id="' + id + '-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" required aria-describedby="' + id + '-email-error">' +
            '<p class="field__error" id="' + id + '-email-error" hidden>Bitte gib eine gültige E-Mail-Adresse an.</p>' +
          '</div>' +
        '</div>' +
        '<div class="field">' +
          '<label for="' + id + '-phone">Telefon <span>optional</span></label>' +
          '<input id="' + id + '-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel">' +
        '</div>' +
        '<div class="field">' +
          '<label for="' + id + '-message">Deine Nachricht</label>' +
          '<textarea id="' + id + '-message" name="message" rows="5" required enterkeyhint="enter" aria-describedby="' + id + '-message-error"></textarea>' +
          '<p class="field__error" id="' + id + '-message-error" hidden>Bitte schreib uns kurz, worum es geht.</p>' +
        '</div>' +
        '<div class="form__trap" aria-hidden="true">' +
          '<label>Bitte leer lassen<input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off"></label>' +
        '</div>' +
        '<p class="form__status" role="status" aria-live="polite"></p>' +
        '<button class="button button--primary button--wide" type="submit">' +
          '<span data-submit-label>' + (direct ? "Anfrage senden" : "Anfrage per E-Mail senden") + '</span>' + icon("go", "icon--go") +
          '<span class="spinner" aria-hidden="true"></span>' +
        '</button>' +
        '<p class="form__note">Mit dem Absenden bearbeiten wir Deine Angaben gemäss unserer <a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
      '</form>' +
      '<div class="form__done" tabindex="-1" hidden>' +
        '<span class="form__done-icon">' + icon("check") + '</span>' +
        '<h3>Danke für Deine Anfrage.</h3>' +
        '<p>Deine Nachricht ist bei uns angekommen. Wir melden uns persönlich bei Dir.</p>' +
        '<button class="button button--outline" type="button" data-form-again>Weitere Anfrage schreiben</button>' +
      '</div>';
  }

  function setupForm(host) {
    formCount += 1;
    host.innerHTML = formMarkup("anfrage-" + formCount);

    var form = $("form", host);
    var done = $(".form__done", host);
    var status = $(".form__status", form);
    var submit = $("button[type='submit']", form);
    var submitLabel = $("[data-submit-label]", form);
    var idleLabel = submitLabel.textContent;
    var required = $$("[required]", form);
    var tried = false;
    var sending = false;

    var check = function (field) {
      var value = field.value.trim();
      var valid = value !== "" && (field.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value));
      var error = document.getElementById(field.id + "-error");
      field.setAttribute("aria-invalid", String(!valid));
      if (error) error.hidden = valid;
      return valid;
    };

    required.forEach(function (field) {
      field.addEventListener("input", function () { if (tried) check(field); });
    });

    var say = function (html) { status.innerHTML = html; };

    var mailLink = function () {
      return '<a href="mailto:' + ANFRAGE.email + '">' + ANFRAGE.email + '</a>';
    };

    var setBusy = function (busy) {
      sending = busy;
      submit.setAttribute("aria-busy", String(busy));
      submitLabel.textContent = busy ? "Wird gesendet …" : idleLabel;
    };

    var showDone = function () {
      form.hidden = true;
      done.hidden = false;
      done.focus({ preventScroll: true });
    };

    $("[data-form-again]", done).addEventListener("click", function () {
      form.reset();
      tried = false;
      required.forEach(function (field) {
        field.removeAttribute("aria-invalid");
        var error = document.getElementById(field.id + "-error");
        if (error) error.hidden = true;
      });
      say("");
      done.hidden = true;
      form.hidden = false;
      required[0].focus();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;
      tried = true;

      var invalid = required.filter(function (field) { return !check(field); });
      if (invalid.length) {
        say("");
        invalid[0].focus();
        return;
      }

      var data = new FormData(form);
      /* Spam-Falle: ausgefüllt wird sie nur von Programmen. */
      if (data.get("botcheck")) { showDone(); return; }
      data.delete("botcheck");

      if (!direct) {
        var body = "Name: " + data.get("name") + "\n" +
          "E-Mail: " + data.get("email") + "\n" +
          (data.get("phone") ? "Telefon: " + data.get("phone") + "\n" : "") +
          "\n" + data.get("message");
        window.location.href = "mailto:" + ANFRAGE.email +
          "?subject=" + encodeURIComponent("Projektanfrage KMU Web Studio") +
          "&body=" + encodeURIComponent(body);
        say("Dein Mailprogramm sollte sich jetzt mit Deiner Nachricht öffnen. Bitte sende sie dort ab. Falls nichts passiert, schreib uns an " + mailLink() + ".");
        return;
      }

      if (ANFRAGE.accessKey) data.append("access_key", ANFRAGE.accessKey);
      data.append("subject", ANFRAGE.subject);
      data.append("from_name", "Website KMU Web Studio");
      data.append("seite", document.title);

      var controller = "AbortController" in window ? new AbortController() : null;
      var timeout = window.setTimeout(function () { if (controller) controller.abort(); }, 20000);

      setBusy(true);
      say("");

      fetch(ANFRAGE.endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
        signal: controller ? controller.signal : undefined
      })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (json) {
            if (!response.ok || json.success === false) throw new Error("Versand abgelehnt");
          });
        })
        .then(function () {
          setBusy(false);
          showDone();
        })
        .catch(function () {
          setBusy(false);
          say("Das Senden hat nicht geklappt. Deine Eingaben sind noch da – bitte versuch es nochmals oder schreib uns direkt an " + mailLink() + ".");
        })
        .then(function () { window.clearTimeout(timeout); });
    });

    return {
      prefill: function (text) {
        var message = $("textarea", form);
        if (text && !message.value.trim()) message.value = text;
      },
      focus: function () {
        if (!form.hidden) required[0].focus({ preventScroll: true });
      },
      form: form
    };
  }

  /* Formular direkt auf der Seite (Kontakt) */
  var inlineHost = $("[data-anfrage-form]");
  var inlineForm = inlineHost ? setupForm(inlineHost) : null;

  /* Anfragefenster: wird beim ersten Öffnen aufgebaut */
  var dialog = null;
  var dialogForm = null;
  var lastTrigger = null;

  function buildDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "anfrage";
    dialog.setAttribute("aria-labelledby", "anfrage-titel");
    dialog.innerHTML = '' +
      '<div class="anfrage__head">' +
        '<div>' +
          '<p class="eyebrow">Unverbindlich anfragen</p>' +
          '<h2 id="anfrage-titel" tabindex="-1">Deine Anfrage</h2>' +
        '</div>' +
        '<button class="anfrage__close" type="button" aria-label="Fenster schliessen">' + icon("close") + '</button>' +
      '</div>' +
      '<div class="anfrage__body">' +
        '<p>Erzähl uns kurz von Deinem Projekt. Wir melden uns persönlich bei Dir.</p>' +
        '<div data-anfrage-host></div>' +
      '</div>';
    document.body.appendChild(dialog);
    dialogForm = setupForm($("[data-anfrage-host]", dialog));

    $(".anfrage__close", dialog).addEventListener("click", function () { dialog.close(); });
    /* Klick auf den abgedunkelten Hintergrund schliesst das Fenster */
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    });
  }

  function openAnfrage(trigger, text) {
    /* Auf der Kontaktseite steht das Formular schon da. */
    if (inlineForm) {
      inlineForm.prefill(text);
      inlineHost.closest(".form-card").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      inlineForm.focus();
      return true;
    }
    if (typeof HTMLDialogElement === "undefined") return false;
    if (!dialog) buildDialog();
    lastTrigger = trigger || null;
    dialogForm.prefill(text);
    setMenu(false);
    dialog.showModal();
    dialog.scrollTop = 0;
    dialogForm.focus();
    return true;
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-anfrage]");
    if (!trigger) return;
    var text = trigger.hasAttribute("data-config-send") ? configSummary : "";
    if (openAnfrage(trigger, text)) event.preventDefault();
  });

  /* Direkter Aufruf über …#anfrage */
  if (window.location.hash === "#anfrage" && inlineForm) inlineForm.focus();
})();
