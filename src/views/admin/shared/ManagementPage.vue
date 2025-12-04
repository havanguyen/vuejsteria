<template>
  <v-container fluid class="pa-6">
    <v-card class="glass-card overflow-hidden" elevation="0">
      <div class="glass-header px-6 py-4 d-flex align-center flex-wrap justify-space-between">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="48" class="mr-4 rounded-lg">
            <v-icon :icon="icon" size="28" color="primary"></v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h5 font-weight-bold">{{ title }}</h1>
            <div class="text-caption text-medium-emphasis">Manage your {{ title.toLowerCase() }}</div>
          </div>
        </div>
        
        <v-btn
          color="primary"
          @click="openDialog()"
          prepend-icon="mdi-plus"
          elevation="4"
          rounded="lg"
          size="large"
          class="mt-4 mt-sm-0 font-weight-bold hover-lift"
        >
          Create New
        </v-btn>
      </div>

      <v-divider class="opacity-20"></v-divider>

      <v-card-text class="pa-6">
        <div class="d-flex mb-6">
          <v-text-field
            v-model="search"
            placeholder="Search..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            class="glass-input"
            style="max-width: 400px"
            clearable
            bg-color="rgba(255,255,255,0.5)"
          ></v-text-field>
        </div>

        <v-data-table-server
          v-model:items-per-page="pagination.size"
          :headers="headers"
          :items="items"
          :items-length="pagination.totalElements"
          :loading="loading"
          item-value="id"
          class="glass-table bg-transparent"
          @update:options="loadItems"
          hover
        >
          <template v-slot:loading>
            <div class="d-flex justify-center align-center pa-12">
              <v-progress-circular
                indeterminate
                color="primary"
                size="48"
                width="4"
              ></v-progress-circular>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="text-center pa-12 text-medium-emphasis">
              <v-icon size="64" class="mb-4 opacity-50">mdi-magnify-close</v-icon>
              <div class="text-h6">No data found</div>
              <div class="text-body-2">Try adjusting your search or filters</div>
            </div>
          </template>

          <template
            v-for="slotName in customSlots"
            v-slot:[`item.${slotName}`]="{ item }"
          >
            <slot :name="`item.${slotName}`" :item="item"></slot>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex justify-end gap-2">
              <slot name="actions" :item="item"></slot>
              <v-btn
                icon="mdi-pencil"
                variant="tonal"
                color="primary"
                size="small"
                class="action-btn"
                @click="openDialog(item)"
              >
                <v-tooltip activator="parent" location="top">Edit</v-tooltip>
              </v-btn>
              <v-btn
                icon="mdi-delete"
                variant="tonal"
                color="error"
                size="small"
                class="action-btn"
                @click="confirmDeleteItem(item)"
              >
                <v-tooltip activator="parent" location="top">Delete</v-tooltip>
              </v-btn>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" :max-width="dialogWidth" persistent transition="dialog-bottom-transition">
      <v-card class="glass-dialog">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-4 d-flex align-center justify-space-between">
          {{ dialogTitle }}
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-divider class="opacity-20"></v-divider>
        
        <v-card-text style="max-height: 80vh; overflow-y: auto" class="pa-6 custom-scrollbar">
          <slot
            name="form"
            :editedItem="editedItem"
            :isSubmitting="isSubmitting"
          ></slot>
        </v-card-text>
        
        <v-divider class="opacity-20"></v-divider>
        
        <v-card-actions class="pa-6 pt-4 bg-surface-variant-lighten">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeDialog"
            :disabled="isSubmitting"
            class="px-6"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveItem"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            variant="flat"
            class="px-8 font-weight-bold"
            rounded="lg"
            elevation="2"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="450px" transition="scale-transition">
      <v-card class="glass-dialog text-center pa-6">
        <v-icon icon="mdi-alert-circle-outline" color="error" size="64" class="mb-4 mx-auto"></v-icon>
        <v-card-title class="text-h5 font-weight-bold px-0">Confirm Deletion</v-card-title>
        <v-card-text class="px-0 pb-6 text-medium-emphasis">
          Are you sure you want to delete this item? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="justify-center pa-0 gap-4">
          <v-btn 
            color="grey-darken-1" 
            variant="outlined" 
            @click="closeDelete"
            class="px-6"
            rounded="lg"
          >Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="deleteItem"
            :loading="isSubmitting"
            class="px-6"
            rounded="lg"
            elevation="2"
          >Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, useSlots, provide } from 'vue';
import { useNotificationStore } from '@/stores/useNotificationStore';

const props = defineProps({
  title: String,
  icon: String,
  headers: Array,
  api: {
    type: Object,
    required: true,
  },
  defaultItem: {
    type: Object,
    required: true,
  },
  dialogWidth: {
    type: String,
    default: '600px',
  },
  onSave: {
    type: Function,
    required: true,
  },
  onBeforeOpenDialog: {
    type: Function,
    default: async () => {},
  },
  onOpenDialog: {
    type: Function,
    default: () => {},
  },
});

