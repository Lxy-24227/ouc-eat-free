<template>
  <div class="rank-container">
    <div class="hero-card">
      <div class="header">
        <div>
          <p class="hero-tag">食堂排行榜</p>
          <h1>今天吃什么</h1>
          <p class="hero-desc">基于真实评分与评论的食堂菜品榜单，创建和评论后会实时刷新。</p>
        </div>

        <div class="header-actions">
          <template v-if="currentUser?.username">
            <button @click="router.push('/CreateDish')" class="solid-btn">投稿菜品</button>
            <button @click="router.push('/profile')" class="ghost-btn">{{ currentUser.username }}</button>
          </template>
          <template v-else>
            <button @click="router.push('/login')" class="ghost-btn">登录</button>
            <button @click="router.push('/register')" class="solid-btn">注册</button>
          </template>
        </div>
      </div>

      <div class="tabs">
        <button
          class="tab"
          :class="{ active: currentTab === 'red' }"
          @click="currentTab = 'red'"
        >
          红榜
        </button>
        <button
          class="tab"
          :class="{ active: currentTab === 'black' }"
          @click="currentTab = 'black'"
        >
          黑榜
        </button>
      </div>

      <div class="search-wrapper" ref="searchWrapperRef">
        <div class="search-input-wrap">
          <input
            ref="searchInputRef"
            v-model="searchKeyword"
            type="search"
            class="search-input"
            placeholder="搜索菜品名称"
            autocomplete="off"
            aria-label="搜索菜品"
            aria-autocomplete="list"
            :aria-expanded="showSearchDropdown"
            aria-controls="search-results-list"
            @input="onSearchInput"
            @keydown="onSearchKeydown"
            @focus="onSearchFocus"
          />
          <button
            v-if="searchKeyword"
            type="button"
            class="search-clear"
            aria-label="清空搜索"
            @click="clearSearch"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <Transition name="search-dropdown">
          <div
            v-if="showSearchDropdown"
            id="search-results-list"
            class="search-dropdown"
            role="listbox"
            aria-label="搜索结果"
            @scroll.passive="onDropdownScroll"
          >
            <div v-if="searching" class="search-loading">搜索中…</div>
            <template v-else-if="searchResults.length > 0">
              <div
                v-for="(dish, idx) in searchResults"
                :key="dish.id"
                class="search-item"
                :class="{ 'search-item--selected': idx === selectedSearchIndex }"
                role="option"
                :aria-selected="idx === selectedSearchIndex"
                @click="selectSearchResult(dish)"
                @mouseenter="selectedSearchIndex = idx"
              >
                <span class="search-item-name">
                  <template v-for="(part, i) in getHighlightedParts(dish.name, searchKeyword)" :key="i">
                    <mark v-if="part.match" class="search-highlight">{{ part.text }}</mark>
                    <span v-else>{{ part.text }}</span>
                  </template>
                </span>
                <span class="search-item-meta">{{ dish.canteen }}</span>
              </div>
            </template>
            <div v-else class="search-empty">未找到匹配的菜品</div>
          </div>
        </Transition>
      </div>
    </div>

    <div v-if="loading" class="loading-tip">加载中…</div>
    <div v-else-if="filteredDishes.length === 0" class="empty-panel">暂无菜品，登录后点击“投稿菜品”来创建第一道菜吧。</div>
    <div v-else class="list">
      <article
        v-for="(dish, index) in filteredDishes"
        :key="dish.id"
        :id="`dish-card-${dish.id}`"
        class="dish-card"
        :class="{ 'top-three': index < 3, 'dish-card--highlight': highlightedDishId === dish.id }"
        @click="goToDetail(dish)"
      >
        <span v-if="index < 3" class="card-badge">TOP{{ index + 1 }}</span>
        <div class="card-body">
          <div class="card-head">
            <div>
              <h3 class="card-title">{{ dish.name }}</h3>
              <p class="card-location">{{ dish.canteen || '未填写食堂' }}</p>
            </div>
            <div class="price-chip">¥{{ dish.price != null ? dish.price : '—' }}</div>
          </div>

          <div class="card-stats">
            <div class="stat-box">
              <span class="stat-label">平均分</span>
              <strong>{{ formatScore(dish.averageScore) }}</strong>
            </div>
            <div class="stat-box">
              <span class="stat-label">评分数</span>
              <strong>{{ dish.totalVotes }}</strong>
            </div>
            <div class="stat-box">
              <span class="stat-label">评论数</span>
              <strong>{{ dish.commentCount }}</strong>
            </div>
          </div>

          <div class="card-stars">
            <StarRating :model-value="Math.round(dish.averageScore)" readonly :show-score-text="true" />
            <span class="card-comment-count">{{ dish.commentCount }} 条评论</span>
          </div>

          <div class="rating-box" @click.stop>
            <p class="rating-label">快速评分</p>
            <StarRating
              v-model="dish.userScore"
              @update:modelValue="handleRate(dish)"
              :show-score-text="false"
            />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StarRating from '../components/StarRating.vue';
