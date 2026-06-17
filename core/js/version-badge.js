/**
 * v1.1 · Badge de versión visible — Mypersonalweb
 *
 * Carga core/version.json e inyecta un badge fijo en la esquina inferior
 * izquierda con la versión actual + enlace al changelog. Sirve para saber
 * de un vistazo qué versión se está mirando.
 *
 * USO: <script src="core/js/version-badge.js" defer></script>
 */
(function () {
  'use strict';

  function detectBasePath() {
    var meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.getAttribute('content')) {
      var b = meta.getAttribute('content').replace(/\/$/, '');
      return b + '/core/version.json';
    }
    var path = location.pathname;
    var depth = (path.match(/\//g) || []).length - 1;
    if (path.endsWith('/') || depth <= 1) return 'core/version.json';
    if (depth === 2) return '../core/version.json';
    return '../../core/version.json';
  }

  function fmtFechaCorta(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    var meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
  }

  function injectBadge(info) {
    if (document.body.hasAttribute('data-version-hide')) return;
    if (document.getElementById('mw-version-badge')) return;

    var seen = (function () {
      try { return localStorage.getItem('mw_last_seen_version'); }
      catch (e) { return null; }
    })();
    var isNew = seen !== info.version;

    var style = document.createElement('style');
    style.textContent = ''
      + '#mw-version-badge{position:fixed;bottom:14px;left:14px;z-index:9998;'
      +   'display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;'
      +   'background:rgba(15,20,35,.85);backdrop-filter:blur(8px);'
      +   'border:1px solid rgba(255,255,255,.12);color:#e8efe9;'
      +   'font:600 11px/1.2 \'JetBrains Mono\',ui-monospace,monospace;'
      +   'text-decoration:none;letter-spacing:.5px;text-transform:uppercase;'
      +   'transition:all 200ms ease;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}'
      + '#mw-version-badge:hover{transform:translateY(-2px);border-color:#c9a84c;color:#c9a84c;box-shadow:0 0 16px rgba(201,168,76,.25)}'
      + '#mw-version-badge .mw-vb-dot{width:7px;height:7px;border-radius:50%;background:#c9a84c;box-shadow:0 0 6px #c9a84c}'
      + '#mw-version-badge.is-new .mw-vb-dot{animation:mw-vb-pulse 1.6s ease-in-out infinite}'
      + '#mw-version-badge.is-new{border-color:#c9a84c;color:#c9a84c}'
      + '#mw-version-badge .mw-vb-date{opacity:.65;font-weight:400;text-transform:none;letter-spacing:.2px}'
      + '@keyframes mw-vb-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}'
      + '@media print{#mw-version-badge{display:none!important}}'
      + '@media(max-width:480px){#mw-version-badge{font-size:10px;padding:5px 10px;bottom:10px;left:10px}}';
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.id = 'mw-version-badge';
    if (isNew) a.classList.add('is-new');
    a.href = info.changelog_url || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    var title = info.tag + ' · ' + (info.title || '') + '\n\nÚltimos cambios:\n' +
      (info.highlights || []).map(function(h){ return '· ' + h; }).join('\n');
    a.title = title;
    a.setAttribute('aria-label', 'Versión ' + info.tag + ' · ' + (info.title || ''));
    a.innerHTML = '<span class="mw-vb-dot"></span>' +
      '<span>' + (info.tag || ('v' + info.version)) + '</span>' +
      '<span class="mw-vb-date">· ' + fmtFechaCorta(info.date) + '</span>';
    a.addEventListener('click', function () {
      try { localStorage.setItem('mw_last_seen_version', info.version); } catch (e) {}
      a.classList.remove('is-new');
    });
    document.body.appendChild(a);
  }

  function load() {
    var url = detectBasePath();
    fetch(url, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (info) {
        if (!info || !info.version) return;
        window.mwVersion = info;
        injectBadge(info);
      })
      .catch(function () { /* silencioso */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
