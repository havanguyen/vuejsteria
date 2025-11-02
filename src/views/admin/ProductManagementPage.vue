<template>
  <div>
    <ManagementPage
      title="Products"
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
        <div v-if="item.salePrice && item.salePrice > 0" class="text-caption text-error">
          (Sale: {{ formatPrice(item.salePrice) }})
        </div>
      </template>
  
      <template #item.author="{ item }">
        {{ item.author?.name || 'N/A' }}
      </template>
  
      <template #item.publisher="{ item }">
        {{ item.publisher?.name || 'N/A' }}
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
                label="Book Cover"
                v-model="imageUrl"
                :aspectRatio="3 / 4"
                placeholderIcon="mdi-book"
              />
            </v-col>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="title"
                :error-messages="errors.title"
                label="Book Title"
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
                label="Description"
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
                label="Author"
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
                label="Publisher"
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
                label="Publication Date"
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
                label="Base Price"
                type="number"
                variant="outlined"
                density="comfortable"
                :disabled="isSubmitting"
                prefix="₫"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model.number="salePrice"
                :error-messages="errors.salePrice"
                label="Sale Price (Optional)"
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
                label="Page Count"
                type="number"
                variant="outlined"
                density="comfortable"
                :disabled="isSubmitting"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12">
              <h6 class="text-subtitle-1 font-weight-medium mb-2">Sale Start Date & Time</h6>
            </v-col>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="saleStartMenu"
                :close-on-content-click="false"
                location="bottom start"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="saleStartDateOnly"
                    label="Date (Ngày)"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    density="comfortable"
                    :disabled="isSubmitting"
                    :error-messages="errors.saleStartDate"
                    prepend-inner-icon="mdi-calendar"
                    clearable
                    @click:clear="saleStartDateOnly = ''; saleStartPicker = null;"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="saleStartPicker"
                  @update:modelValue="updateSaleStartDate"
                  show-adjacent-months
                  hide-header
                  color="primary"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="saleStartTimeOnly"
                label="Time (Giờ:Phút) - Chọn tự động"
                type="time"
                variant="outlined"
                density="comfortable"
                :disabled="isSubmitting"
                :error-messages="errors.saleStartDate"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
  
          <v-row>
            <v-col cols="12">
              <h6 class="text-subtitle-1 font-weight-medium mb-2">Sale End Date & Time</h6>
            </v-col>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="saleEndMenu"
                :close-on-content-click="false"
                location="bottom start"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    v-model="saleEndDateOnly"
                    label="Date (Ngày)"
                    readonly
                    v-bind="props"
                    variant="outlined"
                    density="comfortable"
                    :disabled="isSubmitting"
                    :error-messages="errors.saleEndDate"
                    prepend-inner-icon="mdi-calendar"
                    clearable
                    @click:clear="saleEndDateOnly = ''; saleEndPicker = null;"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="saleEndPicker"
                  @update:modelValue="updateSaleEndDate"
                  show-adjacent-months
                  hide-header
                  color="primary"
                />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="saleEndTimeOnly"
                label="Time (Giờ:Phút) - Chọn tự động"
                type="time"
                variant="outlined"
                density="comfortable"
                :disabled="isSubmitting"
                :error-messages="errors.saleEndDate"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
          <h6 class="text-h6 font-weight-medium mb-4 mt-2 d-flex align-center">
            Product Attributes (Key-Value)
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-plus"
              size="small"
              color="primary"
              variant="tonal"
              @click="openAttributeDialog()"
              :disabled="isSubmitting"
            >
              <v-icon size="20">mdi-plus</v-icon>
              <v-tooltip activator="parent" location="top">Add New Attribute</v-tooltip>
            </v-btn>
          </h6>
  
          <v-card variant="tonal" class="pa-0 mb-6" v-if="attributesArray.length > 0">
            <v-list class="bg-transparent" lines="one" density="compact">
              <v-list-item
                v-for="(attr, index) in attributesArray"
                :key="attr.key"
                @click.stop="openAttributeDialog(attr, index)"
                class="attribute-list-item"
              >
                <template v-slot:append>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    color="red"
                    @click.stop="deleteAttribute(index)"
                  >
                    <v-icon size="18"></v-icon>
                    <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                  </v-btn>
                </template>
                <template v-slot:title>
                  <span class="font-weight-medium text-primary">{{ attr.key }}</span>
                </template>
                <template v-slot:subtitle>
                   <span class="text-medium-emphasis">Value: {{ attr.value }}</span>
                </template>
                <v-tooltip activator="parent" location="top">Click to Edit</v-tooltip>
              </v-list-item>
            </v-list>
          </v-card>
          <v-alert v-else type="info" variant="tonal" density="compact" class="mb-4">
              No custom attributes added. Click '+' to add one.
          </v-alert>
          <v-autocomplete
            v-model="categoryIds"
            :items="categoryList"
            item-title="name"
            item-value="id"
            :error-messages="errors.categoryIds"
            label="Categories"
            variant="outlined"
            density="comfortable"
            :disabled="isSubmitting"
            multiple
            chips
            closable-chips
          ></v-autocomplete>
        </v-form>
      </template>
    </ManagementPage>
    
    <v-dialog v-model="attributeDialog" max-width="450px" persistent>
      <v-card class="pa-2">
        <v-card-title class="text-h5 font-weight-medium pa-4">
          {{ editedAttributeIndex === -1 ? 'Add New Attribute' : 'Edit Attribute' }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="py-6">
          <v-text-field
            v-model="newAttribute.key"
            label="Attribute Key (e.g., language, book_type)"
            variant="outlined"
            density="comfortable"
            :disabled="editedAttributeIndex !== -1"
            class="mb-4"
            hide-details
          ></v-text-field>
          <v-text-field
            v-model="newAttribute.value"
            label="Attribute Value (e.g., Vietnamese, Hardcover)"
            variant="outlined"
            density="comfortable"
            hide-details
          ></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="closeAttributeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveAttribute"
            :disabled="!newAttribute.key || !newAttribute.value"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ManagementPage from './shared/ManagementPage.vue';
import ImageUploader from './shared/ImageUploader.vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { format, parseISO, isValid as isDateValid } from 'date-fns';
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getAuthorsApi,
  getPublishersApi,
  getCategoriesApi,
} from '@/api/productApi';
import { searchProductsApi } from '@/api/searchApi';

