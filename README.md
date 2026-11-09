# MIOSA：站点、文档与交互重建

本地运行的 MIOSA 学习项目，重点重建主页、文档首页和定价页。SvelteKit + Svelte 5 + TypeScript；文档用 MDsveX。原站技术调查见 [RESEARCH](docs/RESEARCH.md)，具体颜色、字体、阴影、滚动区域见 [样式核对](docs/STYLE_AUDIT.md)。

## 部署到 MIOSA

线上地址：<https://docs.norsky.cn>。推送到 `main` 会触发 `.github/workflows/deploy-miosa.yml`：

1. 检查类型，运行 `npm run build:spa`，生成单页应用、所有文档路由入口、搜索索引和机器文档。
2. 在真正的静态文件服务器上，用浏览器验证页面、搜索、深层路由、Markdown 与本地 OSA 检索。
3. 上传未提升的 MIOSA 预览版本，再次进行浏览器验收，检查构建提交号。
4. 验收通过后提升为正式版本，再检查线上地址。失败的预览不会替换当前正式版本。

构建发生在 GitHub Actions，静态文件托管在 MIOSA。仓库 Secret `MIOSA_API_KEY` 用于发布，不进入静态产物。`release.json` 记录该版本的 Git 提交号。

```sh
npm ci --legacy-peer-deps
npm run build:spa
npm run preview:static
# 另一个终端：
npm run verify:deployment
```

构建把内容编译进单个版本化脚本，并为每个文档 URL 生成静态入口；这样可以避免逐页复制正文，同时保持每个路由返回 200。

静态版 OSA 在浏览器中检索文档，不调用服务器模型。API explorer 可以阅读接口，但发送示例资源请求需要运行本地 Node 服务。页面不会声称静态托管提供了这些后端接口。

MIOSA 发布校验会扫描公开示例中的环境变量引用。文档使用 `YOUR_API_KEY` 占位值，CLI 示例使用 `miosa login`；不要为通过校验而把真实云密钥放进页面。此前完整文档产物被拒绝的实际原因是示例中的未绑定环境变量引用，不是已确认的文件数量限制。

## 多语言

站点提供 English / 简体中文切换。页头的语言按钮会把选择写入 `localStorage`（`miosa-locale`），并在刷新和页面切换后保持。界面文案使用 `src/lib/i18n/messages/` 下的命名空间字典；文章内容仍保留单一英文 SVX 源文件，由 `src/lib/i18n.svelte.ts` 的 `translateContent` 在运行时按内容字典翻译，避免复制页面代码。

## 启动

需要 Node.js 22.12+。

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 5173
```

- 主页：http://localhost:5173/
- 文档：http://localhost:5173/docs
- 定价：http://localhost:5173/pricing
- 学习：http://localhost:5173/docs/learn/earn
- API：http://localhost:5173/docs/api

首次进入文档会出现星空入场。可按 Esc 跳过；“Replay intro”或 `/docs?entrance=1` 重播。

```sh
npm run check
npm run build
npm start
```

生产构建使用 Node adapter，默认端口 3000。Playwright 测试通过 `npm test` 运行；macOS 默认使用已安装的 Chrome，其他平台先运行 `npx playwright install chromium`。可通过 `CHROME_PATH` 指定浏览器。

## 源码怎么改

| 内容                           | 位置                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| 主页 / 文档首页 / 定价页       | `src/routes/+page.svelte` / `src/routes/docs/+page.svelte` / `src/routes/pricing/+page.svelte` |
| 原站文档颜色、字体、圆角、阴影 | `src/lib/styles/reference-tokens.css`                                                          |
| 文章与元数据                   | `src/content/*.svx`                                                                            |
| 内容索引与搜索数据             | `src/lib/content/catalog.ts`                                                                   |
| 侧栏分组                       | `src/lib/content/navigation.ts`                                                                |
| 首页产品与卡片数据             | `src/lib/content/products.json` / `landing.ts`                                                 |
| 价格快照 / 竞品来源            | `src/lib/content/pricing-snapshot.json` / `providers.json`                                     |
| 定价计算                       | `src/lib/pricing.ts`                                                                           |
| 示例联动                       | `CodeTabs.svelte` / `RequestBuilder.svelte`                                                    |
| 入场 / 卡片 / Logo 交互 / 线框 | `DocsEntrance.svelte` / `CardDeck.svelte` / `ProductShowcase.svelte` / `ComputeScene.svelte`   |
| 词汇、测验、实验               | `src/lib/content/learning.ts` 与 `src/routes/docs/learn/`                                      |
| 本地练习进度                   | `src/lib/learning.svelte.ts`                                                                   |
| 本地 API                       | `src/routes/api/sandboxes/`                                                                    |
| 可选 AI 上游                   | `src/routes/api/docs/ask/+server.ts`                                                           |

文章 frontmatter 的字符串需要引号，特别是含冒号的描述。元数据同时供标题、Markdown、搜索与机器文档索引使用；新增文章后按需加入导航。示例语言由共享偏好同步，workspace/name 参数改变会更新请求示例。

## 能做什么

首页线框使用 Three.js 实例化几何，保留原站相机、着色器和指针/滚轮参数。文档有首访/回访/重播、跳过和暂停入场、键盘/拖拽卡片、安装切换、可拖动抛掷的 Logo 场景、Zap、产品指南、搜索、目录、Markdown、主题与响应式导航。定价有工作量和预算模式、资源/CPU/时长/并发联动、不可用与容量提示、竞品排名、来源和独立 FAQ。

学习区包含术语练习、测验和七个可操作实验，进度存于当前浏览器。API 页面使用同步的 OpenAPI 参考内容，代码高亮使用 Shiki，图表使用 Mermaid，对话框使用 Bits UI。复杂库按需加载。

## 明确边界

这是可运行的界面与文档重建，不是 MIOSA 云服务。登录和选择真实套餐跳转官方站点；真实资源、付费、奖励到账和生产账户状态没有接入。价格来自 2026-11-09 的公开快照，竞品数据带来源与核对日期，不会静默刷新成另一组价格。

本地 sandbox API 使用进程内存，重启后清空。学习额度是练习记录，没有货币价值。视频课程保持“尚未开放”。文档内容与 sitemap / llms-full 对齐：426 个文档 URL 全部有本地路由，页面正文由同步的 Markdown 内容生成；产品指南也能直接打开目标页的完整内容。

Ask OSA 默认返回本地文档段落。若要接入真实模型，复制 `.env.example` 为 `.env`，填写 `DOCS_AI_BASE_URL`、`DOCS_AI_KEY`、`DOCS_AI_MODEL` 后重启。密钥只留在服务端。未配置服务时界面明确显示本地模式。

字体和品牌图片来自公开参考站点，产品 Logo 用于说明对应构建案例。研究资料与验证范围均在 `docs/`，交互覆盖见 [INTERACTIONS](docs/INTERACTIONS.md)。