import { getRanking } from '../api/rank';
import { submitRating } from '../api/rating';
import { searchDish, getHighlightedParts } from '../utils/searchDish';
import { debounce } from '../utils/debounce';
import { throttle } from '../utils/throttle';
import { getUserInfo } from '../utils/auth';

const router = useRouter();
const route = useRoute();
const currentTab = ref('red');
const loading = ref(false);
const dishes = ref([]);
const currentUser = ref(getUserInfo());

const searchKeyword = ref('');
const searchWrapperRef = ref(null);
const searchInputRef = ref(null);
const searching = ref(false);
const selectedSearchIndex = ref(0);
const highlightedDishId = ref(null);

const showSearchDropdown = computed(() => !!searchKeyword.value.trim());

const filteredDishes = computed(() => {
  return dishes.value.filter(dish => {
    if (currentTab.value === 'black') {
      return dish.totalVotes > 0 && dish.averageScore < 3;
    }
    return dish.totalVotes === 0 || dish.averageScore >= 3;
  }).sort((a, b) => {
    if (currentTab.value === 'black') {
      return a.averageScore - b.averageScore || a.commentCount - b.commentCount;
    }
    return b.averageScore - a.averageScore || b.commentCount - a.commentCount;
  });
});

const searchResults = computed(() => {
  const kw = searchKeyword.value.trim();
  if (!kw) return [];
  return searchDish(kw, filteredDishes.value, 10);
});

const runSearch = debounce(() => {
  searching.value = false;
}, 250);

function formatScore(score) {
  return Number(score || 0).toFixed(1);
}

function handleClickOutside(event) {
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(event.target)) {
    clearSearch({ focusInput: false });
  }
}

function onSearchInput() {
  if (!searchKeyword.value.trim()) {
    searching.value = false;
    return;
  }
  searching.value = true;
  selectedSearchIndex.value = 0;
  runSearch();
}

function onSearchFocus() {
  if (searchKeyword.value.trim()) runSearch();
}

function clearSearch(options = {}) {
  const { focusInput = true } = options;
  searchKeyword.value = '';
  searching.value = false;
  selectedSearchIndex.value = 0;
  highlightedDishId.value = null;
  if (focusInput) searchInputRef.value?.focus();
}

function onSearchKeydown(event) {
  if (!showSearchDropdown.value) {
    if (event.key === 'Escape') clearSearch();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    clearSearch();
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (searchResults.value.length > 0) {
      selectedSearchIndex.value = Math.min(selectedSearchIndex.value + 1, searchResults.value.length - 1);
    }
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (searchResults.value.length > 0) {
      selectedSearchIndex.value = Math.max(selectedSearchIndex.value - 1, 0);
    }
    return;
  }

  if (event.key === 'Enter' && searchResults.value.length > 0) {
    event.preventDefault();
    selectSearchResult(searchResults.value[selectedSearchIndex.value]);
  }
}

