import { ipcMain, dialog } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * 设置对话框相关的 IPC 处理器
 */
export function setupDialogHandlers() {
	/**
	 * 打开文件夹选择对话框
	 * 验证选中的文件夹是否为有效的 Git 仓库
	 */
	ipcMain.handle('dialog:openFolder', async () => {
		const result = await dialog.showOpenDialog({
			title: '选择 Git 仓库文件夹',
			properties: ['openDirectory'],
			buttonLabel: '选择此文件夹'
		})

		if (result.canceled || result.filePaths.length === 0) {
			return { success: false, message: '已取消选择' }
		}

		const folderPath = result.filePaths[0]

		// 检查是否是有效的 Git 仓库 (包含 .git 目录)
		const gitPath = join(folderPath, '.git')
		if (!existsSync(gitPath)) {
			return {
				success: false,
				message: '所选文件夹不是有效的 Git 仓库',
				path: folderPath
			}
		}

		return {
			success: true,
			path: folderPath,
			message: '成功选择 Git 仓库'
		}
	})
}
