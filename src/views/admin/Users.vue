<template>
  <div class="admin-users">
    <div class="page-header">
      <h1>User Management</h1>
      <button @click="showCreateModal = true" class="btn-primary">
        + Create User
      </button>
    </div>

    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td><span class="role-badge">{{ user.role }}</span></td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button @click="deleteUser(user.id)" class="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" class="modal" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h2>Create New User</h2>
        <form @submit.prevent="handleCreateUser">
          <input v-model="newUser.first_name" placeholder="First Name" required />
          <input v-model="newUser.last_name" placeholder="Last Name" required />
          <input v-model="newUser.email" type="email" placeholder="Email" required />
          <input v-model="newUser.password" type="password" placeholder="Password" required />
          <select v-model="newUser.role" required>
            <option value="doctor">Doctor</option>
            <option value="researcher">Researcher</option>
            <option value="auditor">Auditor</option>
            <option value="admin">Admin</option>
          </select>
          <div class="modal-actions">
            <button type="submit" class="btn-primary">Create</button>
            <button type="button" @click="showCreateModal = false" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/api'

const users = ref([])
const showCreateModal = ref(false)
const newUser = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'doctor'
})

onMounted(async () => {
  const res = await adminService.getUsers()
  users.value = res.data.users
})

async function handleCreateUser() {
  await adminService.createUser(newUser.value)
  showCreateModal.value = false
  const res = await adminService.getUsers()
  users.value = res.data.users
}

async function deleteUser(id) {
  if (confirm('Delete this user?')) {
    await adminService.deleteUser(id)
    users.value = users.value.filter(u => u.id !== id)
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.admin-users { padding: 32px; }
.page-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
.users-table { background: white; border-radius: 12px; padding: 24px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
.role-badge { padding: 4px 12px; background: #edf2f7; border-radius: 12px; font-size: 12px; text-transform: capitalize; }
.btn-primary { padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; }
.btn-delete { padding: 6px 12px; color: #c53030; border: 1px solid #feb2b2; background: white; border-radius: 4px; cursor: pointer; }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 32px; border-radius: 12px; width: 500px; }
.modal-content input, .modal-content select { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 6px; }
.modal-actions { display: flex; gap: 12px; margin-top: 16px; }
.btn-secondary { padding: 12px 24px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; }
</style>