function selectSearchResult(dish) {
  clearSearch({ focusInput: false });
  highlightedDishId.value = dish.id;
  setTimeout(() => {
    document.getElementById(`dish-card-${dish.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
  setTimeout(() => {
    highlightedDishId.value = null;
  }, 2000);
}

const onDropdownScroll = throttle(() => {}, 100);

function mapDish(item) {
  return {
    id: item.id,
    name: item.name ?? '未命名',
    canteen: item.canteen ?? item.restaurant_name ?? '',
    averageScore: Number(item.averageScore ?? item.avgRating ?? item.avg_score) || 0,
    totalVotes: Number(item.totalVotes ?? item.voteCount ?? item.total_votes) || 0,
    commentCount: Number(item.commentCount ?? item.comments?.length) || 0,
    userScore: 0,
    price: item.price ?? null
  };
}

async function fetchRanking() {
  loading.value = true;
  try {
    // 最小改动：仅在初始化/创建后重新请求 /api/getRank，修复排行榜不更新
    const res = await getRanking({ type: currentTab.value, page: 1, pageSize: 50 });
    dishes.value = res?.code === 200 && Array.isArray(res?.data?.list)
      ? res.data.list.map(mapDish)
      : [];
  } catch (_) {
    dishes.value = [];
  } finally {
    loading.value = false;
  }
}

function goToDetail(dish) {
  const plainDish = JSON.parse(JSON.stringify(dish));
  localStorage.setItem('current_dish_detail', JSON.stringify(plainDish));
  router.push({ name: 'DishDetail', params: { id: dish.id }, state: { dish: plainDish } });
}

async function handleRate(dish) {
  if (!dish.userScore || dish.userScore < 1) return;
  try {
    const user = getUserInfo();
    await submitRating(dish.id, dish.userScore, user?.username);
    await fetchRanking();
    alert('评分成功！');
  } catch (error) {
    alert(error?.message || '评分失败');
  }
}

onMounted(() => {
  currentUser.value = getUserInfo();
  fetchRanking();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

watch(currentTab, fetchRanking);
watch(() => route.query.refresh, () => {
  currentUser.value = getUserInfo();
  fetchRanking();
});
</script>

<style scoped>
.rank-container {
  min-height: 100vh;
  padding: 24px;
  max-width: 1120px;
  margin: 0 auto;
  background: var(--bg-page);
}

.hero-card {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 26px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(247, 252, 248, 0.94)),
    var(--bg-card);
  border: 1px solid rgba(198, 220, 202, 0.8);
  box-shadow: 0 18px 40px rgba(73, 105, 77, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.hero-tag {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0 0 10px;
  font-size: 34px;
  line-height: 1.15;
  color: var(--text-primary);
}

.hero-desc {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 580px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.solid-btn,
.ghost-btn,
.tab {
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.solid-btn,
.ghost-btn {
  padding: 11px 16px;
  font-size: 14px;
}

.solid-btn {
  border: none;
  background: linear-gradient(135deg, var(--accent), #79ba8a);
  color: #fff;
}

.ghost-btn {
  border: 1px solid #d7e2d8;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-secondary);
}

.solid-btn:hover,
.ghost-btn:hover,
.tab:hover {
  transform: translateY(-1px);
}

.solid-btn:hover {
  box-shadow: 0 12px 24px rgba(96, 160, 115, 0.2);
}

.tabs {
  display: inline-flex;
  padding: 6px;
  background: #f4faf3;
  border-radius: 16px;
  border: 1px solid #e0ede2;
  margin-bottom: 20px;
}

.tab {
  min-width: 104px;
  padding: 10px 18px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 14px;
}

.tab.active {
  background: #fff;
  color: var(--accent);
  box-shadow: 0 8px 18px rgba(96, 160, 115, 0.12);
}

.search-wrapper {
  position: relative;
}

.search-input-wrap {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 1px solid #d7e2d8;
  border-radius: 16px;
  background: #fff;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:hover {
  border-color: #bdd7c1;
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(96, 160, 115, 0.12);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  background: rgba(96, 160, 115, 0.12);
  color: var(--text-primary);
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e0ede2;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(73, 105, 77, 0.1);
  z-index: 100;
}

.search-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eef4ef;
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover,
.search-item--selected {
  background: rgba(96, 160, 115, 0.08);
}

.search-item-name {
  font-weight: 600;
  color: var(--text-primary);
}

.search-item-meta {
  color: var(--text-tertiary);
  font-size: 13px;
}

.search-highlight {
  background: rgba(255, 214, 153, 0.35);
  color: #8f641a;
  border-radius: 4px;
}

.search-loading,
.search-empty {
  padding: 20px 16px;
  text-align: center;
  color: var(--text-tertiary);
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.dish-card {
  position: relative;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(198, 220, 202, 0.8);
  box-shadow: 0 16px 36px rgba(73, 105, 77, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.dish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 44px rgba(73, 105, 77, 0.12);
}

.dish-card.top-three {
  border-color: rgba(255, 206, 115, 0.7);
}

.card-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 206, 115, 0.2);
  color: #a06713;
  font-size: 12px;
  font-weight: 800;
}

.card-body {
  padding: 22px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.card-title {
  margin: 0 0 8px;
  font-size: 22px;
  color: var(--text-primary);
}

.card-location {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.price-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(96, 160, 115, 0.12);
  color: var(--accent);
  font-weight: 700;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}

.stat-box {
  padding: 14px 12px;
  border-radius: 16px;
  background: #f7fbf6;
  border: 1px solid #e0ede2;
}

.stat-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.stat-box strong {
  font-size: 20px;
  color: var(--text-primary);
}

.card-stars {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.card-comment-count {
  color: var(--text-tertiary);
  font-size: 13px;
}

.rating-box {
  padding-top: 16px;
  border-top: 1px solid #eef4ef;
}

.rating-label {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.loading-tip,
.empty-panel {
  text-align: center;
  padding: 36px;
  color: var(--text-tertiary);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(198, 220, 202, 0.8);
  border-radius: 22px;
}

.search-dropdown-enter-active,
.search-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.search-dropdown-enter-from,
.search-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.dish-card--highlight {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(96, 160, 115, 0.12);
}

@media (max-width: 768px) {
  .rank-container {
    padding: 18px;
  }

  .header,
  .card-head,
  .card-stars {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .tabs {
    width: 100%;
  }

  .tab {
    flex: 1;
  }

  .card-stats {
    grid-template-columns: 1fr;
  }
}
</style>