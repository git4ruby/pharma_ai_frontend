<template>
  <div class="admin-analytics">
    <h1>Analytics Dashboard</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <div class="stat-value">{{ data?.overview?.total_users || 0 }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Documents</h3>
        <div class="stat-value">{{ data?.overview?.total_documents || 0 }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Queries</h3>
        <div class="stat-value">{{ data?.overview?.total_queries || 0 }}</div>
      </div>
      <div class="stat-card">
        <h3>Total Embeddings</h3>
        <div class="stat-value">{{ data?.overview?.total_embeddings || 0 }}</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h2>Users by Role</h2>
        <div v-for="(count, role) in data?.user_statistics?.by_role" :key="role" class="chart-row">
          <span class="chart-label">{{ role }}</span>
          <div class="chart-bar" :style="{width: (count / maxUsersByRole * 100) + '%'}"></div>
          <span class="chart-value">{{ count }}</span>
        </div>
      </div>

      <div class="chart-card">
        <h2>Documents by Status</h2>
        <div v-for="(count, status) in data?.document_statistics?.by_status" :key="status" class="chart-row">
          <span class="chart-label">{{ status }}</span>
          <div class="chart-bar" :style="{width: (count / maxDocsByStatus * 100) + '%'}"></div>
          <span class="chart-value">{{ count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/api'

const data = ref(null)

const maxUsersByRole = computed(() => {
  if (!data.value?.user_statistics?.by_role) return 1
  return Math.max(...Object.values(data.value.user_statistics.by_role))
})

const maxDocsByStatus = computed(() => {
  if (!data.value?.document_statistics?.by_status) return 1
  return Math.max(...Object.values(data.value.document_statistics.by_status))
})

onMounted(async () => {
  const res = await adminService.getAnalytics()
  data.value = res.data
})
</script>

<style scoped>
.admin-analytics { padding: 32px; }
h1 { margin-bottom: 24px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
.stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat-card h3 { font-size: 14px; color: #718096; margin-bottom: 8px; }
.stat-value { font-size: 32px; font-weight: 700; color: #1a202c; }
.charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.chart-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.chart-card h2 { font-size: 18px; margin-bottom: 20px; }
.chart-row { display: grid; grid-template-columns: 100px 1fr 50px; align-items: center; gap: 12px; margin-bottom: 12px; }
.chart-label { font-size: 13px; text-transform: capitalize; }
.chart-bar { height: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 4px; }
.chart-value { font-size: 14px; font-weight: 600; text-align: right; }
</style>
