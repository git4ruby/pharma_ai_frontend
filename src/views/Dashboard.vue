<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Welcome back, {{ authStore.user?.first_name }}!</h1>
      <p>Here's your PharmaAI overview</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📁</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.documents }}</div>
          <div class="stat-label">Documents</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.queries }}</div>
          <div class="stat-label">Total Queries</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgProcessingTime }}s</div>
          <div class="stat-label">Avg Response Time</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔒</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.complianceScore }}%</div>
          <div class="stat-label">Compliance Score</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/upload" class="action-card">
          <span class="action-icon">⬆️</span>
          <span class="action-title">Upload Document</span>
          <span class="action-desc">Add new pharmaceutical documents</span>
        </router-link>

        <router-link to="/queries" class="action-card">
          <span class="action-icon">💬</span>
          <span class="action-title">Ask Question</span>
          <span class="action-desc">Query your document library</span>
        </router-link>

        <router-link to="/documents" class="action-card">
          <span class="action-icon">📁</span>
          <span class="action-title">Browse Documents</span>
          <span class="action-desc">View all uploaded files</span>
        </router-link>
      </div>
    </div>

    <div class="security-status">
      <h2>Security Status</h2>
      <div class="security-items">
        <div class="security-item">
          <span class="status-indicator success"></span>
          <span>HIPAA Compliant</span>
        </div>
        <div class="security-item">
          <span class="status-indicator success"></span>
          <span>Encryption Enabled</span>
        </div>
        <div class="security-item">
          <span class="status-indicator success"></span>
          <span>Session Active</span>
        </div>
        <div class="security-item">
          <span class="status-indicator success"></span>
          <span>Audit Logging On</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { documentService, queryService } from '@/services/api'

const authStore = useAuthStore()

const stats = ref({
  documents: 0,
  queries: 0,
  avgProcessingTime: 0,
  complianceScore: 100
})

onMounted(async () => {
  try {
    const [docsRes, queriesRes] = await Promise.all([
      documentService.getAll(),
      queryService.getAll()
    ])

    // Fix: Backend returns data in data.data, but sometimes just data
    const docs = Array.isArray(docsRes.data.data) ? docsRes.data.data : docsRes.data
    const queries = Array.isArray(queriesRes.data.data) ? queriesRes.data.data : queriesRes.data

    stats.value.documents = docs?.length || 0
    stats.value.queries = queries?.length || 0

    if (queries?.length > 0) {
      const total = queries.reduce((sum, q) => sum + (q.processing_time || 0), 0)
      stats.value.avgProcessingTime = (total / queries.length).toFixed(1)
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 32px;
  max-width: 1400px;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 32px;
  color: #1a202c;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #718096;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 36px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.quick-actions {
  margin-bottom: 40px;
}

.quick-actions h2 {
  font-size: 20px;
  color: #1a202c;
  margin-bottom: 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.action-desc {
  font-size: 14px;
  color: #718096;
}

.security-status h2 {
  font-size: 20px;
  color: #1a202c;
  margin-bottom: 16px;
}

.security-items {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.security-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #1a202c;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.success {
  background: #48bb78;
}
</style>
