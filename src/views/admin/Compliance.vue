<template>
  <div class="admin-compliance">
    <h1>HIPAA Compliance Status</h1>
    <p>Security and compliance monitoring dashboard</p>

    <div class="compliance-score">
      <div class="score-circle">
        <div class="score-value">{{ data?.compliance_score || 0 }}%</div>
        <div class="score-label">Compliance Score</div>
      </div>
    </div>

    <div class="compliance-sections">
      <div class="section">
        <h2>HIPAA Compliance</h2>
        <div class="checklist">
          <div class="check-item" :class="{active: data?.hipaa_compliance?.encryption_at_rest}">
            <span class="check-icon">{{ data?.hipaa_compliance?.encryption_at_rest ? '✅' : '❌' }}</span>
            <span>Encryption at Rest</span>
          </div>
          <div class="check-item" :class="{active: data?.hipaa_compliance?.encryption_in_transit}">
            <span class="check-icon">{{ data?.hipaa_compliance?.encryption_in_transit ? '✅' : '❌' }}</span>
            <span>Encryption in Transit</span>
          </div>
          <div class="check-item" :class="{active: data?.hipaa_compliance?.audit_logging}">
            <span class="check-icon">{{ data?.hipaa_compliance?.audit_logging ? '✅' : '❌' }}</span>
            <span>Audit Logging</span>
          </div>
          <div class="check-item" :class="{active: data?.hipaa_compliance?.session_timeout}">
            <span class="check-icon">{{ data?.hipaa_compliance?.session_timeout ? '✅' : '❌' }}</span>
            <span>Session Timeout</span>
          </div>
          <div class="check-item" :class="{active: data?.hipaa_compliance?.access_control}">
            <span class="check-icon">{{ data?.hipaa_compliance?.access_control ? '✅' : '❌' }}</span>
            <span>Role-Based Access Control</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Security Measures</h2>
        <div class="checklist">
          <div class="check-item" :class="{active: data?.security_measures?.rate_limiting}">
            <span class="check-icon">{{ data?.security_measures?.rate_limiting ? '✅' : '❌' }}</span>
            <span>Rate Limiting</span>
          </div>
          <div class="check-item" :class="{active: data?.security_measures?.security_headers}">
            <span class="check-icon">{{ data?.security_measures?.security_headers ? '✅' : '❌' }}</span>
            <span>Security Headers</span>
          </div>
          <div class="check-item" :class="{active: data?.security_measures?.csrf_protection}">
            <span class="check-icon">{{ data?.security_measures?.csrf_protection ? '✅' : '❌' }}</span>
            <span>CSRF Protection</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Recent Security Events</h2>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Failed Logins (24h)</span>
            <span class="stat-value">{{ data?.recent_security_events?.failed_login_attempts_24h || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Successful Logins (24h)</span>
            <span class="stat-value">{{ data?.recent_security_events?.successful_logins_24h || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Documents Uploaded (24h)</span>
            <span class="stat-value">{{ data?.recent_security_events?.documents_uploaded_24h || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/api'

const data = ref(null)

onMounted(async () => {
  const res = await adminService.getComplianceStatus()
  data.value = res.data
})
</script>

<style scoped>
.admin-compliance { padding: 32px; }
h1 { margin-bottom: 8px; }
p { color: #718096; margin-bottom: 32px; }
.compliance-score { text-align: center; margin-bottom: 48px; }
.score-circle { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 48px; border-radius: 50%; }
.score-value { font-size: 48px; font-weight: 700; }
.score-label { font-size: 14px; opacity: 0.9; }
.compliance-sections { display: grid; gap: 24px; }
.section { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.section h2 { font-size: 18px; margin-bottom: 16px; }
.checklist { display: flex; flex-direction: column; gap: 12px; }
.check-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f7fafc; border-radius: 8px; }
.check-item.active { background: #c6f6d5; }
.check-icon { font-size: 18px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-item { padding: 16px; background: #f7fafc; border-radius: 8px; }
.stat-label { display: block; font-size: 13px; color: #718096; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: 700; color: #1a202c; }
</style>
