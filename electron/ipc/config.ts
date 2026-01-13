import { ipcMain } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

// 定义配置结构
interface ProjectConfig {
	id: string
	name: string
	path: string
	isPinned: boolean
	createdAt: string
}

interface AppConfig {
	projects: ProjectConfig[]
	layoutMode: 'horizontal' | 'vertical'
}

// 配置文件路径
const configDir = app.getPath('userData')
const configPath = join(configDir, 'gitlog-mate-config.json')

// 默认配置
const defaultConfig: AppConfig = {
	projects: [],
	layoutMode: 'horizontal'
}

/**
 * 读取配置
 */
function loadConfigFromFile(): AppConfig {
	try {
		if (!existsSync(configPath)) {
			return { ...defaultConfig }
		}
		const data = readFileSync(configPath, 'utf-8')
		return JSON.parse(data)
	} catch {
		return { ...defaultConfig }
	}
}

/**
 * 保存配置
 */
function saveConfigToFile(config: AppConfig): void {
	if (!existsSync(configDir)) {
		mkdirSync(configDir, { recursive: true })
	}
	writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

// 内存中的配置
let currentConfig: AppConfig = loadConfigFromFile()

/**
 * 设置配置存储相关的 IPC 处理器
 */
export function setupConfigHandlers() {
	/**
	 * 加载配置
	 */
	ipcMain.handle('config:load', async () => {
		try {
			currentConfig = loadConfigFromFile()
			return {
				success: true,
				data: currentConfig
			}
		} catch (error: any) {
			return {
				success: false,
				message: `加载配置失败: ${error.message}`
			}
		}
	})

	/**
	 * 保存配置
	 */
	ipcMain.handle('config:save', async (_event, config: Partial<AppConfig>) => {
		try {
			if (config.projects !== undefined) {
				currentConfig.projects = config.projects
			}
			if (config.layoutMode !== undefined) {
				currentConfig.layoutMode = config.layoutMode
			}
			saveConfigToFile(currentConfig)
			return { success: true, message: '配置保存成功' }
		} catch (error: any) {
			return {
				success: false,
				message: `保存配置失败: ${error.message}`
			}
		}
	})
}
