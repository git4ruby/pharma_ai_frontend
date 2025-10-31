import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const documentService = {
  async getAll() {
    const response = await api.get('/api/documents')
    return response.data
  },

  async upload(file, title, containsPhi, classification) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('contains_phi', containsPhi)
    formData.append('classification', classification)

    const response = await api.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/api/documents/${id}`)
    return response.data
  }
}

export const queryService = {
  async create(question) {
    const response = await api.post('/api/queries', { question })
    return response.data
  },

  async getAll() {
    const response = await api.get('/api/queries')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/api/queries/${id}`)
    return response.data
  }
}

export const adminService = {
  async getUsers() {
    const response = await api.get('/api/users')
    return response.data
  },

  async createUser(userData) {
    const response = await api.post('/api/users', { user: userData })
    return response.data
  },

  async updateUser(id, userData) {
    const response = await api.put(`/api/users/${id}`, { user: userData })
    return response.data
  },

  async deleteUser(id) {
    const response = await api.delete(`/api/users/${id}`)
    return response.data
  },

  async getAnalytics() {
    const response = await api.get('/api/analytics/dashboard')
    return response.data
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/api/audit-logs', { params })
    return response.data
  },

  async getComplianceStatus() {
    const response = await api.get('/api/compliance/status')
    return response.data
  },

  async importFromS3() {
    const response = await api.post('/api/admin/s3/import')
    return response.data
  }
}

export const queryAuditService = {
  async getAll(params = {}) {
    const response = await api.get('/api/query-audits', { params })
    return response.data
  },

  async getStatistics() {
    const response = await api.get('/api/query-audits/statistics')
    return response.data
  }
}
