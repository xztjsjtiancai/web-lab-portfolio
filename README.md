# xzt / WEB LAB — 前端作品集

一个纯静态的前端作品集，收录三件从零手写的练习作品。
没有框架、没有构建步骤，只有 HTML、CSS 和原生 JavaScript。

## 目录结构

```
web-lab-portfolio/
├─ index.html          页面结构
├─ assets/
│  ├─ style.css        全部样式（CSS 变量 + 响应式）
│  └─ app.js           筛选、搜索、排序、预览弹窗
├─ image/              三件作品的页面截图
├─ tools/              本地预览与自检脚本（不参与部署）
├─ design.md           设计规范（配色 / 字体 / 间距 / 组件）
└─ AGENTS.md           改代码前的约定
```

## 自检

改完代码可以跑一遍自检，确认交互逻辑和页面结构都没坏：

```bash
node tools/_selftest.cjs     # 筛选、搜索、排序、弹窗、链接（37 项）
node tools/_structcheck.cjs  # 标签闭合、无障碍、资源引用（32 项）
```

`tools/` 只用于开发，Vercel 部署时会忽略它，不影响线上页面。

## 本地预览

方式一：直接双击 `index.html`。

方式二：起一个本地服务（推荐，避免个别浏览器对 `file://` 的限制）：

```bash
npx serve .
# 或者
python -m http.server 5173
```

然后打开 `http://localhost:5173`。

## 已有功能

- 按类型筛选作品（全部 / 应用 / 交互 / 表单）
- 按标题或标签实时搜索
- 三种排序方式：默认顺序、名称 A→Z、名称 Z→A
- 点击「预览」查看页面截图，支持 Esc、关闭按钮、点击遮罩退出
- 键盘可达，焦点样式统一，尊重 `prefers-reduced-motion`
- 响应式：桌面三列 → 平板两列 → 手机单列，导航条从左侧转到顶部

## 修改作品链接

打开 `assets/app.js`，顶部的 `LINKS` 就是链接配置：

```js
var LINKS = {
  recipe: 'https://caipu-ten.vercel.app/',
  quiz: 'https://quiz-game-one-phi.vercel.app/',
  register: 'https://my-web-project10.vercel.app/'
};
```

- 填了地址：卡片封面变成新标签页链接，悬停显示「打开作品」。
- 留空或地址无效：封面点击改为弹出截图预览。

标题和「预览」按钮始终打开截图弹窗，行为固定，便于对照。

## 部署到 Vercel

1. 把本目录推到 GitHub 仓库。
2. 打开 <https://vercel.com/new>，选择该仓库。
3. Framework Preset 选 **Other**，Build Command 与 Output Directory 都留空。
4. 点 Deploy，几秒后即可拿到可访问的网址。

项目是纯静态站点，不需要任何环境变量或构建配置。
