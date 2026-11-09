---
slug: "guides/agent-orchestration/patterns"
title: "编排模式"
description: "MIOSA 智能体系统的协调模式：提示调度、持久运行组、子智能体、沙箱托管的协调器、自配置智能体、工件导出、凭证和权限。"
section: "Agents"
order: 6023
---

这些是使智能体系统随着其发展而工作的协调模式：提示如何到达正确的设备，任务如何扇出到持久运行组，沙箱内和沙箱托管的拓扑，生成的工作如何离开运行时，以及凭证和权限如何保持范围。

---

## 及时发货

在运行时，编排主要意味着将提示分派到正确的位置
device and streaming the result back.

|提示目标|用它来 |命令示例 |
|---|---|---|
|沙盒|代码、文件、测试、构建、工件、预览服务器 | `miosa prompt --sandbox <id> "build the page"` |
|电脑| browser, screenshots, clicks, form fill, visual QA | `miosa prompt --computer <id> "test signup"` |
| BYOC/开放计算机 |私人本地文件、应用程序、网络、客户控制的硬件|有关主机范围的工作，请参阅 [OpenComputers](/docs/opencomputers) |

Create reusable runtime profiles for the agents your product supports.一个
配置文件可以是租户范围的或特定于工作区的，并且可以应用于沙箱
工人、计算机智能体或两者兼而有之。

提示到设备的流程应该在您的产品后端中明确：

```text
user prompt
  -> product run record
  -> runtime profile resolution
  -> sandbox, computer, or BYOC/OpenComputer target
  -> scoped env and secret injection
  -> event stream
  -> files, artifacts, screenshots, previews, deployments
```

这让 Polsia 式的运营商、coFounder.co 式的公司操作系统、
Nebula 风格的虚拟设备和 Lovable/Replit/Genspark 风格的应用程序构建器
即使它们在下面使用不同的运行时，也可以共享一个 UI 合约。

### 持久跑步组

当一项产品任务分散为多个子运行时，请使用智能体运行组。
该组为您的 UI 提供了一份持久记录，用于计数、状态、取消、
child run lookup, and a group event stream.

```text
user task
  -> agent run group
    -> child run: sandbox coder
    -> child run: sandbox tester
    -> child run: computer browser QA
    -> child run: deployment verifier
  -> artifacts, events, previews, screenshots, deployment URL
```

当前的调度批次上限为每个 API 调用 100 次子运行。为数百人
or thousands of logical agents, queue the work in your backend and dispatch in
batches against one or more groups. Keep a separate concurrency policy per
租户/工作区，因此一个客户无法消耗整个运行时池。

The user-facing loop should be:

```text
create group
  -> dispatch child runs
  -> stream /agent-run-groups/{id}/events
  -> show child run status and output as it happens
  -> list artifacts from completed child runs
  -> expose download/preview/deploy actions in your UI
```

这可以避免为每个子智能体打开一个浏览器流。您的产品后端可以
订阅一个组流，将事件规范化到您自己的任务时间表中，以及
当沙箱和计算机智能体并行工作时，保持 UI 活跃。

When a child run uses a sandbox process-backed runtime, cancellation stops the
recorded sandbox process instead of only changing run status.用这个来
更长的构建、测试、抓取或工件生成任务，用户可以在这些任务中
从您的用户界面取消。

**命令行界面**

```bash
miosa api POST /agent-runtime-profiles -d '{
  "name": "lumen-claude",
  "runtime": "claude-code",
  "workspace_id": "lumen",
  "tools": ["filesystem", "shell", "browser"],
  "connectors": ["anthropic/workspace"],
  "env": {"ANTHROPIC_MODEL": "claude-sonnet-4.6"},
  "is_default": true
}'

miosa agent run builder \
  --sandbox sbx_123 \
  --no-follow

miosa api POST /run-groups -d '{
  "name": "lumen-build-and-qa",
  "workspace_id": "ws_123",
  "concurrency_limit": 10,
  "expected_runs": 3
}'

miosa api POST /run-groups/grp_123/dispatch -d '{
  "runs": [
    {"sandbox_id": "sbx_code", "provider": "claude-code", "prompt": "Build the app", "orchestration_role": "coder"},
    {"sandbox_id": "sbx_test", "provider": "codex", "prompt": "Run tests", "orchestration_role": "tester"},
    {"computer_id": "cmp_browser", "provider": "osa", "prompt": "Verify signup in the browser", "orchestration_role": "browser-qa"}
  ],
  "async": true
}'

miosa api GET "/run-groups/grp_123/activity?stream=true&limit=100"
```

