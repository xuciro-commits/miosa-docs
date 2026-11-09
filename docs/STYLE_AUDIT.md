# 原站样式核对

采样日期：2026-11-09。范围是主页、文档首页、Quickstart、定价页，以及搜索和 OSA 的公开状态；不是全站所有登录页面。浏览器计算样式保存在 `reference/style-contract.json`。字体与品牌素材在本地提供。

## 已确认的基础值

| 用途                       | 原始值                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| 营销页背景                 | `#07080b`                                                                                |
| 主页字体                   | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`    |
| 主页标题                   | `clamp(3.2rem,6vw,6.3rem)` / `620` / `.92` / `-.058em` / `#f4f5f7`                       |
| 定价页字体                 | `Geist, Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| 定价页标题                 | `clamp(46px,6vw,72px)` / `540` / `.94` / `-.06em` / `#f5f5f5`                            |
| 文档字体                   | Geist，`"ss01", "cv11"`，抗锯齿开启                                                      |
| 文档首页标题               | `clamp(2.6rem,5.6vw,4.25rem)` / `590` / `1` / `-.058em`                                  |
| 文档文章标题               | `40px` / `600` / `1.1` / `-.03em`                                                        |
| 文档正文                   | `15px` / `1.7`                                                                           |
| 文档面板圆角               | `16px`                                                                                   |
| 定价卡片 / 控件 / 徽标圆角 | `12px / 8px / 6px`                                                                       |

文档原始变量保存在 `src/lib/styles/reference-tokens.css`，本地组件的语义变量直接引用它们。

| Token                 | 亮色              | 暗色                    |
| --------------------- | ----------------- | ----------------------- |
| `--docs-canvas`       | `#f4f4f5`         | `#0a0a0b`               |
| `--dt`                | `#09090b`         | `#fafafa`               |
| `--dt2`               | `#3f3f46`         | `#b4b4ba`               |
| `--dt3`               | `#71717a`         | `#8a8a92`               |
| `--dt4`               | `#a1a1aa`         | `#5c5c64`               |
| `--dbg`               | `#ffffff`         | `#111113`               |
| `--dbg2`              | `#fafafa`         | `#161618`               |
| `--dbg3`              | `#f4f4f5`         | `#1d1d20`               |
| `--dbd`               | `#e4e4e7`         | `#26262a`               |
| `--dbd2`              | `#efeff1`         | `#1b1b1e`               |
| `--docs-panel-border` | `rgba(0,0,0,.06)` | `rgba(255,255,255,.06)` |

阴影不是统一的一层模糊：面板、导航、按钮和卡片有独立的 `--docs-shadow-*`。这些多层值已保留。卡片背景直接使用 OrbitCard 原始渐变，例如构建卡片为 `linear-gradient(145deg,#ff986e,#f36b47)`。

## 滚动区域

在上述范围确认了下列 **15 类区域**。这不是 15 个全局 token，也不意味着全站只有 15 处。

| 区域         | 原站选择器                   | 原站规则                        | 本地对应                       |
| ------------ | ---------------------------- | ------------------------------- | ------------------------------ |
| 页面         | `html`                       | 原生；`scrollbar-gutter:stable` | `html`                         |
| 侧栏         | `.dl-sidebar`                | `thin; var(--dbd) transparent`  | `.sidebar-nav`                 |
| 移动文档导航 | `.mt`                        | `none`；WebKit 隐藏             | 紧凑导航 / 抽屉                |
| 文章目录     | `.dt-scroll`                 | `none`；WebKit 隐藏             | `.toc-links`                   |
| 搜索筛选项   | `.cp-chips`                  | `none`                          | `.search-sections`             |
| 搜索结果     | `.cp-list`                   | `thin; var(--dbd) transparent`  | `.search-results`              |
| OSA 输入     | `.cp__input`                 | `thin`                          | `.ask-form textarea`           |
| OSA 日志     | `.ap__log`                   | `thin; var(--dbd) transparent`  | `.ask-messages`                |
| 安装选项     | `.ic-tabs`                   | `none`；WebKit 隐藏             | `.install-tabs`                |
| 安装命令     | `.ic-cmd`                    | `none`；WebKit 隐藏             | `.command-line code`           |
| 示例语言标签 | `.docs-tabs__bar`            | `none`；WebKit 隐藏             | `.code-tabs`                   |
| 文档表格     | `.doc-table-frame`           | `none`                          | MDsveX 内容表格                |
| 代码正文     | `pre.language-*`             | 原生 `auto`                     | `.code-body`                   |
| Mermaid      | `.docs-mermaid`              | `thin`                          | 图表滚动容器                   |
| 定价表格     | `.ai-frame`, `.table-scroll` | 原生 `auto`                     | `.simple-table`, `.plan-table` |

侧栏还有上下渐隐遮罩；搜索和 OSA 日志限制滚动传播。隐藏滚动条的区域仍能滚动。当前抓到的样式中，没有这些滚动区统一的 `6px` 宽度、滑块圆角、轨道底色或 hover 颜色；`thin` 的实际像素由浏览器与系统决定。不要为“看起来相近”擅自补一套 WebKit thumb 规则。

## 背景亮度

主页：桌面线框层 `opacity:.72`，遮罩为 `linear-gradient(90deg,#07080bd6,#07080b61 53%,#07080bb8)`。

主页在820px以下改为 `.54`、首屏绝对定位、`scale(1.08)`，遮罩改为 `linear-gradient(180deg,#07080b38,#07080b7a 58%,#07080b)`。

定价页：线框层 `opacity:.20`；遮罩为 `linear-gradient(180deg,#07080b61,#07080bb8 23%,#07080bf0 55%,#07080b)`。940px 以下线框降为 `.16`，640px 以下为 `.12`，遮罩改为 `#07080bc7`。

线框本身不是 CSS 图片：原站用 Three.js 画 `15×9×19` 个实例化立方体，边长 3.6，相机 FOV 62。`ComputeScene.svelte` 保留了公开实现中的网格、相机、着色器、指针与滚轮参数；减少动态效果时只绘制静态帧。WebGL 不可用时显示静态网格。

## 来源

- [文档壳样式](https://miosa.ai/_app/immutable/assets/29.DLqYOYQS.css)
- [文档共享组件样式](https://miosa.ai/_app/immutable/assets/SdkGrid.CXXG-4cs.css)
- [搜索样式](https://miosa.ai/_app/immutable/assets/CommandPalette.-gvf_qkM.css)
- [卡片样式](https://miosa.ai/_app/immutable/assets/OrbitCard.BmD_cZWQ.css)
- [主页样式](https://miosa.ai/_app/immutable/assets/32.BG5sYxgC.css)
- [定价页样式](https://miosa.ai/_app/immutable/assets/935.DnJ-SvbE.css)

浏览器测试锁定了关键标题、表面、阴影与滚动条模式。仍需区分“这些属性对齐”与“所有像素完全一致”：正文内容长度、Logo 物理运动时刻、系统字体栅格化和 GPU 帧会影响截图；本项目没有宣称整站逐像素完全相等。
