<template>
  <div class="create-dish-container">
    <div class="header">
      <button @click="$router.push('/DishRank')" class="back-btn">榜单</button>
      <h1>新增菜品</h1>
    </div>

    <div class="card">
      <div class="form-group">
        <label>所属食堂</label>
        <select v-model="formData.canteen">
          <option v-for="c in canteens" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>菜品名称</label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="请输入菜名"
          maxlength="20"
        />
      </div>

      <div class="form-group">
        <label>价格（元）</label>
        <input
          v-model.number="formData.price"
          type="number"
          min="0.1"
          step="0.1"
          placeholder="请输入价格，例如 12.5"
        />
      </div>

      <button
        @click="handleSubmit"
        :disabled="isSubmitting"
        class="submit-btn"
      >
        {{ isSubmitting ? '提交中…' : '发布并查看排行' }}
      </button>
    </div>

    <p class="footer-tip">真实评价帮助更多人选择</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { createDish } from '../api/dish';

const router = useRouter();
const isSubmitting = ref(false);

const canteens = ['一食堂', '二食堂', '三食堂', '四食堂'];

const formData = ref({
  canteen: '一食堂',
  name: '',
  price: null
});

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    alert('请输入菜品名称！');
    return;
  }
  if (formData.value.price == null || Number(formData.value.price) <= 0) {
    alert('请输入正确价格（大于0）！');
    return;
  }

  try {
    isSubmitting.value = true;
    // 最小改动：仅修复创建菜品未入库问题，改为真实接口
    const res = await createDish({
      name: formData.value.name.trim(),
      canteen: formData.value.canteen,
      price: Number(formData.value.price)
    });
    if (res?.code === 200) {
      alert('发布成功！');
      router.push('/DishRank');
      return;
    }
    alert(res?.message || '发布失败，请稍后重试');
  } catch (error) {
    console.error('提交失败:', error);
    alert(error?.message || '发布失败，请检查网络');
  } finally {
    isSubmitting.value = false;
  } 
};
</script>

<style scoped>
.create-dish-container {
  padding: 24px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 28px;
}

.back-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all .2s ease;
}
.back-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card {
  background: var(--bg-card);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

select, input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: var(--bg-card);
}

select:focus, input:focus {
  border-color: var(--accent);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s;
}
.submit-btn:hover:not(:disabled) {
  opacity: 0.92;
}

.submit-btn:active {
  opacity: 0.92;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.footer-tip {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 12px;
  margin-top: 28px;
}

@media (min-width: 900px) {
  .create-dish-container {
    max-width: 560px;
  }
  .card {
    padding: 28px;
  }
}
</style>