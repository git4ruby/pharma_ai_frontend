<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="logo-link">
          <h2>PharmaAI</h2>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">
          <span class="icon">📊</span>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/documents" class="nav-item">
          <span class="icon">📁</span>
          <span>Documents</span>
        </router-link>

        <router-link to="/upload" class="nav-item">
          <span class="icon">⬆️</span>
          <span>Upload</span>
        </router-link>

        <router-link to="/queries" class="nav-item">
          <span class="icon">💬</span>
          <span>Q&A</span>
        </router-link>

        <router-link v-if="authStore.isAdmin || authStore.isAuditor" to="/query-audit" class="nav-item">
          <span class="icon">🔍</span>
          <span>Query Audit</span>
        </router-link>

        <div v-if="authStore.isAdmin" class="nav-divider"></div>
        <div v-if="authStore.isAdmin" class="nav-section">Admin</div>

        <router-link v-if="authStore.isAdmin" to="/admin/users" class="nav-item">
          <span class="icon">👥</span>
          <span>Users</span>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/admin/analytics" class="nav-item">
          <span class="icon">📈</span>
          <span>Analytics</span>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/admin/audit-logs" class="nav-item">
          <span class="icon">📋</span>
          <span>Audit Logs</span>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/admin/compliance" class="nav-item">
          <span class="icon">🔒</span>
          <span>Compliance</span>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="/admin/background-jobs" class="nav-item">
          <span class="icon">⚙️</span>
          <span>Background Jobs</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-name">{{ authStore.user?.full_name }}</div>
          <div class="user-role">{{ authStore.user?.role }}</div>
        </div>
        <button @click="handleLogout" class="btn-logout">
          Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="session-warning" v-if="authStore.sessionWarningShown">
        <div class="warning-content">
          <span>⚠️ Your session will expire in 2 minutes due to inactivity</span>
          <button @click="authStore.hideSessionWarning()">Dismiss</button>
        </div>
      </div>

      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchCurrentUser()
  }

  let inactivityTimer
  let warningTimer

  function resetTimers() {
    clearTimeout(inactivityTimer)
    clearTimeout(warningTimer)
    authStore.hideSessionWarning()

    warningTimer = setTimeout(() => {
      authStore.showSessionWarning()
    }, 13 * 60 * 1000)

    inactivityTimer = setTimeout(() => {
      authStore.logout()
      router.push('/login')
    }, 15 * 60 * 1000)
  }

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, resetTimers, true)
  })

  resetTimers()
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: #1a202c;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-link {
  text-decoration: none;
  cursor: pointer;
}

.sidebar-header h2 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-section {
  padding: 12px 20px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  color: #a0aec0;
  letter-spacing: 0.5px;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #cbd5e0;
  text-decoration: none;
  transition: all 0.2s;
  gap: 12px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.router-link-exact-active {
  background: rgba(102, 126, 234, 0.1);
  color: white;
  border-left: 3px solid #667eea;
}

.nav-item .icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  margin-bottom: 12px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  font-size: 12px;
  color: #a0aec0;
  text-transform: capitalize;
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.15);
}

.main-content {
  margin-left: 260px;
  flex: 1;
  background: #f7fafc;
  min-height: 100vh;
}

.session-warning {
  background: #fff3cd;
  border-bottom: 2px solid #ffc107;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.warning-content {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #856404;
}

.warning-content button {
  padding: 6px 16px;
  background: #ffc107;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: relative;
    height: auto;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
