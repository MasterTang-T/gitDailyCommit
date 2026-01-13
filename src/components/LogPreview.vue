<template>
  <div class="log-preview-container">
    <div class="panel-title">
      <span>📝 日志预览</span>
      <a-button
        v-if="store.logs.length > 0"
        type="primary"
        size="small"
        @click="handleCopy"
      >
        <template #icon><CopyOutlined /></template>
        复制日志
      </a-button>
    </div>

    <!-- 加载状态 -->
    <div class="loading-overlay" v-if="store.loading">
      <a-spin size="large" tip="正在获取日志..." />
    </div>

    <!-- 日志内容 -->
    <div class="log-content" v-if="store.logs.length > 0" ref="logContentRef">
      <div v-for="(group, projectName) in groupedLogs" :key="projectName" class="project-group">
        <h3>### {{ projectName }}</h3>
        <ul>
          <li v-for="(log, index) in group" :key="index">
            {{ log.date }}: {{ log.message }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else-if="!store.loading">
      <FileSearchOutlined class="icon" />
      <p>暂无日志</p>
      <p style="font-size: 12px; color: #bbb">选择项目和日期范围后，点击"生成日志"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined, FileSearchOutlined } from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import type { CommitLog } from '@/types'

const store = useAppStore()
const logContentRef = ref<HTMLElement>()

// 按项目分组的日志
const groupedLogs = computed(() => {
  const groups: Record<string, CommitLog[]> = {}

  for (const log of store.logs) {
    if (!groups[log.projectName]) {
      groups[log.projectName] = []
    }
    groups[log.projectName].push(log)
  }

  // 按日期排序每个组内的日志
  for (const key in groups) {
    groups[key].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }

  return groups
})

// 生成 Markdown 格式的日志文本
function generateMarkdown(): string {
  const lines: string[] = []

  for (const [projectName, logs] of Object.entries(groupedLogs.value)) {
    lines.push(`### ${projectName}`)
    for (const log of logs) {
      lines.push(`- ${log.date}: ${log.message}`)
    }
    lines.push('') // 空行分隔
  }

  return lines.join('\n')
}

// 复制到剪贴板
async function handleCopy() {
  try {
    const text = generateMarkdown()
    await navigator.clipboard.writeText(text)
    message.success('日志已复制到剪贴板')
  } catch (error) {
    message.error('复制失败，请手动选择复制')
  }
}
</script>

<style scoped>
.log-preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.8;
}

.project-group {
  margin-bottom: 20px;
}

.project-group:last-child {
  margin-bottom: 0;
}

.project-group h3 {
  color: #1890ff;
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e6f4ff;
}

.project-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.project-group li {
  padding: 6px 0;
  color: #444;
  border-bottom: 1px dashed #eee;
}

.project-group li:last-child {
  border-bottom: none;
}

.project-group li::before {
  content: "•";
  color: #1890ff;
  font-weight: bold;
  margin-right: 10px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-state .icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-state p {
  margin: 4px 0;
}
</style>
