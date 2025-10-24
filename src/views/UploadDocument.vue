<template>
  <div class="upload-page">
    <div class="page-header">
      <h1>Upload Document</h1>
      <p>Upload pharmaceutical documents for AI processing and Q&A</p>
    </div>

    <div class="upload-info">
      <div class="guidelines-header">
        <h3>📋 Upload Guidelines</h3>
        <button type="button" @click="showGuidelines = !showGuidelines" class="toggle-guidelines-btn">
          {{ showGuidelines ? 'Hide' : 'Show' }}
        </button>
      </div>
      <div v-show="showGuidelines" class="guidelines-grid">
        <div class="guideline-section">
          <h4>📁 Classification Levels</h4>
          <ul>
            <li><strong>Public:</strong> Published research, drug information, medical knowledge. Accessible to all users.</li>
            <li><strong>Confidential:</strong> Unpublished research, proprietary data. Accessible to all researchers for collaboration.</li>
            <li><strong>Restricted:</strong> Highly sensitive data. Currently treated same as Confidential.</li>
          </ul>
        </div>

        <div class="guideline-section">
          <h4>🔒 PHI (Protected Health Information)</h4>
          <p><strong>Check "Contains PHI" if document includes:</strong></p>
          <ul>
            <li>Patient names, addresses, or contact information</li>
            <li>Medical record numbers or health plan beneficiary numbers</li>
            <li>Social Security numbers or biometric identifiers</li>
            <li>Any of the 18 HIPAA PHI identifiers</li>
          </ul>
          <p class="warning-text">⚠️ PHI documents are only accessible by the uploader and administrators for HIPAA compliance.</p>
        </div>

        <div class="guideline-section">
          <h4>⚡ Processing</h4>
          <ul>
            <li>Documents are processed with AI for semantic search</li>
            <li>Processing time depends on document size</li>
            <li>You'll be notified when processing completes</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="upload-container">
      <form @submit.prevent="handleUpload" class="upload-form">
        <h2 class="form-title">📤 Upload Documents</h2>

        <div class="form-group">
          <label for="file">Select File(s)</label>
          <div class="file-drop-zone" @dragover.prevent @drop.prevent="handleDrop">
            <input
              id="file"
              type="file"
              @change="handleFileChange"
              accept=".pdf,.docx,.txt"
              multiple
              required
              class="file-input-hidden"
            />
            <label for="file" class="file-drop-label">
              <span class="file-icon">📁</span>
              <span class="file-text">
                <span><strong>Click to browse</strong> or drag and drop files here</span>
                <small>PDF, DOCX, TXT • Max 50MB per file</small>
              </span>
            </label>
          </div>

          <div v-if="selectedFiles.length > 0" class="files-list">
            <div class="files-header">
              <span><strong>{{ selectedFiles.length }}</strong> file(s) selected</span>
              <button type="button" @click="clearFiles" class="clear-btn">Clear All</button>
            </div>
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <div class="file-icon">📄</div>
              <div class="file-details">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.size) }}</div>
              </div>
              <button type="button" @click="removeFile(index)" class="remove-btn" title="Remove file">×</button>
            </div>
          </div>
        </div>

        <div v-if="selectedFiles.length > 1" class="batch-notice">
          <div class="batch-icon">📦</div>
          <div>
            <strong>Batch Upload Mode</strong>
            <p>All {{ selectedFiles.length }} selected files will share the same classification and PHI settings below.</p>
          </div>
        </div>

        <div class="settings-section">
          <h3>Document Settings</h3>

          <div class="form-group">
            <label>Classification Level</label>
            <div class="radio-group-modern">
              <label class="radio-card" :class="{ active: formData.classification === 'public' }">
                <input
                  type="radio"
                  v-model="formData.classification"
                  value="public"
                />
                <div class="radio-content">
                  <span class="radio-icon">🌐</span>
                  <span class="radio-label">Public</span>
                </div>
              </label>
              <label class="radio-card" :class="{ active: formData.classification === 'confidential' }">
                <input
                  type="radio"
                  v-model="formData.classification"
                  value="confidential"
                />
                <div class="radio-content">
                  <span class="radio-icon">🔒</span>
                  <span class="radio-label">Confidential</span>
                </div>
              </label>
              <label class="radio-card" :class="{ active: formData.classification === 'restricted' }">
                <input
                  type="radio"
                  v-model="formData.classification"
                  value="restricted"
                />
                <div class="radio-content">
                  <span class="radio-icon">⚠️</span>
                  <span class="radio-label">Restricted</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <div class="toggle-wrapper">
              <label class="toggle-label">
                <span class="toggle-text">
                  <strong>Contains PHI</strong>
                  <small>Protected Health Information</small>
                </span>
                <input
                  type="checkbox"
                  v-model="formData.contains_phi"
                  class="toggle-checkbox"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ successMessage }}
        </div>

        <div v-if="loading" class="upload-progress">
          <div class="progress-text">Uploading {{ uploadedCount }} of {{ selectedFiles.length }} files...</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="loading || selectedFiles.length === 0">
            {{ loading ? 'Uploading...' : `Upload ${selectedFiles.length} Document${selectedFiles.length !== 1 ? 's' : ''}` }}
          </button>
          <router-link to="/documents" class="btn-secondary">
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { documentService } from '@/services/api'

