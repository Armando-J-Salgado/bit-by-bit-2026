/* ============================================================
   BIT-BY-BIT GAME JAM — clues.js
   Extensible clue/easter-egg registry.

   HOW TO ADD A NEW CLUE LATER:
   Push a new object into CLUES with a unique id, a trigger()
   function that wires up its own listener, and (optionally)
   call reveal() to show new lore text. No other file needs
   to change.
   ============================================================ */

(function () {
  'use strict';

  var monitor = document.querySelector('.monitor');
  var tagline = document.getElementById('tagline');
  var camLabel = document.getElementById('camLabel');
  var systemId = document.getElementById('systemId');
  var staticFlash = document.getElementById('staticFlash');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- shared effects, reusable by any clue ---------- */

  function flashStatic() {
    if (reduceMotion) return;
    staticFlash.classList.remove('is-flashing');
    // force reflow so the animation can restart if triggered again quickly
    void staticFlash.offsetWidth;
    staticFlash.classList.add('is-flashing');
    document.dispatchEvent(new CustomEvent('clue:staticBurst'));
  }

  function shudder() {
    if (reduceMotion) return;
    monitor.classList.remove('is-shuddering');
    void monitor.offsetWidth;
    monitor.classList.add('is-shuddering');
  }

  function revealLine(text, holdMs) {
    var prev = tagline.textContent;
    tagline.classList.add('is-flickering');
    tagline.textContent = text;
    window.setTimeout(function () {
      tagline.classList.remove('is-flickering');
    }, 260);
    if (holdMs) {
      window.setTimeout(function () {
        tagline.textContent = prev;
      }, holdMs);
    }
  }

  /* ---------- clue registry ---------- */

  var CLUES = [

    // 1. console message — first thing anyone who opens devtools sees
    {
      id: 'console-boot',
      trigger: function () {
        var style1 = 'color:#ffb000;font-family:monospace;font-size:12px;';
        var style2 = 'color:#6f6656;font-family:monospace;font-size:11px;';
        console.log('%cSYSTEM BOOT // CAM NETWORK', style1);
        console.log('%cframe count desynced. drift detected since last cycle.', style2);
        console.log('%cif you are reading this before 08.24 — you are early. or late.', style2);
      }
    },

    // 2. konami-style key sequence -> bigger reveal
    {
      id: 'key-sequence',
      trigger: function () {
        var sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        var progress = 0;
        document.addEventListener('keydown', function (e) {
          if (e.key === sequence[progress]) {
            progress++;
            if (progress === sequence.length) {
              progress = 0;
              shudder();
              flashStatic();
              revealLine('SUBJECT LOG 003 — DO NOT REWIND', 3200);
            }
          } else {
            progress = (e.key === sequence[0]) ? 1 : 0;
          }
        });
      }
    },

    // 3. idle / tab-return trigger
    {
      id: 'idle-return',
      trigger: function () {
        var awayAt = null;
        var IDLE_THRESHOLD_MS = 15000;

        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            awayAt = Date.now();
          } else if (awayAt) {
            var away = Date.now() - awayAt;
            if (away > IDLE_THRESHOLD_MS) {
              flashStatic();
              revealLine('BIENVENIDO DE NUEVO', 2200);
              systemId.textContent = 'SYS//0x00 · GAP LOGGED (' + Math.round(away / 1000) + 's)';
              window.setTimeout(function () {
                systemId.textContent = 'SYS//0x00 · AWAITING SYNC';
              }, 4000);
            }
            awayAt = null;
          }
        });
      }
    },

    // 4. cam label click/hover -> swaps to a higher, unexplained camera number
    {
      id: 'cam-swap',
      trigger: function () {
        var real = camLabel.textContent;
        var swapped = false;

        function swap() {
          if (swapped) return;
          swapped = true;
          camLabel.textContent = 'CAM\u00A013';
          camLabel.classList.add('is-swapped');
          window.setTimeout(function () {
            camLabel.textContent = real;
            camLabel.classList.remove('is-swapped');
            swapped = false;
          }, 900);
        }

        camLabel.addEventListener('click', swap);
        camLabel.addEventListener('mouseenter', function () {
          if (Math.random() < 0.15) swap();
        });
      }
    },

    // 5. tab title flicker while unfocused
    {
      id: 'title-flicker',
      trigger: function () {
        var realTitle = document.title;
        var alt = 'signal lost //';
        var flickering = false;

        window.addEventListener('blur', function () {
          if (flickering) return;
          flickering = true;
          var swaps = 0;
          var interval = window.setInterval(function () {
            document.title = (swaps % 2 === 0) ? alt : realTitle;
            swaps++;
            if (swaps > 4) {
              window.clearInterval(interval);
              document.title = realTitle;
              flickering = false;
            }
          }, 900);
        });

        window.addEventListener('focus', function () {
          document.title = realTitle;
        });
      }
    },

    // 6. rare ambient static burst, fully passive, no interaction required
    {
      id: 'ambient-static',
      trigger: function () {
        function scheduleNext() {
          var delay = 20000 + Math.random() * 70000; // 20s - 90s
          window.setTimeout(function () {
            flashStatic();
            scheduleNext();
          }, delay);
        }
      }
    },

    // 7. section header scramble on hover
    {
      id: 'section-scramble',
      trigger: function () {
        var headers = document.querySelectorAll('.section-title');
        var glyphs = '0123456789ABCDEF#%@&!';

        headers.forEach(function (h) {
          var original = h.textContent;
          var scrambling = false;

          h.addEventListener('mouseenter', function () {
            if (scrambling || Math.random() > 0.4) return;
            scrambling = true;
            var ticks = 0;
            var interval = window.setInterval(function () {
              var scrambled = original.split('').map(function (ch) {
                if (ch === ' ' || ch === '//' || ch === ':') return ch;
                return glyphs[Math.floor(Math.random() * glyphs.length)];
              }).join('');
              h.textContent = scrambled;
              h.classList.add('is-glitching');
              ticks++;
              if (ticks > 5) {
                window.clearInterval(interval);
                h.textContent = original;
                h.classList.remove('is-glitching');
                scrambling = false;
              }
            }, 60);
          });
        });
      }
    },

    // 8. inscription button static burst on hover
    {
      id: 'inscription-hover',
      trigger: function () {
        var btn = document.getElementById('inscriptionBtn');
        if (!btn) return;
        btn.addEventListener('mouseenter', function () {
          if (Math.random() < 0.35) {
            flashStatic();
          }
        });
      }
    }
  ];

  CLUES.forEach(function (clue) {
    clue.trigger();
  });

})();