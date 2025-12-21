<template>
  <div>
    <ManagementPage
      title="Product Management"
      icon="mdi-book-open-page-variant"
      :headers="headers"
      :api="api"
      :defaultItem="defaultItem"
      dialogWidth="1000px"
      :onSave="onSave"
      :onBeforeOpenDialog="onBeforeOpenDialog"
      :onOpenDialog="handleOpenDialog"
    >
      <template #item.imageUrl="{ item }">
        <v-avatar size="48" class="my-2 rounded-lg elevation-2">
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
              height="240"
              width="160"
              cover
              class="rounded-lg elevation-4"
            ></v-img>
          </v-tooltip>
        </v-avatar>
      </template>

      <template #item.title="{ item }">
        <div class="font-weight-bold text-body-1 text-primary">
          {{ item.title }}
        </div>
        <div
          class="text-caption text-medium-emphasis text-truncate"
          style="max-width: 200px"
        >
          {{ item.description || "No description" }}
        </div>
      </template>

      <template #item.basePrice="{ item }">
        <div class="font-weight-bold">{{ formatPrice(item.basePrice) }}</div>
        <div
          v-if="item.salePrice && item.salePrice > 0"
          class="text-caption text-error font-weight-medium"
        >
          Sale: {{ formatPrice(item.salePrice) }}
        </div>
      </template>

      <template #item.author="{ item }">
        <v-chip
          size="small"
          variant="tonal"
          color="info"
          class="font-weight-medium"
        >
          {{ item.author?.name || "N/A" }}
        </v-chip>
      </template>

      <template #item.publisher="{ item }">
        <div class="text-body-2">{{ item.publisher?.name || "N/A" }}</div>
      </template>

      <template #form="{ isSubmitting }">
        <v-form>
          <v-alert
            v-if="formError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-6"
            closable
          >
            {{ formError }}
          </v-alert>

          <v-row>
            <v-col cols="12" md="4">
              <v-card
                class="glass-card pa-4 fill-height d-flex flex-column align-center justify-center"
                elevation="0"
              >
                <ImageUploader
                  label="Book Cover"
                  v-model="imageUrl"
                  :aspectRatio="3 / 4"
                  placeholderIcon="mdi-book"
                />
                <div class="text-caption text-medium-emphasis mt-2 text-center">
                  Recommended ratio 3:4
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="8">
              <v-card class="glass-card pa-6 fill-height" elevation="0">
                <h3 class="text-h6 font-weight-bold mb-4 text-primary">
                  Basic Information
                </h3>

                <v-text-field
                  v-model="title"
                  :error-messages="errors.title"
                  label="Book Title"
                  variant="outlined"
                  density="comfortable"
                  :disabled="isSubmitting"
                  class="mb-2 glass-input"
                ></v-text-field>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="isbn"
                      :error-messages="errors.isbn"
                      label="ISBN"
                      variant="outlined"
                      density="comfortable"
                      :disabled="isSubmitting"
                      class="glass-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="pageCount"
                      :error-messages="errors.pageCount"
                      label="Page Count"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      :disabled="isSubmitting"
                      class="glass-input"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-textarea
                  v-model="description"
                  :error-messages="errors.description"
                  label="Description"
                  variant="outlined"
                  density="comfortable"
                  :disabled="isSubmitting"
                  rows="4"
                  class="glass-input"
                ></v-textarea>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12">
              <v-card class="glass-card pa-6" elevation="0">
                <h3 class="text-h6 font-weight-bold mb-4 text-primary">
                  Details & Pricing
                </h3>

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
                      class="glass-input"
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
                      class="glass-input"
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
                      class="glass-input"
                    ></v-text-field>
                  </v-col>

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
                      class="glass-input"
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
                      class="glass-input"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="stock"
                      :error-messages="errors.stock"
                      label="Stock Quantity"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      :disabled="isSubmitting"
                      prepend-inner-icon="mdi-package-variant"
                      class="glass-input"
                    ></v-text-field>
                  </v-col>
                </v-row>

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
                  class="mt-2 glass-input"
                ></v-autocomplete>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12">
              <v-card class="glass-card pa-6" elevation="0">
                <h3 class="text-h6 font-weight-bold mb-4 text-primary">
                  Sale Schedule
                </h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 font-weight-bold mb-2">
                      Start Time
                    </div>
                    <v-row dense>
                      <v-col cols="7">
                        <v-menu
                          v-model="saleStartMenu"
                          :close-on-content-click="false"
                          location="bottom start"
                        >
                          <template v-slot:activator="{ props }">
                            <v-text-field
                              v-model="saleStartDateOnly"
                              label="Date"
                              readonly
                              v-bind="props"
                              variant="outlined"
                              density="comfortable"
                              :disabled="isSubmitting"
                              :error-messages="errors.saleStartDate"
                              prepend-inner-icon="mdi-calendar"
                              clearable
                              @click:clear="
                                saleStartDateOnly = '';
                                saleStartPicker = null;
                              "
                              class="glass-input"
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
                      <v-col cols="5">
                        <v-text-field
                          v-model="saleStartTimeOnly"
                          label="Time"
                          type="time"
                          variant="outlined"
                          density="comfortable"
                          :disabled="isSubmitting"
                          :error-messages="errors.saleStartDate"
                          clearable
                          class="glass-input"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="text-subtitle-2 font-weight-bold mb-2">
                      End Time
                    </div>
                    <v-row dense>
                      <v-col cols="7">
                        <v-menu
                          v-model="saleEndMenu"
                          :close-on-content-click="false"
                          location="bottom start"
                        >
                          <template v-slot:activator="{ props }">
                            <v-text-field
                              v-model="saleEndDateOnly"
                              label="Date"
                              readonly
                              v-bind="props"
                              variant="outlined"
                              density="comfortable"
                              :disabled="isSubmitting"
                              :error-messages="errors.saleEndDate"
                              prepend-inner-icon="mdi-calendar"
                              clearable
                              @click:clear="
                                saleEndDateOnly = '';
                                saleEndPicker = null;
                              "
                              class="glass-input"
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
                      <v-col cols="5">
                        <v-text-field
                          v-model="saleEndTimeOnly"
                          label="Time"
                          type="time"
                          variant="outlined"
                          density="comfortable"
                          :disabled="isSubmitting"
                          :error-messages="errors.saleEndDate"
                          clearable
                          class="glass-input"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12">
              <v-card class="glass-card pa-6" elevation="0">
                <div class="d-flex align-center justify-space-between mb-4">
                  <h3 class="text-h6 font-weight-bold text-primary">
                    Additional Attributes
                  </h3>
                  <v-btn
                    prepend-icon="mdi-plus"
                    size="small"
                    color="primary"
                    variant="tonal"
                    @click="openAttributeDialog()"
                    :disabled="isSubmitting"
                    class="font-weight-bold"
                  >
                    Add Attribute
                  </v-btn>
                </div>

                <v-card
                  variant="outlined"
                  class="pa-0 border-dashed"
                  v-if="attributesArray.length > 0"
                  style="border-color: rgba(0, 0, 0, 0.1)"
                >
                  <v-list
                    class="bg-transparent"
                    lines="one"
                    density="comfortable"
                  >
                    <template
                      v-for="(attr, index) in attributesArray"
                      :key="attr.key"
                    >
                      <v-list-item
                        @click.stop="openAttributeDialog(attr, index)"
                        class="attribute-list-item"
                        rounded="lg"
                      >
                        <template v-slot:prepend>
                          <v-avatar
                            color="primary"
                            variant="tonal"
                            size="32"
                            class="mr-2"
                          >
                            <span class="text-caption font-weight-bold">{{
                              index + 1
                            }}</span>
                          </v-avatar>
                        </template>

                        <v-list-item-title
                          class="font-weight-bold text-primary"
                        >
                          {{ attr.key }}
                        </v-list-item-title>

                        <v-list-item-subtitle>
                          {{ attr.value }}
                        </v-list-item-subtitle>

                        <template v-slot:append>
                          <div class="d-flex gap-2">
                            <v-btn
                              icon="mdi-pencil"
                              variant="tonal"
                              color="primary"
                              size="small"
                              class="action-btn"
                              @click.stop="openAttributeDialog(attr, index)"
                            >
                              <v-tooltip activator="parent" location="top"
                                >Edit</v-tooltip
                              >
                            </v-btn>
                            <v-btn
                              icon="mdi-delete"
                              variant="tonal"
                              color="error"
                              size="small"
                              class="action-btn"
                              @click.stop="deleteAttribute(index)"
                            >
                              <v-tooltip activator="parent" location="top"
                                >Delete</v-tooltip
                              >
                            </v-btn>
                          </div>
                        </template>
                      </v-list-item>
                      <v-divider
                        v-if="index < attributesArray.length - 1"
                        class="mx-4 opacity-20"
                      ></v-divider>
                    </template>
                  </v-list>
                </v-card>

                <v-sheet
                  v-else
                  class="d-flex flex-column align-center justify-center py-8 bg-surface-variant-lighten rounded-lg border-dashed"
                >
                  <v-icon
                    icon="mdi-tag-outline"
                    size="40"
                    color="medium-emphasis"
                    class="mb-2 opacity-50"
                  ></v-icon>
                  <div class="text-body-2 text-medium-emphasis">
                    No custom attributes added yet.
                  </div>
                </v-sheet>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </template>
    </ManagementPage>

    <v-dialog
      v-model="attributeDialog"
      max-width="450px"
      persistent
      transition="dialog-bottom-transition"
    >
      <v-card class="glass-dialog">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-4">
          {{
            editedAttributeIndex === -1 ? "Add New Attribute" : "Edit Attribute"
          }}
        </v-card-title>
        <v-divider class="opacity-20"></v-divider>
        <v-card-text class="pa-6">
          <v-text-field
            v-model="newAttribute.key"
            label="Attribute Key (e.g., language)"
            variant="outlined"
            density="comfortable"
            :disabled="editedAttributeIndex !== -1"
            class="mb-4 glass-input"
            hide-details="auto"
            placeholder="Enter key..."
          ></v-text-field>
          <v-text-field
            v-model="newAttribute.value"
            label="Attribute Value (e.g., Vietnamese)"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="glass-input"
            placeholder="Enter value..."
          ></v-text-field>
        </v-card-text>
        <v-divider class="opacity-20"></v-divider>
        <v-card-actions class="pa-6 pt-4 bg-surface-variant-lighten">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="closeAttributeDialog"
            class="px-6"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveAttribute"
            :disabled="!newAttribute.key || !newAttribute.value"
            class="px-6 font-weight-bold"
            rounded="lg"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import ManagementPage from "./shared/ManagementPage.vue";
