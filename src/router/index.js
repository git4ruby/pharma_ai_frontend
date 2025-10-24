import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('@/views/auth/Signup.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('@/views/Documents.vue')
      },
      {
        path: 'upload',
        name: 'Upload',
        component: () => import('@/views/UploadDocument.vue')
      },
      {
        path: 'queries',
        name: 'Queries',
        component: () => import('@/views/Queries.vue')
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/Users.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/analytics',
        name: 'AdminAnalytics',
        component: () => import('@/views/admin/Analytics.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/audit-logs',
        name: 'AdminAuditLogs',
        component: () => import('@/views/admin/AuditLogs.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/compliance',
        name: 'AdminCompliance',
        component: () => import('@/views/admin/Compliance.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/background-jobs',
        name: 'AdminBackgroundJobs',
        component: () => import('@/views/admin/BackgroundJobs.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'query-audit',
        name: 'QueryAudit',
        component: () => import('@/views/QueryAudit.vue'),
        meta: { requiresAuditor: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // If user is authenticated but user data not loaded, fetch it first
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchCurrentUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
  } else if (to.meta.requiresAuditor && !['admin', 'auditor'].includes(authStore.user?.role)) {
    next('/')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
