import { ipcMain } from 'electron'
import { existsSync } from 'fs'
import { join, basename } from 'path'
import { execSync } from 'child_process'

/**
 * 提交日志信息
 */
interface CommitLog {
	projectName: string
	message: string
	date: string
}

/**
 * 项目信息（带自定义名称）
 */
interface ProjectInfo {
	path: string
	name: string
}

/**
 * 设置 Git 相关的 IPC 处理器
 */
export function setupGitHandlers() {
	/**
	 * 验证路径是否为有效的 Git 仓库
	 */
	ipcMain.handle('git:validatePath', async (_event, path: string) => {
		try {
			const gitPath = join(path, '.git')
			const isValid = existsSync(path) && existsSync(gitPath)
			return { success: true, isValid }
		} catch (error: any) {
			return { success: false, isValid: false, message: error.message }
		}
	})

	/**
	 * 获取项目名称 (使用文件夹名称)
	 */
	ipcMain.handle('git:getProjectName', async (_event, path: string) => {
		try {
			return { success: true, name: basename(path) }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	})

	/**
	 * 获取 Git 提交日志
	 * @param projects 项目信息数组（包含路径和自定义名称）
	 * @param startDate 开始日期 (YYYY-MM-DD)
	 * @param endDate 结束日期 (YYYY-MM-DD)
	 */
	ipcMain.handle('git:getLogs', async (_event, projects: ProjectInfo[], startDate: string, endDate: string) => {
		const allLogs: CommitLog[] = []
		const errors: { path: string; message: string }[] = []

		for (const project of projects) {
			const repoPath = project.path
			const projectName = project.name

			try {
				// 验证路径是否存在
				if (!existsSync(repoPath)) {
					errors.push({ path: repoPath, message: '路径不存在' })
					continue
				}

				// 检查是否是 Git 仓库
				const gitPath = join(repoPath, '.git')
				if (!existsSync(gitPath)) {
					errors.push({ path: repoPath, message: '不是有效的 Git 仓库' })
					continue
				}

				// 执行 git log 命令
				// --no-merges: 排除合并提交
				// --after/--before: 日期范围 (after >= startDate, before <= endDate 当天结束)
				// 为了包含今天，需要将 endDate 加一天作为 before 的参数
				// 或者使用 --since 和 --until 配合时间
				// 使用 %B 获取完整的提交信息，使用特殊分隔符避免内容冲突
				const cmd = `git log --no-merges --after="${startDate} 00:00:00" --before="${endDate} 23:59:59" --pretty=format:"%B|||%ad^^^^^" --date=format:"%Y-%m-%d %H:%M"`

				try {
					const output = execSync(cmd, {
						cwd: repoPath,
						encoding: 'utf-8',
						stdio: ['pipe', 'pipe', 'pipe']
					})

					// 解析输出
					if (output && output.trim()) {
						const records = output.split('^^^^^')
						for (const record of records) {
							if (!record.trim()) continue

							// 分离消息和日期
							const lastSeparatorIndex = record.lastIndexOf('|||')
							if (lastSeparatorIndex !== -1) {
								const message = record.substring(0, lastSeparatorIndex).trim()
								const date = record.substring(lastSeparatorIndex + 3).trim()

								if (message && date) {
									allLogs.push({
										projectName,
										message,
										date
									})
								}
							}
						}
					}
				} catch (gitError: any) {
					// Git 命令执行错误（可能是空仓库或无提交）
					// 忽略此错误，继续处理下一个仓库
				}
			} catch (error: any) {
				errors.push({ path: repoPath, message: error.message })
			}
		}

		return {
			success: true,
			logs: allLogs,
			errors: errors.length > 0 ? errors : null
		}
	})

	/**
	 * 批量更新仓库
	 */
	ipcMain.handle('git:batchUpdate', async (_event, paths: string[]) => {
		const results: { path: string; success: boolean; message: string }[] = []

		for (const repoPath of paths) {
			try {
				if (!existsSync(repoPath)) {
					results.push({ path: repoPath, success: false, message: '路径不存在' })
					continue
				}

				const gitPath = join(repoPath, '.git')
				if (!existsSync(gitPath)) {
					results.push({ path: repoPath, success: false, message: '不是有效的 Git 仓库' })
					continue
				}

				try {
					execSync('git pull', {
						cwd: repoPath,
						encoding: 'utf-8',
						stdio: ['ignore', 'pipe', 'pipe']
					})
					results.push({ path: repoPath, success: true, message: '更新成功' })
				} catch (gitError: any) {
					results.push({
						path: repoPath,
						success: false,
						message: gitError.message ? gitError.message.split('\n')[0] : 'Git pull 失败'
					})
				}
			} catch (error: any) {
				results.push({ path: repoPath, success: false, message: error.message })
			}
		}

		return {
			success: true,
			results
		}
	})
}
