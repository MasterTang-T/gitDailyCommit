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

// 默认配置
const defaultConfig: AppConfig = {
	projects: [],
	layoutMode: 'horizontal'
}

// 获取配置文件路径（延迟获取，确保 app ready）
function getConfigPath(): string {
	const configDir = app.getPath('userData')
	return join(configDir, 'gitlog-mate-config.json')
}

function getConfigDir(): string {
	return app.getPath('userData')
}

/**
 * 读取配置
 */
function loadConfigFromFile(): AppConfig {
	try {
		const configPath = getConfigPath()
		console.log('[Config] Loading config from:', configPath)
		if (!existsSync(configPath)) {
			console.log('[Config] Config file does not exist, using default config')
			return { ...defaultConfig }
		}
		const data = readFileSync(configPath, 'utf-8')
		console.log('[Config] Config loaded successfully')
		return JSON.parse(data)
	} catch (error) {
		console.error('[Config] Error loading config:', error)
		return { ...defaultConfig }
	}
}

/**
 * 保存配置
 */
function saveConfigToFile(config: AppConfig): void {
	const configDir = getConfigDir()
	const configPath = getConfigPath()
	console.log('[Config] Saving config to:', configPath)
	console.log('[Config] Config data:', JSON.stringify(config, null, 2))

	if (!existsSync(configDir)) {
		console.log('[Config] Creating config directory:', configDir)
		mkdirSync(configDir, { recursive: true })
	}
	writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
	console.log('[Config] Config saved successfully')
}

// 内存中的配置（延迟初始化）
let currentConfig: AppConfig | null = null

/**
 * 获取当前配置（确保已初始化）
 */
function getCurrentConfig(): AppConfig {
	if (currentConfig === null) {
		currentConfig = loadConfigFromFile()
	}
	return currentConfig
}

/**
 * 设置配置存储相关的 IPC 处理器
 */
export function setupConfigHandlers() {
	// 初始化配置（在 app ready 后调用）
	console.log('[Config] Setting up config handlers')
	console.log('[Config] User data path:', app.getPath('userData'))

	/**
	 * 加载配置
	 */
	ipcMain.handle('config:load', async () => {
		try {
			console.log('[Config] IPC: config:load called')
			currentConfig = loadConfigFromFile()
			return {
				success: true,
				data: currentConfig
			}
		} catch (error: any) {
			console.error('[Config] IPC: config:load error:', error)
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
			console.log('[Config] IPC: config:save called with:', JSON.stringify(config))
			const current = getCurrentConfig()

			if (config.projects !== undefined) {
				current.projects = config.projects
			}
			if (config.layoutMode !== undefined) {
				current.layoutMode = config.layoutMode
			}

			currentConfig = current
			saveConfigToFile(currentConfig)
			return { success: true, message: '配置保存成功' }
		} catch (error: any) {
			console.error('[Config] IPC: config:save error:', error)
			return {
				success: false,
				message: `保存配置失败: ${error.message}`
			}
		}
	})
}