const headers = [
  { title: 'Cover', key: 'imageUrl', sortable: false, width: '100px' },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Author', key: 'author', sortable: true },
  { title: 'Publisher', key: 'publisher', sortable: true },
  { title: 'Price', key: 'basePrice', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
];

const api = {
  list: getProductsApi,
  search: searchProductsApi,
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
  salePrice: null,
  saleStartDate: '',
  saleEndDate: '',
  categoryIds: [],
});

const formError = ref(null);
const authorList = ref([]);
const publisherList = ref([]);
const categoryList = ref([]);
const loadingDependencies = ref(false);

const attributesArray = ref([]);
const attributeDialog = ref(false);
const newAttribute = ref({ key: '', value: '' });
const editedAttributeIndex = ref(-1);

const saleStartDateOnly = ref('');
const saleStartTimeOnly = ref('');
const saleEndDateOnly = ref('');
const saleEndTimeOnly = ref('');

const saleStartMenu = ref(false);
const saleEndMenu = ref(false);
const saleStartPicker = ref(null);
const saleEndPicker = ref(null);


const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-'); 
};

const openAttributeDialog = (attr = { key: '', value: '' }, index = -1) => {
  newAttribute.value = JSON.parse(JSON.stringify(attr));
  editedAttributeIndex.value = index;
  attributeDialog.value = true;
};

const closeAttributeDialog = () => {
  attributeDialog.value = false;
  newAttribute.value = { key: '', value: '' };
  editedAttributeIndex.value = -1;
};

const saveAttribute = () => {
  if (!newAttribute.value.key || !newAttribute.value.value) {
    return;
  }

  const normalizedKey = slugify(newAttribute.value.key.toLowerCase());

  if (editedAttributeIndex.value > -1) {
    attributesArray.value[editedAttributeIndex.value].value = newAttribute.value.value;
  } else {
    if (attributesArray.value.some(attr => attr.key === normalizedKey)) {
        formError.value = `Attribute key '${newAttribute.value.key}' already exists. Please edit the existing one.`;
        return;
    }
    attributesArray.value.push({ key: normalizedKey, value: newAttribute.value.value });
  }
  formError.value = null;
  closeAttributeDialog();
};

const deleteAttribute = (index) => {
  attributesArray.value.splice(index, 1);
};


const productSchema = z.object({
  title: z.string().min(1, 'Book title is required'),
  slug: z.string().optional(),
  isbn: z.string().optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable().or(z.literal('')),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  authorId: z.string().min(1, 'Author is required'),
  publisherId: z.string().min(1, 'Publisher is required'),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
    .optional()
    .nullable()
    .or(z.literal('')),
  pageCount: z.number().int().min(0, 'Pages must be >= 0').optional().nullable(),
  basePrice: z.number().min(0, 'Price must be >= 0'),
  
  salePrice: z.number().min(0, 'Sale Price must be >= 0').optional().nullable().or(z.literal(0)),
  saleStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, 'Date & Time must be in YYYY-MM-DDTHH:MM format or empty')
    .optional()
    .nullable()
    .or(z.literal('')),
  saleEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, 'Date & Time must be in YYYY-MM-DDTHH:MM format or empty')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  categoryIds: z.array(z.string()).optional(),
});

const { errors, setValues, resetForm, validate, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(productSchema),
  initialValues: defaultItem.value,
});

const { value: title } = useField('title');
const { value: slug } = useField('slug');
const { value: isbn } = useField('isbn');
const { value: description } = useField('description');
const { value: imageUrl } = useField('imageUrl');
const { value: authorId } = useField('authorId');
const { value: publisherId } = useField('publisherId');
const { value: publicationDate } = useField('publicationDate');
const { value: pageCount } = useField('pageCount');
const { value: basePrice } = useField('basePrice');
const { value: salePrice } = useField('salePrice');
const { value: saleStartDate } = useField('saleStartDate');
const { value: saleEndDate } = useField('saleEndDate');
const { value: categoryIds } = useField('categoryIds');