**打字稿**

```typescript
const profile = await miosa.agentRuntimeProfiles.create({
  name: "lumen-claude",
  runtime: "claude-code",
  workspaceId: "ws_123",
  isDefault: true,
  appliesTo: { resources: ["sandbox", "computer"] },
  tools: ["filesystem", "shell", "browser"],
  connectors: ["anthropic/workspace"],
  env: { ANTHROPIC_MODEL: "claude-sonnet-4.6" },
})

const run = await miosa.agentRuns.run({
  sandboxId: "sbx_123",
  prompt: "Build the intake form and export the generated HTML.",
  agentRuntimeProfileId: profile.id,
  cwd: "/workspace",
})

const group = await miosa.agentRunGroups.create({
  name: "lumen-build-and-qa",
  workspaceId: "ws_123",
  concurrencyLimit: 10,
  expectedRuns: 3,
})

await miosa.agentRunGroups.dispatch(
  group.id,
  [
    {
      sandboxId: "sbx_code",
      provider: "claude-code",
      prompt: "Build the app",
      orchestrationRole: "coder",
    },
    {
      computerId: "cmp_browser",
      provider: "osa",
      prompt: "Verify signup in the browser",
      orchestrationRole: "browser-qa",
    },
  ],
  { async: true },
)

for await (const event of miosa.agentRunGroups.streamEvents(group.id)) {
  timeline.append({
    childRunId: event.agent_run_id,
    type: event.type,
    message: event.message,
  })
}
```

**Python**

```python
profile = client.agent_runtime_profiles.create(
    name="lumen-claude",
    runtime="claude-code",
    workspace_id="ws_123",
    is_default=True,
    applies_to={"resources": ["sandbox", "computer"]},
    tools=["filesystem", "shell", "browser"],
    connectors=["anthropic/workspace"],
    env={"ANTHROPIC_MODEL": "claude-sonnet-4.6"},
)

run = client.agent_runs.run(
    sandbox_id="sbx_123",
    agent_runtime_profile_id=profile["id"],
    cwd="/workspace",
    prompt="Build the intake form and export the generated HTML.",
)

group = client.agent_run_groups.create(
    name="lumen-build-and-qa",
    workspace_id="ws_123",
    concurrency_limit=10,
    expected_runs=3,
)

client.agent_run_groups.dispatch(
    group["id"],
    [
        {
            "sandbox_id": "sbx_code",
            "provider": "claude-code",
            "prompt": "Build the app",
            "orchestration_role": "coder",
        },
        {
            "computer_id": "cmp_browser",
            "provider": "osa",
            "prompt": "Verify signup in the browser",
            "orchestration_role": "browser-qa",
        },
    ],
    async_=True,
)

for event in client.agent_run_groups.stream_events(group["id"]):
    timeline.append(
        {
            "child_run_id": event["agent_run_id"],
            "type": event["type"],
            "message": event.get("message"),
        }
    )
```

如果未传递显式配置文件，MIOSA 将解析工作区默认配置文件
first, then the tenant default profile. Request-level `env` values override
non-secret profile defaults. Secret provider keys should come from managed
secrets or connectors, not from profile `env`.

Recommended inheritance order:

