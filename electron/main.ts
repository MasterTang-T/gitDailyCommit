import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { setupConfigHandlers } from './ipc/config'
import { setupGitHandlers } from './ipc/git'
import { setupDialogHandlers } from './ipc/dialog'

// 主窗口引用
let mainWindow: BrowserWindow | null = null

/**
 * 创建主窗口
 */
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		title: 'GitLog Mate - Git 日志助手',
		webPreferences: {
			preload: join(__dirname, 'preload.js'),
			nodeIntegration: false,
			contextIsolation: true
		}
	})

	// 开发环境加载 Vite 开发服务器
	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
		mainWindow.webContents.openDevTools()
	} else {
		// 生产环境加载打包后的文件
		mainWindow.loadFile(join(__dirname, '../dist/index.html'))
	}

	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
	// 注册所有 IPC 处理器
	setupConfigHandlers()
	setupGitHandlers()
	setupDialogHandlers()

	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

// 所有窗口关闭时退出应用 (macOS 除外)
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
