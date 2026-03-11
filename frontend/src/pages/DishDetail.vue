<template>
  <div class="detail-container">
    <div class="header">
      <!-- 跳转：返回榜单，使用 push 兜底，避免直链打开时 back() 退回站外 -->
      <button @click="goBack" class="back-btn">返回</button>
      <h1>菜品详情</h1>
    </div>

    <div v-if="!dish && route.params.id" class="loading-tip">加载中…</div>
    <div v-else-if="!dish" class="empty-tip">未找到菜品</div>
    <template v-else>
      <div class="dish-card">
        <div class="card-body">
          <h2 class="card-title">{{ dish.name }}</h2>
          <p class="card-location">{{ dish.canteen || '未知食堂' }}</p>
          <div class="card-stars">
            <StarRating :model-value="Math.round(dish.averageScore)" readonly :show-score-text="true" />
            <span class="card-votes">{{ dish.totalVotes }} 人评分</span>
          </div>
          <span class="card-price">¥{{ dish.price != null ? dish.price : '—' }}</span>
        </div>
      </div>

      <div class="comment-section">
        <h3 class="section-title">用户评价</h3>

        <!-- 评价输入行 -->
        <div class="comment-score-wrap">
          <span class="score-label">评分</span>
          <StarRating v-model="commentScore" :show-score-text="true" />
        </div>
        <div class="comment-input-wrap">
          <input
            v-model="commentContent"
            type="text"
            class="comment-input"
            placeholder="写下你的评价（最多50字）"
            maxlength="50"
            @input="onCommentInput"
          />
          <span class="char-count" :class="{ over: isOverLimit }">{{ commentContent.length }}/50</span>
          <button
            class="submit-comment-btn"
            :disabled="!canSubmit || isSubmitting"
            @click="submitComment"
          >
            {{ isSubmitting ? '提交中…' : '提交' }}
          </button>
        </div>
        <p v-if="isOverLimit" class="over-hint">评论需控制在50字以内</p>

        <!-- 评价列表 -->
        <div v-if="commentsLoading" class="loading-tip">加载评价中…</div>
        <ul v-else-if="comments.length > 0" class="comment-list">
          <li v-for="c in comments" :key="c.id || c.createTime + c.content" class="comment-item">
            <span class="comment-user">{{ c.username || c.userId || '匿名' }}</span>
            <span class="comment-content">{{ c.content }}</span>
            <span class="comment-score">{{ c.score }}分</span>
            <span class="comment-time">{{ c.createTime }}</span>
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

const route = useRoute();
const router = useRouter();
const dish = ref(null);
const commentContent = ref('');
const commentScore = ref(5);
const comments = ref([]);
const commentsLoading = ref(false);
const isSubmitting = ref(false);

/** 跳转：返回榜单页。使用 push 兜底，避免直链打开时 back() 退回站外导致白屏 */
function goBack() {
  router.push('/DishRank');
}

const isOverLimit = computed(() => commentContent.value.length > 50);
const canSubmit = computed(() => {
  return commentContent.value.trim().length > 0
    && commentContent.value.length <= 50
    && Number(commentScore.value) >= 1
    && Number(commentScore.value) <= 5;
});

/** 50字限制：粘贴等场景可能突破 maxlength，此处兜底截断 */
function onCommentInput() {
  if (commentContent.value.length > 50) {
    commentContent.value = commentContent.value.slice(0, 50);
  }
}

async function fetchComments() {
  const id = route.params.id;
  if (!id) return;
  commentsLoading.value = true;
  try {
    const res = await getComments(id, 1, 50);
    if (res?.code === 200 && res?.data?.list) {
      comments.value = res.data.list;
    }
  } catch (_) {
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
}

async function submitComment() {
  if (!canSubmit.value || isSubmitting.value) return;
  const id = route.params.id;
  if (!id) return;
  const userText = localStorage.getItem('user_info');
  if (!userText) {
    // 最小改动：仅修复未登录仍可评论的问题
    alert('请先登录后再评论');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  const user = JSON.parse(userText);

  isSubmitting.value = true;
  try {
    const res = await addComment(
      Number(id),
      Number(commentScore.value),
      commentContent.value.trim(),
      user.username || 'anonymous'
    );
    if (res?.code === 200) {
      commentContent.value = '';
      commentScore.value = 5;
      await fetchComments();
      alert('提交成功！');
    } else {
      alert(res?.message || '提交失败');
    }
  } catch (e) {
    alert(e?.message || '提交失败，请检查网络');
  } finally {
    isSubmitting.value = false;
  }
}

/** 依赖：菜品数据来自 router.push 的 state，直链/刷新时用 params.id 生成占位 */
onMounted(async () => {
  const state = history.state;
  if (state?.dish) {
    dish.value = state.dish;
  } else {
    const cached = localStorage.getItem('current_dish_detail');
    if (cached) {
      dish.value = JSON.parse(cached);
    }
  }

  if (!dish.value && route.params.id) {
    dish.value = {
      id: route.params.id,
      name: `菜品 #${route.params.id}`,
      canteen: '',
      averageScore: 0,
      totalVotes: 0,
      price: null
    };
  } else if (route.params.id) {
    localStorage.setItem('current_dish_detail', JSON.stringify(dish.value));
  }
  fetchComments();
});

watch(() => route.params.id, () => {
  const state = history.state;
  if (state?.dish) {
    dish.value = state.dish;
    localStorage.setItem('current_dish_detail', JSON.stringify(dish.value));
  }
  fetchComments();
});
</script>

<style scoped>
.detail-container {
  padding: 24px;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
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
}

h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.dish-card {
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.card-body {
  padding: 16px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-location {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0 0 10px 0;
}

.card-stars {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-votes {
  font-size: 12px;
  color: var(--text-tertiary);
}

.card-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.comment-section {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.comment-input-wrap {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}
.comment-score-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.score-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.comment-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
  background: var(--bg-card);
}

.comment-input:focus {
  border-color: var(--accent);
}

.char-count {
  font-size: 12px;
  color: var(--text-tertiary);
  min-width: 36px;
}

.char-count.over {
  color: #c53030;
}

.submit-comment-btn {
  padding: 10px 16px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity .2s ease;
}
.submit-comment-btn:hover:not(:disabled) {
  opacity: .92;
}

.submit-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.over-hint {
  font-size: 12px;
  color: #c53030;
  margin: 0 0 12px 0;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
  border-top: 1px solid var(--border);
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-user {
  font-weight: 500;
  color: var(--text-secondary);
  margin-right: 8px;
}

.comment-content {
  color: var(--text-primary);
}

.comment-time {
  display: inline-block;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 4px;
  margin-left: 8px;
}
.comment-score {
  margin-left: 8px;
  font-size: 12px;
  color: var(--accent);
}

.loading-tip,
.empty-tip {
  text-align: center;
  padding: 24px;
  color: var(--text-tertiary);
  font-size: 14px;
}

@media (max-width: 640px) {
  .comment-input-wrap {
    grid-template-columns: 1fr;
  }
  .submit-comment-btn {
    width: 100%;
  }
}
</style>
