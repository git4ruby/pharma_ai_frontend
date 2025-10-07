<template>
  <div class="query-audit-page">
    <div class="page-header">
      <div>
        <h1>Query Audit & Monitoring</h1>
        <p>Monitor all system queries for compliance and security</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics" class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Queries</div>
        <div class="stat-value">{{ statistics.total_queries }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Today</div>
        <div class="stat-value">{{ statistics.queries_today }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">This Week</div>
        <div class="stat-value">{{ statistics.queries_this_week }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Processing Time</div>
        <div class="stat-value">{{ statistics.average_processing_time }}s</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filter-group">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search questions..."
          class="filter-input"
          @input="debouncedSearch"
        />
      </div>

      <div class="filter-group">
        <select v-model="filters.status" @change="applyFilters" class="filter-select">
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div class="filter-group">
        <input
          v-model="filters.startDate"
          type="date"
          class="filter-input"
          @change="applyFilters"
        />
        <span class="filter-separator">to</span>
        <input
          v-model="filters.endDate"
          type="date"
          class="filter-input"
          @change="applyFilters"
        />
      </div>

      <button @click="clearFilters" class="btn-secondary">Clear Filters</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">Loading query audit data...</div>

    <!-- Query List -->
    <div v-else-if="queries.length > 0" class="queries-list">
      <div v-for="query in queries" :key="query.id" class="query-audit-item">
        <div class="query-header">
          <div class="query-user">
            <span class="user-name">{{ query.user.full_name }}</span>
            <span class="user-email">({{ query.user.email }})</span>
            <span :class="['role-badge', query.user.role]">{{ query.user.role }}</span>
          </div>
          <div class="query-meta">
            <span class="query-date">{{ formatDate(query.created_at) }}</span>
            <span :class="['status-badge', query.status]">{{ query.status }}</span>
          </div>
        </div>

        <div class="query-content">
          <div class="question-section">
            <strong>Question:</strong>
            <p>{{ query.question }}</p>
          </div>

          <div v-if="query.answer" class="answer-section">
            <strong>Answer:</strong>
            <p>{{ query.answer }}</p>
          </div>

          <div class="query-details">
            <div class="detail-item">
              <span class="detail-label">Processing Time:</span>
              <span>{{ query.processing_time ? query.processing_time + 's' : 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Citations:</span>
              <span>{{ query.citation_count }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Documents Accessed:</span>
              <span>{{ query.documents_accessed.length }}</span>
            </div>
          </div>

          <div v-if="query.documents_accessed.length > 0" class="documents-accessed">
            <strong>Documents Accessed:</strong>
            <div class="document-tags">
              <span
                v-for="doc in query.documents_accessed"
                :key="doc.id"
                class="document-tag"
              >
                {{ doc.title }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2>No queries found</h2>
      <p>No queries match your current filters</p>
    </div>

    <!-- Pagination -->
    <div v-if="meta && meta.total_pages > 1" class="pagination">
      <button
        @click="changePage(meta.page - 1)"
        :disabled="meta.page === 1"
        class="btn-page"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ meta.page }} of {{ meta.total_pages }}
      </span>
      <button
        @click="changePage(meta.page + 1)"
        :disabled="meta.page === meta.total_pages"
        class="btn-page"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { queryAuditService } from '@/services/api'

const queries = ref([])
const statistics = ref(null)
const loading = ref(true)
const meta = ref(null)

const filters = ref({
  search: '',
  status: '',
  startDate: '',
  endDate: '',
  page: 1
})

let searchTimeout = null

onMounted(async () => {
  await Promise.all([fetchQueries(), fetchStatistics()])
})

async function fetchQueries() {
  try {
    loading.value = true
    const params = {
      page: filters.value.page,
      per_page: 20
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.startDate) params.start_date = filters.value.startDate
    if (filters.value.endDate) params.end_date = filters.value.endDate

    const response = await queryAuditService.getAll(params)
    queries.value = response.data || []
    meta.value = response.meta
  } catch (error) {
    console.error('Failed to fetch query audit data:', error)
  } finally {
    loading.value = false
  }
}

async function fetchStatistics() {
  try {
    const response = await queryAuditService.getStatistics()
    statistics.value = response.data
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    applyFilters()
  }, 500)
}

function applyFilters() {
  filters.value.page = 1
  fetchQueries()
}

function clearFilters() {
  filters.value = {
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1
  }
  fetchQueries()
}

function changePage(page) {
  filters.value.page = page
  fetchQueries()
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.query-audit-page {
  padding: 32px;
  max-width: 1400px;
}

.page-header {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a202c;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-input,
.filter-select {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.filter-input {
  min-width: 200px;
}

.filter-separator {
  color: #718096;
  font-size: 14px;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #f7fafc;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #718096;
}

.queries-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.query-audit-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.query-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 600;
  color: #1a202c;
}

.user-email {
  color: #718096;
  font-size: 14px;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.admin {
  background: #fef5e7;
  color: #c27803;
}

.role-badge.doctor {
  background: #e1f5fe;
  color: #0277bd;
}

.role-badge.researcher {
  background: #f3e5f5;
  color: #7b1fa2;
}

.role-badge.auditor {
  background: #e8f5e9;
  color: #2e7d32;
}

.query-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.query-date {
  color: #718096;
  font-size: 14px;
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

.query-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-section,
.answer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-section strong,
.answer-section strong {
  color: #4a5568;
  font-size: 14px;
}

.question-section p,
.answer-section p {
  color: #1a202c;
  line-height: 1.6;
}

.query-details {
  display: flex;
  gap: 24px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
  font-size: 14px;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-label {
  color: #718096;
  font-weight: 500;
}

.documents-accessed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.documents-accessed strong {
  color: #4a5568;
  font-size: 14px;
}

.document-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.document-tag {
  padding: 6px 12px;
  background: #edf2f7;
  border-radius: 6px;
  font-size: 13px;
  color: #2d3748;
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
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.btn-page {
  padding: 10px 20px;
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f7fafc;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #4a5568;
  font-size: 14px;
}
</style>
