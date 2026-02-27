import { ipcMain } from 'electron'
import { exec } from 'child_process'
import { platform } from 'os'

export function setupShellHandlers() {
  ipcMain.handle('shell:openInTerminal', async (event, path: string) => {
    try {
      let command: string
      // 根据操作系统类型决定打开终端的命令
      if (platform() === 'win32') {
        // Windows 下使用 PowerShell 打开目标目录
        command = `start powershell.exe -NoExit -Command "cd '${path}'"`
      } else if (platform() === 'darwin') {
        // macOS 下使用 Terminal 打开
        command = `open -a Terminal "${path}"`
      } else {
        // Linux 或其它类 Unix 系统尝试启动默认终端仿真器
        command = `x-terminal-emulator --working-directory="${path}"`
      }

      return new Promise((resolve) => {
        exec(command, (error) => {
          if (error) {
            console.error(`Failed to open terminal: ${error.message}`)
            resolve({ success: false, error: error.message })
          } else {
            resolve({ success: true })
          }
        })
      })
    } catch (error: any) {
      console.error(`Error in shell:openInTerminal: ${error.message}`)
      return { success: false, error: error.message }
    }
  })
}
