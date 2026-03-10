<template>
  <div class="page-container">
    <div class="header">
      <h1>欢迎回来</h1>
    </div>

    <div class="auth-card">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input
          v-model="form.username"
          type="text"
          class="form-input"
          placeholder="请输入用户名"
        />
      </div>

      <div class="form-group">
        <label class="form-label">密码</label>
        <input
          v-model="form.password"
          type="password"
          class="form-input"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
      </div>

      <button class="btn-primary" :disabled="isLoading" @click="handleLogin">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>

      <div class="auth-links">
        <span class="text-hint">还没有账号？</span>
        <button class="link-btn" @click="$router.push('/register')">立即注册</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({ username: '', password: '' });
const isLoading = ref(false);

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    alert('请填写完整信息');
    return;
  }

  isLoading.value = true;
  // 模拟 API 请求
  setTimeout(() => {
    // 模拟保存用户信息到本地
    localStorage.setItem('user_info', JSON.stringify({
      username: form.value.username,
      avatar: 'https://via.placeholder.com/150/ebebeb/999?text=User',
      bio: '这个人很懒，什么都没写~'
    }));
    isLoading.value = false;
    router.push('/DishRank'); // 登录成功跳回主页
  }, 800);
}
</script>

<style scoped>
/* 基础容器规范同步自现有组件 */
.page-container {
  padding: 24px;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header {
  margin-bottom: 32px;
  text-align: center;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.auth-card {
  background: var(--bg-card);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  color: var(--text-primary);
  background: var(--bg-card);
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--accent);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.text-hint {
  color: var(--text-tertiary);
}

.link-btn {
  background: transparent;
  border: none;
  color: var(--accent);
  font-weight: 500;
  cursor: pointer;
  padding: 0 4px;
}

@media (min-width: 1200px) {
  .page-container { max-width: 480px; }
}
</style>