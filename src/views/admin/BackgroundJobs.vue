<template>
  <div class="background-jobs">
    <div class="page-header">
      <h1>Background Jobs Monitor</h1>
      <button @click="refreshData" class="btn-refresh" :disabled="loading">
        <span v-if="!loading">🔄 Refresh</span>
        <span v-else>Loading...</span>
      </button>
    </div>

    <!-- Overall Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Processed</div>
        <div class="stat-value">{{ stats.processed?.toLocaleString() || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Failed Jobs</div>
        <div class="stat-value error">{{ stats.failed?.toLocaleString() || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Enqueued</div>
        <div class="stat-value">{{ stats.enqueued?.toLocaleString() || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Retrying</div>
        <div class="stat-value warning">{{ stats.retry_size || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Scheduled</div>
        <div class="stat-value">{{ stats.scheduled_size || 0 }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Workers</div>
        <div class="stat-value">{{ stats.workers_size || 0 }}</div>
      </div>
    </div>

    <!-- Document Processing Stats -->
    <div class="section">
      <h2>Document Processing</h2>
      <div class="doc-stats">
        <div class="doc-stat">
          <span class="label">Total:</span>
          <span class="value">{{ documentStats.total || 0 }}</span>
        </div>
        <div class="doc-stat pending">
          <span class="label">Pending:</span>
          <span class="value">{{ documentStats.pending || 0 }}</span>
        </div>
        <div class="doc-stat processing">
          <span class="label">Processing:</span>
          <span class="value">{{ documentStats.processing || 0 }}</span>
        </div>
        <div class="doc-stat completed">
          <span class="label">Completed:</span>
          <span class="value">{{ documentStats.completed || 0 }}</span>
        </div>
        <div class="doc-stat failed">
          <span class="label">Failed:</span>
          <span class="value">{{ documentStats.failed || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Queues -->
    <div class="section">
      <h2>Queues</h2>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Queue Name</th>
              <th>Size</th>
              <th>Latency (seconds)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="queue in queues" :key="queue.name">
              <td><strong>{{ queue.name }}</strong></td>
              <td>{{ queue.size }}</td>
              <td>{{ queue.latency }}</td>
            </tr>
            <tr v-if="queues.length === 0">
              <td colspan="3" class="no-data">No queues found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Failed Jobs -->
    <div class="section">
      <h2>Failed Jobs ({{ failedJobs.retry_jobs?.length || 0 }} retrying, {{ failedJobs.dead_jobs?.length || 0 }} dead)</h2>

      <div v-if="failedJobs.retry_jobs && failedJobs.retry_jobs.length > 0">
        <h3>Retrying</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job Class</th>
                <th>Error</th>
                <th>Failed At</th>
                <th>Retry Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in failedJobs.retry_jobs" :key="job.jid">
                <td><code>{{ job.class }}</code></td>
                <td class="error-message">
                  <strong>{{ job.error_class }}</strong>: {{ job.error_message }}
                </td>
                <td>{{ formatDate(job.failed_at) }}</td>
                <td>{{ job.retry_count }}</td>
                <td>
                  <button @click="retryJob(job.jid)" class="btn-action retry">Retry Now</button>
                  <button @click="deleteJob(job.jid)" class="btn-action delete">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="failedJobs.dead_jobs && failedJobs.dead_jobs.length > 0" style="margin-top: 2rem;">
        <h3>Dead (Exceeded Retry Limit)</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Job Class</th>
                <th>Error</th>
                <th>Failed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in failedJobs.dead_jobs" :key="job.jid">
                <td><code>{{ job.class }}</code></td>
                <td class="error-message">
                  <strong>{{ job.error_class }}</strong>: {{ job.error_message }}
                </td>
                <td>{{ formatDate(job.failed_at) }}</td>
                <td>
                  <button @click="deleteJob(job.jid)" class="btn-action delete">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="(!failedJobs.retry_jobs || failedJobs.retry_jobs.length === 0) && (!failedJobs.dead_jobs || failedJobs.dead_jobs.length === 0)" class="no-failed">
        ✅ No failed jobs
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="section">
      <h2>Recent Activity</h2>
      <div class="activity-grid">
        <div class="activity-section">
          <h3>Recent Completions</h3>
          <ul class="activity-list" v-if="documentStats.recent_completions && documentStats.recent_completions.length > 0">
            <li v-for="doc in documentStats.recent_completions" :key="doc.id">
              <span class="doc-title">{{ doc.title }}</span>
              <span class="doc-time">{{ formatDate(doc.processed_at) }}</span>
            </li>
          </ul>
          <p v-else class="no-data">No recent completions</p>
        </div>
        <div class="activity-section">
          <h3>Recent Failures</h3>
          <ul class="activity-list error" v-if="documentStats.recent_failures && documentStats.recent_failures.length > 0">
            <li v-for="doc in documentStats.recent_failures" :key="doc.id">
              <span class="doc-title">{{ doc.title }}</span>
              <span class="doc-time">{{ formatDate(doc.failed_at) }}</span>
            </li>
          </ul>
          <p v-else class="no-data">No recent failures</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const loading = ref(false)
const stats = ref({})
const queues = ref([])
const failedJobs = ref({})
const documentStats = ref({})
const authStore = useAuthStore()

const API_BASE = 'http://localhost:3000/api/admin/background_jobs'

// Configure axios with auth token
const axiosConfig = {
  headers: {
    'Authorization': `Bearer ${authStore.token}`
  }
}

async function fetchStats() {
  try {
    const response = await axios.get(`${API_BASE}/stats`, axiosConfig)
    stats.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

async function fetchQueues() {
  try {
    const response = await axios.get(`${API_BASE}/queues`, axiosConfig)
    queues.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch queues:', error)
  }
}

async function fetchFailedJobs() {
  try {
    const response = await axios.get(`${API_BASE}/failed`, axiosConfig)
    failedJobs.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch failed jobs:', error)
  }
}

async function fetchDocumentStats() {
  try {
    const response = await axios.get(`${API_BASE}/document_stats`, axiosConfig)
    documentStats.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch document stats:', error)
  }
}

async function refreshData() {
  loading.value = true
  await Promise.all([
    fetchStats(),
    fetchQueues(),
    fetchFailedJobs(),
    fetchDocumentStats()
  ])
  loading.value = false
}

async function retryJob(jid) {
  if (!confirm('Retry this job?')) return

  try {
    await axios.post(`${API_BASE}/${jid}/retry`, {}, axiosConfig)
    alert('Job retried successfully')
    await refreshData()
  } catch (error) {
    alert('Failed to retry job: ' + error.message)
  }
}

async function deleteJob(jid) {
  if (!confirm('Delete this job permanently?')) return

  try {
    await axios.delete(`${API_BASE}/${jid}`, axiosConfig)
    alert('Job deleted successfully')
    await refreshData()
  } catch (error) {
    alert('Failed to delete job: ' + error.message)
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleString()
}

onMounted(() => {
  refreshData()
  // Auto-refresh every 30 seconds
  setInterval(refreshData, 30000)
})
</script>

<style scoped>
.background-jobs {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
}

.btn-refresh {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-refresh:hover:not(:disabled) {
  background: #5568d3;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 12px;
  color: #718096;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
}

.stat-value.error {
  color: #e53e3e;
}

.stat-value.warning {
  color: #dd6b20;
}

.section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.section h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #2d3748;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #4a5568;
}

.doc-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.doc-stat {
  padding: 12px 20px;
  background: #f7fafc;
  border-radius: 6px;
  border-left: 4px solid #cbd5e0;
}

.doc-stat.pending {
  border-left-color: #f6ad55;
}

.doc-stat.processing {
  border-left-color: #4299e1;
}

.doc-stat.completed {
  border-left-color: #48bb78;
}

.doc-stat.failed {
  border-left-color: #f56565;
}

.doc-stat .label {
  font-size: 14px;
  color: #718096;
  margin-right: 8px;
}

.doc-stat .value {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px;
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
  font-size: 12px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #2d3748;
}

.data-table code {
  background: #edf2f7;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}

.error-message {
  color: #c53030;
  font-size: 13px;
  max-width: 400px;
}

.no-data {
  text-align: center;
  color: #a0aec0;
  padding: 24px;
  font-style: italic;
}

.no-failed {
  text-align: center;
  padding: 32px;
  color: #48bb78;
  font-size: 18px;
  font-weight: 600;
}

.btn-action {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
}

.btn-action.retry {
  background: #48bb78;
  color: white;
}

.btn-action.retry:hover {
  background: #38a169;
}

.btn-action.delete {
  background: #fc8181;
  color: white;
}

.btn-action.delete:hover {
  background: #f56565;
}

.activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.activity-section {
  padding: 16px;
  background: #f7fafc;
  border-radius: 6px;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-list li {
  padding: 10px;
  margin-bottom: 8px;
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.activity-list.error li {
  border-left: 3px solid #fc8181;
}

.doc-title {
  font-weight: 500;
  color: #2d3748;
}

.doc-time {
  color: #718096;
  font-size: 12px;
}

@media (max-width: 768px) {
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
