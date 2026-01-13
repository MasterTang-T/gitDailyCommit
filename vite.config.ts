import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		electron([
			{
				// 主进程入口
				entry: 'electron/main.ts',
				vite: {
					build: {
						outDir: 'dist-electron',
						rollupOptions: {
							external: ['electron']
						}
					}
				}
			},
			{
				// 预加载脚本
				entry: 'electron/preload.ts',
				onstart(options) {
					options.reload()
				},
				vite: {
					build: {
						outDir: 'dist-electron'
					}
				}
			}
		]),
		renderer()
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src')
		}
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html')
			}
		}
	}
})
