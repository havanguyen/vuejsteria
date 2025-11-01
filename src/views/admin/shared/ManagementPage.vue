<template>
  <v-container>
    <v-card class="pa-4 pa-md-6" elevation="2">
      <v-card-title
        class="text-h4 font-weight-medium mb-4 d-flex align-center"
      >
        <v-icon :icon="icon" start color="primary" size="36"></v-icon>
        {{ title }}
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="openDialog()"
          prepend-icon="mdi-plus"
          variant="flat"
          class="page-header-button"
        >
          Tạo mới
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="pagination.size"
          :headers="headers"
          :items="items"
          :items-length="pagination.totalElements"
          :loading="loading"
          :search="search"
          item-value="id"
          class="elevation-0 border rounded-lg data-table-hover"
          @update:options="loadItems"
          hover
        >
          <template v-slot:loading>
            <div class="d-flex justify-center align-center pa-5">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </div>
          </template>

          <template v-slot:no-data>
            <div class="text-center pa-6 text-grey">
              <v-icon size="large" class="mb-2">mdi-magnify-close</v-icon>
              <div>Không tìm thấy dữ liệu.</div>
            </div>
          </template>

          <template
            v-for="slotName in customSlots"
            v-slot:[`item.${slotName}`]="{ item }"
          >
            <slot :name="`item.${slotName}`" :item="item"></slot>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex justify-end">
              <v-btn
                variant="tonal"
                color="blue-darken-1"
                size="small"
                class="me-2"
                @click="openDialog(item)"
                prepend-icon="mdi-pencil"
              >
                Sửa
                <v-tooltip activator="parent" location="top">Sửa</v-tooltip>
              </v-btn>
              <v-btn
                variant="tonal"
                color="red-darken-1"
                size="small"
                @click="confirmDeleteItem(item)"
                prepend-icon="mdi-delete"
              >
                Xóa
                <v-tooltip activator="parent" location="top">Xóa</v-tooltip>
              </v-btn>
            </div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" :max-width="dialogWidth" persistent>
      <v-card class="pa-2">
        <v-card-title class="text-h5 font-weight-medium pa-4">
          {{ dialogTitle }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="max-height: 80vh; overflow-y: auto" class="py-6">
          <slot
            name="form"
            :editedItem="editedItem"
            :isSubmitting="isSubmitting"
          ></slot>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="closeDialog"
            :disabled="isSubmitting"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            @click="saveItem"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            variant="flat"
          >
            Lưu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="450px">
      <v-card class="pa-2">
        <v-card-title class="text-h5">Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa mục này? Thao tác này không thể hoàn tác.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
            >Hủy</v-btn
          >
          <v-btn
            color="red-darken-1"
            variant="flat"
            @click="deleteItem"
            :loading="isSubmitting"
            >Xóa</v-btn
          >
          <v-spacer></v-spacer>
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

const dialogTitle = computed(() =>
  editedItem.value.id ? `Sửa ${props.title}` : `Tạo ${props.title}`
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
    const data = await props.api.list(page - 1, itemsPerPage, sort);

    if (data && typeof data.content !== 'undefined') {
      items.value = data.content;
      pagination.value.totalElements = data.totalElements;
      pagination.value.totalPages = data.totalPages;
    } else if (Array.isArray(data)) {
      items.value = data;
      pagination.value.totalElements = data.length;
      pagination.value.totalPages = 1;
    } else {
      items.value = [];
      pagination.value.totalElements = 0;
      pagination.value.totalPages = 1;
    }
  } catch (error) {
    notificationStore.showError(`Lỗi khi tải ${props.title}: ${error.message}`);
    items.value = [];
    pagination.value.totalElements = 0;
  } finally {
    loading.value = false;
  }
};

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
      notificationStore.showSuccess(`${props.title} đã được lưu.`);
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
      `Lỗi khi lưu: ${error.message || 'Validation failed'}`
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
    notificationStore.showSuccess(`${props.title} đã được xóa.`);
    closeDelete();
    await loadItems({
      page: pagination.value.page,
      itemsPerPage: pagination.value.size,
      sortBy: [],
    });
    emit('item-deleted');
  } catch (error) {
    notificationStore.showError(`Lỗi khi xóa: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style>
.data-table-hover tbody tr:hover {
  background-color: #f5f5f5 !important;
  transition: background-color 0.2s ease-in-out;
}
.page-header-button {
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out !important;
}
.page-header-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
}
</style>