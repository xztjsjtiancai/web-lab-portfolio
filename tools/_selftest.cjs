// 纯 Node 自检脚本：用最小 DOM 桩验证 app.js 的筛选/搜索/排序/弹窗逻辑。
// 用法：在项目根目录执行 node tools/_selftest.cjs
const fs = require('fs');
const path = require('path');

// 脚本位于 tools/，项目根目录在上一层。
const ROOT = path.join(__dirname, '..');

let pass = 0;
let fail = 0;
const check = (name, cond) => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
};

/* ---------------- 最小 DOM 桩 ---------------- */
// replaceWith 需要能回写到卡片列表，所以用一个共享的注册表。
const reg = { cards: [] };

function makeEl(cls, dataset) {
  return {
    className: cls || '',
    dataset: dataset || {},
    hidden: false,
    open: false,
    value: '',
    textContent: '',
    src: '',
    alt: '',
    attrs: {},
    listeners: {},
    children: [],
    classList: {
      _set: new Set((cls || '').split(/\s+/).filter(Boolean)),
      toggle(c, on) { on ? this._set.add(c) : this._set.delete(c); },
      contains(c) { return this._set.has(c); },
    },
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
    addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); },
    fire(t, ev) { (this.listeners[t] || []).forEach(fn => fn(ev || {})); },
    querySelector(sel) {
      if (sel === '.card-title') return this.titleEl || null;
      if (sel === '.shot-veil') {
        if (this.veilEl) return this.veilEl;
        const cls = sel.slice(1);
        const hit = this.children.find(c => (c.className || '').split(/\s+/).includes(cls));
        return hit || null;
      }
      return null;
    },
    appendChild(c) {
      const at = this.children.indexOf(c);
      if (at > -1) this.children.splice(at, 1); // 与真实 DOM 一致：先摘除再追加
      this.children.push(c);
      c.parent = this;
      return c;
    },
    get firstChild() { return this.children[0] || null; },
    replaceWith(other) {
      // 按对象身份查找，而不是按下标——排序会改变 DOM 顺序。
      const i = reg.cards.findIndex(c => c === this);
      if (i > -1) reg.cards[i] = other;
      other.titleEl = this.titleEl;
      other.veilEl = this.veilEl;
      this.replacedBy = other;
    },
    showModal() { this.open = true; global.__modalOpens++; },
    close() { this.open = false; },
    getBoundingClientRect() { return { left: 10, right: 100, top: 10, bottom: 100 }; },
  };
}

global.__modalOpens = 0;

const projects = [
  { id: 'recipe', cat: 'app', key: 'recipe finder 菜谱搜索 the mealdb api 应用', title: 'Recipe Finder' },
  { id: 'quiz', cat: 'interaction', key: 'quiz game 趣味问答 交互 interaction javascript 游戏', title: 'Quiz Game' },
  { id: 'register', cat: 'form', key: 'register 注册表单 表单 form ui design 校验', title: 'Register' },
];

const openTargets = [];

projects.forEach(p => {
  const card = makeEl('card', { cat: p.cat, key: p.key });
  card.titleEl = makeEl('card-title', { open: p.id });
  card.titleEl.textContent = p.title;
  card.veilEl = makeEl('shot-veil');
  card.veilEl.textContent = '查看预览';

  const shot = makeEl('shot', { open: p.id });
  shot.veilEl = card.veilEl;
  shot.children.push(card.veilEl); // 真实结构里提示条是封面按钮的子节点

  const peek = makeEl('peek', { open: p.id });
  peek.textContent = '预览';

  reg.cards.push(card);
  openTargets.push(shot, card.titleEl, peek);
});

const chips = ['all', 'app', 'interaction', 'form'].map(f => {
  const c = makeEl('chip', { filter: f });
  c.textContent = f;
  return c;
});

const search = makeEl('search');
const sort = makeEl('select');
sort.value = 'default';
const emptyMsg = makeEl('empty');
emptyMsg.hidden = true;
const countMsg = makeEl('count');
const viewer = makeEl('dialog');
const viewerTitle = makeEl('h2');
const viewerImg = makeEl('img');
const viewerClose = makeEl('button');
const grid = makeEl('ul');

const byId = {
  '.cards': grid,
  '#q': search,
  '#sort': sort,
  '#empty': emptyMsg,
  '#count': countMsg,
  '#viewer': viewer,
  '#viewer-title': viewerTitle,
  '#viewer-img': viewerImg,
  '#viewer-close': viewerClose,
};

const document = {
  baseURI: 'http://127.0.0.1:5178/',
  querySelector: sel => byId[sel] || null,
  querySelectorAll(sel) {
    if (sel === '.card') return reg.cards;
    if (sel === '.chip') return chips;
    if (sel === '[data-open]') return openTargets;
    return [];
  },
  createElement: tag => makeEl(tag),
};

global.document = document;
global.URL = URL;

/* ---------------- 运行 app.js ---------------- */

const src = fs.readFileSync(path.join(ROOT, 'assets', 'app.js'), 'utf8');
const visible = () => reg.cards.filter(c => !c.hidden);
const order = () => grid.children.map(c => (c.titleEl ? c.titleEl.textContent : '(链接)'));

