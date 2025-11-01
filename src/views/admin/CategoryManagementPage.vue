<template>
  <ManagementPage
    title="Danh mục"
    icon="mdi-bookmark-multiple"
    :headers="headers"
    :api="api"
    :defaultItem="defaultItem"
    dialogWidth="600px"
    :onSave="onSave"
    :onOpenDialog="handleOpenDialog"
  >
    <template #item.parentCategory="{ item }">
      {{ item.parentCategory?.name || 'N/A' }}
    </template>

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
          label="Tên danh mục"
          variant="outlined"
          density="comfortable"
          :disabled="isSubmitting"
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="slug"
          :error-messages="errors.slug"
          label="Slug"
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
  getCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from '@/api/productApi';

const headers = [
  { title: 'ID', key: 'id', sortable: true, width: '300px' },
  { title: 'Tên danh mục', key: 'name', sortable: true },
  { title: 'Slug', key: 'slug', sortable: true },
  { title: 'Danh mục cha', key: 'parentCategory', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const api = {
  list: getCategoriesApi,
  create: createCategoryApi,
  update: updateCategoryApi,
  delete: deleteCategoryApi,
};

const defaultItem = ref({
  id: null,
  name: '',
  slug: '',
  parentCategoryId: null,
});

const formError = ref(null);

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  parentCategoryId: z.string().nullable().optional(),
});

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(categorySchema),
  initialValues: defaultItem.value,
});

const { value: name } = useField('name');
const { value: slug } = useField('slug');
const { value: parentCategoryId } = useField('parentCategoryId');

const handleOpenDialog = (item) => {
  if (item && item.id) {
    setValues({
      ...item,
      parentCategoryId: item.parentCategory?.id || null,
    });
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