# One Key, Four Worlds · 演讲稿 App

把 `演讲稿.html` 打包成了一个可以装到 iPhone 主屏幕的离线 App（PWA）。

## 装到 iPhone（一次就好）

1. 用 **Safari**（不要用微信/Chrome 内置浏览器）打开：
   **https://memory66683.github.io/one-key-four-worlds/**
2. 点底部工具栏的 **分享** 按钮（方框 + 向上箭头）
3. 往下滑，点 **添加到主屏幕** → 右上角 **添加**
4. 主屏幕会出现「一键四世界」，点开就是全屏 App，没有地址栏

装好之后**完全离线可用**，飞机上、没网、开勿扰都能打开。第一次打开需要联网几秒，之后就不用了。

## 已做的改动

- 全屏运行（standalone），状态栏透明，刘海/底部安全区已适配
- 离线缓存：整个页面 + 图标缓存在本地，断网照常打开
- 4 组图标（含 iOS 180px 和 Android maskable），主屏图标是四根竖条，最后一根黄铜色
- 手机端工具栏压成一行：`▶ 计时 / 倒计时 / 重置 / 隐藏标注`
- 计时器改成真实时钟计算：锁屏、切后台、关掉 App 再回来都不会走偏
- 计时器打开时申请屏幕常亮（防止演讲前排练时自动锁屏）
- 计时进度和「隐藏标注」状态会记住，下次打开接着用
- 打印按钮在手机 / 独立 App 模式下自动隐藏

## 文件

```
index.html              主页面（含计时器、离线注册）
manifest.webmanifest    App 名称、图标、全屏配置
sw.js                   离线缓存（stale-while-revalidate）
icons/                  各种尺寸图标
tools/gen-icons.mjs     图标生成脚本（node tools/gen-icons.mjs）
```

## 改完内容怎么更新

改 `index.html` 后推上去即可，GitHub Pages 大约 1 分钟生效：

```bash
git add -A && git commit -m "update" && git push
```

手机上打开 App 一次（会先显示旧版、后台静默更新），第二次打开就是新版。

如果改了图标或想强制刷新缓存，把 `sw.js` 里的 `VERSION = 'okfw-v1'` 改成 `v2`。

## 本地预览

```bash
python3 -m http.server 8791
# 打开 http://127.0.0.1:8791/
```
