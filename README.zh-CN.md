# JanDan

语言：[English](./README.md) | 中文

[VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=TaipaXu.jandan-vscode) | [代码仓库](https://github.com/TaipaXu/jandan-vscode)

JanDan 是一个非官方的 [煎蛋](https://jandan.net/) VS Code 扩展。它在活动栏中提供煎蛋视图，可以直接浏览热榜、新鲜事、无聊图、随手拍、女装、树洞、问答和支援链接。

## 界面预览

![JanDan 扩展](./app.png)

## 功能特性

- 活动栏中包含热榜、新鲜事、无聊图、随手拍、女装、树洞、问答和支援煎蛋视图。
- 热榜视图包含 4 小时热榜、无聊图、树洞、问答、随手拍、3 日最佳和 7 日最佳分类。
- 支持上一页、下一页和刷新操作。
- 使用 Webview 渲染文章和图片内容。
- 支持对图片内容执行 `oo` 和 `xx` 投票。
- 支援链接会通过 VS Code 打开外部页面。

## 技术栈

- [Vite+](https://viteplus.dev/guide/) 作为统一工具链和 `vp` CLI。
- [VS Code Extension API](https://code.visualstudio.com/api) 用于树视图、命令和 Webview。
- [TypeScript](https://www.typescriptlang.org/) 用于扩展代码。
- [Axios](https://axios-http.com/) 和 `form-data` 用于煎蛋 API 请求。

## 运行环境

- Node.js：`24.17.0`
- 包管理器：`pnpm@11.5.2`
- VS Code engine：`^1.125.0`
- Vite+ 会从 `package.json` 读取这些设置。

## 开发

安装依赖：

```bash
vp install
```

启动扩展构建监听：

```bash
vp run dev
```

在 VS Code 中打开本目录，然后从运行和调试面板启动 `Run Extension`，即可打开 Extension Development Host。

## 构建

通过 Vite+ 运行项目构建脚本：

```bash
vp run build
```

生产构建会输出扩展入口文件：

```text
out/extension.js
```

## 打包

创建本地 VSIX 包：

```bash
vp run package
```

## 校验

```bash
vp run check
```

该命令会运行项目配置的 Vite+ 格式化和 lint 校验。需要自动格式化和修复时，可以直接运行 `vp check --fix`。

也可以运行 `vp help` 查看 Vite+ 提供的完整命令列表，或运行 `vp <command> --help` 查看单个命令的帮助。

## 许可证

本项目使用 [GPL-3.0 License](./LICENSE)。
