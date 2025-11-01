<template>
  <v-card
    @click="triggerFileInput"
    variant="tonal"
    class="image-uploader-card"
    :class="{ 'is-uploading': isUploading }"
    :disabled="isUploading"
  >
    <v-img
      :src="modelValue || placeholder"
      :aspect-ratio="aspectRatio"
      cover
      class="image-preview"
    >
      <template v-slot:placeholder>
        <div class="d-flex align-center justify-center fill-height text-grey">
          <v-icon :icon="placeholderIcon" size="48"></v-icon>
        </div>
      </template>
      <v-fade-transition>
        <div
          v-if="!isUploading"
          class="d-flex align-center justify-center fill-height image-overlay"
        >
          <v-icon color="white" size="32">mdi-camera-plus-outline</v-icon>
        </div>
      </v-fade-transition>
      <v-progress-linear
        v-if="isUploading"
        indeterminate
        color="primary"
        absolute
        location="bottom"
      ></v-progress-linear>
    </v-img>
    <input
      type="file"
      ref="fileInputRef"
      @change="handleFileSelected"
      accept="image/*"
      hidden
    />
    <v-card-text class="text-center pa-2">
      <div class="text-subtitle-2">{{ label }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { uploadImageApi } from '@/api/fileApi';

const props = defineProps({
  modelValue: String,
  label: {
    type: String,
    default: 'Upload Image',
  },
  placeholder: {
    type: String,
    default: 'https://via.placeholder.com/300x400',
  },
  placeholderIcon: {
    type: String,
    default: 'mdi-image-area',
  },
  aspectRatio: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(['update:modelValue']);

const loadingStore = useLoadingStore();
const notificationStore = useNotificationStore();

const isUploading = ref(false);
const fileInputRef = ref(null);

const triggerFileInput = () => {
  if (isUploading.value) return;
  fileInputRef.value.click();
};

const handleFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploading.value = true;
  loadingStore.showLoading();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await uploadImageApi(formData);
    emit('update:modelValue', response.url);
    notificationStore.showSuccess('Image uploaded successfully!');
  } catch (err) {
    notificationStore.showError(err.message || 'Image upload failed');
  } finally {
    isUploading.value = false;
    loadingStore.hideLoading();
    event.target.value = null;
  }
};
</script>

<style scoped>
.image-uploader-card {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.image-uploader-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.image-uploader-card.is-uploading {
  cursor: not-allowed;
  opacity: 0.7;
}
.image-preview .image-overlay {
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}
.image-uploader-card:hover .image-overlay {
  opacity: 1;
}
</style>