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
    /* Der Name sagt, was ein Klick tut; ein zusätzliches aria-pressed würde dem widersprechen. */
    var setVideoState = function (paused) {
      videoToggle.setAttribute("data-paused", String(paused));
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

  /* ---------- Referenzen (Startseite und Seite Referenzen) ----------
     MacBook und iPhone je Referenz.
     – Mit Maus: Maus auf eine Referenz, sie wird gross; dann scrollen,
       und ihre Seite läuft von oben nach unten durch MacBook und iPhone.
       Die Seite selbst bleibt stehen; am Ende scrollt sie weiter.
       Gewählt wird nur durch echte Mausbewegung: Schiebt das Scrollen
       eine Referenz unter den stehenden Zeiger, scrollt die Seite weiter.
     – Ohne Maus (Handy, Tablet): Jede Seite läuft beim Vorbeiscrollen
       durch. Bei «Bewegung reduzieren» bleibt sie stehen. */

  var mouseQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  var siteHeader = $(".site-header");

  $$("[data-showcase]").forEach(function (showcase) {
    var board = $("[data-showcase-stage]", showcase);
    var devices = $$(".device", board);
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

    /* ---- Gross zeigen: Zoom um einen Punkt in der Karte ----
       Liegt der Ursprung in der Karte, deckt die grosse Karte den Zeiger
       weiter ab. Der Punkt wird so gewählt, dass die grosse Karte in der
       Fläche und im sichtbaren Bereich bleibt, möglichst beim Zeiger. */
    /* Lage ohne transform, damit eine laufende Animation nicht mitzählt */
    var layoutBox = function (el) {
      var x = 0;
      var y = 0;
      for (var node = el; node; node = node.offsetParent) {
        x += node.offsetLeft;
        y += node.offsetTop;
      }
      return { left: x - window.scrollX, top: y - window.scrollY, width: el.offsetWidth, height: el.offsetHeight };
    };

    var zoom = function (card, px, py) {
      var rect = layoutBox(card.el);
      var area = board.getBoundingClientRect();
      var section = showcase.getBoundingClientRect();
      var top = Math.max((siteHeader ? siteHeader.getBoundingClientRect().bottom : 0) + 20, section.top + 20);
      var bottom = Math.min(window.innerHeight - 20, section.bottom - 20);
      var want = Math.max(rect.width * 1.14, Math.min(area.width * 0.62, 860));
      /* nie breiter als die Fläche und nie höher als der sichtbare Bereich */
      var scale = Math.max(1.04, Math.min(1.8, want / rect.width, area.width / rect.width, (bottom - top) / rect.height));
      var axis = function (start, size, low, high, pointer) {
        var room = scale - 1;
        var from = (start + scale * size - high) / room;
        var to = (start - low) / room;
        /* Passt es nicht ganz, ragt die Karte auf beiden Seiten gleich weit hinaus. */
        var origin = from <= to ? Math.max(from, Math.min(to, pointer - start)) : (from + to) / 2;
        return Math.max(0, Math.min(size, origin));
      };
      var ox = axis(rect.left, rect.width, area.left, area.right, px == null ? rect.left + rect.width / 2 : px);
      var oy = axis(rect.top, rect.height, top, bottom, py == null ? rect.top + rect.height / 2 : py);
      card.zoom = scale;
      card.el.style.transformOrigin = ox.toFixed(1) + "px " + oy.toFixed(1) + "px";
      card.el.style.setProperty("--zoom", scale.toFixed(3));
    };

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
        measure();
        if (byKey) zoom(card); else zoom(card, lastX, lastY);
        card.el.classList.add("is-live");
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
      /* Am Anfang oder am Ende der Referenz scrollt die Seite weiter.
         Die Referenz ist vergrössert: geteilt durch den Zoom läuft sie so schnell wie die Seite. */
      if (scrollCard(live, dy / (live.zoom || 1))) event.preventDefault();
    }, { passive: false });

    /* Lichtfleck folgt der Maus */
    var lightFrame = 0;
    showcase.addEventListener("pointermove", function (event) {
      if (mode !== "mouse" || reduceMotion.matches) return;
      var x = event.clientX;
      var y = event.clientY;
      if (lightFrame) return;
      lightFrame = window.requestAnimationFrame(function () {
        lightFrame = 0;
        var rect = showcase.getBoundingClientRect();
        showcase.style.setProperty("--sx", (x - rect.left).toFixed(0) + "px");
        showcase.style.setProperty("--sy", (y - rect.top).toFixed(0) + "px");
        showcase.classList.add("is-lit");
      });
    });
    showcase.addEventListener("pointerleave", function () { showcase.classList.remove("is-lit"); });

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
        /* 0, wenn die Referenz unten ganz hereingekommen ist; 1, wenn sie oben ankommt. */
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

    /* ---- Einflug: Geräte steigen gestaffelt auf, wenn sie ins Bild kommen ---- */
    if ("IntersectionObserver" in window) {
      var arrive = new IntersectionObserver(function (entries) {
        var wave = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.style.setProperty("--d", String(wave));
          wave += 1;
          el.classList.add("is-in");
          arrive.unobserve(el);
          window.setTimeout(function () { el.classList.add("is-settled"); }, 900 + wave * 90);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
      devices.forEach(function (device) { arrive.observe(device); });
    } else {
      devices.forEach(function (device) { device.classList.add("is-in", "is-settled"); });
    }

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
          device.setAttribute("aria-describedby", showcase.getAttribute("data-hint") || "");
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
  });

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

  /* ==========================================================
     Motion: Überschriften, Fortschritt, Magnet-Buttons, Hero,
     Neigung, Erklärbilder. Alles aus bei «Bewegung reduzieren»,
     Maus-Effekte nur mit Maus.
     ========================================================== */

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------- Überschriften Wort für Wort ---------- */

  var splitWords = function (heading) {
    var count = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var fragment = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(part)); return; }
            var outer = document.createElement("span");
            var inner = document.createElement("span");
            outer.className = "word";
            inner.textContent = part;
            inner.style.setProperty("--w", String(count));
            count += 1;
            outer.appendChild(inner);
            fragment.appendChild(outer);
          });
          node.replaceChild(fragment, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(heading);
    heading.classList.add("is-split");
  };

  var headings = $$(".display").filter(function (heading) {
    /* Wörter mit weichem Trennstrich (Web­auftritt) nicht zerlegen */
    return heading.textContent.indexOf("­") === -1;
  });
  headings.forEach(splitWords);

  var showHeading = function (heading) { heading.classList.add("is-shown"); };
  if ("IntersectionObserver" in window) {
    var headingWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        showHeading(entry.target);
        headingWatch.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    headings.forEach(function (heading) {
      if (heading.hasAttribute("data-intro")) {
        heading.style.setProperty("--wd", "120ms");
        window.requestAnimationFrame(function () { showHeading(heading); });
      } else {
        headingWatch.observe(heading);
      }
    });
  } else {
    headings.forEach(showHeading);
  }

  /* ---------- Scroll-Fortschritt, Hero-Tiefe ---------- */

  var bar = null;
  if (header) {
    var progressEl = document.createElement("div");
    progressEl.className = "progress";
    progressEl.setAttribute("aria-hidden", "true");
    progressEl.innerHTML = "<i></i>";
    header.appendChild(progressEl);
    bar = progressEl.firstChild;
  }

  var hero = $(".hero");
  var heroMedia = hero ? $(".hero__media", hero) : null;
  var heroCopy = hero ? $(".hero__copy", hero) : null;
  var heroTag = hero ? $(".price-tag", hero) : null;
  var scrollFrame = 0;

  var onScroll = function () {
    scrollFrame = 0;
    var y = window.scrollY;
    if (bar) {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = "scaleX(" + Math.min(1, y / max).toFixed(4) + ")";
    }
    if (hero && !reduceMotion.matches) {
      var height = hero.offsetHeight;
      var p = Math.max(0, Math.min(1, y / height));
      if (heroMedia) heroMedia.style.transform = "translate3d(0," + (p * height * 0.28).toFixed(1) + "px,0) scale(" + (1 + p * 0.08).toFixed(4) + ")";
      if (heroCopy) {
        heroCopy.style.transform = "translate3d(0," + (-p * 70).toFixed(1) + "px,0)";
        heroCopy.style.opacity = String(Math.max(0, 1 - p * 1.25).toFixed(3));
      }
      if (heroTag) heroTag.style.translate = "0 " + (-p * 120).toFixed(1) + "px";
    }
  };

  window.addEventListener("scroll", function () {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(onScroll);
  }, { passive: true });
  window.addEventListener("resize", function () {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(onScroll);
  });
  onScroll();

  /* ---------- Buttons ziehen leicht zur Maus ---------- */

  if (finePointer.matches && !reduceMotion.matches) {
    $$(".button--primary, .button--glass, .button--light, [data-magnet]").forEach(function (el) {
      var pull = el.hasAttribute("data-magnet") ? 0.3 : 0.16;
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var x = (event.clientX - rect.left - rect.width / 2) * pull;
        var y = (event.clientY - rect.top - rect.height / 2) * pull;
        el.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
      });
      el.addEventListener("pointerleave", function () { el.style.translate = ""; });
    });

    /* ---------- Karten neigen sich zur Maus, mit Glanz ---------- */
    $$("[data-tilt]").forEach(function (card) {
      var settle = 0;
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        window.clearTimeout(settle);
        card.style.transition = "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)";
        card.style.transform = "perspective(900px) rotateX(" + (-y * 8).toFixed(2) + "deg) rotateY(" + (x * 10).toFixed(2) + "deg) translateY(-6px)";
        card.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
        card.classList.add("is-tilt");
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition = "transform 700ms cubic-bezier(0.23, 1, 0.32, 1)";
        card.style.transform = "";
        card.classList.remove("is-tilt");
        settle = window.setTimeout(function () { card.style.transition = ""; }, 720);
      });
    });
  }

  /* ---------- Erklärbilder anhalten ----------
     Sie laufen länger als fünf Sekunden; ein Knopf hält sie an (WCAG 2.2.2). */

  $$("[data-motion-toggle]").forEach(function (button) {
    var scope = button.closest("section");
    var label = $("[data-motion-label]", button);
    if (!scope || !label || reduceMotion.matches) return;
    button.hidden = false;
    button.addEventListener("click", function () {
      var paused = !scope.classList.contains("is-paused");
      scope.classList.toggle("is-paused", paused);
      button.setAttribute("data-paused", String(paused));
      label.textContent = paused ? "Animationen abspielen" : "Animationen anhalten";
    });
  });

  /* ---------- Erklärbilder laufen nur, solange sie zu sehen sind ---------- */

  if ("IntersectionObserver" in window) {
    var players = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle("is-playing", entry.isIntersecting); });
    }, { threshold: 0.25 });
    $$("[data-play]").forEach(function (el) { players.observe(el); });
  }

  /* ---------- Lichtpunkt unter dem Mauszeiger ---------- */

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion.matches) {
    $$(".price-card").forEach(function (card) {
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
        '<p class="form__note">Wir verwenden Deine Angaben, um Deine Anfrage zu beantworten. Mehr dazu in der <a href="datenschutz.html#kontakt">Datenschutzerklärung</a>.</p>' +
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