|层|继承进入运行|不应包含 |
|---|---|---|
|租户默认配置文件 | Organization-wide runtime, tool, and non-secret env defaults | Customer-specific provider keys |
|工作区默认配置文件 | Company/customer runtime choice, cwd defaults, allowed tools |租户管理密钥 |
|智能体简介 | Role instructions, connectors, approval policy, model hints | Browser-visible secrets |
|运行请求 | Prompt, cwd, timeout, non-secret env overrides | Long-lived provider credentials |

Use managed secrets or connectors for anything that can spend money, access
customer data, publish externally, or call a provider API.跑步应该
receive a scoped MIOSA runtime token with tenant/workspace/user/run attribution,
plus brokered provider access only for the endpoints the profile allows.

Every dispatch should record:

- 提示
- 运行时或运行框架
- 设备 ID
- scoped credentials and connectors
- 审批政策
- 流媒体事件
- files, artifacts, screenshots, previews, or deployment outputs

The user experience should be the same whether the prompt is handled by OSA,
Codex, Claude Code, Hermes, OpenCode, OpenClaw, or a custom runtime.

---

## 沙箱内的子智能体

您还可以在沙箱内运行子智能体。当产品
希望主要协调器将工作委派到隔离的工作区中。

```text
Account / tenant
  -> workspace
    -> orchestrator service
      -> sandbox
        -> subagent A: code editor
        -> subagent B: test runner
        -> subagent C: artifact generator
        -> subagent D: deploy verifier
```The sandbox receives the environment and scoped credentials it needs.的
subagents run inside `/workspace`, communicate through files, local processes,
stdout, and MIOSA events, and report results back to the orchestrator.

Good uses for sandbox-hosted subagents:

- 一个存储库内的并行代码审查智能体
- test generation plus test execution
- 报告生成人员
- 神器转换工人
- 依赖安装/构建/lint/测试管道

Avoid using one sandbox as an uncontrolled multi-tenant process host.一个沙箱
should belong to one tenant/workspace/security boundary.

---

---

## Sandbox-hosted orchestrators

The orchestrator does not always have to live in your backend. MIOSA 沙箱
可以是根协调器工作区。

```text
Tenant account
  -> workspace
    -> root orchestrator sandbox
      -> orchestration config
      -> local subagents
      -> child MIOSA sandboxes
      -> child MIOSA computers
      -> artifacts
      -> previews
      -> deployments
```

This pattern is useful for autonomous coding systems, research systems,
artifact factories, and customer-owned agent runtimes.根沙箱保留
项目文件、智能体配置、运行历史记录和本地工具。的
orchestrator process inside that sandbox can call MIOSA to launch additional
当需要隔离的工作人员时，可以使用沙箱或计算机。

这种模式的好例子：

- 根沙箱运行智能体管理器
- 子沙箱构建一个网络应用程序
- 子沙箱并行运行测试
- 子计算机在浏览器中打开预览
- 根沙箱收集屏幕截图、日志和工件
- 部署智能体发布验证结果

The backend still owns tenant enforcement, billing, quotas, audit logging, and
代币铸造。沙箱托管的编排器拥有本地计划和执行
该工作空间的策略。

---

---

## 自配置智能体

沙箱托管的协调器可以自定义自己的设置。可以写配置
文件、安装包、创建工作脚本、生成任务定义，以及
随着项目的发展调整其本地工作流程。

`/workspace` 内的典型文件：

```text
/workspace
  agent.config.json
  miosa.runbook.md
  tasks/
    build.json
    test.json
    browser-qa.json
  agents/
    coder.ts
    tester.ts
    artifact-generator.py
  artifacts/
  logs/
```

示例 `agent.config.json`：

```json
{
  "workspace": "lumen-demo",
  "defaultTemplate": "nextjs",
  "workers": {
    "coder": { "runtime": "local", "tools": ["files", "exec"] },
    "tester": { "runtime": "child-sandbox", "template": "miosa-sandbox" },
    "browserQa": { "runtime": "computer", "template": "ubuntu-browser" }
  },
  "limits": {
    "maxConcurrentWorkers": 8,
    "maxChildSandboxes": 4,
    "maxChildComputers": 1
  }
}
```

