/**
 * 项目配置类型
 */
export interface Project {
	/** 唯一标识符 */
	id: string
	/** 项目名称（自定义） */
	name: string
	/** 项目路径 */
	path: string
	/** 是否置顶 */
	isPinned: boolean
	/** 创建时间 */
	createdAt: string
	/** 路径是否有效 */
	isValid?: boolean
}

/**
 * 项目信息（用于获取日志）
 */
export interface ProjectInfo {
	path: string
	name: string
}

/**
 * Git 提交日志
 */
export interface CommitLog {
	/** 项目名称 */
	projectName: string
	/** 提交信息 */
	message: string
	/** 提交日期 */
	date: string
}

/**
 * 布局模式
 */
export type LayoutMode = 'horizontal' | 'vertical'

/**
 * 应用配置
 */
export interface AppConfig {
	/** 项目列表 */
	projects: Project[]
	/** 布局模式 */
	layoutMode: LayoutMode
}

/**
 * 日期范围
 */
export interface DateRange {
	start: string
	end: string
}

/**
 * Electron API 类型定义
 */
export interface ElectronAPI {
	openFolderDialog: () => Promise<{ success: boolean; path?: string; message: string }>
	loadConfig: () => Promise<{ success: boolean; data?: AppConfig; message?: string }>
	saveConfig: (config: Partial<AppConfig>) => Promise<{ success: boolean; message: string }>
	getLogs: (projects: ProjectInfo[], startDate: string, endDate: string) => Promise<{
		success: boolean
		logs: CommitLog[]
		errors?: { path: string; message: string }[]
	}>
	validatePath: (path: string) => Promise<{ success: boolean; isValid: boolean }>
	getProjectName: (path: string) => Promise<{ success: boolean; name?: string }>
}

// 扩展 Window 接口
declare global {
	interface Window {
		electronAPI: ElectronAPI
	}
}
