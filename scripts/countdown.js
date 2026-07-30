/* ============================================================
   BIT-BY-BIT GAME JAM — countdown.js
   Counts down to the jam launch. Occasionally "misbehaves" —
   on purpose. Time is not as stable as it looks.
   ============================================================ */

(function () {
  'use strict';

  // Monday, August 24th, 8:00 AM, El Salvador time (UTC-6), fixed offset.
  var TARGET = new Date('2026-08-24T08:00:00-06:00').getTime();

  var els = {
    days: document.getElementById('clockDays'),
    hours: document.getElementById('clockHours'),
    minutes: document.getElementById('clockMinutes'),
    seconds: document.getElementById('clockSeconds')
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // last real seconds value shown, used for the rare "rewind" tick
  var lastSecondsValue = null;
  var rewindArmed = false;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function render(days, hours, minutes, seconds) {
    els.days.textContent = pad(days);
    els.hours.textContent = pad(hours);
    els.minutes.textContent = pad(minutes);
    els.seconds.textContent = pad(seconds);
  }

  function maybeGlitchDigit(el) {
    if (reduceMotion) return;
    // ~1 in 220 ticks: flash a wrong value on one digit for a single frame
    if (Math.random() < 1 / 220) {
      var original = el.textContent;
      var fake = pad(Math.floor(Math.random() * 60));
      el.textContent = fake;
      el.classList.add('is-glitching');
      window.setTimeout(function () {
        el.textContent = original;
        el.classList.remove('is-glitching');
      }, 140);
    }
  }

  function tick() {
    var now = Date.now();
    var diff = TARGET - now;

    if (diff <= 0) {
      render(0, 0, 0, 0);
      document.dispatchEvent(new CustomEvent('countdown:complete'));
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    // rare rewind: seconds digit counts backward for one tick, then corrects.
    // easy to dismiss as a bug. that's the point.
    if (!reduceMotion && !rewindArmed && lastSecondsValue !== null && Math.random() < 1 / 400) {
      rewindArmed = true;
      var rewound = (lastSecondsValue + 1) % 60;
      render(days, hours, minutes, rewound);
      els.seconds.classList.add('is-glitching');
      window.setTimeout(function () {
        els.seconds.classList.remove('is-glitching');
        rewindArmed = false;
      }, 140);
    } else {
      render(days, hours, minutes, seconds);
    }

    lastSecondsValue = seconds;

    maybeGlitchDigit(els.hours);
    maybeGlitchDigit(els.minutes);
  }

  tick();
  window.setInterval(tick, 1000);
})();