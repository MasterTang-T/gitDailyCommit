<template>
	<a-modal v-model:open="visible" :title="isEdit ? '编辑项目' : '添加项目'" :confirm-loading="loading" ok-text="确定"
		cancel-text="取消" @ok="handleSubmit" @cancel="handleCancel">
		<a-form :model="formData" :rules="rules" ref="formRef" layout="vertical">
			<a-form-item label="项目名称" name="name">
				<a-input v-model:value="formData.name" placeholder="请输入项目名称" :maxlength="50" />
			</a-form-item>

			<a-form-item label="本地仓库路径" name="path">
				<a-input-group compact>
					<a-input v-model:value="formData.path" placeholder="请选择 Git 仓库文件夹" style="width: calc(100% - 80px)"
						readonly />
					<a-button type="primary" @click="handleSelectFolder">
						选择
					</a-button>
				</a-input-group>
				<div class="path-status" v-if="formData.path">
					<CheckCircleFilled v-if="pathValid" style="color: #52c41a" />
					<CloseCircleFilled v-else style="color: #ff4d4f" />
					<span :style="{ color: pathValid ? '#52c41a' : '#ff4d4f' }">
						{{ pathValid ? '有效的 Git 仓库' : '不是有效的 Git 仓库' }}
					</span>
				</div>
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message, type FormInstance } from 'ant-design-vue'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue'
import type { Project } from '@/types'

const props = defineProps<{
	open: boolean
	project?: Project | null
}>()

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void
	(e: 'save', data: { name: string; path: string; id?: string }): void
}>()

const visible = ref(false)
const loading = ref(false)
const pathValid = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)

const formData = reactive({
	id: '',
	name: '',
	path: ''
})

const rules = {
	name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
	path: [{ required: true, message: '请选择本地仓库路径', trigger: 'blur' }]
}

// 监听 open 属性
watch(() => props.open, (val) => {
	visible.value = val
	if (val) {
		// 如果是编辑模式，填充数据
		if (props.project) {
			isEdit.value = true
			formData.id = props.project.id
			formData.name = props.project.name
			formData.path = props.project.path
			pathValid.value = props.project.isValid !== false
		} else {
			isEdit.value = false
			formData.id = ''
			formData.name = ''
			formData.path = ''
			pathValid.value = false
		}
	}
})

// 监听 visible 变化，同步到父组件
watch(visible, (val) => {
	emit('update:open', val)
})

// 选择文件夹
async function handleSelectFolder() {
	const result = await window.electronAPI.openFolderDialog()

	if (!result.success) {
		if (result.message !== '已取消选择') {
			message.error(result.message)
		}
		return
	}

	formData.path = result.path!
	pathValid.value = true  // openFolderDialog 已验证是 Git 仓库

	// 如果项目名称为空，自动填充文件夹名称
	if (!formData.name) {
		const nameResult = await window.electronAPI.getProjectName(result.path!)
		if (nameResult.success && nameResult.name) {
			formData.name = nameResult.name
		}
	}
}

// 提交表单
async function handleSubmit() {
	try {
		await formRef.value?.validate()

		if (!pathValid.value) {
			message.error('请选择有效的 Git 仓库')
			return
		}

		loading.value = true

		emit('save', {
			id: formData.id || undefined,
			name: formData.name,
			path: formData.path
		})

		visible.value = false
	} catch (error) {
		// 表单验证失败
	} finally {
		loading.value = false
	}
}

// 取消
function handleCancel() {
	visible.value = false
}
</script>

<style scoped>
.path-status {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 8px;
	font-size: 13px;
}
</style>
