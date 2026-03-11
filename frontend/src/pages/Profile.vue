<template>
  <div class="page-container">
    <div class="header">
      <button @click="$router.push('/DishRank')" class="back-btn">返回</button>
      <h1>个人中心</h1>
      <button v-if="!isEditing" @click="isEditing = true" class="edit-btn">编辑</button>
      <button v-else @click="saveProfile" class="save-btn">保存</button>
    </div>

    <div class="profile-card">
      <div class="avatar-section">
        <div
          class="avatar-container"
          :class="{ 'can-edit': isEditing }"
          @click="triggerFileInput"
        >
          <img :src="userInfo.avatar" alt="头像" class="avatar" />
          <div v-if="isEditing" class="avatar-overlay">更换头像</div>
        </div>

        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept="image/*"
          @change="handleFileChange"
        />
        <p v-if="isEditing" class="avatar-hint">点击头像即可上传新图片</p>
      </div>

      <div v-if="!isEditing" class="info-section">
        <div class="info-item">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ userInfo.username || '未登录' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">个人简介</span>
          <span class="info-value bio-text">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</span>
        </div>
      </div>

      <div v-else class="edit-section">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input v-model="editForm.username" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">个人简介</label>
          <textarea v-model="editForm.bio" class="form-input textarea" rows="3"></textarea>
        </div>
      </div>
    </div>

    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { clearUserInfo, getUserInfo } from '../utils/auth';

const router = useRouter();
const isEditing = ref(false);
const fileInput = ref(null); // 对应 template 中的 ref="fileInput"

const userInfo = ref({
  username: '',
  avatar: 'https://via.placeholder.com/150/ebebeb/999?text=User',
  bio: ''
});

const editForm = ref({ username: '', bio: '' });

onMounted(() => {
  const parsed = getUserInfo();
  if (parsed) {
    userInfo.value = { ...userInfo.value, ...parsed };
    editForm.value = { username: parsed.username || '', bio: parsed.bio || '' };
  }
});

// 触发隐藏的 input 点击
function triggerFileInput() {
  if (isEditing.value) {
    fileInput.value.click();
  }
}

// 处理图片上传并转为 Base64
function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 限制 2MB 以内，防止 localStorage 存不下
  if (file.size > 2 * 1024 * 1024) {
    alert('图片不能超过 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    // 将图片转换成 Base64 字符串赋值给头像
    userInfo.value.avatar = event.target.result;
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  userInfo.value.username = editForm.value.username;
  userInfo.value.bio = editForm.value.bio;

  // 保存到本地存储
  localStorage.setItem('user_info', JSON.stringify(userInfo.value));
  isEditing.value = false;
  alert('保存成功');
}

function handleLogout() {
  if(confirm('确定要退出登录吗？')) {
    clearUserInfo();
    router.push('/login');
  }
}
</script>

<style scoped>
/* 保持你原有的所有样式不变 */
.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  cursor: default;
  border: 2px solid var(--border);
}

.avatar-container.can-edit {
  cursor: pointer;
  border: 2px dashed var(--accent);
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  padding: 4px 0;
  text-align: center;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-container {
  padding: 24px;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.back-btn, .edit-btn, .save-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.save-btn {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.profile-card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 24px 16px;
  margin-bottom: 24px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-hint {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.bio-text {
  font-weight: 400;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  background: var(--bg-page);
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--accent);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.logout-btn {
  width: 100%;
  padding: 14px;
  background: var(--bg-card);
  color: #c53030;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #fff5f5;
}
</style>