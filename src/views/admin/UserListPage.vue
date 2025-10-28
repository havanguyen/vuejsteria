<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllUsersApi } from '@/api/userApi';

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

const headers = [
  { title: 'ID', key: 'id', sortable: false },
  { title: 'Username', key: 'username' },
  { title: 'First Name', key: 'profileResponse.firstName' },
  { title: 'Last Name', key: 'profileResponse.lastName' },
  { title: 'Email', key: 'profileResponse.email', sortable: false },
  { title: 'Status', key: 'active', sortable: true },
  { title: 'Roles', key: 'roles', sortable: false },
];

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getAllUsersApi();
    users.value = data;
  } catch (err) {
    console.error('Failed to fetch users:', err);
    error.value = 'Could not load users.';
  } finally {
    loading.value = false;
  }
};

const viewUserDetail = (event, { item }) => {
  if (item && item.id) {
    router.push({ name: 'AdminUserDetail', params: { id: item.id } });
  }
};

onMounted(fetchUsers);
</script>

<template>
  <v-container>
    <v-card class="pa-4 pa-md-6 elevation-1">
      <v-card-title class="text-h4 font-weight-medium mb-4 d-flex align-center">
         <v-icon start color="primary">mdi-account-group</v-icon>
        Admin - User Management
      </v-card-title>
      <v-card-text>
         <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ error }}
          </v-alert>

        <v-data-table
          :headers="headers"
          :items="users"
          :loading="loading"
          item-value="id"
          class="elevation-0 border rounded-lg data-table-clickable-rows"
          items-per-page="10"
          hover
          @click:row="viewUserDetail"
        >
         <template v-slot:item.profileResponse\.firstName="{ item }">
            {{ item.profileResponse?.firstName || '-' }}
         </template>
         <template v-slot:item.profileResponse\.lastName="{ item }">
            {{ item.profileResponse?.lastName || '-' }}
         </template>
         <template v-slot:item.profileResponse\.email="{ item }">
            {{ item.profileResponse?.email || '-' }}
         </template>
          <template v-slot:item.active="{ item }">
             <v-chip
                :color="item.active ? 'success' : 'error'"
                size="small"
                label
             >
                {{ item.active ? 'Active' : 'Inactive' }}
             </v-chip>
         </template>
         <template v-slot:item.roles="{ item }">
            <template v-if="item.roles && item.roles.length > 0">
                 <v-chip
                    v-for="role in item.roles"
                    :key="role.name"
                    :color="role.name === 'ADMIN' ? 'error' : 'primary'"
                    size="small"
                    class="mr-1"
                    label
                 >
                 {{ role.name }}
                 </v-chip>
            </template>
            <span v-else class="text-grey">-</span>
          </template>

           <template v-slot:loading>
             <div class="d-flex justify-center align-center pa-5">
                 <v-progress-circular indeterminate color="primary"></v-progress-circular>
             </div>
           </template>
           <template v-slot:no-data>
             <div class="text-center pa-6 text-grey">
                 <v-icon size="large" class="mb-2">mdi-account-search-outline</v-icon>
                 <div>No users found.</div>
             </div>
          </template>

        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style>
.data-table-clickable-rows tbody tr:hover {
  cursor: pointer;
}
</style>