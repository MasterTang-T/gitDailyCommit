<template>
  <div class="project-list-container">
    <div class="panel-title">
      <span>📁 项目仓库</span>
      <div class="title-actions">
        <a-button type="link" size="small" @click="handleSelectAll">
          {{ allSelected ? '取消全选' : '全选' }}
        </a-button>
        <a-button type="primary" size="small" @click="handleAddProject">
          <template #icon>
            <PlusOutlined />
          </template>
          添加
        </a-button>
      </div>
    </div>

    <div class="project-list" v-if="store.sortedProjects.length > 0">
      <div v-for="project in store.sortedProjects" :key="project.id" class="project-item" :class="{
        'selected': store.selectedProjectIds.has(project.id),
        'invalid': project.isValid === false,
        'pinned': project.isPinned
      }" @click="store.toggleSelect(project.id)">
        <a-checkbox :checked="store.selectedProjectIds.has(project.id)" :disabled="project.isValid === false"
          @click.stop @change="store.toggleSelect(project.id)" />

        <div class="project-info" @dblclick.stop="handleEditProject(project)">
          <div class="project-name">
            <PushpinFilled v-if="project.isPinned" class="pin-icon" />
            <WarningFilled v-if="project.isValid === false" class="warning-icon" />
            {{ project.name }}
          </div>
          <div class="project-path" :title="project.path">{{ project.path }}</div>
        </div>

        <div class="project-actions">
          <a-tooltip title="编辑">
            <a-button type="text" size="small" @click.stop="handleEditProject(project)">
              <EditOutlined />
            </a-button>
          </a-tooltip>

          <a-tooltip :title="project.isPinned ? '取消置顶' : '置顶'">
            <a-button type="text" size="small" @click.stop="store.togglePin(project.id)">
              <PushpinOutlined v-if="!project.isPinned" />
              <PushpinFilled v-else style="color: #faad14" />
            </a-button>
          </a-tooltip>

          <a-tooltip title="删除">
            <a-popconfirm title="确定要删除此项目吗？" ok-text="确定" cancel-text="取消" @confirm="store.removeProject(project.id)">
              <a-button type="text" size="small" danger @click.stop>
                <DeleteOutlined />
              </a-button>
            </a-popconfirm>
          </a-tooltip>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <FolderOpenOutlined class="icon" />
      <p>暂无项目</p>
      <p style="font-size: 12px; color: #bbb">点击上方"添加"按钮添加 Git 仓库</p>
    </div>

    <!-- 项目编辑弹窗 -->
    <ProjectDialog v-model:open="dialogVisible" :project="editingProject" @save="handleSaveProject" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  PushpinOutlined,
  PushpinFilled,
  FolderOpenOutlined,
  WarningFilled
} from '@ant-design/icons-vue'
import { useAppStore } from '@/stores/app'
import type { Project } from '@/types'
import ProjectDialog from './ProjectDialog.vue'

const store = useAppStore()

const dialogVisible = ref(false)
const editingProject = ref<Project | null>(null)

// 是否全选
const allSelected = computed(() => {
  const validProjects = store.projects.filter(p => p.isValid !== false)
  return validProjects.length > 0 && store.selectedProjectIds.size === validProjects.length
})

// 添加项目
function handleAddProject() {
  editingProject.value = null
  dialogVisible.value = true
}

// 编辑项目
function handleEditProject(project: Project) {
  editingProject.value = project
  dialogVisible.value = true
}

// 保存项目
async function handleSaveProject(data: { name: string; path: string; id?: string }) {
  if (data.id) {
    // 编辑现有项目
    await store.updateProject(data.id, data.name, data.path)
    message.success('项目更新成功')
  } else {
    // 检查是否已存在
    const exists = store.projects.some(p => p.path === data.path)
    if (exists) {
      message.warning('该仓库路径已存在')
      return
    }

    await store.addProject(data.path, data.name)
    message.success('项目添加成功')
  }
}

// 全选/取消全选
function handleSelectAll() {
  store.toggleSelectAll()
}
</script>

<style scoped>
.project-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.project-list {
  flex: 1;
  overflow-y: auto;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #fafafa;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.project-item:hover {
  background: #f0f5ff;
}

.project-item.selected {
  background: #e6f4ff;
  border-color: #91caff;
}

.project-item.invalid {
  background: #fff2f0;
  border-color: #ffccc7;
  opacity: 0.8;
}

.project-item.pinned:not(.invalid) {
  background: #fffbe6;
  border-color: #ffe58f;
}

.project-info {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  cursor: pointer;
}

.project-name {
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pin-icon {
  color: #faad14;
  font-size: 12px;
}

.warning-icon {
  color: #ff4d4f;
  font-size: 12px;
}

.project-path {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.project-item:hover .project-actions {
  opacity: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #999;
}

.empty-state .icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
}
</style>
