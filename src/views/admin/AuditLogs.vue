<template>
  <div class="admin-audit-logs">
    <h1>Audit Logs</h1>
    <p>Complete audit trail for HIPAA compliance</p>

    <div class="logs-table">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>User</th>
            <th>IP Address</th>
            <th>Timestamp</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td><span class="action-badge">{{ log.action }}</span></td>
            <td>{{ log.user?.full_name || 'N/A' }}</td>
            <td>{{ log.ip_address }}</td>
            <td>{{ formatDateTime(log.created_at) }}</td>
            <td>
              <button v-if="log.metadata" @click="showDetails(log)" class="btn-link">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedLog" class="modal" @click.self="selectedLog = null">
      <div class="modal-content">
        <h2>Log Details</h2>
        <pre>{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
        <button @click="selectedLog = null" class="btn-primary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/api'

const logs = ref([])
const selectedLog = ref(null)

onMounted(async () => {
  const res = await adminService.getAuditLogs()
  logs.value = res.data.audit_logs
})

function formatDateTime(date) {
  return new Date(date).toLocaleString()
}

function showDetails(log) {
  selectedLog.value = log
}
</script>

<style scoped>
.admin-audit-logs { padding: 32px; }
h1 { margin-bottom: 8px; }
p { color: #718096; margin-bottom: 24px; }
.logs-table { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
.action-badge { padding: 4px 12px; background: #edf2f7; border-radius: 12px; font-size: 12px; font-family: monospace; }
.btn-link { color: #667eea; border: none; background: none; cursor: pointer; text-decoration: underline; }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 32px; border-radius: 12px; max-width: 600px; }
pre { background: #f7fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
.btn-primary { margin-top: 16px; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; }
</style>