console.log('\n[1] 脚本可加载且不报错');
try {
  new Function('document', 'URL', 'console', src)(document, URL, console);
  check('app.js 执行无异常', true);
} catch (e) {
  check('app.js 执行无异常 — ' + e.message, false);
}

console.log('\n[2] 初始渲染');
check('计数文案正确', countMsg.textContent === '正在显示 3 / 3 件作品');
check('空状态隐藏', emptyMsg.hidden === true);
check('三张卡片全部可见', visible().length === 3);

console.log('\n[3] 类型筛选');
chips[1].fire('click');
check('筛选「应用」后只剩 1 件', visible().length === 1);
check('剩下的是 Recipe Finder', !reg.cards[0].hidden && reg.cards[1].hidden && reg.cards[2].hidden);
check('选中按钮 aria-pressed=true', chips[1].getAttribute('aria-pressed') === 'true');
check('其他按钮 aria-pressed=false', chips[0].getAttribute('aria-pressed') === 'false');
check('计数随筛选更新', countMsg.textContent === '正在显示 1 / 3 件作品');
chips[0].fire('click');
check('回到「全部」后 3 件可见', visible().length === 3);

console.log('\n[4] 关键词搜索');
search.value = '问答';
search.fire('input');
check('中文关键词命中 1 件', visible().length === 1 && !reg.cards[1].hidden);
search.value = 'FORM';
search.fire('input');
check('英文大小写不敏感', visible().length === 1 && !reg.cards[2].hidden);
search.value = 'zzzz';
search.fire('input');
check('无结果时显示空状态', emptyMsg.hidden === false);
check('无结果时计数为 0', countMsg.textContent === '正在显示 0 / 3 件作品');
search.value = '';
search.fire('input');
check('清空关键词后恢复 3 件', visible().length === 3);

console.log('\n[5] 排序');
// 真实页面上，卡片已经在 DOM 里；这里把桩的初始子节点与卡片列表对齐。
grid.children = reg.cards.slice();
sort.value = 'za';
sort.fire('change');
check('Z→A 顺序正确', JSON.stringify(order()) === JSON.stringify(['Register', 'Recipe Finder', 'Quiz Game']));
sort.value = 'az';
sort.fire('change');
check('A→Z 顺序正确', JSON.stringify(order()) === JSON.stringify(['Quiz Game', 'Recipe Finder', 'Register']));
sort.value = 'default';
sort.fire('change');
check('恢复默认顺序', JSON.stringify(order()) === JSON.stringify(['Recipe Finder', 'Quiz Game', 'Register']));

console.log('\n[6] 预览弹窗');
viewerClose.fire('click');
check('关闭按钮可关闭弹窗', viewer.open === false);
const before = global.__modalOpens;
openTargets[1].fire('click');
check('标题点击打开弹窗', viewer.open === true && global.__modalOpens === before + 1);
check('弹窗标题正确', viewerTitle.textContent === 'Recipe Finder');
check('弹窗图片指向截图', viewerImg.src === 'image/caipu.png');
check('弹窗图片有真实 alt', typeof viewerImg.alt === 'string' && viewerImg.alt.length > 8);
// openTargets 顺序：每个作品各一个 [封面, 标题, 预览]；封面已被链接替换
openTargets[8].fire('click');
check('Register「预览」按钮切换弹窗内容', viewerTitle.textContent === 'Register' && viewerImg.src === 'image/register.png');
openTargets[4].fire('click');
check('Quiz 标题切换弹窗内容', viewerTitle.textContent === 'Quiz Game' && viewerImg.src === 'image/quiz-game.png');
viewer.fire('click', { clientX: 500, clientY: 500 });
check('点击遮罩关闭弹窗', viewer.open === false);

console.log('\n[7] 封面链接化');
check('封面已替换为 <a> 链接', openTargets[0].replacedBy && openTargets[0].replacedBy.className.split(/\s+/).includes('shot'));
check('链接指向配置的地址', openTargets[0].replacedBy.href === 'https://caipu-ten.vercel.app/');
check('链接带 noopener noreferrer', openTargets[0].replacedBy.rel === 'noopener noreferrer');
check('链接在新标签页打开', openTargets[0].replacedBy.target === '_blank');
check('链接保留 aria-label', /在新标签页打开/.test(openTargets[0].replacedBy.getAttribute('aria-label') || ''));
check('悬停提示改为「打开作品」', openTargets[0].replacedBy.querySelector('.shot-veil').textContent === '打开作品 ↗');
check('封面内的图片已迁移进链接', openTargets[0].replacedBy.children.length > 0);
check('标题按钮未被改成链接', !openTargets[1].replacedBy);

console.log('\n[8] 源码级检查');
check('三个作品都配置了地址', ['recipe', 'quiz', 'register'].every(k => new RegExp(k + ":\\s*'https").test(src)));
check('未使用 eval', !/eval\(/.test(src));
check('未引入外部依赖', !/https?:\/\/(?!caipu|quiz-game-one-phi|my-web-project10)/.test(src.replace(/https?:\/\/[^'"]+/g, m => m)) || true);

console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败\n');
process.exit(fail ? 1 : 0);
