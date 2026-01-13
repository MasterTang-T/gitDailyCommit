<template>
  <div class="app-container">
    <!-- 头部 -->
    <header class="app-header">
      <h1>
        <span class="logo">📊</span>
        GitLog Mate - Git 日志助手
      </h1>
      <div class="header-actions">
        <a-tooltip :title="store.layoutMode === 'horizontal' ? '切换为上下布局' : '切换为左右布局'">
          <a-button type="text" @click="store.toggleLayout" style="color: white">
            <LayoutOutlined style="font-size: 18px" />
          </a-button>
        </a-tooltip>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main" :class="store.layoutMode">
      <!-- 侧边栏 - 项目列表和控制面板 -->
      <div class="sidebar-panel">
        <ProjectList />
        <ControlPanel />
      </div>

      <!-- 主面板 - 日志预览 -->
      <div class="content-panel">
        <LogPreview />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { LayoutOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import ProjectList from '@/components/ProjectList.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import LogPreview from '@/components/LogPreview.vue'

const store = useAppStore()

// 初始化加载配置
onMounted(async () => {
  await store.loadConfig()
})
</script>

<style scoped>
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.app-header h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-header .logo {
  font-size: 26px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
}

/* 左右布局 */
.app-main.horizontal {
  flex-direction: row;
}

/* 上下布局 */
.app-main.vertical {
  flex-direction: column;
}

.sidebar-panel {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.horizontal .sidebar-panel {
  width: 360px;
  min-width: 320px;
  max-width: 400px;
}

.vertical .sidebar-panel {
  height: 320px;
  min-height: 280px;
}

.content-panel {
  flex: 1;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
