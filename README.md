# GitLog Mate

Git 日志助手 - 帮助开发者从多个本地 Git 仓库获取提交日志，生成日报/周报。

## 功能特性

-   📁 **项目管理**: 添加、删除、置顶多个 Git 仓库
-   📅 **日期选择**: 快捷日期（今天/本周/本月）和自定义日期范围
-   📝 **日志生成**: 自动获取并格式化 Git 提交记录
-   📋 **一键复制**: 将 Markdown 格式日志复制到剪贴板
-   🎨 **双布局**: 支持左右分栏和上下分栏布局切换
-   💾 **持久化**: 自动保存项目配置

## 技术栈

-   Electron + Vite
-   Vue 3 + TypeScript
-   Ant Design Vue
-   Pinia 状态管理
-   simple-git + electron-store

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 构建

```bash
# 构建 Windows .exe 安装程序
pnpm build:exe
```

## 许可证

MIT
