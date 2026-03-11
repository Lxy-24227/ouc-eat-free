<template>
  <div class="detail-container">
    <div class="header">
      <button @click="goBack" class="back-btn">返回榜单</button>
      <h1>菜品详情</h1>
    </div>

    <div v-if="!dish && route.params.id" class="loading-tip">加载中…</div>
    <div v-else-if="!dish" class="empty-tip">未找到菜品</div>
    <template v-else>
      <div class="dish-card">
        <div class="dish-title-row">
          <div>
            <h2 class="card-title">{{ dish.name }}</h2>
            <p class="card-location">{{ dish.canteen || '未填写食堂' }}</p>
          </div>
          <div class="price-chip">¥{{ dish.price != null ? dish.price : '—' }}</div>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">平均分</span>
            <strong>{{ formatScore(dish.averageScore) }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">评分数</span>
            <strong>{{ dish.totalVotes || 0 }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">评论数</span>
            <strong>{{ comments.length }}</strong>
          </div>
        </div>

        <div class="card-stars">
          <StarRating :model-value="Math.round(dish.averageScore || 0)" readonly :show-score-text="true" />
        </div>
      </div>

      <div class="comment-section">
        <div class="section-header">
          <h3 class="section-title">用户评价</h3>
          <span class="login-tag">{{ currentUser?.username ? `当前用户：${currentUser.username}` : '未登录' }}</span>
        </div>

        <div class="comment-form">
          <div class="score-row">
            <span class="form-label">评分</span>
            <StarRating v-model="commentScore" :show-score-text="true" />
          </div>

          <div class="input-row">
            <input
              v-model="commentContent"
              type="text"
              class="comment-input"
              placeholder="写下你的评价（最多20字）"
              maxlength="20"
              @input="onCommentInput"
            />
            <button
              class="submit-comment-btn"
              :disabled="!canSubmit || isSubmitting"
              @click="submitComment"
            >
              {{ isSubmitting ? '提交中…' : '提交评论' }}
            </button>
          </div>
          <div class="input-footer">
            <span class="char-count" :class="{ over: isOverLimit }">{{ commentContent.length }}/20</span>
            <button v-if="!currentUser?.username" class="login-link-btn" @click="goLogin">登录后评论</button>
          </div>
          <p v-if="isOverLimit" class="over-hint">评论需控制在20字以内</p>
        </div>

        <div v-if="commentsLoading" class="loading-tip">加载评价中…</div>
        <ul v-else-if="comments.length > 0" class="comment-list">
          <li v-for="c in comments" :key="c.id || c.createTime + c.content" class="comment-item">
            <div class="comment-top">
              <div class="comment-user-box">
                <span class="comment-user">{{ c.username || c.userId || '匿名' }}</span>
                <span class="comment-score">{{ c.score }}分</span>
              </div>
              <span class="comment-time">{{ c.createTime }}</span>
            </div>
            <p class="comment-content">{{ c.content }}</p>
          </li>
        </ul>
        <p v-else class="empty-tip">暂无评价，快来抢沙发～</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StarRating from '../components/StarRating.vue';
import { getComments, addComment } from '../api/comment';
import { getDishDetail } from '../api/dish';
import { getUserInfo } from '../utils/auth';

const route = useRoute();
const router = useRouter();
const dish = ref(null);
const commentContent = ref('');
const commentScore = ref(0);
const comments = ref([]);
const commentsLoading = ref(false);
const isSubmitting = ref(false);
const currentUser = ref(getUserInfo());

function formatScore(score) {
  return Number(score || 0).toFixed(1);
}

function goBack() {
  router.push({
    path: '/DishRank',
    query: { refresh: String(Date.now()) }
  });
}

function goLogin() {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  });
}

const isOverLimit = computed(() => commentContent.value.length > 20);
const canSubmit = computed(() => commentScore.value > 0 && commentContent.value.trim().length > 0 && commentContent.value.length <= 20);

function onCommentInput() {
  if (commentContent.value.length > 20) {
    commentContent.value = commentContent.value.slice(0, 20);
  }
}

function recoverDishFromLocal() {
  const stateDish = history.state?.dish;
  if (stateDish) {
    dish.value = stateDish;
    localStorage.setItem('current_dish_detail', JSON.stringify(stateDish));
    return;
  }

  const cached = localStorage.getItem('current_dish_detail');
  if (!cached) return;

  try {
    const parsed = JSON.parse(cached);
    if (String(parsed.id) === String(route.params.id)) {
      dish.value = parsed;
    }
  } catch (_) {
    localStorage.removeItem('current_dish_detail');
  }
}

