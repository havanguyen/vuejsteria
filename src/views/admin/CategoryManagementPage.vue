<template>
  <ManagementPage
    title="Categories"
    icon="mdi-bookmark-multiple"
    :headers="headers"
    :api="api"
    :defaultItem="defaultItem"
    dialogWidth="600px"
    :onSave="onSave"
    :onOpenDialog="handleOpenDialog"
  >
    <template #form="{ editedItem, isSubmitting }">
      <v-form>
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
          label="Category Name"
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
import { ref } from 'vue';
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
  { title: 'Category Name', key: 'name', sortable: true },
  { title: 'Slug', key: 'slug', sortable: true },
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
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  parentCategoryId: z.string().nullable().optional(),
});

const { errors, setValues, resetForm, validate, values } = useForm({
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
  const { valid } = await validate();
  if (!valid) {
    return false;
  }

  const payload = { ...values };

  try {
    if (editedItem.id) {
      await api.update(editedItem.id, payload);
    } else {
      await api.create(payload);
    }
    resetForm();
    return true;
  } catch (err) {
    formError.value = err.message || 'An unknown error occurred while saving.';
    return false;
  }
};
</script>