const emit = defineEmits(['item-saved', 'item-deleted']);

const notificationStore = useNotificationStore();
const slots = useSlots();

const items = ref([]);
const loading = ref(true);
const search = ref('');
const pagination = ref({
  page: 1,
  size: 10,
  totalPages: 0,
  totalElements: 0,
});

const dialog = ref(false);
const deleteDialog = ref(false);
const editedItem = ref(JSON.parse(JSON.stringify(props.defaultItem)));
const itemToDelete = ref(null);
const isSubmitting = ref(false);

let searchDebounce = null;

const dialogTitle = computed(() =>
  editedItem.value.id ? `Edit ${props.title}` : `Create ${props.title}`
);

const customSlots = computed(() => {
  return props.headers
    .map((h) => h.key)
    .filter((key) => key !== 'actions' && slots[`item.${key}`]);
});

const loadItems = async ({ page, itemsPerPage, sortBy }) => {
  loading.value = true;
  try {
    const sort = sortBy.length
      ? `${sortBy[0].key},${sortBy[0].order}`
      : 'id,desc';

    let responseData;

    if (search.value && props.api.search) {
      responseData = await props.api.search(
        search.value,
        page - 1,
        itemsPerPage
      );
    } else {
      responseData = await props.api.list(page - 1, itemsPerPage, sort);
    }

    const data = responseData;

    if (data && typeof data.content !== 'undefined') {
      items.value = data.content;
      pagination.value.totalElements = data.totalElements;
      pagination.value.totalPages = data.totalPages;
      pagination.value.page = data.pageable?.pageNumber + 1 || page;
    } else if (Array.isArray(data)) {
      items.value = data;
      pagination.value.totalElements = data.length;
      pagination.value.totalPages = 1;
      pagination.value.page = 1;
    } else {
      items.value = [];
      pagination.value.totalElements = 0;
      pagination.value.totalPages = 1;
      pagination.value.page = 1;
    }
  } catch (error) {
    notificationStore.showError(`Error loading ${props.title}: ${error.message}`);
    items.value = [];
    pagination.value.totalElements = 0;
  } finally {
    loading.value = false;
  }
};

watch(search, (newValue) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    loadItems({
      page: 1,
      itemsPerPage: pagination.value.size,
      sortBy: [],
    });
  }, 300);
});

const openDialog = async (item = null) => {
  isSubmitting.value = true;
  await props.onBeforeOpenDialog();
  isSubmitting.value = false;

  if (item) {
    editedItem.value = JSON.parse(JSON.stringify(item));
  } else {
    editedItem.value = JSON.parse(JSON.stringify(props.defaultItem));
  }

  props.onOpenDialog(editedItem.value);

  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  props.onOpenDialog(null);
};

const saveItem = async () => {
  isSubmitting.value = true;
  try {
    const success = await props.onSave(editedItem.value, (errorMsg) => {
      notificationStore.showError(errorMsg);
    });

    if (success) {
      notificationStore.showSuccess(`${props.title} saved successfully.`);
      closeDialog();
      await loadItems({
        page: pagination.value.page,
        itemsPerPage: pagination.value.size,
        sortBy: [],
      });
      emit('item-saved');
    }
  } catch (error) {
    notificationStore.showError(
      `Save failed: ${error.message || 'Validation failed'}`
    );
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDeleteItem = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const closeDelete = () => {
  deleteDialog.value = false;
  itemToDelete.value = null;
};

const deleteItem = async () => {
  if (!itemToDelete.value) return;
  isSubmitting.value = true;
  try {
    await props.api.delete(itemToDelete.value.id);
    notificationStore.showSuccess(`${props.title} deleted successfully.`);
    closeDelete();
    await loadItems({
      page: pagination.value.page,
      itemsPerPage: pagination.value.size,
      sortBy: [],
    });
    emit('item-deleted');
  } catch (error) {
    notificationStore.showError(`Delete failed: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05) !important;
}

.glass-header {
  background: linear-gradient(to right, rgba(var(--v-theme-primary), 0.05), transparent);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.glass-dialog {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 24px !important;
}

.glass-table :deep(th) {
  background: transparent !important;
  font-weight: 700 !important;
  color: rgba(0,0,0,0.7) !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.glass-table :deep(td) {
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}

.glass-table :deep(tr:hover td) {
  background-color: rgba(var(--v-theme-primary), 0.03) !important;
}

.action-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.3) !important;
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-50 {
  opacity: 0.5;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}

.bg-surface-variant-lighten {
  background-color: rgba(var(--v-theme-surface-variant), 0.03);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
</style>