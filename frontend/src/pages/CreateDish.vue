<template>
  <div class="create-dish-container">
    <div class="header">
      <button @click="$router.push('/DishRank')" class="back-btn">⬅ 榜单</button>
      <h1>新增校园菜品</h1>
    </div>

    <div class="card">
      <div class="form-group">
        <label>📍 所属食堂</label>
        <select v-model="formData.canteen">
          <option v-for="c in canteens" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>🏢 具体楼层</label>
        <select v-model="formData.floor">
          <option v-for="f in floors" :key="f" :value="f">{{ f }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>🍲 菜品名称</label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="请输入菜名，如：油泼面"
          maxlength="20"
        />
      </div>

      <div class="form-group rating-section">
        <label>⭐️ 初始评分 (选填)</label>
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ active: star <= formData.initialScore }"
            @click="formData.initialScore = star"
          >
            ★
          </span>
          <span class="score-hint">{{ scoreHint }}</span>
        </div>
      </div>

      <button
        @click="handleSubmit"
        :disabled="isSubmitting"
        class="submit-btn"
      >
        {{ isSubmitting ? '正在发布...' : '发布并查看排行' }}
      </button>
    </div>

    <p class="footer-tip">你的真实评价是大家避雷/安利的关键 ✨</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isSubmitting = ref(false);

const canteens = ['一食堂', '二食堂', '三食堂', '四食堂'];
const floors = ['B1', 'F1', 'F2', 'F3'];

// 表单响应式数据：增加了 initialScore
const formData = ref({
  canteen: '一食堂',
  floor: 'F1',
  name: '',
  initialScore: 0 // 默认为0分
});

// 计算评分提示文案
const scoreHint = computed(() => {
  const hints = {
    0: '点击星星打分',
    1: '极差，避雷',
    2: '一般，不推荐',
    3: '还可以，能吃',
    4: '好吃，推荐',
    5: '绝了，必须安利'
  };
  return hints[formData.value.initialScore];
});

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    alert("请输入菜品名称！");
    return;
  }

  // 校验是否打分（如果你们强制要求创建时必须评价）
  if (formData.value.initialScore === 0) {
    if (!confirm("你还没有打分，确定要提交吗？")) return;
  }

  try {
    isSubmitting.value = true;

    // --- 模拟提交 ---
    console.log("提交的数据包含评分：", formData.value);
    await new Promise(resolve => setTimeout(resolve, 800));

    alert("发布并评价成功！");

    // 跳转到排行榜页面
    router.push('/DishRank');

  } catch (error) {
    console.error("提交失败:", error);
    alert("发布失败，请检查网络");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 保持原有样式并增加打分样式 */
.create-dish-container {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-btn {
  background: #eee;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  margin-right: 15px;
  font-size: 14px;
}

h1 {
  font-size: 22px;
  color: #333;
  margin: 0;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 22px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #444;
  font-size: 15px;
}

select, input {
  width: 100%;
  padding: 14px;
  border: 1.5px solid #eee;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

select:focus, input:focus {
  border-color: #ff4757;
}

/* 评分区域专属样式 */
.rating-section {
  padding: 15px 0;
  border-top: 1px dashed #eee;
}

.stars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star {
  font-size: 30px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s, transform 0.1s;
}

.star:active {
  transform: scale(1.2);
}

.star.active {
  color: #ffca28;
}

.score-hint {
  margin-left: 10px;
  font-size: 14px;
  color: #999;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
  transition: transform 0.2s, background-color 0.2s;
  margin-top: 10px;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  background-color: #ffb8bc;
  cursor: not-allowed;
}

.footer-tip {
  text-align: center;
  color: #aaa;
  font-size: 13px;
  margin-top: 30px;
}
</style>