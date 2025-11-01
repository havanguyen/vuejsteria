<template>
  <ManagementPage
    title="Nhà xuất bản"
    icon="mdi-domain"
    :headers="headers"
    :api="api"
    :defaultItem="defaultItem"
    dialogWidth="600px"
    :onSave="onSave"
    :onOpenDialog="handleOpenDialog"
  >
    <template #form="{ editedItem, isSubmitting }">
      <v-form @submit.prevent="onSave(editedItem)">
        <v-alert
          v-if="formError"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          closable
        >
          {{ formError }}
        </v-alert>

        <v-text-field
          v-model="name"
          :error-messages="errors.name"
          label="Tên nhà xuất bản"
          variant="outlined"
          density="comfortable"
          :disabled="isSubmitting"
          class="mb-4"
        ></v-text-field>
      </v-form>
    </template>
  </ManagementPage>
</template>

<script setup>
import { ref, watch, inject } from 'vue';
import ManagementPage from './shared/ManagementPage.vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import {
  getPublishersApi,
  createPublisherApi,
  updatePublisherApi,
  deletePublisherApi,
} from '@/api/productApi';

const headers = [
  { title: 'ID', key: 'id', sortable: true, width: '300px' },
  { title: 'Tên nhà xuất bản', key: 'name', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const api = {
  list: getPublishersApi,
  create: createPublisherApi,
  update: updatePublisherApi,
  delete: deletePublisherApi,
};

const defaultItem = ref({
  id: null,
  name: '',
});

const formError = ref(null);

const publisherSchema = z.object({
  name: z.string().min(1, 'Tên NXB là bắt buộc'),
});

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(publisherSchema),
  initialValues: defaultItem.value,
});

const { value: name } = useField('name');

const handleOpenDialog = (item) => {
  if (item && item.id) {
    setValues(item);
  } else {
    resetForm();
  }
};

const onSave = async (editedItem, showError) => {
  formError.value = null;
  const result = await handleSubmit();
  if (!result.valid) {
    return false;
  }

  const payload = { ...result.values };

  try {
    if (editedItem.id) {
      await api.update(editedItem.id, payload);
    } else {
      await api.create(payload);
    }
    resetForm();
    return true;
  } catch (err) {
    formError.value = err.message || 'Lỗi không xác định khi lưu.';
    return false;
  }
};
</script>