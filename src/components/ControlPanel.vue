<template>
  <div class="control-panel">
    <div class="quick-buttons">
      <a-button
        :type="activeQuickBtn === 'today' ? 'primary' : 'default'"
        @click="setQuickDate('today')"
      >
        今天
      </a-button>
      <a-button
        :type="activeQuickBtn === 'week' ? 'primary' : 'default'"
        @click="setQuickDate('week')"
      >
        本周
      </a-button>
      <a-button
        :type="activeQuickBtn === 'month' ? 'primary' : 'default'"
        @click="setQuickDate('month')"
      >
        本月
      </a-button>
    </div>

    <div class="date-range-picker">
      <a-range-picker
        v-model:value="dateRange"
        :placeholder="['开始日期', '结束日期']"
        format="YYYY-MM-DD"
        :allowClear="false"
        style="width: 100%"
        @change="handleDateChange"
      />
    </div>

    <a-button
      type="primary"
      class="generate-btn"
      :loading="store.loading"
      :disabled="store.selectedProjectIds.size === 0"
      @click="handleGenerate"
    >
      <template #icon><FileTextOutlined /></template>
      生成日志
    </a-button>

    <div class="selected-info" v-if="store.selectedProjectIds.size > 0">
      已选择 {{ store.selectedProjectIds.size }} 个项目
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { FileTextOutlined } from '@ant-design/icons-vue'
import dayjs, { Dayjs } from 'dayjs'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

// 日期范围
const dateRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs()])

// 当前激活的快捷按钮
const activeQuickBtn = ref<'today' | 'week' | 'month' | null>('today')

// 设置快捷日期
function setQuickDate(type: 'today' | 'week' | 'month') {
  activeQuickBtn.value = type
  const today = dayjs()

  switch (type) {
    case 'today':
      dateRange.value = [today, today]
      break
    case 'week':
      dateRange.value = [today.startOf('week'), today]
      break
    case 'month':
      dateRange.value = [today.startOf('month'), today]
      break
  }
}

// 日期变化处理
function handleDateChange() {
  activeQuickBtn.value = null
}

// 生成日志
async function handleGenerate() {
  if (store.selectedProjectIds.size === 0) {
    message.warning('请先选择至少一个项目')
    return
  }

  const startDate = dateRange.value[0].format('YYYY-MM-DD')
  const endDate = dateRange.value[1].format('YYYY-MM-DD')

  await store.fetchLogs(startDate, endDate)

  if (store.logs.length === 0) {
    message.info('所选日期范围内没有找到提交记录')
  } else {
    message.success(`成功获取 ${store.logs.length} 条提交记录`)
  }
}
</script>

<style scoped>
.control-panel {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.quick-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.quick-buttons .ant-btn {
  flex: 1;
}

.date-range-picker {
  margin-bottom: 12px;
}

.generate-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
}

.selected-info {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #666;
}
</style>
