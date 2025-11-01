<template>
  <ManagementPage
    title="Sản phẩm"
    icon="mdi-book-open-page-variant"
    :headers="headers"
    :api="api"
    :defaultItem="defaultItem"
    dialogWidth="900px"
    :onSave="onSave"
    :onBeforeOpenDialog="onBeforeOpenDialog"
    :onOpenDialog="handleOpenDialog"
  >
    <template #item.imageUrl="{ item }">
      <v-avatar size="40" class="my-2" rounded="0">
        <v-img
          :src="item.imageUrl || 'https://via.placeholder.com/40x60'"
          cover
        >
          <template v-slot:placeholder>
            <v-icon>mdi-book</v-icon>
          </template>
        </v-img>
        <v-tooltip activator="parent" location="end">
          <v-img
            :src="item.imageUrl || 'https://via.placeholder.com/40x60'"
            height="200"
            width="140"
            contain
          ></v-img>
        </v-tooltip>
      </v-avatar>
    </template>

    <template #item.basePrice="{ item }">
      {{ formatPrice(item.basePrice) }}
    </template>

    <template #item.author="{ item }">
      {{ item.author?.name || 'N/A' }}
    </template>

    <template #item.publisher="{ item }">
      {{ item.publisher?.name || 'N/A' }}
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

        <v-row>
          <v-col cols="12" md="4">
            <ImageUploader
              label="Ảnh bìa sản phẩm"
              v-model="imageUrl"
              :aspectRatio="3 / 4"
              placeholderIcon="mdi-book"
            />
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="title"
              :error-messages="errors.title"
              label="Tên sách"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
            ></v-text-field>
            <v-text-field
              v-model="isbn"
              :error-messages="errors.isbn"
              label="ISBN"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
            ></v-text-field>
            <v-textarea
              v-model="description"
              :error-messages="errors.description"
              label="Mô tả"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
              rows="3"
            ></v-textarea>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-autocomplete
              v-model="authorId"
              :items="authorList"
              item-title="name"
              item-value="id"
              :error-messages="errors.authorId"
              label="Tác giả"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
              :loading="loadingDependencies"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-autocomplete
              v-model="publisherId"
              :items="publisherList"
              item-title="name"
              item-value="id"
              :error-messages="errors.publisherId"
              label="Nhà xuất bản"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
              :loading="loadingDependencies"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="publicationDate"
              :error-messages="errors.publicationDate"
              label="Ngày xuất bản"
              type="date"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="basePrice"
              :error-messages="errors.basePrice"
              label="Giá gốc"
              type="number"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
              prefix="₫"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model.number="pageCount"
              :error-messages="errors.pageCount"
              label="Số trang"
              type="number"
              variant="outlined"
              density="comfortable"
              :disabled="isSubmitting"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-autocomplete
          v-model="categoryIds"
          :items="categoryList"
          item-title="name"
          item-value="id"
          :error-messages="errors.categoryIds"
          label="Danh mục"
          variant="outlined"
          density="comfortable"
          :disabled="isSubmitting"
          :loading="loadingDependencies"
          multiple
          chips
          closable-chips
        ></v-autocomplete>
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
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getAuthorsApi,
  getPublishersApi,
  getCategoriesApi,
} from '@/api/productApi';

const headers = [
  { title: 'Ảnh bìa', key: 'imageUrl', sortable: false, width: '100px' },
  { title: 'Tên sách', key: 'title', sortable: true },
  { title: 'Tác giả', key: 'author', sortable: true },
  { title: 'NXB', key: 'publisher', sortable: true },
  { title: 'Giá', key: 'basePrice', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const api = {
  list: getProductsApi,
  create: createProductApi,
  update: updateProductApi,
  delete: deleteProductApi,
};

const defaultItem = ref({
  id: null,
  title: '',
  slug: '',
  isbn: '',
  description: '',
  imageUrl: '',
  authorId: null,
  publisherId: null,
  publicationDate: '',
  pageCount: 0,
  basePrice: 0,
  categoryIds: [],
});

const formError = ref(null);
const authorList = ref([]);
const publisherList = ref([]);
const categoryList = ref([]);
const loadingDependencies = ref(false);

const productSchema = z.object({
  title: z.string().min(1, 'Tên sách là bắt buộc'),
  isbn: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url('URL hình ảnh không hợp lệ')
    .optional()
    .nullable()
    .or(z.literal('')),
  authorId: z.string().min(1, 'Tác giả là bắt buộc'),
  publisherId: z.string().min(1, 'NXB là bắt buộc'),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD')
    .optional()
    .nullable(),
  pageCount: z.number().int().min(0, 'Số trang phải >= 0').optional().nullable(),
  basePrice: z.number().min(0, 'Giá phải >= 0'),
  categoryIds: z.array(z.string()).optional(),
});

const { handleSubmit, errors, setValues, resetForm } = useForm({
  validationSchema: toTypedSchema(productSchema),
  initialValues: defaultItem.value,
});

const { value: title } = useField('title');
const { value: isbn } = useField('isbn');
const { value: description } = useField('description');
const { value: imageUrl } = useField('imageUrl');
const { value: authorId } = useField('authorId');
const { value: publisherId } = useField('publisherId');
const { value: publicationDate } = useField('publicationDate');
const { value: pageCount } = useField('pageCount');
const { value: basePrice } = useField('basePrice');
const { value: categoryIds } = useField('categoryIds');

const handleOpenDialog = (item) => {
  if (item && item.id) {
    setValues({
      ...item,
      authorId: item.author?.id,
      publisherId: item.publisher?.id,
      categoryIds: item.categories?.map((c) => c.id) || [],
      publicationDate: item.publicationDate
        ? item.publicationDate.split('T')[0]
        : '',
    });
  } else {
    resetForm();
  }
};

const onBeforeOpenDialog = async () => {
  loadingDependencies.value = true;
  try {
    const [authorsData, publishersData, categoriesData] = await Promise.all([
      getAuthorsApi(0, 1000),
      getPublishersApi(0, 1000),
      getCategoriesApi(),
    ]);
    authorList.value = authorsData.content;
    publisherList.value = publishersData.content;
    categoryList.value = categoriesData;
  } catch (error) {
    console.error('Failed to load dependencies', error);
  } finally {
    loadingDependencies.value = false;
  }
};

const onSave = async (editedItem, showError) => {
  formError.value = null;

  const result = await handleSubmit();
  if (!result.valid) {
    return false;
  }

  const payload = { ...result.values };

  payload.publicationDate = payload.publicationDate || null;
  payload.pageCount = payload.pageCount || 0;

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

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};
</script>