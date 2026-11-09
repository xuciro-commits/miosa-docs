---
slug: "concepts/computers-desktop"
title: "计算机（桌面产品）"
description: "MIOSA 云桌面产品：完整的 GUI 环境，具有屏幕截图、单击、键入和键盘 API，以及它们与沙箱的不同之处。"
section: "Optional"
order: 17008
---

**计算机**是在云中运行的完整桌面环境，具有屏幕截图、单击、键入和键盘 API。它们是与沙箱不同的产品表面 - 不同的生命周期，不同的用例。

| |沙盒|电脑|
|---|---|---|
|主要用途 |代码执行、文件 I/O、开发服务器、智能体工具使用 |桌面GUI、浏览器自动化、计算机使用智能体|
|显示|无（无头）|桌面流|
|无障碍树|没有 |是的 |
|生命周期 | Short-to-medium lived, auto-suspend |面向会话 |
|模板| `miosa-sandbox` (the default) | `miosa-desktop` |

Use Sandboxes for building apps.当您的智能体或工作流程需要真实屏幕时，请使用计算机。

您还可以携带自己的硬件（Mac、Linux、Windows）并通过 BYOC 将其注册为计算机主机。

```bash
curl -X POST https://api.miosa.ai/api/v1/computers \
  -H "Authorization: Bearer $MIOSA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-computer","template_type":"miosa-desktop","size":"small"}'
```

[Computers overview →](/docs/computers/overview)

## 三个命名层

每个新读者都会遇到一件事：“计算机”在 MIOSA 中具有特定的含义。

|层|术语 |意义|
|-------|------|---------|
|品牌 | **米奥萨** | The wordmark and platform. |
|资源 | **计算机** |桌面 GUI 产品。 Not a generic synonym for "VM." |
|人工智能智能体 | **OSA 智能体** |智能体运行时。选修的; installable inside a Sandbox or Computer. |

Sandboxes are not Computers. Runtime Instances are not Computers.电脑就是电脑。当您遇到一般使用“计算机”的旧文档或代码时，请根据上下文替换“沙箱”或“运行时实例”。

## 下一步

- [Resource model](/docs/concepts/resource-model): what a Sandbox is.
- [计算机概述](/docs/computers/overview)：完整的计算机参考。
- [核心概念](/docs/concepts)：一屏概述。