import ImageUploader from "./shared/ImageUploader.vue";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { format, parseISO, isValid as isDateValid } from "date-fns";
import {
  getProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getAuthorsApi,
  getPublishersApi,
  getCategoriesApi,
} from "@/api/productApi";
import { getInventoryApi, setInventoryApi } from "@/api/inventoryApi";
import { searchProductsApi } from "@/api/searchApi";

const headers = [
  { title: "Cover", key: "imageUrl", sortable: false, width: "80px" },
  { title: "Title", key: "title", sortable: true },
  { title: "Author", key: "author", sortable: true },
  { title: "Publisher", key: "publisher", sortable: true },
  { title: "Price", key: "basePrice", sortable: true },
  { title: "Actions", key: "actions", sortable: false, align: "end" },
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
  title: "",
  slug: "",
  isbn: "",
  description: "",
  imageUrl: "",
  authorId: null,
  publisherId: null,
  publicationDate: "",
  pageCount: 0,
  basePrice: 0,
  salePrice: null,
  saleStartDate: "",
  saleEndDate: "",
  categoryIds: [],
  stock: 0,
});

const formError = ref(null);
const authorList = ref([]);
const publisherList = ref([]);
const categoryList = ref([]);
const loadingDependencies = ref(false);

const attributesArray = ref([]);
const attributeDialog = ref(false);
const newAttribute = ref({ key: "", value: "" });
const editedAttributeIndex = ref(-1);

