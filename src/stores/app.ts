import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, LayoutMode, CommitLog, ProjectInfo } from '@/types'

/**
 * 应用状态管理
 */
export const useAppStore = defineStore('app', () => {
	// 状态
	const projects = ref<Project[]>([])
	const layoutMode = ref<LayoutMode>('horizontal')
	const selectedProjectIds = ref<Set<string>>(new Set())
	const logs = ref<CommitLog[]>([])
	const loading = ref(false)

	// 计算属性 - 获取排序后的项目列表 (置顶优先)
	const sortedProjects = computed(() => {
		return [...projects.value].sort((a, b) => {
			// 置顶项目优先
			if (a.isPinned && !b.isPinned) return -1
			if (!a.isPinned && b.isPinned) return 1
			// 按创建时间倒序
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		})
	})

	// 计算属性 - 获取已选中的项目
	const selectedProjects = computed(() => {
		return projects.value.filter(p => selectedProjectIds.value.has(p.id))
	})

	// 加载配置
	async function loadConfig() {
		const result = await window.electronAPI.loadConfig()
		if (result.success && result.data) {
			projects.value = result.data.projects
			layoutMode.value = result.data.layoutMode

			// 验证所有项目路径
			await validateAllPaths()
		}
	}

	// 保存配置
	async function saveConfig() {
		// 将响应式对象转换为普通对象，避免 IPC 克隆错误
		const plainProjects = JSON.parse(JSON.stringify(projects.value))
		const plainLayoutMode = layoutMode.value

		console.log('[Store] Saving config...', {
			projects: plainProjects,
			layoutMode: plainLayoutMode
		})
		const result = await window.electronAPI.saveConfig({
			projects: plainProjects,
			layoutMode: plainLayoutMode
		})
		console.log('[Store] Save config result:', result)
	}

	// 验证所有项目路径
	async function validateAllPaths() {
		for (const project of projects.value) {
			const result = await window.electronAPI.validatePath(project.path)
			project.isValid = result.success && result.isValid
		}
	}

	// 添加项目
	async function addProject(path: string, name: string) {
		const newProject: Project = {
			id: crypto.randomUUID(),
			name,
			path,
			isPinned: false,
			createdAt: new Date().toISOString(),
			isValid: true
		}
		projects.value.push(newProject)
		await saveConfig()
	}

	// 更新项目
	async function updateProject(id: string, name: string, path: string) {
		const project = projects.value.find(p => p.id === id)
		if (project) {
			project.name = name
			project.path = path
			// 验证新路径
			const result = await window.electronAPI.validatePath(path)
			project.isValid = result.success && result.isValid
			await saveConfig()
		}
	}

	// 删除项目
	async function removeProject(id: string) {
		const index = projects.value.findIndex(p => p.id === id)
		if (index > -1) {
			projects.value.splice(index, 1)
			selectedProjectIds.value.delete(id)
			await saveConfig()
		}
	}

	// 切换项目置顶状态
	async function togglePin(id: string) {
		const project = projects.value.find(p => p.id === id)
		if (project) {
			project.isPinned = !project.isPinned
			await saveConfig()
		}
	}

	// 切换项目选中状态
	function toggleSelect(id: string) {
		if (selectedProjectIds.value.has(id)) {
			selectedProjectIds.value.delete(id)
		} else {
			selectedProjectIds.value.add(id)
		}
	}

	// 全选/取消全选
	function toggleSelectAll() {
		const validProjects = projects.value.filter(p => p.isValid !== false)
		if (selectedProjectIds.value.size === validProjects.length) {
			selectedProjectIds.value.clear()
		} else {
			validProjects.forEach(p => selectedProjectIds.value.add(p.id))
		}
	}

	// 切换布局模式
	async function toggleLayout() {
		layoutMode.value = layoutMode.value === 'horizontal' ? 'vertical' : 'horizontal'
		await saveConfig()
	}

	// 获取日志
	async function fetchLogs(startDate: string, endDate: string) {
		loading.value = true
		try {
			// 构建项目信息数组（使用自定义名称）- 确保是普通对象
			const projectInfos: ProjectInfo[] = selectedProjects.value
				.filter(p => p.isValid !== false)
				.map(p => ({ path: p.path, name: p.name }))

			// 转换为普通对象避免 IPC 克隆问题
			const plainProjectInfos = JSON.parse(JSON.stringify(projectInfos))

			if (plainProjectInfos.length === 0) {
				logs.value = []
				return
			}

			const result = await window.electronAPI.getLogs(plainProjectInfos, startDate, endDate)
			if (result.success) {
				logs.value = result.logs
			}
		} finally {
			loading.value = false
		}
	}

	// 清空日志
	function clearLogs() {
		logs.value = []
	}

	// 批量更新仓库
	async function batchUpdateRepositories() {
		if (selectedProjectIds.value.size === 0) return

		loading.value = true
		try {
			const validProjects = selectedProjects.value.filter(p => p.isValid !== false)
			if (validProjects.length === 0) return

			const paths = validProjects.map(p => p.path)
			const result = await window.electronAPI.batchUpdate(paths)

			return result
		} finally {
			loading.value = false
		}
	}

	return {
		// 状态
		projects,
		layoutMode,
		selectedProjectIds,
		logs,
		loading,
		// 计算属性
		sortedProjects,
		selectedProjects,
		// 方法
		loadConfig,
		saveConfig,
		addProject,
		updateProject,
		removeProject,
		togglePin,
		toggleSelect,
		toggleSelectAll,
		toggleLayout,
		fetchLogs,
		clearLogs,
		validateAllPaths,
		batchUpdateRepositories
	}
})
