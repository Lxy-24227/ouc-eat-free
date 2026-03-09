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
        <label>楼层</label>
        <select v-model="formData.floor">
          <option v-for="f in floors" :key="f" :value="f">{{ f }}</option>
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

      <div class="form-group rating-section">
        <label>初始评分（选填）</label>
        <div class="stars">
          <StarRating v-model="formData.initialScore" :show-score-text="false" />
          <span class="score-hint">{{ scoreHint }}</span>
        </div>
      </div>

      <div class="form-group comment-section">
        <label>首次评价（选填，最多20字）</label>
        <div class="comment-input-row">
          <input
            v-model="formData.comment"
            type="text"
            placeholder="写下你的评价…"
            maxlength="20"
            class="comment-input"
            @input="onCommentInput"
          />
          <span class="char-count" :class="{ over: formData.comment.length > 20 }">{{ formData.comment.length }}/20</span>
        </div>
        <p v-if="formData.comment.length > 20" class="over-hint">评论需控制在20字以内</p>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import StarRating from '../components/StarRating.vue';
import { addComment } from '../api/comment';

const router = useRouter();
const isSubmitting = ref(false);

const canteens = ['一食堂', '二食堂', '三食堂', '四食堂'];
const floors = ['B1', 'F1', 'F2', 'F3'];

// 表单响应式数据：增加了 initialScore、comment
const formData = ref({
  canteen: '一食堂',
  floor: 'F1',
  name: '',
  initialScore: 0,
  comment: ''
});

/** 20字限制：粘贴等可能突破 maxlength，此处兜底截断 */
function onCommentInput() {
  if (formData.value.comment.length > 20) {
    formData.value.comment = formData.value.comment.slice(0, 20);
  }
}

// 计算评分提示文案
const scoreHint = computed(() => {
  const hints = {
    0: '点击选择星级',
    1: '极差，不予推荐',
    2: '一般，不推荐',
    3: '尚可，可以尝试',
    4: '推荐，值得一试',
    5: '非常推荐'
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

    // 模拟创建菜品（实际项目需对接 POST /api/v1/dish）
    const mockDishId = 105;
    await new Promise(resolve => setTimeout(resolve, 500));

    // 若有评价内容，提交至后端；接口失败时给出明确提示，仍跳转榜单
    const comment = formData.value.comment?.trim();
    let commentOk = true;
    if (comment && comment.length <= 20) {
      try {
        await addComment(mockDishId, comment);
      } catch (e) {
        commentOk = false;
        alert("发布成功！但评论提交失败：" + (e?.message || "请检查网络"));
      }
    }

    if (commentOk) {
      alert(comment ? "发布并评价成功！" : "发布成功！");
    }
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

.rating-section {
  padding: 16px 0;
  border-top: 1px solid var(--border);
}

.stars {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-hint {
  font-size: 13px;
  color: var(--text-tertiary);
}

.comment-section {
  margin-top: 4px;
}

.comment-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
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

.over-hint {
  font-size: 12px;
  color: #c53030;
  margin: 8px 0 0 0;
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
</style>