const saleStartDateOnly = ref("");
const saleStartTimeOnly = ref("");
const saleEndDateOnly = ref("");
const saleEndTimeOnly = ref("");

const saleStartMenu = ref(false);
const saleEndMenu = ref(false);
const saleStartPicker = ref(null);
const saleEndPicker = ref(null);

const formatPrice = (value) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

const openAttributeDialog = (attr = { key: "", value: "" }, index = -1) => {
  newAttribute.value = JSON.parse(JSON.stringify(attr));
  editedAttributeIndex.value = index;
  attributeDialog.value = true;
};

const closeAttributeDialog = () => {
  attributeDialog.value = false;
  newAttribute.value = { key: "", value: "" };
  editedAttributeIndex.value = -1;
};

const saveAttribute = () => {
  if (!newAttribute.value.key || !newAttribute.value.value) {
    return;
  }

  const normalizedKey = slugify(newAttribute.value.key.toLowerCase());

  if (editedAttributeIndex.value > -1) {
    attributesArray.value[editedAttributeIndex.value].value =
      newAttribute.value.value;
  } else {
    if (attributesArray.value.some((attr) => attr.key === normalizedKey)) {
      formError.value = `Attribute key '${newAttribute.value.key}' already exists. Please edit the existing one.`;
      return;
    }
    attributesArray.value.push({
      key: normalizedKey,
      value: newAttribute.value.value,
    });
  }
  formError.value = null;
  closeAttributeDialog();
};

