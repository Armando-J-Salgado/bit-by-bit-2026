/* ============================================================
   BIT-BY-BIT GAME JAM — data-loader.js
   Dynamically loads rules, dates, prizes, instructions, and
   inscription links from public/jam-data.json with CRT aesthetics.
   ============================================================ */

(function () {
  'use strict';

  var DATA_URL = 'public/jam-data.json';

  var els = {
    inscriptionBtn: document.getElementById('inscriptionBtn'),
    datesList: document.getElementById('datesList'),
    rulesList: document.getElementById('rulesList'),
    instructionsList: document.getElementById('instructionsList'),
    prizesGrid: document.getElementById('prizesGrid')
  };

  function renderInscription(url, label) {
    if (!els.inscriptionBtn) return;
    els.inscriptionBtn.href = url || '#';
    if (label) {
      var labelSpan = els.inscriptionBtn.querySelector('.inscription-btn__text');
      if (labelSpan) {
        labelSpan.textContent = label;
      } else {
        els.inscriptionBtn.textContent = label;
      }
    }
  }

  function renderDates(dates) {
    if (!els.datesList || !Array.isArray(dates)) return;
    els.datesList.innerHTML = '';

    dates.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'date-card';
      card.setAttribute('data-id', item.id || '');

      card.innerHTML =
        '<div class="date-card__header">' +
          '<span class="date-card__stage">' + escapeHtml(item.stage) + '</span>' +
          '<span class="date-card__status badge--' + (item.status || 'pending').toLowerCase() + '">' + escapeHtml(item.status || 'PENDING') + '</span>' +
        '</div>' +
        '<div class="date-card__time">' + escapeHtml(item.date) + '</div>' +
        (item.note ? '<div class="date-card__note">// ' + escapeHtml(item.note) + '</div>' : '');

      els.datesList.appendChild(card);
    });
  }

  function renderRules(rules) {
    if (!els.rulesList || !Array.isArray(rules)) return;
    els.rulesList.innerHTML = '';

    rules.forEach(function (ruleText, idx) {
      var li = document.createElement('li');
      li.className = 'rule-item';
      li.innerHTML = '<span class="rule-item__prefix">&gt;</span> <span class="rule-item__text">' + escapeHtml(ruleText) + '</span>';
      els.rulesList.appendChild(li);
    });
  }

  function renderInstructions(instructions) {
    if (!els.instructionsList || !Array.isArray(instructions)) return;
    els.instructionsList.innerHTML = '';

    instructions.forEach(function (text) {
      var li = document.createElement('li');
      li.className = 'instruction-item';
      li.innerHTML = '<span class="instruction-item__icon">⚡</span> <span class="instruction-item__text">' + escapeHtml(text) + '</span>';
      els.instructionsList.appendChild(li);
    });
  }

  function renderPrizes(prizes) {
    if (!els.prizesGrid || !Array.isArray(prizes)) return;
    els.prizesGrid.innerHTML = '';

    prizes.forEach(function (prize) {
      var card = document.createElement('div');
      card.className = 'prize-card prize-card--rank-' + (prize.rank || '01');

      card.innerHTML =
        '<div class="prize-card__badge">' + escapeHtml(prize.badge || ('RANK ' + prize.rank)) + '</div>' +
        '<h3 class="prize-card__title">' + escapeHtml(prize.title) + '</h3>' +
        '<div class="prize-card__reward">' + escapeHtml(prize.reward) + '</div>' +
        '<p class="prize-card__desc">' + escapeHtml(prize.description) + '</p>';

      els.prizesGrid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function applyFlickerEffect() {
    var monitor = document.querySelector('.monitor');
    if (monitor) {
      monitor.classList.add('is-loading-data');
      window.setTimeout(function () {
        monitor.classList.remove('is-loading-data');
      }, 350);
    }
  }

  function loadJamData() {
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Signal degraded: HTTP ' + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        renderInscription(data.inscriptionUrl, data.inscriptionLabel);
        renderDates(data.dates);
        renderRules(data.rules);
        renderInstructions(data.instructions);
        renderPrizes(data.prizes);
        applyFlickerEffect();
      })
      .catch(function (err) {
        console.warn('[SYSTEM WARN] Unable to sync jam-data.json:', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadJamData);
  } else {
    loadJamData();
  }
})();
