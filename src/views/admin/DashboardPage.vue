<template>
  <v-container fluid class="pa-6">
    <h1 class="text-h4 font-weight-bold mb-6 text-primary d-flex align-center">
      <v-icon class="mr-3">mdi-view-dashboard-outline</v-icon>
      Dashboard
    </h1>

    <div class="d-flex justify-end mb-6">
      <v-btn
        color="primary"
        prepend-icon="mdi-database-sync"
        @click="handleSyncSearch"
        :loading="isSyncing"
        class="text-capitalize"
        rounded="lg"
        elevation="2"
      >
        Sync Search Data
      </v-btn>
    </div>
    
    <v-slide-y-transition group appear>
      <v-row key="stat-cards">
        <v-col
          v-for="(stat, i) in statCards"
          :key="i"
          cols="12"
          sm="6"
          lg="3"
        >
          <v-card
            class="glass-card stat-card fill-height"
            elevation="0"
          >
            <div class="d-flex justify-space-between align-start pa-6">
              <div>
                <div class="text-overline text-medium-emphasis font-weight-bold mb-1">{{ stat.title }}</div>
                <div class="text-h3 font-weight-bold" :class="`text-${stat.color}`">
                  <v-fade-transition leave-absolute>
                    <span :key="stat.value">{{ stat.value }}</span>
                  </v-fade-transition>
                </div>
              </div>
              <v-avatar 
                :color="stat.color" 
                variant="tonal" 
                size="64" 
                class="rounded-xl"
              >
                <v-icon :icon="stat.icon" size="32" />
              </v-avatar>
            </div>
            
            <!-- Decorative gradient line at bottom -->
            <div class="stat-line" :class="`bg-${stat.color}`"></div>
          </v-card>
        </v-col>
      </v-row>

      <v-row key="charts" class="mt-2">
        <v-col cols="12" lg="8">
          <v-card class="glass-card chart-card pa-6" elevation="0">
            <div class="d-flex align-center justify-space-between mb-6">
              <v-card-title class="pa-0 font-weight-bold text-h6">
                Revenue Overview
              </v-card-title>
              <v-chip size="small" color="primary" variant="tonal">Monthly</v-chip>
            </div>
            <div class="chart-container">
              <Bar
                v-if="revenueChartData.datasets.length"
                :data="revenueChartData"
                :options="chartOptions"
              />
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" lg="4">
          <v-card class="glass-card chart-card pa-6" elevation="0">
            <div class="d-flex align-center justify-space-between mb-6">
              <v-card-title class="pa-0 font-weight-bold text-h6">
                New Users
              </v-card-title>
              <v-chip size="small" color="success" variant="tonal">Weekly</v-chip>
            </div>
            <div class="chart-container">
              <Line
                v-if="userChartData.datasets.length"
                :data="userChartData"
                :options="chartOptions"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-slide-y-transition>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'vue-chartjs';
import { getAllUsersApi } from '@/api/userApi';
import { getProductsApi } from '@/api/productApi';
import { syncSearchApi } from '@/api/searchApi';
import { useNotificationStore } from '@/stores/useNotificationStore';

const notificationStore = useNotificationStore();
const isSyncing = ref(false);

const handleSyncSearch = async () => {
  isSyncing.value = true;
  try {
    await syncSearchApi();
    notificationStore.showSuccess('Search data synchronized successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
    notificationStore.showError('Failed to synchronize search data.');
  } finally {
    isSyncing.value = false;
  }
};

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

const statCards = ref([
  {
    title: 'Total Users',
    value: 0,
    icon: 'mdi-account-group',
    color: 'primary',
  },
  {
    title: 'Total Products',
    value: 0,
    icon: 'mdi-book-open-page-variant',
    color: 'success',
  },
  {
    title: 'Total Orders',
    value: 0,
    icon: 'mdi-cart',
    color: 'warning',
  },
  {
    title: 'Revenue',
    value: '0 ₫',
    icon: 'mdi-cash',
    color: 'error',
  },
]);

const revenueChartData = ref({ labels: [], datasets: [] });
const userChartData = ref({ labels: [], datasets: [] });

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#000',
      bodyColor: '#666',
      borderColor: 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false,
      },
      ticks: {
        font: {
          family: 'Inter',
        }
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: 'Inter',
        }
      }
    },
  },
  tension: 0.4,
});

const loadStats = async () => {
  try {
    const [usersData, productsData] = await Promise.all([
      getAllUsersApi(),
      getProductsApi(0, 1),
    ]);
    statCards.value[0].value = usersData.length;
    statCards.value[1].value = productsData.totalElements;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};

const loadMockCharts = () => {
  const labels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Create gradient for bar chart
  const ctx = document.createElement('canvas').getContext('2d');
  const gradientBar = ctx.createLinearGradient(0, 0, 0, 400);
  gradientBar.addColorStop(0, 'rgba(25, 118, 210, 0.8)');
  gradientBar.addColorStop(1, 'rgba(25, 118, 210, 0.2)');

  revenueChartData.value = {
    labels,
    datasets: [
      {
        label: 'Revenue (Million ₫)',
        backgroundColor: gradientBar,
        hoverBackgroundColor: 'rgba(25, 118, 210, 1)',
        borderRadius: 8,
        data: [15, 22, 18, 25, 30, 28, 35, 40, 38, 45, 42, 50],
        barThickness: 12,
      },
    ],
  };

  const gradientLine = ctx.createLinearGradient(0, 0, 0, 400);
  gradientLine.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
  gradientLine.addColorStop(1, 'rgba(76, 175, 80, 0.0)');

  userChartData.value = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'New Users',
        borderColor: '#4CAF50',
        backgroundColor: gradientLine,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#4CAF50',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        data: [5, 8, 12, 10, 15, 14],
      },
    ],
  };
};

onMounted(() => {
  loadStats();
  loadMockCharts();
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05) !important;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1) !important;
}

.stat-line {
  height: 4px;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  opacity: 0.5;
}

.chart-card {
  height: 420px;
}

.chart-container {
  height: 320px;
  width: 100%;
}
</style>