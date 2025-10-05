<template>
  <div class="queries-page">
    <div class="page-header">
      <h1>Q&A Assistant</h1>
      <p>Ask questions about your pharmaceutical documents</p>
    </div>

    <div class="queries-container">
      <div class="chat-panel">
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="queries.length === 0" class="empty-chat">
            <div class="welcome-icon">💬</div>
            <h2>Welcome to PharmaAI Q&A</h2>
            <p>Ask any question about your uploaded documents</p>
            <ul class="example-questions">
              <li>What were the clinical trial results?</li>
              <li>What are the common adverse events?</li>
              <li>How does the drug work?</li>
            </ul>
          </div>

          <div
            v-for="query in sortedQueries"
            :key="query.id"
            class="message-group"
          >
            <div class="message user-message">
              <div class="message-header">
                <span class="message-icon">👤</span>
                <span class="message-author">You</span>
                <span class="message-time">{{ formatTime(query.created_at) }}</span>
              </div>
              <div class="message-content">{{ query.question }}</div>
            </div>

            <div v-if="query.status === 'completed'" class="message ai-message">
              <div class="message-header">
                <span class="message-icon">🤖</span>
                <span class="message-author">PharmaAI</span>
                <span class="message-time">{{ formatTime(query.queried_at) }}</span>
              </div>
              <div class="message-content">{{ query.answer }}</div>

              <div v-if="query.citations && query.citations.length > 0" class="citations">
                <div class="citations-header">📎 Sources:</div>
                <div class="citations-list">
                  <div
                    v-for="citation in query.citations"
                    :key="citation.id"
                    class="citation"
                  >
                    <div class="citation-title">{{ citation.document.title }}</div>
                    <div class="citation-score">
                      Relevance: {{ (citation.relevance_score * 100).toFixed(0) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="query.status === 'processing'" class="message ai-message">
              <div class="message-header">
                <span class="message-icon">🤖</span>
                <span class="message-author">PharmaAI</span>
              </div>
              <div class="message-content processing">
                <span class="processing-spinner"></span>
                Processing your question...
              </div>
            </div>

            <div v-else-if="query.status === 'failed'" class="message ai-message error">
              <div class="message-header">
                <span class="message-icon">⚠️</span>
                <span class="message-author">Error</span>
              </div>
              <div class="message-content">
                Failed to process question. Please try again.
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <form @submit.prevent="handleAskQuestion">
            <div class="input-wrapper">
              <textarea
                v-model="newQuestion"
                placeholder="Ask a question about your documents..."
                rows="3"
                :disabled="loading"
                @keydown.enter.exact.prevent="handleAskQuestion"
              ></textarea>
              <button
                type="submit"
                class="btn-send"
                :disabled="loading || !newQuestion.trim()"
              >
                {{ loading ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { queryService } from '@/services/api'

const queries = ref([])
const newQuestion = ref('')
const loading = ref(false)
const messagesContainer = ref(null)

const sortedQueries = computed(() => {
  return [...queries.value].sort((a, b) =>
    new Date(a.created_at) - new Date(b.created_at)
  )
})

onMounted(async () => {
  await fetchQueries()
})

async function fetchQueries() {
  try {
    const response = await queryService.getAll()
    queries.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch queries:', error)
  }
}

async function handleAskQuestion() {
  if (!newQuestion.value.trim() || loading.value) return

  loading.value = true
  const question = newQuestion.value.trim()
  newQuestion.value = ''

  try {
    const response = await queryService.create(question)
    queries.value.push(response.data)

    await nextTick()
    scrollToBottom()
  } catch (error) {
    alert(error.response?.data?.errors?.[0] || 'Failed to process question')
    newQuestion.value = question
  } finally {
    loading.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.queries-page {
  padding: 32px;
  max-width: 1400px;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  color: #1a202c;
  margin-bottom: 8px;
}

.page-header p {
  color: #718096;
}

.queries-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.chat-panel {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-chat {
  text-align: center;
  padding: 60px 20px;
}

.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-chat h2 {
  font-size: 24px;
  color: #1a202c;
  margin-bottom: 8px;
}

.empty-chat p {
  color: #718096;
  margin-bottom: 24px;
}

.example-questions {
  list-style: none;
  padding: 0;
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
}

.example-questions li {
  padding: 12px 16px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 8px;
  color: #4a5568;
  font-style: italic;
}

.message-group {
  margin-bottom: 24px;
}

.message {
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 12px;
}

.user-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-left: auto;
  max-width: 70%;
}

.ai-message {
  background: #f7fafc;
  max-width: 85%;
}

.ai-message.error {
  background: #fed7d7;
  color: #c53030;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.user-message .message-header {
  color: rgba(255, 255, 255, 0.9);
}

.ai-message .message-header {
  color: #718096;
}

.message-icon {
  font-size: 18px;
}

.message-author {
  font-weight: 600;
}

.message-time {
  font-size: 12px;
  opacity: 0.8;
  margin-left: auto;
}

.message-content {
  line-height: 1.6;
  white-space: pre-wrap;
}

.processing {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
}

.processing-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.citations {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.citations-header {
  font-size: 13px;
  font-weight: 600;
  color: #718096;
  margin-bottom: 8px;
}

.citations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.citation {
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
}

.citation-title {
  font-weight: 500;
  color: #1a202c;
  margin-bottom: 4px;
}

.citation-score {
  font-size: 12px;
  color: #718096;
}

.chat-input {
  border-top: 1px solid #e2e8f0;
  padding: 20px 24px;
  background: #fafafa;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-wrapper textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
}

.input-wrapper textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn-send {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
