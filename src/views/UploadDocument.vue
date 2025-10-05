<template>
  <div class="upload-page">
    <div class="page-header">
      <h1>Upload Document</h1>
      <p>Upload pharmaceutical documents for AI processing and Q&A</p>
    </div>

    <div class="upload-container">
      <form @submit.prevent="handleUpload" class="upload-form">
        <div class="form-group">
          <label for="title">Document Title</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            placeholder="e.g., Phase III Clinical Trial Results"
          />
        </div>

        <div class="form-group">
          <label for="file">Select File</label>
          <div class="file-input-wrapper">
            <input
              id="file"
              type="file"
              @change="handleFileChange"
              accept=".pdf,.docx,.txt"
              required
            />
            <div v-if="selectedFile" class="file-info">
              <span>📄 {{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
          </div>
          <small class="hint">Supported formats: PDF, DOCX, TXT (Max 50MB)</small>
        </div>

        <div class="form-group">
          <label>Classification</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                v-model="formData.classification"
                value="public"
              />
              <span>Public</span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                v-model="formData.classification"
                value="confidential"
              />
              <span>Confidential</span>
            </label>
            <label class="radio-option">
              <input
                type="radio"
                v-model="formData.classification"
                value="restricted"
              />
              <span>Restricted</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.contains_phi"
            />
            <span>Contains PHI (Protected Health Information)</span>
          </label>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          Document uploaded successfully! Processing will begin shortly.
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="loading || !selectedFile">
            {{ loading ? 'Uploading...' : 'Upload Document' }}
          </button>
          <router-link to="/documents" class="btn-secondary">
            Cancel
          </router-link>
        </div>
      </form>

      <div class="upload-info">
        <h3>📋 Upload Guidelines</h3>
        <ul>
          <li>Ensure documents are pharmaceutical research-related</li>
          <li>Mark PHI appropriately for HIPAA compliance</li>
          <li>Select correct classification level</li>
          <li>Documents are processed with AI for semantic search</li>
          <li>Processing time depends on document size</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { documentService } from '@/services/api'

const router = useRouter()

const formData = ref({
  title: '',
  classification: 'confidential',
  contains_phi: false
})

const selectedFile = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 50 * 1024 * 1024) {
      error.value = 'File size must be less than 50MB'
      selectedFile.value = null
      return
    }
    selectedFile.value = file
    error.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleUpload() {
  if (!selectedFile.value) {
    error.value = 'Please select a file'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await documentService.upload(
      selectedFile.value,
      formData.value.title,
      formData.value.contains_phi,
      formData.value.classification
    )

    success.value = true

    setTimeout(() => {
      router.push('/documents')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.errors?.[0] || 'Upload failed. Please try again.'
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

.upload-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

.upload-form {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #1a202c;
  font-weight: 500;
  font-size: 14px;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
}

.file-input-wrapper input[type="file"] {
  width: 100%;
  padding: 12px;
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
}

.file-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 6px;
}

.file-size {
  color: #718096;
  font-size: 13px;
}

.hint {
  display: block;
  margin-top: 6px;
  color: #718096;
  font-size: 12px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
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

.upload-info {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.upload-info h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #1a202c;
}

.upload-info ul {
  list-style: none;
  padding: 0;
}

.upload-info li {
  padding: 8px 0;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.upload-info li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #48bb78;
  font-weight: bold;
}

@media (max-width: 900px) {
  .upload-container {
    grid-template-columns: 1fr;
  }
}
</style>
