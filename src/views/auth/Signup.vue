<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Asclepius AI</h1>
        <p>Create your account</p>
      </div>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="first_name">First Name</label>
            <input
              id="first_name"
              v-model="formData.first_name"
              type="text"
              required
              placeholder="John"
            />
          </div>

          <div class="form-group">
            <label for="last_name">Last Name</label>
            <input
              id="last_name"
              v-model="formData.last_name"
              type="text"
              required
              placeholder="Doe"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="john.doe@example.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="Min 12 chars, uppercase, lowercase, number, symbol"
          />
          <small class="password-hint">
            Must be at least 12 characters with uppercase, lowercase, number, and special character
          </small>
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirm Password</label>
          <input
            id="password_confirmation"
            v-model="formData.password_confirmation"
            type="password"
            required
            placeholder="Re-enter password"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Sign Up' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Log in</router-link></p>
      </div>

      <div class="security-badge">
        🔒 HIPAA Compliant | End-to-End Encrypted
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const error = ref('')

async function handleSignup() {
  loading.value = true
  error.value = ''

  if (formData.value.password !== formData.value.password_confirmation) {
    error.value = 'Passwords do not match'
    loading.value = false
    return
  }

  const result = await authStore.signup(formData.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }

  loading.value = false
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 8px;
}

.auth-header p {
  color: #666;
  font-size: 14px;
}

.auth-form {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.password-hint {
  display: block;
  margin-top: 6px;
  color: #999;
  font-size: 12px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.auth-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.security-badge {
  margin-top: 30px;
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