const router = useRouter()

const formData = ref({
  classification: 'confidential',
  contains_phi: false
})

const selectedFiles = ref([])
const loading = ref(false)
const error = ref('')
const success = ref(false)
const successMessage = ref('')
const uploadProgress = ref(0)
const uploadedCount = ref(0)
const showGuidelines = ref(true)

function handleFileChange(event) {
  const files = Array.from(event.target.files)
  const validFiles = []
  const invalidFiles = []

  for (const file of files) {
    if (file.size > 50 * 1024 * 1024) {
      invalidFiles.push(file.name)
      continue
    }
    validFiles.push(file)
  }

  selectedFiles.value = validFiles

  if (invalidFiles.length > 0) {
    error.value = `${invalidFiles.length} file(s) exceed 50MB limit: ${invalidFiles.join(', ')}`
  } else {
    error.value = ''
  }
}

function removeFile(index) {
  selectedFiles.value.splice(index, 1)
  if (selectedFiles.value.length === 0) {
    error.value = ''
  }
}

function clearFiles() {
  selectedFiles.value = []
  error.value = ''
  document.getElementById('file').value = ''
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function handleDrop(event) {
  const files = Array.from(event.dataTransfer.files)
  const validFiles = []
  const invalidFiles = []

  for (const file of files) {
    if (file.size > 50 * 1024 * 1024) {
      invalidFiles.push(file.name)
      continue
    }
    validFiles.push(file)
  }

  selectedFiles.value = validFiles

  if (invalidFiles.length > 0) {
    error.value = `${invalidFiles.length} file(s) exceed 50MB limit: ${invalidFiles.join(', ')}`
  } else {
    error.value = ''
  }
}

async function handleUpload() {
  if (selectedFiles.value.length === 0) {
    error.value = 'Please select at least one file'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false
  uploadedCount.value = 0
  uploadProgress.value = 0

  const failedFiles = []

  try {
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]

      // Generate title from filename (remove extension)
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')

      try {
        await documentService.upload(
          file,
          title,
          formData.value.contains_phi,
          formData.value.classification
        )

        uploadedCount.value++
        uploadProgress.value = Math.round((uploadedCount.value / selectedFiles.value.length) * 100)
      } catch (err) {
        const errorMsg = err.response?.data?.status?.message || err.message || 'Unknown error'
        failedFiles.push({ name: file.name, error: errorMsg })
        console.error(`Failed to upload ${file.name}:`, err)
      }
    }

    if (failedFiles.length === 0) {
      success.value = true
      successMessage.value = `Successfully uploaded ${uploadedCount.value} document${uploadedCount.value !== 1 ? 's' : ''}! Processing will begin shortly.`

      setTimeout(() => {
        router.push('/documents')
      }, 2000)
    } else {
      error.value = `Uploaded ${uploadedCount.value} of ${selectedFiles.value.length} documents.\n\nFailed uploads:\n${failedFiles.map(f => `• ${f.name}: ${f.error}`).join('\n')}`
    }
  } catch (err) {
    error.value = 'Upload failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upload-page {
  padding: 32px;
  max-width: 1200px;
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

.upload-info {
  background: white;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  max-width: 1200px;
}

.upload-info h3 {
  font-size: 18px;
  margin: 0;
  color: #1a202c;
}

.guidelines-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toggle-guidelines-btn {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle-guidelines-btn:hover {
  background: #5568d3;
}

.guidelines-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.upload-container {
  display: block;
}

.upload-form {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f7fafc;
}

.form-group {
  margin-bottom: 28px;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  color: #1a202c;
  font-weight: 600;
  font-size: 14px;
}

.file-input-hidden {
  display: none;
}

.file-drop-zone {
  position: relative;
  margin-bottom: 16px;
}

.file-drop-label {
  display: flex !important;
  align-items: center !important;
  gap: 28px !important;
  padding: 14px 20px !important;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.3s;
}

.file-drop-label:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.file-icon {
  font-size: 54px !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
}

.file-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: #2d3748;
  line-height: 1.3;
}

.file-text small {
  font-size: 12px;
  color: #718096;
  line-height: 1.3;
}

.files-list {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #4a5568;
}

.clear-btn {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 12px;
  font-weight: 500;
  border-radius: 4px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #fed7d7;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f7fafc;
  transition: background 0.2s;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #f7fafc;
}

.file-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.remove-btn {
  background: #fff5f5;
  border: none;
  color: #e53e3e;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 10px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #fed7d7;
  color: #c53030;
}

.batch-notice {
  display: flex;
  gap: 16px;
  background: linear-gradient(135deg, #f0f4ff 0%, #edf2f7 100%);
  border-left: 4px solid #667eea;
  padding: 16px 20px;
  margin-bottom: 32px;
  border-radius: 8px;
  color: #2d3748;
  font-size: 14px;
}

.batch-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.batch-notice strong {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
  color: #1a202c;
}

.batch-notice p {
  margin: 0;
  color: #4a5568;
  font-size: 13px;
  line-height: 1.6;
}

.settings-section {
  background: #f7fafc;
  padding: 24px;
  border-radius: 10px;
  margin-bottom: 24px;
}

.settings-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 20px;
}

.upload-progress {
  margin-bottom: 20px;
}

.progress-text {
  margin-bottom: 8px;
  color: #4a5568;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.radio-group-modern {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.radio-card {
  position: relative;
  display: block;
  cursor: pointer;
}

.radio-card input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.radio-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.3s;
}

.radio-card:hover .radio-content {
  border-color: #cbd5e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.radio-card.active .radio-content {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.radio-icon {
  font-size: 28px;
}

.radio-label {
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
}

.toggle-wrapper {
  position: relative;
  width: calc((100% - 24px) / 3);
}

.toggle-label {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 16px;
  cursor: pointer;
  padding: 12px 18px !important;
  background: white;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
  position: relative;
}

.toggle-label:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.toggle-text strong {
  font-size: 14px;
  color: #1a202c;
  line-height: 1.3;
}

.toggle-text small {
  font-size: 12px;
  color: #718096;
  line-height: 1.3;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  background: #cbd5e0;
  border-radius: 34px;
  transition: background 0.3s;
  flex-shrink: 0;
}

.toggle-slider:before {
  content: "";
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-checkbox:checked ~ .toggle-slider {
  background: #667eea;
}

.toggle-checkbox:checked ~ .toggle-slider:before {
  transform: translateX(24px);
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  white-space: pre-line;
}

.success-message {
  background: #c6f6d5;
  color: #22543d;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: white;
  color: #1a202c;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.guideline-section {
  padding: 0;
}

.guideline-section h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2d3748;
}

.guideline-section p {
  font-size: 13px;
  color: #4a5568;
  margin: 8px 0;
  line-height: 1.6;
}

.guideline-section ul {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.guideline-section li {
  padding: 6px 0;
  color: #4a5568;
  font-size: 13px;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.guideline-section li:before {
  content: "•";
  position: absolute;
  left: 6px;
  color: #667eea;
  font-weight: bold;
}

.warning-text {
  background: #fff5f5;
  border-left: 3px solid #fc8181;
  padding: 10px 12px;
  margin-top: 12px;
  border-radius: 4px;
  color: #742a2a;
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .guidelines-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .upload-form {
    max-width: 100%;
  }
}
</style>
