<template>
  <div class="rank-container">
    <div class="header">
      <h1>🍴 校园菜品黑红榜</h1>
      <button @click="$router.push('/CreateDish')" class="add-btn">+ 我要投稿</button>
    </div>

    <div class="tabs">
      <div
        class="tab"
        :class="{ active: currentTab === 'red' }"
        @click="currentTab = 'red'"
      >❤️ 红榜 (高分)</div>
      <div
        class="tab"
        :class="{ active: currentTab === 'black' }"
        @click="currentTab = 'black'"
      >🖤 黑榜 (避雷)</div>
    </div>

    <div class="list">
      <div v-for="(dish, index) in filteredDishes" :key="dish.id" class="dish-card">
        <div class="rank-badge" :class="currentTab">{{ index + 1 }}</div>

        <div class="dish-info">
          <h3>{{ dish.name }}</h3>
          <p class="location">{{ dish.canteen }} · {{ dish.floor }}</p>
          <div class="stats">
            <span class="avg-score">⭐ {{ dish.averageScore.toFixed(1) }}</span>
            <span class="votes">{{ dish.totalVotes }} 人参与</span>
          </div>
        </div>

        <div class="rating-box">
          <p>你的评价：</p>
          <StarRating
            v-model="dish.userScore"
            @update:modelValue="handleRate(dish)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import StarRating from '../components/StarRating.vue';

const currentTab = ref('red');

// 模拟初始数据
const dishes = ref([
  { id: 101, name: '红烧排骨', canteen: '一食堂', floor: 'F2', averageScore: 4.8, totalVotes: 156, userScore: 0 },
  { id: 102, name: '螺蛳粉', canteen: '二食堂', floor: 'B1', averageScore: 2.1, totalVotes: 89, userScore: 0 },
  { id: 103, name: '菠萝咕咾肉', canteen: '三食堂', floor: 'F1', averageScore: 4.5, totalVotes: 42, userScore: 0 },
  { id: 104, name: '仰望星空派', canteen: '四食堂', floor: 'F3', averageScore: 1.2, totalVotes: 230, userScore: 0 },
]);

// 过滤和排序逻辑
const filteredDishes = computed(() => {
  let result = [];
  if (currentTab.value === 'red') {
    result = dishes.value.filter(d => d.averageScore >= 3);
    return result.sort((a, b) => b.averageScore - a.averageScore);
  } else {
    result = dishes.value.filter(d => d.averageScore < 3);
    return result.sort((a, b) => a.averageScore - b.averageScore);
  }
});

// 处理打分逻辑
const handleRate = (dish) => {
  // 模拟计算：更新平均分
  const newTotal = dish.totalVotes + 1;
  dish.averageScore = (dish.averageScore * dish.totalVotes + dish.userScore) / newTotal;
  dish.totalVotes = newTotal;

  alert(`打分成功！你给了 ${dish.userScore} 星。该菜品目前平均分：${dish.averageScore.toFixed(1)}`);
};
</script>

<style scoped>
.rank-container { padding: 20px; max-width: 600px; margin: 0 auto; background: #fff; min-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.add-btn { background: #42b983; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; }

.tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 20px; }
.tab { flex: 1; text-align: center; padding: 12px; cursor: pointer; color: #666; font-weight: bold; }
.tab.active { color: #ff4757; border-bottom: 2px solid #ff4757; }

.dish-card {
  display: flex; align-items: center; padding: 15px; border-radius: 12px;
  background: #f9f9f9; margin-bottom: 15px; border: 1px solid #eee;
}
.rank-badge {
  width: 30px; height: 30px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px;
}
.rank-badge.red { background: #ff4757; }
.rank-badge.black { background: #2f3542; }

.dish-info { flex: 1; }
.dish-info h3 { margin: 0; font-size: 18px; }
.location { font-size: 12px; color: #888; margin: 4px 0; }
.avg-score { color: #ffa502; font-weight: bold; margin-right: 10px; }
.votes { font-size: 12px; color: #999; }

.rating-box { text-align: right; border-left: 1px solid #eee; padding-left: 15px; }
.rating-box p { font-size: 12px; color: #999; margin: 0 0 5px 0; }
</style>