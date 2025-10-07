<template>
  <div class="documents-page">
    <div class="page-header">
      <div>
        <h1>Document Library</h1>
        <p>View and manage your uploaded documents</p>
      </div>
      <router-link to="/upload" class="btn-primary">
        ⬆️ Upload New
      </router-link>
    </div>

    <div v-if="loading" class="loading">
      Loading documents...
    </div>

    <div v-else-if="documents.length === 0" class="empty-state">
      <div class="empty-icon">📁</div>
      <h2>No documents yet</h2>
      <p>Upload your first pharmaceutical document to get started</p>
      <router-link to="/upload" class="btn-primary">
        Upload Document
      </router-link>
    </div>

    <div v-else class="documents-grid">
      <div v-for="doc in documents" :key="doc.id" class="document-card">
        <div class="document-header">
          <div class="document-icon">
            {{ getFileIcon(doc.file_type) }}
          </div>
          <div class="document-info">
            <h3>{{ doc.title }}</h3>
            <p class="document-filename">{{ doc.filename }}</p>
          </div>
        </div>

        <div class="document-meta">
          <div class="meta-item">
            <span class="meta-label">Status:</span>
            <span :class="['status-badge', doc.status]">
              {{ doc.status }}
            </span>
          </div>

          <div class="meta-item">
            <span class="meta-label">Classification:</span>
            <span class="classification-badge">{{ doc.classification }}</span>
          </div>

          <div class="meta-item">
            <span class="meta-label">Size:</span>
            <span>{{ formatFileSize(doc.file_size) }}</span>
          </div>

          <div class="meta-item">
            <span class="meta-label">Uploaded:</span>
            <span>{{ formatDate(doc.created_at) }}</span>
          </div>

          <div v-if="doc.contains_phi" class="phi-badge">
            🔒 Contains PHI
          </div>
        </div>

        <div class="document-actions">
          <button
            v-if="canDelete"
            @click="handleDelete(doc.id)"
            class="btn-delete"
            :disabled="deleting === doc.id"
          >
            {{ deleting === doc.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { documentService } from '@/services/api'

const authStore = useAuthStore()
const documents = ref([])
const loading = ref(true)
const deleting = ref(null)

const canDelete = computed(() => authStore.isAdmin)

onMounted(async () => {
  await fetchDocuments()
})

async function fetchDocuments() {
  try {
    loading.value = true
    const response = await documentService.getAll()
    // Backend returns { status: {...}, data: [...] }
    // So we need response.data.data, but if data is already the array, use it directly
    const docs = Array.isArray(response.data.data) ? response.data.data : response.data
    documents.value = docs || []
  } catch (error) {
    console.error('Failed to fetch documents:', error)
  } finally {
    loading.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this document?')) {
    return
  }

  try {
    deleting.value = id
    await documentService.delete(id)
    documents.value = documents.value.filter(d => d.id !== id)
  } catch (error) {
    alert('Failed to delete document')
  } finally {
    deleting.value = null
  }
}

function getFileIcon(fileType) {
  if (fileType.includes('pdf')) return '📕'
  if (fileType.includes('word')) return '📘'
  if (fileType.includes('text')) return '📄'
  return '📁'
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.documents-page {
  padding: 32px;
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  color: #1a202c;
  margin-bottom: 8px;
}

.page-header p {
  color: #718096;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #718096;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h2 {
  font-size: 24px;
  color: #1a202c;
  margin-bottom: 8px;
}

.empty-state p {
  color: #718096;
  margin-bottom: 24px;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.document-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.document-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.document-icon {
  font-size: 36px;
}

.document-info h3 {
  font-size: 18px;
  color: #1a202c;
  margin-bottom: 4px;
}

.document-filename {
  font-size: 13px;
  color: #718096;
}

.document-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.meta-label {
  color: #718096;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.processing {
  background: #fef5e7;
  color: #c27803;
}

.status-badge.pending {
  background: #e2e8f0;
  color: #4a5568;
}

.status-badge.failed {
  background: #fed7d7;
  color: #c53030;
}

.classification-badge {
  padding: 4px 12px;
  background: #edf2f7;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.phi-badge {
  background: #fff5f7;
  color: #c53030;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.btn-delete {
  padding: 8px 16px;
  background: white;
  color: #c53030;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: #fff5f5;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
