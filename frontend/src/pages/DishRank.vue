<template>
  <div class="rank-container">
    <div class="header">
      <h1>菜品排行</h1>
      <button @click="$router.push('/CreateDish')" class="add-btn">我要投稿</button>
    </div>

    <div class="tabs">
      <div
        class="tab"
        :class="{ active: currentTab === 'red' }"
        @click="currentTab = 'red'"
      >红榜</div>
      <div
        class="tab"
        :class="{ active: currentTab === 'black' }"
        @click="currentTab = 'black'"
      >黑榜</div>
    </div>

    <div v-if="loading" class="loading-tip">加载中…</div>
    <div v-else class="list">
      <div
        v-for="(dish, index) in filteredDishes"
        :key="dish.id"
        class="dish-card"
        :class="{ 'top-three': index < 3 }"
      >
        <span v-if="index < 3" class="card-badge">TOP{{ index + 1 }}</span>
        <div class="card-image-wrap">
          <img :src="dish.image || 'https://via.placeholder.com/400x240/ebebeb/999?text=—'" :alt="dish.name" class="card-image" />
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ dish.name }}</h3>
          <p class="card-location">{{ dish.canteen }} · {{ dish.floor }}</p>
          <div class="card-stars">
            <StarRating :model-value="Math.round(dish.averageScore)" readonly :show-score-text="false" />
            <span class="card-votes">{{ dish.totalVotes }} 人评分</span>
          </div>
          <div class="card-meta">
            <span class="card-price">¥{{ dish.price != null ? dish.price : '—' }}</span>
          </div>
          <div class="rating-box">
            <p class="rating-label">我的评分</p>
            <StarRating
              v-model="dish.userScore"
              @update:modelValue="handleRate(dish)"
              :show-score-text="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import StarRating from '../components/StarRating.vue';
import { getRanking } from '../api/rank';
import { submitRating } from '../api/rating';

const currentTab = ref('red');
const loading = ref(false);

const MOCK_DISHES = [
  { id: 101, name: '红烧排骨', canteen: '一食堂', floor: 'F2', averageScore: 4.8, totalVotes: 156, userScore: 0, price: 12 },
  { id: 102, name: '螺蛳粉', canteen: '二食堂', floor: 'B1', averageScore: 2.1, totalVotes: 89, userScore: 0, price: 10 },
  { id: 103, name: '菠萝咕咾肉', canteen: '三食堂', floor: 'F1', averageScore: 4.5, totalVotes: 42, userScore: 0, price: 15 },
  { id: 104, name: '仰望星空派', canteen: '四食堂', floor: 'F3', averageScore: 1.2, totalVotes: 230, userScore: 0, price: 8 },
];

const dishes = ref([...MOCK_DISHES]);

function mapDish(item) {
  return {
    id: item.id,
    name: item.name ?? '未命名',
    canteen: item.restaurant_name ?? '',
    floor: item.floor ?? '',
    averageScore: Number(item.avg_score) || 0,
    totalVotes: Number(item.total_votes) ?? 0,
    userScore: 0,
    price: item.price ?? null,
    image: item.image ?? null,
  };
}

async function fetchRanking() {
  loading.value = true;
  try {
    const res = await getRanking({ type: currentTab.value, page: 1, pageSize: 50 });
    if (res?.code === 200 && res?.data?.list?.length) {
      dishes.value = res.data.list.map(mapDish);
    }
  } catch (_) {
    dishes.value = [...MOCK_DISHES];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchRanking);
watch(currentTab, fetchRanking);

const filteredDishes = computed(() => {
  const list = currentTab.value === 'red'
    ? dishes.value.filter(d => d.averageScore >= 3).sort((a, b) => b.averageScore - a.averageScore)
    : dishes.value.filter(d => d.averageScore < 3).sort((a, b) => a.averageScore - b.averageScore);
  return list;
});

async function handleRate(dish) {
  if (!dish.userScore || dish.userScore < 1) return;
  try {
    await submitRating(dish.id, dish.userScore);
    const newTotal = (dish.totalVotes || 0) + 1;
    const newAvg = ((dish.averageScore * (dish.totalVotes || 0)) + dish.userScore) / newTotal;
    dish.averageScore = Math.round(newAvg * 100) / 100;
    dish.totalVotes = newTotal;
    alert(`打分成功！该菜品目前平均分：${dish.averageScore.toFixed(1)}`);
  } catch (e) {
    const newTotal = (dish.totalVotes || 0) + 1;
    dish.averageScore = ((dish.averageScore * (dish.totalVotes || 0)) + dish.userScore) / newTotal;
    dish.totalVotes = newTotal;
    alert(`打分已更新（本地）：${dish.averageScore.toFixed(1)}`);
  }
}
</script>

<style scoped>
.rank-container {
  padding: 24px;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dish-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.dish-card.top-three {
  border-color: #d4cfc4;
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.card-image-wrap {
  width: 100%;
  height: 0;
  padding-bottom: 40%;
  background: #ebebeb;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 14px 16px;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-location {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0 0 10px 0;
}

.card-stars {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-votes {
  font-size: 12px;
  color: var(--text-tertiary);
}

.card-meta {
  margin-bottom: 10px;
}

.card-price {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.rating-box {
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.rating-label,
.rating-box p {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0 0 6px 0;
  font-weight: 500;
}

.loading-tip {
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>