<template>
  <div class="page-container">
    <div class="header">
      <h1>创建新账号</h1>
    </div>

    <div class="auth-card">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <input v-model="form.username" type="text" class="form-input" placeholder="请输入用户名" />
      </div>

      <div class="form-group">
        <label class="form-label">密码</label>
        <input v-model="form.password" type="password" class="form-input" placeholder="请输入密码" />
      </div>

      <div class="form-group">
        <label class="form-label">确认密码</label>
        <input v-model="form.confirmPassword" type="password" class="form-input" placeholder="请再次输入密码" />
      </div>

      <button class="btn-primary" :disabled="isLoading" @click="handleRegister">
        {{ isLoading ? '注册中...' : '注册' }}
      </button>

      <div class="auth-links">
        <span class="text-hint">已有账号？</span>
        <button class="link-btn" @click="$router.push('/login')">直接登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../api/auth';

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
    const res = await register(form.value.username.trim(), form.value.password);
    if (res?.code === 200) {
      alert('注册成功，请登录');
      router.push('/login');
      return;
    }
    alert(res?.message || '注册失败');
  } catch (error) {
    alert(error?.message || '注册失败');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
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
.header { margin-bottom: 32px; text-align: center; }
h1 { font-size: 24px; font-weight: 600; color: var(--text-primary); margin: 0; }
.auth-card { background: var(--bg-card); padding: 24px; border-radius: 12px; border: 1px solid var(--border); }
.form-group { margin-bottom: 20px; }
.form-label { display: block; font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; }
.form-input { width: 100%; padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 15px; color: var(--text-primary); background: var(--bg-card); outline: none; box-sizing: border-box; }
.form-input:focus { border-color: var(--accent); }
.btn-primary { width: 100%; padding: 12px; background: var(--accent); color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: opacity .2s ease; }
.btn-primary:hover:not(:disabled) { opacity: .92; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.auth-links { margin-top: 20px; text-align: center; font-size: 14px; }
.text-hint { color: var(--text-tertiary); }
.link-btn { background: transparent; border: none; color: var(--accent); font-weight: 500; cursor: pointer; padding: 0 4px; }
.link-btn:hover { text-decoration: underline; }
@media (min-width: 1200px) { .page-container { max-width: 480px; } }
</style>