const deleteAttribute = (index) => {
  attributesArray.value.splice(index, 1);
};

const productSchema = z.object({
  title: z.string().min(1, "Book title is required"),
  slug: z.string().optional(),
  isbn: z.string().optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable().or(z.literal("")),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  authorId: z.string().min(1, "Author is required"),
  publisherId: z.string().min(1, "Publisher is required"),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
    .optional()
    .nullable()
    .or(z.literal("")),
  pageCount: z
    .number()
    .int()
    .min(0, "Pages must be >= 0")
    .optional()
    .nullable(),
  basePrice: z.number().min(0, "Price must be >= 0"),

  salePrice: z
    .number()
    .min(0, "Sale Price must be >= 0")
    .optional()
    .nullable()
    .or(z.literal(0)),
  saleStartDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/,
      "Date & Time must be in YYYY-MM-DDTHH:MM format or empty"
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  saleEndDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/,
      "Date & Time must be in YYYY-MM-DDTHH:MM format or empty"
    )
    .optional()
    .nullable()
    .or(z.literal("")),

  categoryIds: z.array(z.string()).optional(),
  stock: z.number().int().min(0, "Stock must be >= 0").optional().nullable(),
});

const { errors, setValues, resetForm, validate, values, setFieldValue } =
  useForm({
    validationSchema: toTypedSchema(productSchema),
    initialValues: defaultItem.value,
  });

const { value: title } = useField("title");
const { value: slug } = useField("slug");
const { value: isbn } = useField("isbn");
const { value: description } = useField("description");
const { value: imageUrl } = useField("imageUrl");
const { value: authorId } = useField("authorId");
const { value: publisherId } = useField("publisherId");
const { value: publicationDate } = useField("publicationDate");
const { value: pageCount } = useField("pageCount");
const { value: basePrice } = useField("basePrice");
const { value: salePrice } = useField("salePrice");
const { value: saleStartDate } = useField("saleStartDate");
const { value: saleEndDate } = useField("saleEndDate");
const { value: categoryIds } = useField("categoryIds");
const { value: stock } = useField("stock");

watch(title, (newTitle) => {
  if (!values.id) {
    slug.value = slugify(newTitle);
  }
});

const updateSaleStartDate = (newDate) => {
  saleStartDateOnly.value = newDate ? format(newDate, "yyyy-MM-dd") : "";
  saleStartMenu.value = false;
};

