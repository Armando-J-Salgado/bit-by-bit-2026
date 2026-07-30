/* ============================================================
   BIT-BY-BIT GAME JAM — audio.js
   Default-on ambient loop + static-burst stinger.
   Browsers block autoplay-with-sound until the visitor has
   interacted with the page at least once, so we attempt to
   play immediately, and if blocked, start on the first click
   or keypress anywhere on the page.
   ============================================================ */

(function () {
    'use strict';

    var toggle = document.getElementById('audioToggle');
    var ambient = document.getElementById('ambientAudio');
    var staticBurst = document.getElementById('staticBurst');
    var enabled = true;

    ambient.volume = 0.35;
    staticBurst.volume = 0.5;

    // reflect the default "on" state in the button right away
    toggle.setAttribute('aria-pressed', 'true');
    toggle.querySelector('.audio-toggle__text').textContent = 'MUTE';

    // try to autoplay; most browsers will block this until first interaction
    ambient.play().catch(function () {
        function startOnInteraction() {
            if (enabled) {
                ambient.play().catch(function () {});
            }
        }
        // capture: true fires this before the toggle button's own click
        // handler, so the very first click anywhere (including the button)
        // unlocks playback first; { once: true } cleans itself up
        document.addEventListener('click', startOnInteraction, { capture: true, once: true });
        document.addEventListener('keydown', startOnInteraction, { capture: true, once: true });
    });

    toggle.addEventListener('click', function () {
        enabled = !enabled;
        toggle.setAttribute('aria-pressed', String(enabled));
        toggle.querySelector('.audio-toggle__text').textContent = enabled ? 'MUTE' : 'AUDIO';

        if (enabled) {
            ambient.play().catch(function () {});
        } else {
            ambient.pause();
        }
    });

    // any static-burst clue effect also plays the stinger, but only if audio is enabled
    document.addEventListener('clue:staticBurst', function () {
        if (!enabled) return;
        staticBurst.currentTime = 0;
        staticBurst.play().catch(function () {});
    });

})();