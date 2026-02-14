<template>
  <div class="rank-container">
    <h1>🔥 校园菜品黑红榜</h1>

    <div class="tabs">
      <button :class="{ active: showRedBox }" @click="showRedBox = true">红榜 (高分)</button>
      <button :class="{ active: !showRedBox }" @click="showRedBox = false">黑榜 (低分)</button>
    </div>

    <div class="dish-list">
      <div v-for="(dish, index) in sortedDishes" :key="dish.id" class="dish-card">
        <div class="rank-num">{{ index + 1 }}</div>
        <div class="info">
          <h3>{{ dish.name }}</h3>
          <p>{{ dish.canteen }} · {{ dish.floor }}</p>
          <div class="score-display">
            平均分：<span>{{ dish.averageScore.toFixed(1) }}</span>
          </div>
        </div>

        <div class="rate-action">
          <p>去评分：</p>
          <StarRating v-model="dish.myRate" @update:modelValue="updateScore(dish)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import StarRating from '../components/StarRating.vue';

const showRedBox = ref(true);

// 模拟初始数据
const dishes = ref([
  { id: 1, name: '红烧排骨', canteen: '一食堂', floor: 'F2', averageScore: 4.8, totalVotes: 100, myRate: 0 },
  { id: 2, name: '螺蛳粉', canteen: '二食堂', floor: 'B1', averageScore: 2.3, totalVotes: 50, myRate: 0 },
  { id: 3, name: '烤肉饭', canteen: '三食堂', floor: 'F1', averageScore: 4.5, totalVotes: 80, myRate: 0 },
  { id: 4, name: '蓝瘦香菇', canteen: '一食堂', floor: 'F1', averageScore: 1.5, totalVotes: 30, myRate: 0 },
]);

// 核心排序逻辑
const sortedDishes = computed(() => {
  const list = [...dishes.value];
  if (showRedBox.value) {
    // 红榜：从高到低排
    return list.filter(d => d.averageScore >= 3).sort((a, b) => b.averageScore - a.averageScore);
  } else {
    // 黑榜：从低到高排
    return list.filter(d => d.averageScore < 3).sort((a, b) => a.averageScore - b.averageScore);
  }
});

// 模拟更新平均分的逻辑
const updateScore = (dish) => {
  // 这里的逻辑应该是发给后端，后端计算后再返回
  // 临时模拟：(当前平均分 * 总票数 + 我的分数) / (总票数 + 1)
  const newTotalVotes = dish.totalVotes + 1;
  dish.averageScore = (dish.averageScore * dish.totalVotes + dish.myRate) / newTotalVotes;
  dish.totalVotes = newTotalVotes;
  alert(`感谢评分！该菜品当前平均分已更新为: ${dish.averageScore.toFixed(1)}`);
};
</script>

<style scoped>
.rank-container { padding: 20px; max-width: 600px; margin: 0 auto; }
.tabs { display: flex; gap: 10px; margin-bottom: 20px; }
.tabs button { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; }
.tabs button.active { background: #ff4757; color: white; font-weight: bold; }

.dish-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.rank-num { font-size: 24px; font-weight: bold; margin-right: 15px; color: #ff4757; }
.info { flex: 1; }
.info h3 { margin: 0 0 5px 0; }
.score-display span { color: #ffca28; font-weight: bold; font-size: 18px; }
.rate-action p { font-size: 12px; color: #999; margin-bottom: 4px; }
</style>