这使得智能体可以改进自己的操作程序，而不需要每一个
更改为在父应用程序中进行硬编码。

使用这些护栏：

- 保持配置文件在 `/workspace` 中可见
- 需要明确批准配额或许可增加
- 在应用之前验证生成的配置
- 限制子沙箱/计算机创建
- 将运行事件写回产品 UI
- 重大自我修改前的快照
- 将租户管理员凭据保留在沙箱之外

目标是受控自主：智能体可以编码和配置自己的
工作空间，但 MIOSA 仍然强制执行帐户边界和资源限制。

---

---

## 导出生成的工作

智能体应该留下具体的输出。对于应用程序构建者和智能体公司
产品，这些输出成为用户的可交付成果：HTML、PDF、DOCX 文件，
CSV 导出、屏幕截图、ZIP、源补丁、构建日志或部署 URL。

当您期望生成文件时，请在智能体运行上使用声明的工件路径：

```json
{
  "sandbox_id": "sbx_code",
  "provider": "claude-code",
  "prompt": "Build the landing page and export /workspace/artifacts/site.html",
  "metadata": {
    "artifact_paths": ["/workspace/artifacts/site.html"]
  }
}
```

运行完成后，列出并下载工件：

```bash
miosa run files <run-id> --json
miosa run download <run-id> <file-id> --output ./site.html
```

MIOSA 在可能的情况下将工件字节捕获到托管存储中。如果一个
工件有 `persisted: true`，您的 UI 可以在之后继续显示下载按钮
运行时间停止。如果不持久，请保持沙箱或计算机运行
直到文件被下载、发布或复制到持久的地方。

在您的产品 UI 中使用此拆分：

|输出类型|最佳表面|
|---|---|
| HTML、PDF、DOCX、CSV、ZIP |神器下载|
|网络应用程序 |沙盒预览，然后部署 |
|屏幕截图或可视化 QA 结果 |工件预览和事件时间线 |
|源代码更改 |文件面板、git diff、工件 ZIP |
|长效产品|部署或 Docker 主机 URL |

---

---

## 凭证和帐户连接

大型智能体系统应使用限定范围的凭据，而不是共享一个租户
管理密钥无处不在。

```text
Tenant key
  -> server-side orchestrator only
  -> mints scoped workspace/user tokens
  -> tokens injected into sandbox/computer runtime
  -> subagents call MIOSA within their allowed scope
```

注入运行时的典型环境：

```bash
MIOSA_API_KEY=msk_scoped_...
MIOSA_TENANT_ID=...
MIOSA_WORKSPACE_ID=...
MIOSA_PROJECT_ID=...
MIOSA_USER_ID=...
MIOSA_RUN_ID=...
```

这使得每个子智能体都可以连接到正确的帐户，同时仍然提供
平台的可审核性、配额和撤销。

重要凭证规则：- 浏览器代码永远不会接收租户管理密钥。
- 沙箱接收范围内的运行时密钥，而不是根帐户密钥。
- 每个令牌都有工作空间/项目/用户/运行属性。
- 每个命令、文件写入、预览、快照和部署都是可审核的。
- 配额适用于租户、工作区、用户和运行时池级别。

---

---

## 权限和安全

每个智能体应仅获得其所需的权限。

|智能体|典型权限 |
|---|---|
|沙盒代码智能体 | sandbox files, exec, previews, snapshots |
|神器智能体| sandbox files, exec, artifact export |
|浏览器 QA 智能体 | computer screenshot, click, type, navigation |
|部署智能体 | deployment publish, domains, rollback |
|计费/支持智能体 | usage, credits, audit log |

Use scoped workspace keys or server-side tokens. Do not put tenant admin keys in
浏览器代码。

---

---

## 另请参阅

- [智能体编排](/docs/guides/agent-orchestration)：概念：规模模型、运行时选择、通信原语以及队列和池架构。
- [编排示例](/docs/guides/agent-orchestration/examples)：应用程序构建器、沙箱优先代码智能体和计算机 QA 智能体的工作流程。
