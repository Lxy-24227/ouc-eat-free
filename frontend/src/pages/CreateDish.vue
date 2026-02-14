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

      <button
        @click="handleSubmit"
        :disabled="isSubmitting"
        class="submit-btn"
      >
        {{ isSubmitting ? '正在发布...' : '发布并去排行' }}
      </button>
    </div>

    <p class="footer-tip">让更多同学发现校园美味 ✨</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// 注意：如果你的 api/dish.js 还没写好，可以先注释掉下面这行
// import { createDish } from '../api/dish';

const router = useRouter();
const isSubmitting = ref(false);

// 选项数据
const canteens = ['一食堂', '二食堂', '三食堂', '四食堂'];
const floors = ['B1', 'F1', 'F2', 'F3'];

// 表单响应式数据
const formData = ref({
  canteen: '一食堂',
  floor: 'F1',
  name: ''
});

// 提交处理函数
const handleSubmit = async () => {
  // 1. 基础非空校验
  if (!formData.value.name.trim()) {
    alert("请输入菜品名称！");
    return;
  }

  try {
    isSubmitting.value = true;

    // --- 联调阶段 ---
    // 如果后端接口已准备好，取消下面的注释：
    // await createDish(formData.value);

    // --- 模拟阶段 ---
    // 模拟网络延迟 800ms
    await new Promise(resolve => setTimeout(resolve, 800));

    alert("发布成功！");

    // 2. 跳转到排行榜页面
    router.push('/DishRank');

  } catch (error) {
    console.error("提交失败:", error);
    alert("服务器开小差了，我们将先为您跳转到榜单页");
    router.push('/DishRank');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
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