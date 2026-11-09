---
slug: "integrations/examples"
title: "示例应用程序"
description: "您可以克隆、在本地运行并适应您自己的堆栈的四个全堆栈白标签示例。"
section: "Platform builders"
order: 9006
---

四个完整的、可运行的示例。每个都演示了不同的前端堆栈和一组不同的白标功能。 Clone the repo and follow the "Run locally" steps below each entry.

每个示例在调整之前都应该通过三个证明：应用程序在本地启动，其 MIOSA 资源解析为预期的工作区和项目，并且浏览器永远不会收到服务器 API 密钥。

## 选一个例子

|目标|以 | 开头完成证明|
|---|---|---|
|服务器渲染集成 | `whitelabel-saas` | A customer Sandbox opens through a scoped Preview token |
|使用嵌入式终端反应产品 | `whitelabel-react-saas` |刷新恢复相同属性的沙箱 |
| Next.js 市场或构建器 | `whitelabel-nextjs-marketplace` |多个项目通过规范 ID 保持分隔 |
| vue学习环境| `whitelabel-vue-tutor` | Quotas and teardown apply to the correct end user |

> **Caution: Use examples as executable starting points**
>
> 首先不更改地运行示例。
> Record the successful local URL and MIOSA resource IDs, then adapt one concern at a time.

所有示例都位于 [MIOSA GitHub 存储库 ](https://github.com/Miosa-osa/miosa) 根目录下的 `examples/` 中。

---

## 白标-SaaS

**Stack:** Python (Flask) backend + plain HTML/JS frontend

**它展示了什么：**

- 一次性租户设置：自定义预览域、品牌、Webhook 注册
- Per-customer sandbox provisioning with `external_user_id`, `external_project_id`, and `metadata`
- 服务器端预览令牌铸造和 iframe 嵌入
- HMAC-SHA256 webhook 签名验证
- 通过 `external_user_id` 进行拆卸（取消流程）

这是规范的参考示例。 Every concept in the [white-label walkthrough](/docs/platform/white-label) maps directly to code in this example.

**本地运行：**

```bash
cd examples/whitelabel-saas
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env  -  fill in MIOSA_API_KEY

python setup.py      # one-time tenant setup
python app.py        # server on http://localhost:8000
# Open index.html in a browser for the embed demo
```

**GitHub:** [`examples/whitelabel-saas`](https://github.com/Miosa-osa/miosa/tree/main/examples/whitelabel-saas)

---

## 白标签-反应-SaaS

**Stack:** React 18 (Vite) frontend + Express.js BFF

**它展示了什么：**

- BFF模式：Express mints浏览器代币； React uses `@miosa/sdk` directly in the browser
- Live terminal inside an iframe powered by the TypeScript SDK
- Per-user sandbox state stored in the BFF session
- Sandbox resume on page refresh (poll for `state === "running"` before showing the embed)
- Token refresh on `miosa:preview:expired` message event

**本地运行：**

```bash
cd examples/whitelabel-react-saas
pnpm install

cp .env.example .env
# Edit .env  -  fill in MIOSA_API_KEY

pnpm dev   # starts both Express (port 3001) and Vite (port 5173)
# Open http://localhost:5173
```

**GitHub：** [`examples/whitelabel-react-saas`](https://github.com/Miosa-osa/miosa/tree/main/examples/whitelabel-react-saas)

---

## Whitelabel-nextjs-marketplace

**堆栈：** Next.js 15（应用程序路由器）全堆栈

**它展示了什么：**

- Next.js Route Handlers as the BFF: token minting without a separate Express server
- Seller onboarding: sandbox provisioned on first login, re-used on return
- Multi-project listing: sandboxes filtered by `external_user_id` and rendered as cards
- Usage display: per-seller compute hours fetched with `client.usage.get(external_user_id)`
- Custom `next.config.js` to proxy sandbox previews through the Next.js server (avoid CORS for embedded iframes)

**本地运行：**

```bash
cd examples/whitelabel-nextjs-marketplace
pnpm install

cp .env.local.example .env.local
# Edit .env.local  -  fill in MIOSA_API_KEY

pnpm dev   # starts on http://localhost:3000
```

**GitHub:** [`examples/whitelabel-nextjs-marketplace`](https://github.com/Miosa-osa/miosa/tree/main/examples/whitelabel-nextjs-marketplace)

---

## 白色标签-vue-tutor

**堆栈：** Vue 3 (Vite) 前端 + Express.js 后端

**What it demonstrates:**

- Per-lesson sandbox lifecycle: fresh sandbox per lesson, destroyed on completion
- Quota enforcement: custom middleware rejects `sandbox.create` if the user has reached their limit
- Public share links with a 15-minute TTL for peer review
- File-tree component: reads the sandbox filesystem via `client.files.list(sandboxId, "/")`
- Run-button component: streams exec output via `client.exec.stream(sandboxId, "npm test")`

**本地运行：**

```bash
cd examples/whitelabel-vue-tutor
pnpm install

cp .env.example .env
# Edit .env  -  fill in MIOSA_API_KEY

pnpm dev   # starts both Express (port 3001) and Vite (port 5174)
# Open http://localhost:5174
```

**GitHub：** [`examples/whitelabel-vue-tutor`](https://github.com/Miosa-osa/miosa/tree/main/examples/whitelabel-vue-tutor)

---

## 特征矩阵

|能力|白色标签-SaaS |白色标签反应SaaS | Whitelabel-nextjs-市场 |白色标签-vue-导师 |
|---|:---:|:---:|:---:|:---:|
| Preview token (server-side) |是的 |是的 |是的 |是的 |
| iframe 嵌入 |是的 |是的 |是的 |是的 |
| Webhook 验证 |是的 |  - |  - |  - |
| Browser token (client SDK) |  - |是的 |  - |  - |
|直播终端 |  - |是的 |  - |是的 |
|文件树 |  - |  - |  - |是的 |
|执行流 |  - |  - |  - |是的 |
|使用情况显示|  - |  - |是的 |  - |
|配额执行 |  - |  - |  - |是的 |
|公开分享链接 |  - |  - |  - |是的 |
|用户拆解 |是的 |  - |  - |  - |

---## 贡献一个例子

如果您在 MIOSA 上构建了某些内容并想要共享它，请在 [MIOSA GitHub 存储库 ](https://github.com/Miosa-osa/miosa) 中打开拉取请求。示例必须：

- 包含有效的 `README.md` 以及本地设置说明
- 不提交 `MIOSA_API_KEY` 或任何秘密
- 对所有资源属性使用 `external_user_id`
- 如果包含 Webhook 端点，则验证 Webhook 签名
- 包含一个烟雾命令，当主要用户旅程失败时，该命令会以非零值退出
- 固定支持的运行时和包管理器版本
- 解释预期输出和清理步骤

---

## 另请参阅

- [端到端演练](/docs/platform/white-label)
- [预览令牌](/docs/develop/previews)
- [Webhooks 参考](/docs/integrations/webhooks)
