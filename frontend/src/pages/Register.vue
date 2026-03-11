<template>
  <div class="page-container">
    <div class="auth-shell">
      <div class="brand-panel">
        <p class="brand-tag">
          <span style="font-weight: bold; font-size: 1.7em; letter-spacing: 0.1em; color: #60a073; font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;">
            OUC <span style="color:#46845e;">Eat Free</span>
          </span>
        </p>
        <h1>注册账号</h1>
        <p class="brand-desc">这里欢迎任何友善犀利的声音</p>
      </div>

      <div class="auth-card">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model.trim="form.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model.trim="form.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input
            v-model.trim="form.confirmPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入密码"
            maxlength="20"
            @keyup.enter="handleRegister"
          />
        </div>

        <button class="btn-primary" :disabled="isLoading" @click="handleRegister">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>

        <div class="auth-links">
          <span class="text-hint">已有账号？</span>
          <button class="link-btn" @click="router.push('/login')">直接登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../api/auth';

const router = useRouter();
const form = ref({ username: '', password: '', confirmPassword: '' });
const isLoading = ref(false);

async function handleRegister() {
  if (!form.value.username || !form.value.password || !form.value.confirmPassword) {
    alert('请填写完整信息');
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    alert('两次输入的密码不一致');
    return;
  }

  isLoading.value = true;

  try {
    const res = await registerUser({
      username: form.value.username,
      password: form.value.password
    });

    if (res?.code !== 200) {
      alert(res?.message || '注册失败');
      return;
    }

    alert('注册成功，请登录');
    router.push('/login');
  } catch (error) {
    alert(error?.message || '用户名已存在');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(120, 182, 136, 0.14), transparent 32%),
    radial-gradient(circle at bottom left, rgba(255, 198, 129, 0.18), transparent 28%),
    var(--bg-page);
}

.auth-shell {
  width: min(940px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
}

.brand-panel,
.auth-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(198, 220, 202, 0.8);
  border-radius: 24px;
  box-shadow: 0 18px 40px rgba(73, 105, 77, 0.08);
}

.brand-panel {
  padding: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-tag {
  margin: 0 0 14px;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0 0 12px;
  font-size: 32px;
  line-height: 1.2;
  color: var(--text-primary);
}

.brand-desc {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 15px;
}

.auth-card {
  padding: 32px 28px;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  border: 1px solid #d7e2d8;
  border-radius: 14px;
  background: #f9fcf8;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.form-input:hover {
  border-color: #bdd7c1;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(96, 160, 115, 0.12);
  transform: translateY(-1px);
}

.btn-primary {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), #79ba8a);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(96, 160, 115, 0.2);
}

.btn-primary:disabled {
  opacity: 0.7;
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
  font-weight: 700;
  cursor: pointer;
  padding: 0 4px;
  transition: opacity 0.2s ease;
}

.link-btn:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    padding: 28px 24px 12px;
  }

  .auth-card {
    padding: 24px 20px;
  }

  h1 {
    font-size: 28px;
  }
}
</style>