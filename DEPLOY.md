# 从零到上线：推 GitHub + 部署 Vercel

项目已经是 git 仓库（分支 `main`，已有 2 次提交），你只需要补上远程地址。

## 一、先把项目放到顺手的位置

项目当前在工作区：

```
C:\Users\18969\Documents\deepseek-harness\default-workspace\web-lab-portfolio
```

建议整份拷贝到桌面旁边的作业目录（**连 `.git` 一起拷**，否则提交历史会丢）：

```
D:\woyaoqisl\桌面\大三上\web\web-lab-portfolio
```

然后用 VS Code 打开这个文件夹。

## 二、在 GitHub 上建仓库

网页操作最省事：

1. 打开 <https://github.com/new>
2. Repository name 填 `web-lab-portfolio`（或你喜欢的名字）
3. 选 **Public**，**不要**勾选 "Add a README file"、"Add .gitignore"、"Choose a license"
4. 点 **Create repository**

## 三、在 VS Code 里推送

打开 VS Code 的终端（`` Ctrl+` ``），逐条执行
（把 `<你的用户名>` 换成你的 GitHub 用户名）：

```bash
git remote add origin https://github.com/<你的用户名>/web-lab-portfolio.git
git branch -M main
git push -u origin main
```

第一次推送会弹出浏览器让你登录 GitHub 授权，登录一次即可。

> 如果提示 `remote origin already exists`，改成：
> `git remote set-url origin https://github.com/<你的用户名>/web-lab-portfolio.git`

## 四、部署到 Vercel

1. 打开 <https://vercel.com/new>
2. 用 GitHub 账号登录，授权后选中刚推上去的 `web-lab-portfolio`
3. 配置保持默认即可（本项目是纯静态站点）：
   - **Framework Preset**：`Other`
   - **Build Command**：留空
   - **Output Directory**：留空
   - **Install Command**：留空
4. 点 **Deploy**，大约 10 秒后就能拿到 `https://xxx.vercel.app` 的网址。

以后每次 `git push`，Vercel 都会自动重新部署，不需要再点一遍。

## 五、部署后自查

打开线上网址，确认这几件事：

- [ ] 页面是深色背景 + 左侧导航条，三个卡片正常显示截图
- [ ] 顶部四个筛选按钮能切换，结果数量跟着变
- [ ] 搜索框输入「问答」只剩 Quiz Game，输入乱码出现空状态提示
- [ ] 排序切换后卡片顺序变化
- [ ] 点「预览」弹出截图，Esc 和点空白处都能关掉
- [ ] 把浏览器窗口拖窄到手机宽度，布局变成单列且没有横向滚动条
- [ ] 按 Tab 键，焦点框清晰可见

## 六、改内容的地方

| 想改什么 | 改哪个文件 |
| --- | --- |
| 作品标题、描述、标签 | `index.html` 里对应 `<li class="card">` |
| 作品线上地址 | `assets/app.js` 顶部的 `LINKS` |
| 截图 | 替换 `image/` 里的同名 PNG |
| 配色、间距、字号 | `assets/style.css` 顶部的 CSS 变量 |
| 页面文案（自我介绍等） | `index.html` 的 `<header class="intro">` |

改完样式或结构后，可以先跑一遍自检：

```bash
node tools/_selftest.cjs
node tools/_structcheck.cjs
```

两个都显示 `0 失败` 再提交，能避免大部分低级错误。
