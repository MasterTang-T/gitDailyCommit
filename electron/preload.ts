import { contextBridge, ipcRenderer } from 'electron'

/**
 * 项目信息接口
 */
interface ProjectInfo {
	path: string
	name: string
}

/**
 * 暴露给渲染进程的安全 API
 */
contextBridge.exposeInMainWorld('electronAPI', {
	// 对话框操作
	openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),

	// 配置操作
	loadConfig: () => ipcRenderer.invoke('config:load'),
	saveConfig: (config: any) => ipcRenderer.invoke('config:save', config),

	// Git 操作 - 支持项目自定义名称
	getLogs: (projects: ProjectInfo[], startDate: string, endDate: string) =>
		ipcRenderer.invoke('git:getLogs', projects, startDate, endDate),

	// 路径验证
	validatePath: (path: string) => ipcRenderer.invoke('git:validatePath', path),

	// 获取项目名称
	getProjectName: (path: string) => ipcRenderer.invoke('git:getProjectName', path)
})
