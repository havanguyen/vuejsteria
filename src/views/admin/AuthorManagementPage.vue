<template>
  <ManagementPage
    title="Authors"
    icon="mdi-account-edit"
    :headers="headers"
    :api="api"
    :defaultItem="defaultItem"
    dialogWidth="700px"
    :onSave="onSave"
    :onOpenDialog="handleOpenDialog"
  >
    <template #item.avatarUrl="{ item }">
      <v-avatar size="40" class="my-2">
        <v-img :src="item.avatarUrl || 'https://via.placeholder.com/40'" />
      </v-avatar>
    </template>

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

        <v-row>
          <v-col cols="12" md="4">
            <ImageUploader
              label="Author Avatar"
              v-model="avatarUrl"
              placeholderIcon="mdi-account-circle"
            />
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="name"
              :error-messages="errors.name"
              label="Author Name"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="bio"
              :error-messages="errors.bio"
              label="Biography"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
              rows="8"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-form>
    </template>
  </ManagementPage>
</template>

<script setup>
import { ref } from 'vue';
import ManagementPage from './shared/ManagementPage.vue';
import ImageUploader from './shared/ImageUploader.vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import {
  getAuthorsApi,
  createAuthorApi,
  updateAuthorApi,
  deleteAuthorApi,
} from '@/api/productApi';

const headers = [
  { title: 'Avatar', key: 'avatarUrl', sortable: false, width: '100px' },
  { title: 'Author Name', key: 'name', sortable: true },
  { title: 'Biography', key: 'bio', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const api = {
  list: getAuthorsApi,
  create: createAuthorApi,
  update: updateAuthorApi,
  delete: deleteAuthorApi,
};

const defaultItem = ref({
  id: null,
  name: '',
  bio: '',
  avatarUrl: '',
});

const formError = ref(null);

const authorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  bio: z.string().optional(),
  avatarUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
});

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(authorSchema),
  initialValues: defaultItem.value,
});

const { value: name } = useField('name');
const { value: bio } = useField('bio');
const { value: avatarUrl } = useField('avatarUrl');

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
    formError.value = err.message || 'An unknown error occurred while saving.';
    return false;
  }
};
</script>