/* ==========================================================================
   xzt / WEB LAB — 交互脚本
   功能：类型筛选、关键词搜索、排序、预览弹窗
   ========================================================================== */

/* --------------------------------------------------------------------------
   作品链接配置
   填写后，卡片图片与标题会变成新标签页打开的真实链接；
   留空或地址无效时，点击改为弹出截图预览。
   -------------------------------------------------------------------------- */
var LINKS = {
  recipe: 'https://xztweb2412190321.vercel.app/',
  quiz: 'https://web2-1-umber.vercel.app/',
  register: 'https://web2-2-zeta.vercel.app/'
};

/* 截图预览信息 */
var SHOTS = {
  recipe: {
    title: 'Recipe Finder',
    src: 'image/caipu.png',
    alt: 'Recipe Finder 菜谱搜索页面的完整截图'
  },
  quiz: {
    title: 'Quiz Game',
    src: 'image/quiz-game.png',
    alt: 'Quiz Game 趣味问答页面的完整截图'
  },
  register: {
    title: 'Register',
    src: 'image/register.png',
    alt: 'Register 注册表单页面的完整截图'
  }
};

(function () {
  'use strict';

  var grid = document.querySelector('.cards');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var searchInput = document.querySelector('#q');
  var sortSelect = document.querySelector('#sort');
  var emptyMsg = document.querySelector('#empty');
  var countMsg = document.querySelector('#count');
  var viewer = document.querySelector('#viewer');
  var viewerTitle = document.querySelector('#viewer-title');
  var viewerImg = document.querySelector('#viewer-img');

  var activeFilter = 'all';
  var originalOrder = cards.slice();

  /* 极少数环境（如 file:// 下被严格限制）会拿不到 console，兜一层避免报错 */
  function warn(message) {
    if (typeof console !== 'undefined' && console.warn) console.warn(message);
  }

  /* ---------------- 筛选 / 搜索 / 排序 ---------------- */

  function matchesKeyword(card, keyword) {
    if (!keyword) return true;
    var needle = keyword.toLocaleLowerCase();
    var haystack = (card.dataset.key || '') + ' ' +
      (card.querySelector('.card-title') || {}).textContent;
    return haystack.toLocaleLowerCase().indexOf(needle) !== -1;
  }

  function render() {
    var keyword = searchInput.value.trim();
    var shown = 0;

    cards.forEach(function (card) {
      var okFilter = activeFilter === 'all' || card.dataset.cat === activeFilter;
      var okKeyword = matchesKeyword(card, keyword);
      var visible = okFilter && okKeyword;
      card.hidden = !visible;
      if (visible) shown++;
    });

    emptyMsg.hidden = shown > 0;
    countMsg.textContent = '正在显示 ' + shown + ' / ' + cards.length + ' 件作品';
  }

  function reorder(mode) {
    var sorted = originalOrder.slice();
    if (mode === 'az') {
      sorted.sort(function (a, b) { return titleOf(a).localeCompare(titleOf(b), 'en'); });
    } else if (mode === 'za') {
      sorted.sort(function (a, b) { return titleOf(b).localeCompare(titleOf(a), 'en'); });
    }
    sorted.forEach(function (card) { grid.appendChild(card); });
  }

  function titleOf(card) {
    var el = card.querySelector('.card-title');
    return el ? el.textContent.trim() : '';
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeFilter = chip.dataset.filter;
      chips.forEach(function (other) {
        var on = other === chip;
        other.classList.toggle('is-on', on);
        other.setAttribute('aria-pressed', String(on));
      });
      render();
    });
  });

  searchInput.addEventListener('input', render);

  sortSelect.addEventListener('change', function () {
    reorder(sortSelect.value);
    render();
  });

  /* ---------------- 跳转链接 / 预览弹窗 ---------------- */

  function safeUrl(id) {
    var raw = (LINKS[id] || '').trim();
    if (!raw) return null;
    try {
      var url = new URL(raw, document.baseURI);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
      return url.href;
    } catch (err) {
      warn('作品 ' + id + ' 的链接无效，改用截图预览。');
      return null;
    }
  }

  function toLink(button, url, label) {
    var link = document.createElement('a');
    link.className = button.className;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', label + '（在新标签页打开）');
    /* 迁移封面内部的图片与提示条 */
    var childCount = button.children.length;
    for (var i = 0; i < childCount; i++) {
      link.appendChild(button.children[0]);
    }
    var veil = link.querySelector('.shot-veil');
    if (veil) veil.textContent = '打开作品 ↗';
    button.replaceWith(link);
  }

  function openPreview(id) {
    var shot = SHOTS[id];
    if (!shot) return;
    viewerTitle.textContent = shot.title;
    viewerImg.src = shot.src;
    viewerImg.alt = shot.alt;
    if (typeof viewer.showModal !== 'function') return; // 极老的浏览器没有 <dialog>
    viewer.showModal();
    viewer.scrollTop = 0;
  }

  document.querySelectorAll('[data-open]').forEach(function (el) {
    var id = el.dataset.open;
    var url = safeUrl(id);

    /* 封面：有链接就变成新标签页链接，没有就弹出截图预览 */
    if (url && el.classList.contains('shot')) {
      toLink(el, url, '访问 ' + SHOTS[id].title);
      return;
    }
    /* 标题与「预览」按钮始终打开弹窗，保持一种可预期的行为 */
    el.addEventListener('click', function () { openPreview(id); });
  });

  document.querySelector('#viewer-close').addEventListener('click', function () {
    viewer.close();
  });

  viewer.addEventListener('click', function (event) {
    var rect = viewer.getBoundingClientRect();
    var outside = event.clientX < rect.left || event.clientX > rect.right ||
                  event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) viewer.close();
  });

  render();
}());
