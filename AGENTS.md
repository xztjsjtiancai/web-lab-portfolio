# 项目约定

改任何页面、布局或组件之前，先读 `design.md`，复用 `assets/style.css` 顶部的
CSS 变量；需要新设计模式时同步更新 `design.md`，保持全项目视觉一致。

本项目是 xzt 的纯静态前端作品集，深色科技感方向：左侧固定导航条 + 卡片式作品墙。
技术栈只有 HTML / CSS / 原生 JavaScript，不要引入框架、构建工具或外部 CDN。

三件作品（Recipe Finder、Quiz Game、Register）的真实页面地址写在
`assets/app.js` 的 `LINKS` 中；页面截图放在 `image/`，用于弹窗预览。
不要为不存在的作品编造链接或截图。

提交前自查：无控制台报错、键盘可走完全部交互、320px 宽度无横向溢出、
`prefers-reduced-motion` 下无动画。