watch(title, (newTitle) => {
  if (!values.id) {
    slug.value = slugify(newTitle);
  }
});

const updateSaleStartDate = (newDate) => {
  saleStartDateOnly.value = newDate ? format(newDate, 'yyyy-MM-dd') : '';
  saleStartMenu.value = false;
};

const updateSaleEndDate = (newDate) => {
  saleEndDateOnly.value = newDate ? format(newDate, 'yyyy-MM-dd') : '';
  saleEndMenu.value = false;
};


const handleOpenDialog = (item) => {
  attributesArray.value = [];
  
  if (item && item.id) {
    const attributesObj = item.attributes || {};
    for (const key in attributesObj) {
        attributesArray.value.push({ key: key, value: attributesObj[key] });
    }

    const salesStart = item.saleStartDate?.substring(0, 16).split('T') || ['', ''];
    saleStartDateOnly.value = salesStart[0];
    saleStartTimeOnly.value = salesStart[1];

    const salesEnd = item.saleEndDate?.substring(0, 16).split('T') || ['', ''];
    saleEndDateOnly.value = salesEnd[0];
    saleEndTimeOnly.value = salesEnd[1];

    if (salesStart[0]) {
        const parsedDate = parseISO(salesStart[0]);
        if (isDateValid(parsedDate)) saleStartPicker.value = parsedDate;
    } else {
        saleStartPicker.value = null;
    }
    
    if (salesEnd[0]) {
        const parsedDate = parseISO(salesEnd[0]);
        if (isDateValid(parsedDate)) saleEndPicker.value = parsedDate;
    } else {
        saleEndPicker.value = null;
    }


    const itemToSet = {
      ...item,
      authorId: item.author?.id,
      publisherId: item.publisher?.id,
      categoryIds: item.categories?.map((c) => c.id) || [],
      publicationDate: item.publicationDate
        ? item.publicationDate.split('T')[0]
        : '',
      slug: item.slug || slugify(item.title),
      salePrice: item.salePrice || 0,
      
      saleStartDate: item.saleStartDate
        ? item.saleStartDate.substring(0, 16)
        : '',
      saleEndDate: item.saleEndDate
        ? item.saleEndDate.substring(0, 16)
        : '',
    };
    delete itemToSet.attributes;

    setValues(itemToSet);
  } else {
    resetForm();
    slug.value = slugify(title.value);
    saleStartDateOnly.value = '';
    saleStartTimeOnly.value = '';
    saleEndDateOnly.value = '';
    saleEndTimeOnly.value = '';
    saleStartPicker.value = null;
    saleEndPicker.value = null;
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

  setFieldValue('saleStartDate', saleStartDateOnly.value && saleStartTimeOnly.value
    ? `${saleStartDateOnly.value}T${saleStartTimeOnly.value}`
    : (saleStartDateOnly.value || '')
    );
  setFieldValue('saleEndDate', saleEndDateOnly.value && saleEndTimeOnly.value
    ? `${saleEndDateOnly.value}T${saleEndTimeOnly.value}`
    : (saleEndDateOnly.value || '')
    );
  
  const { valid } = await validate();
  if (!valid) {
    return false;
  }
  
  const payload = { ...values };

  payload.authorId = payload.authorId || null;
  payload.publisherId = payload.publisherId || null;
  payload.publicationDate = payload.publicationDate || null;
  payload.pageCount = payload.pageCount || 0;
  payload.basePrice = Number(payload.basePrice);
  
  payload.slug = payload.slug || slugify(payload.title);

  payload.salePrice = Number(payload.salePrice) || null;

  const dateToIso = (dateString) => {
    if (!dateString) return null;
    if (dateString.includes('T')) {
        return `${dateString}:00+07:00`;
    }
    const dateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
        return `${dateMatch[0]}T00:00:00+07:00`;
    }
    return null;
  };

  payload.saleStartDate = dateToIso(payload.saleStartDate);
  payload.saleEndDate = dateToIso(payload.saleEndDate);

  const attributesObject = {};
  attributesArray.value.forEach(attr => {
    if (attr.key && attr.value) {
      attributesObject[attr.key] = attr.value;
    }
  });

  if (Object.keys(attributesObject).length > 0) {
    payload.attributes = attributesObject;
  } else {
    delete payload.attributes;
  }
  
  if (!payload.salePrice) delete payload.salePrice;
  if (!payload.saleStartDate) delete payload.saleStartDate;
  if (!payload.saleEndDate) delete payload.saleEndDate;
  if (payload.isbn === '') payload.isbn = null;
  if (payload.description === '') payload.description = null;
  if (payload.imageUrl === '') payload.imageUrl = null;


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

const formatPrice = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};
</script>

<style scoped>
.attribute-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}
.attribute-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
.attribute-list-item:last-child {
    border-bottom: none;
}
</style>