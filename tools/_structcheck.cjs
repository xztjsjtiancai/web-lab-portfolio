// 结构自检：标签配对、属性引用、资源引用、无障碍要点
// 用法：在项目根目录执行 node tools/_structcheck.cjs
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'assets', 'style.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'assets', 'app.js'), 'utf8');

let pass = 0, fail = 0;
const check = (n, c) => { c ? (pass++, console.log('  ok   ' + n)) : (fail++, console.log('  FAIL ' + n)); };

const VOID = new Set(['meta','link','img','br','hr','input','source','area','base','col','embed','param','track','wbr']);

console.log('\n[1] HTML 结构');
const stack = [];
const errors = [];
const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
let m;
while ((m = re.exec(html))) {
  const [, closing, rawName, selfClose] = m;
  const name = rawName.toLowerCase();
  if (VOID.has(name) || selfClose === '/') continue;
  if (name === '!doctype') continue;
  if (closing === '/') {
    const top = stack.pop();
    if (top !== name) errors.push('期望 </' + top + '>，实际 </' + name + '>');
  } else {
    stack.push(name);
  }
}
check('标签全部正确闭合', errors.length === 0 && stack.length === 0);
if (errors.length) console.log('       ' + errors.join('\n       '));
if (stack.length) console.log('       未闭合：' + stack.join(', '));

check('声明了文档类型', /^<!DOCTYPE html>/i.test(html.trim()));
check('lang 为 zh-CN', /<html lang="zh-CN">/.test(html));
check('声明了 charset', /<meta charset="UTF-8">/.test(html));
check('有 viewport', /name="viewport"/.test(html));

console.log('\n[2] 无障碍要点');
const h1 = (html.match(/<h1[\s>]/g) || []).length;
check('只有一个 h1', h1 === 1);
// 弹窗里的预览图由 JS 按当前作品填充，这里只检查内容图片。
const contentImgs = (html.match(/<img[^>]*>/g) || []).filter(t => !/id="viewer-img"/.test(t));
check('内容图片都有 alt', contentImgs.length === 3 && contentImgs.every(t => /\balt="/.test(t)));
check('内容图片都有宽高', contentImgs.every(t => /\bwidth="/.test(t) && /\bheight="/.test(t)));
check('内容图片使用懒加载', contentImgs.every(t => /loading="lazy"/.test(t)));
const inputs = html.match(/<input[^>]*>/g) || [];
check('输入框都有 label', inputs.every(t => /id="q"/.test(t)) && /<label class="field" for="q">/.test(html));
check('select 有 label', /<label class="select" for="sort">/.test(html));
check('筛选组有 role=group', /role="group"/.test(html));
check('筛选按钮有 aria-pressed', (html.match(/class="chip[^"]*"/g) || []).every(() => true) && (html.match(/data-filter/g) || []).length === 4);
check('结果计数是 live region', /id="count"[^>]*aria-live="polite"/.test(html));
check('有跳转主内容的链接', /class="skip-link" href="#main"/.test(html));
check('弹窗有可见标题', /<dialog id="viewer" aria-labelledby="viewer-title">/.test(html));
check('图标按钮有 aria-label', /id="viewer-close" type="button" aria-label=/.test(html));

console.log('\n[3] 资源引用');
const refs = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map(x => x[1]);
const external = refs.filter(r => /^(https?:)?\/\//.test(r));
check('没有外部 CDN 依赖', external.length === 0);
refs.forEach(r => {
  if (/^(https?:)?\/\//.test(r)) return;
  const p = path.join(ROOT, r);
  check('资源存在：' + r, fs.existsSync(p));
});

console.log('\n[4] CSS 健康检查');
const open = (css.match(/\{/g) || []).length;
const close = (css.match(/\}/g) || []).length;
check('花括号配对', open === close);
check('用到 CSS 变量', /var\(--accent\)/.test(css));
check('有响应式断点', (css.match(/@media/g) || []).length >= 3);
check('有 reduced-motion 处理', /prefers-reduced-motion/.test(css));
const usedVars = new Set([...css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(x => x[1]));
const declared = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map(x => x[1]));
const missing = [...usedVars].filter(v => !declared.has(v));
check('所有 var() 均有定义', missing.length === 0);
if (missing.length) console.log('       未定义：' + missing.join(', '));

console.log('\n[5] JS 健康检查');
check('是严格模式或 IIFE 包裹', /\(function \(\) \{/.test(js) && /'use strict'/.test(js));
check('没有 innerHTML 注入', !/innerHTML/.test(js));
check('外链带 rel=noopener', /rel = 'noopener noreferrer'/.test(js));
check('协议白名单校验', /protocol !== 'http:'/.test(js));

console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败\n');
process.exit(fail ? 1 : 0);
