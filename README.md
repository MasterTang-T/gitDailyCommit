# 📊 GitLog Mate - Git 日志助手

> **专为开发者打造的高效 Git 日志管理与周报生成工具。**
>
> A powerful tool designed for developers to manage multiple local Git repositories, generate daily/weekly reports, and perform batch operations efficiently.

---

## 📖 简介 | Introduction

**GitLog Mate** 是一款基于 Electron + Vue 3 开发的桌面端应用，旨在解决开发者在写日报、周报时需要频繁切换多个仓库查看提交记录的痛点。

通过 GitLog Mate，你可以将所有本地 Git 仓库集中管理，一键拉取指定时间段内的所有提交记录，甚至可以批量更新（Git Pull）你的仓库。精美的 UI 设计和流畅的交互体验，让繁琐的日志整理工作变得轻松愉悦。

## ✨ 核心功能 | Key Features

### 🚀 **多仓库集中管理**

- 轻松添加、编辑和删除本地 Git 仓库路径。
- **自动验证**：智能检测路径是否为有效的 Git 仓库。
- **置顶功能**：将常用仓库置顶，方便快速访问。
- **状态提示**：直观展示仓库是否有效或异常。

### 📝 **智能日志生成**

- **多维度筛选**：支持“今天”、“本周”、“本月”快捷按钮，或自定义日期范围。
- **聚合展示**：一键拉取所有选中仓库的 commit 记录，自动按时间排序整理。
- **格式化输出**：清晰展示提交时间、项目名称和提交信息，直接复制即可用于周报。

### 🔄 **批量操作 (Batch Operations)**

- **批量更新**：选中多个仓库，一键执行 `git pull`，保持所有项目代码同步。
- **实时反馈**：实时显示更新成功/失败的数量及详情。

### 🎨 **现代化 UI 设计**

- **灵活布局**：支持 **左右分栏** 和 **上下分栏** 两种布局模式，适应不同屏幕尺寸和阅读习惯。
- **Ant Design 风格**：采用 Ant Design Vue 组件库，界面简洁大方，交互流畅。
- **响应式体验**：精心设计的侧边栏和控制面板。

---

## 🛠️ 技术栈 | Tech Stack

本项目采用现代化的前端技术栈构建：

- **Core**: [Electron](https://www.electronjs.org/) (v33+)
- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Library**: [Ant Design Vue](https://antdv.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Date Library**: [Day.js](https://day.js.org/)

---

## 💻 安装与运行 | Installation & Run

### 前置条件

- Node.js (建议 v18+)
- Git (需配置到系统环境变量中)

### 开发环境运行

1. **克隆仓库**

    ```bash
    git clone https://github.com/your-username/gitlog-mate.git
    cd gitlog-mate
    ```

2. **安装依赖**

    ```bash
    npm install
    # 或者使用 pnpm / yarn
    pnpm install
    ```

3. **启动开发服务器**

    ```bash
    npm run dev
    ```

    此命令将同时启动 Vite 开发服务器和 Electron 窗口。

### 打包构建

构建适用于 Windows 的安装包（exe）：

```bash
npm run build:exe
```

构建完成后，安装包将位于 `release` 目录下。

---

## 📖 使用指南 | Usage Guide

1. **添加项目**
    - 点击左侧面板的 **“添加”** 按钮。
    - 输入项目名称（别名）和本地磁盘的绝对路径。
    - 系统会自动验证路径有效性。

2. **生成日志**
    - 在左侧列表勾选需要统计的项目（支持全选）。
    - 在控制面板选择时间范围（默认“今天”）。
    - 点击 **“生成日志”** 按钮。
    - 右侧面板将展示所有相关的 Git 提交记录。

3. **批量更新**
    - 勾选需要更新的项目。
    - 点击 **“批量更新”** 按钮。
    - 等待系统执行 `git pull`，完成后会提示成功数量。

---

## 🤝 贡献 | Contributing

欢迎提交 Issue 和 Pull Request！如果你有好的想法或建议，请随时告诉我。

1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request

---

## 📄 许可证 | License

[MIT](./LICENSE) License © 2024 GitLog Mate Team
