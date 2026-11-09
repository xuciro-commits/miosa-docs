---
slug: "computers/vs-sandbox"
title: "计算机与沙箱"
description: "根据经验法则和并排表，为工作负载选择计算机或沙箱。"
section: "Computers"
order: 3002
---

> **注意：规则**
>
> 如果用户或智能体需要查看和操作真实屏幕，请使用计算机。
> 如果工作负载仅需要 shell、文件系统、进程或预览端口，请使用沙箱。

## 按工作负载选择

|工作量|选择|为什么 |
|---|---|---|
|运行测试、安装软件包、构建代码、公开开发服务器 | **沙盒** |更快、更便宜的 shell-first 计算 |
|必须点击网站的计算机使用智能体 | **计算机** | Needs pixels, browser state, and input events |
|登录的浏览器会话必须跨任务生存**计算机** | Browser profile persists with the VM |
| Headless Playwright、API 测试、CLI 工作流程 | **沙盒** | No visible desktop needed |
| Screenshot-based QA or visual inspection | **计算机** |使用渲染的屏幕作为真相 |
|桌面应用程序、扩展、文件选择器或手动接管 | **计算机** | Needs a full GUI and streamable session |
| Public 24/7 app URL for customers | **Docker 主机** |专为持久部署和自定义域而构建 |

## 计算机的用途

|使用 |它给你什么 |
|---|---|
|智能体浏览器|运行保持登录状态的浏览器会话，向智能体公开像素，并且可以由人工恢复。 |
|人工切换 |让操作员打开同一个实时桌面，检查状态，然后从自动化停止的地方继续。 |
| GUI 自动化 |使用鼠标、键盘、剪贴板、窗口、辅助功能和 shell 命令驱动桌面应用程序。 |
|持久工作区 |在停止/启动周期中保留文件、浏览器配置文件、已安装的工具和本地状态。 |

## 另请参阅

- **计算机使用**：完整操作参考：屏幕截图、单击、键入、按键、滚动、拖动、热键、窗口、辅助功能树等。
  [打开](/docs/computer-use)
- **嵌入和流式传输**：使用短期流令牌将实时像素流嵌入您自己的 UI 中。
  [打开](/docs/computers/embedding)
- **BYOC / OpenComputers**：自带硬件（Mac、Linux、Windows）。
  一个命令将您的计算机注册为 MIOSA 计算机。
  [打开](/docs/opencomputers)
