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

  /* ---------- Referenzen als Scroll-Szene (Startseite) ----------
     Die Bühne bleibt stehen, während man scrollt. Jede Referenz hat
     einen eigenen Scroll-Abschnitt; in ihm läuft die Seite einmal von
     oben nach unten durch Browser- und Handyrahmen. */

  var showcase = $("[data-showcase]");
  if (showcase) {
    var scItems = $$(".showcase__item", showcase);
    var scDevices = $$(".device", showcase);
    var scStage = $("[data-showcase-stage]", showcase);
    var scCue = $(".showcase__cue", showcase);
    var scLink = $("[data-showcase-link]", showcase);
    var scDomain = $("[data-showcase-domain]", showcase);
    var scCaption = $("[data-showcase-caption]", showcase);
    var scBars = scItems.map(function (item) { return $(".showcase__bar b", item); });
    var scShots = scDevices.map(function (device) {
      return $$(".view", device).map(function (view) {
        return { view: view, img: $("img", view), max: 0, current: 0, target: 0 };
      });
    });
    var scCount = scDevices.length;
    var scMode = window.matchMedia("(prefers-reduced-motion: no-preference) and (min-height: 600px)");
    var scOn = false;
    var scActive = 0;
    var scFrame = 0;
    var clamp01 = function (value) { return Math.max(0, Math.min(1, value)); };

    var scSetActive = function (index) {
      if (index === scActive) return;
      scActive = index;
      scDevices.forEach(function (device, i) { device.classList.toggle("is-active", i === index); });
      scItems.forEach(function (item, i) {
        if (i === index) item.setAttribute("aria-current", "true"); else item.removeAttribute("aria-current");
      });
      var item = scItems[index];
      scLink.href = "https://" + item.getAttribute("data-domain");
      scDomain.textContent = item.getAttribute("data-domain");
      scCaption.textContent = item.getAttribute("data-caption");
    };

    var scMeasure = function () {
      scShots.forEach(function (shots) {
        shots.forEach(function (shot) {
          shot.max = Math.max(0, shot.img.offsetHeight - shot.view.clientHeight);
        });
      });
    };

    var scPaint = function () {
      var moving = false;
      scShots.forEach(function (shots, i) {
        shots.forEach(function (shot) {
          /* Nur die sichtbare Referenz gleitet nach; die anderen springen. */
          var delta = shot.target - shot.current;
          if (i !== scActive || Math.abs(delta) < 0.5) shot.current = shot.target;
          else { shot.current += delta * 0.2; moving = true; }
          shot.img.style.transform = "translate3d(0," + (-shot.current).toFixed(1) + "px,0)";
        });
      });
      scFrame = moving ? window.requestAnimationFrame(scPaint) : 0;
    };

    var scUpdate = function () {
      if (!scOn) return;
      var rect = showcase.getBoundingClientRect();
      var viewport = window.innerHeight;
      var scrollable = Math.max(1, rect.height - viewport);
      var progress = clamp01(-rect.top / scrollable);

      /* Anflug: Die Bühne richtet sich auf, während der Abschnitt ins Bild kommt. */
      var approach = 1 - clamp01((viewport - rect.top) / viewport);
      var tilt = approach * approach;
      scStage.style.transform = tilt > 0.001
        ? "perspective(1600px) rotateX(" + (9 * tilt).toFixed(2) + "deg) rotateY(" + (-14 * tilt).toFixed(2) + "deg) scale(" + (1 - 0.1 * tilt).toFixed(3) + ")"
        : "";

      var position = progress * scCount;
      var index = Math.min(scCount - 1, Math.floor(position));
      var local = clamp01(position - index);
      scSetActive(index);
      if (scCue) scCue.classList.toggle("is-hidden", progress > 0.03);

      scBars.forEach(function (bar, i) {
        var fill = i < index ? 1 : i === index ? local : 0;
        bar.style.transform = "scaleX(" + fill.toFixed(3) + ")";
      });

      /* Kurz stehen bleiben am Anfang und am Ende jeder Referenz. */
      var travel = clamp01((local - 0.07) / 0.83);
      scShots.forEach(function (shots, i) {
        var amount = i < index ? 1 : i === index ? travel : 0;
        shots.forEach(function (shot) { shot.target = shot.max * amount; });
      });
      if (!scFrame) scFrame = window.requestAnimationFrame(scPaint);
    };

    var scEnable = function (on) {
      scOn = on;
      showcase.classList.toggle("is-scrolly", on);
      if (on) {
        scMeasure();
        scUpdate();
      } else {
        window.cancelAnimationFrame(scFrame);
        scFrame = 0;
        scStage.style.transform = "";
        scShots.forEach(function (shots) {
          shots.forEach(function (shot) { shot.current = shot.target = 0; shot.img.style.transform = ""; });
        });
        scBars.forEach(function (bar) { bar.style.transform = ""; });
      }
    };

    scItems.forEach(function (item, i) {
      item.addEventListener("click", function () {
        if (!scOn) {
          scDevices[i].scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
          return;
        }
        var rect = showcase.getBoundingClientRect();
        var scrollable = rect.height - window.innerHeight;
        window.scrollTo({ top: window.scrollY + rect.top + scrollable * ((i + 0.03) / scCount), behavior: "smooth" });
      });
    });

    window.addEventListener("scroll", scUpdate, { passive: true });
    window.addEventListener("resize", function () { if (scOn) { scMeasure(); scUpdate(); } });
    scShots.forEach(function (shots) {
      shots.forEach(function (shot) {
        shot.img.addEventListener("load", function () { if (scOn) { scMeasure(); scUpdate(); } });
      });
    });
    scMode.addEventListener("change", function () { scEnable(scMode.matches); });
    scEnable(scMode.matches);
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