const updateSaleEndDate = (newDate) => {
  saleEndDateOnly.value = newDate ? format(newDate, "yyyy-MM-dd") : "";
  saleEndMenu.value = false;
};

const handleOpenDialog = async (item) => {
  attributesArray.value = [];
  resetForm({ values: defaultItem.value });

  if (item && item.id) {
    const attributesObj = item.attributes || {};
    for (const key in attributesObj) {
      attributesArray.value.push({ key: key, value: attributesObj[key] });
    }

    const salesStart = item.saleStartDate?.substring(0, 16).split("T") || [
      "",
      "",
    ];
    saleStartDateOnly.value = salesStart[0];
    saleStartTimeOnly.value = salesStart[1];

    const salesEnd = item.saleEndDate?.substring(0, 16).split("T") || ["", ""];
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
        ? item.publicationDate.split("T")[0]
        : "",
      slug: item.slug || slugify(item.title),
      salePrice: item.salePrice || 0,

      saleStartDate: item.saleStartDate
        ? item.saleStartDate.substring(0, 16)
        : "",
      saleEndDate: item.saleEndDate ? item.saleEndDate.substring(0, 16) : "",
      stock: 0,
    };
    delete itemToSet.attributes;

    setValues(itemToSet);

    try {
      const inventoryData = await getInventoryApi(item.id);
      setFieldValue("stock", inventoryData.stock);
    } catch (e) {
      setFieldValue("stock", 0);
    }
  } else {
    saleStartDateOnly.value = "";
    saleStartTimeOnly.value = "";
    saleEndDateOnly.value = "";
    saleEndTimeOnly.value = "";
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
    console.error("Failed to load dependencies", error);
  } finally {
    loadingDependencies.value = false;
  }
};

const onSave = async (editedItem, showError) => {
  formError.value = null;

  setFieldValue(
    "saleStartDate",
    saleStartDateOnly.value && saleStartTimeOnly.value
      ? `${saleStartDateOnly.value}T${saleStartTimeOnly.value}`
      : saleStartDateOnly.value || ""
  );
  setFieldValue(
    "saleEndDate",
    saleEndDateOnly.value && saleEndTimeOnly.value
      ? `${saleEndDateOnly.value}T${saleEndTimeOnly.value}`
      : saleEndDateOnly.value || ""
  );

  const { valid } = await validate();
  if (!valid) {
    return false;
  }

  const payload = { ...values };
  const stockAmount = payload.stock || 0;
  delete payload.stock;

  payload.authorId = payload.authorId || null;
  payload.publisherId = payload.publisherId || null;
  payload.publicationDate = payload.publicationDate || null;
  payload.pageCount = payload.pageCount || 0;
  payload.basePrice = Number(payload.basePrice);

  payload.slug = payload.slug || slugify(payload.title);

  payload.salePrice = Number(payload.salePrice) || null;

  const dateToIso = (dateString) => {
    if (!dateString) return null;
    if (dateString.includes("T")) {
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
  attributesArray.value.forEach((attr) => {
    if (attr.key && attr.value) {
      attributesObject[attr.key] = attr.value;
    }
  });
  payload.attributes = attributesObject;

  try {
    let savedProduct;
    if (editedItem.id) {
      savedProduct = await updateProductApi(editedItem.id, payload);
    } else {
      savedProduct = await createProductApi(payload);
    }

    if (savedProduct && savedProduct.id) {
      await setInventoryApi(savedProduct.id, stockAmount);
    }

    return true;
  } catch (error) {
    console.error("Save failed:", error);
    showError(error.message || "Failed to save product");
    return false;
  }
};
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
}

.glass-input :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(4px);
  border-radius: 8px;
}

.glass-dialog {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-radius: 24px !important;
}

.attribute-list-item {
  transition: background-color 0.2s ease;
}

.attribute-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.border-dashed {
  border-style: dashed !important;
}

.bg-surface-variant-lighten {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-50 {
  opacity: 0.5;
}
</style>
