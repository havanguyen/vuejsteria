<template>
  <v-container fluid>
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
            class="stat-card"
            :color="stat.color"
            variant="tonal"
            elevation="2"
          >
            <div class="d-flex justify-space-between align-center pa-4">
              <div>
                <div class="text-h4 font-weight-bold">
                  <v-fade-transition leave-absolute>
                    <span :key="stat.value">{{ stat.value }}</span>
                  </v-fade-transition>
                </div>
                <div class="text-overline">{{ stat.title }}</div>
              </div>
              <v-avatar :color="stat.color" size="64" class="elevation-4">
                <v-icon :icon="stat.icon" size="32" color="white" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row key="charts">
        <v-col cols="12" lg="8">
          <v-card class="pa-4 chart-card" elevation="2">
            <v-card-title>Doanh thu (Giả lập)</v-card-title>
            <v-card-text>
              <Bar
                v-if="revenueChartData.datasets.length"
                :data="revenueChartData"
                :options="chartOptions"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" lg="4">
          <v-card class="pa-4 chart-card" elevation="2">
            <v-card-title>Người dùng mới (Giả lập)</v-card-title>
            <v-card-text>
              <Line
                v-if="userChartData.datasets.length"
                :data="userChartData"
                :options="chartOptions"
              />
            </v-card-text>
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
    title: 'Tổng Users',
    value: 0,
    icon: 'mdi-account-group',
    color: 'primary',
  },
  {
    title: 'Tổng Sản phẩm',
    value: 0,
    icon: 'mdi-book-open-page-variant',
    color: 'success',
  },
  {
    title: 'Tổng Đơn hàng',
    value: 0,
    icon: 'mdi-cart',
    color: 'warning',
  },
  {
    title: 'Doanh thu',
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
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
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
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
    'T8',
    'T9',
    'T10',
    'T11',
    'T12',
  ];
  revenueChartData.value = {
    labels,
    datasets: [
      {
        label: 'Doanh thu (triệu ₫)',
        backgroundColor: 'rgba(25, 118, 210, 0.6)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 2,
        borderRadius: 4,
        data: [15, 22, 18, 25, 30, 28, 35, 40, 38, 45, 42, 50],
      },
    ],
  };

  userChartData.value = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
    datasets: [
      {
        label: 'Người dùng mới',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: 'rgba(76, 175, 80, 1)',
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
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
.stat-card {
  transition:
    all 0.3s ease-in-out,
    border 0.1s ease-in-out;
  border: 1px solid transparent;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
  border-color: currentColor;
}

.chart-card {
  height: 400px;
}

.chart-card .v-card-text {
  height: calc(100% - 64px);
}
</style>