async function fetchDish() {
  const id = route.params.id;
  if (!id) return;

  try {
    const res = await getDishDetail(id);
    if (res?.code === 200 && res?.data) {
      dish.value = res.data;
      localStorage.setItem('current_dish_detail', JSON.stringify(res.data));
    }
  } catch (_) {
    recoverDishFromLocal();
  }
}

async function fetchComments() {
  const id = route.params.id;
  if (!id) return;
  commentsLoading.value = true;
  try {
    const res = await getComments(id, 1, 50);
    comments.value = res?.code === 200 && Array.isArray(res?.data?.list) ? res.data.list : [];
  } catch (_) {
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
}

async function submitComment() {
  if (!currentUser.value?.username) {
    goLogin();
    return;
  }

  if (!canSubmit.value || isSubmitting.value) return;

  const id = route.params.id;
  if (!id) return;

  isSubmitting.value = true;
  try {
    const res = await addComment(
      Number(id),
      commentContent.value.trim(),
      commentScore.value,
      currentUser.value.username
    );

    if (res?.code !== 200) {
      alert(res?.message || '提交失败');
      return;
    }

    commentContent.value = '';
    commentScore.value = 0;
    await Promise.all([fetchDish(), fetchComments()]);
    alert('提交成功！');
  } catch (error) {
    alert(error?.message || '提交失败，请检查网络');
  } finally {
    isSubmitting.value = false;
  }
}

async function initPage() {
  currentUser.value = getUserInfo();
  recoverDishFromLocal();
  await Promise.all([fetchDish(), fetchComments()]);
}

onMounted(initPage);

watch(() => route.params.id, initPage);
</script>

<style scoped>
.detail-container {
  padding: 24px;
  max-width: 760px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.82);
  color: var(--text-secondary);
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  border-color: #bdd7c1;
}

h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.dish-card,
.comment-section {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(198, 220, 202, 0.8);
  border-radius: 22px;
  box-shadow: 0 16px 36px rgba(73, 105, 77, 0.08);
}

.dish-card {
  padding: 24px;
  margin-bottom: 24px;
}

.dish-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 28px;
  color: var(--text-primary);
}

.card-location {
  margin: 0;
  color: var(--text-secondary);
  font-size: 15px;
}

.price-chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(96, 160, 115, 0.12);
  color: var(--accent);
  font-weight: 700;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 22px 0 18px;
}

.summary-item {
  padding: 16px;
  border-radius: 16px;
  background: #f7fbf6;
  border: 1px solid #e0ede2;
}

.summary-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-tertiary);
}

.summary-item strong {
  font-size: 24px;
  color: var(--text-primary);
}

.card-stars {
  display: flex;
  align-items: center;
}

.comment-section {
  padding: 22px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.login-tag {
  font-size: 13px;
  color: var(--text-secondary);
}

.comment-form {
  padding: 18px;
  border-radius: 18px;
  background: #f8fcf7;
  border: 1px solid #e0ede2;
}

.score-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.comment-input {
  flex: 1;
  min-width: 0;
  padding: 13px 14px;
  border: 1px solid #d7e2d8;
  border-radius: 14px;
  background: #fff;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.comment-input:hover {
  border-color: #bdd7c1;
}

.comment-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(96, 160, 115, 0.12);
}

.submit-comment-btn,
.login-link-btn {
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.submit-comment-btn {
  padding: 13px 18px;
  background: linear-gradient(135deg, var(--accent), #79ba8a);
  color: #fff;
}

.submit-comment-btn:hover:not(:disabled),
.login-link-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(96, 160, 115, 0.18);
}

.submit-comment-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.char-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

.char-count.over {
  color: #c53030;
}

.login-link-btn {
  padding: 8px 12px;
  background: rgba(96, 160, 115, 0.12);
  color: var(--accent);
}

.over-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #c53030;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 14px;
}

.comment-item {
  padding: 18px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #edf2ee;
}

.comment-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.comment-user-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-user {
  font-weight: 700;
  color: var(--text-primary);
}

.comment-score {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 196, 98, 0.18);
  color: #9a6b17;
  font-size: 12px;
  font-weight: 700;
}

.comment-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.comment-content {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.loading-tip,
.empty-tip {
  text-align: center;
  padding: 24px;
  color: var(--text-tertiary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 18px;
  }

  .dish-title-row,
  .section-header,
  .input-row,
  .input-footer,
  .comment-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .submit-comment-btn {
    width: 100%;
  }
}
</style>
