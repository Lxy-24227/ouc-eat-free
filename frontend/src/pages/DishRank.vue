<template>
  <div class="rank-container">
    <div class="header">
      <h1>菜品排行</h1>
      <button @click="$router.push('/CreateDish')" class="add-btn">我要投稿</button>
    </div>

    <div class="tabs">
      <div
        class="tab"
        :class="{ active: currentTab === 'red' }"
        @click="currentTab = 'red'"
      >红榜</div>
      <div
        class="tab"
        :class="{ active: currentTab === 'black' }"
        @click="currentTab = 'black'"
      >黑榜</div>
    </div>

    <!-- 搜索模块：输入框 + 下拉结果 -->
    <div class="search-wrapper" ref="searchWrapperRef">
      <div class="search-input-wrap">
        <input
          ref="searchInputRef"
          v-model="searchKeyword"
          type="search"
          class="search-input"
          placeholder="搜索菜品名称…"
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

      <!-- 搜索结果下拉列表 -->
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
              <div class="search-item-stars">
                <StarRating
                  :model-value="Math.round(dish.averageScore)"
                  readonly
                  :show-score-text="true"
                />
              </div>
            </div>
          </template>
          <div v-else class="search-empty">未找到匹配的菜品</div>
        </div>
      </Transition>
    </div>

    <div v-if="loading" class="loading-tip">加载中…</div>
    <div v-else class="list">
      <div
        v-for="(dish, index) in filteredDishes"
        :key="dish.id"
        :id="`dish-card-${dish.id}`"
        class="dish-card"
        :class="{ 'top-three': index < 3, 'dish-card--highlight': highlightedDishId === dish.id }"
        @click="goToDetail(dish)"
      >
        <span v-if="index < 3" class="card-badge">TOP{{ index + 1 }}</span>
        <div class="card-image-wrap">
          <img :src="dish.image || 'https://via.placeholder.com/400x240/ebebeb/999?text=—'" :alt="dish.name" class="card-image" />
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ dish.name }}</h3>
          <p class="card-location">{{ dish.canteen }} · {{ dish.floor }}</p>
          <div class="card-stars">
            <StarRating :model-value="Math.round(dish.averageScore)" readonly :show-score-text="false" />
            <span class="card-votes">{{ dish.totalVotes }} 人评分</span>
          </div>
          <div class="card-meta">
            <span class="card-price">¥{{ dish.price != null ? dish.price : '—' }}</span>
          </div>
          <div class="rating-box" @click.stop>
            <p class="rating-label">我的评分</p>
            <StarRating
              v-model="dish.userScore"
              @update:modelValue="handleRate(dish)"
              :show-score-text="false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import StarRating from '../components/StarRating.vue';
import { getRanking } from '../api/rank';
import { submitRating } from '../api/rating';
import { searchDish, getHighlightedParts } from '../utils/searchDish';
import { debounce } from '../utils/debounce';
import { throttle } from '../utils/throttle';

const router = useRouter();
const currentTab = ref('red');
const loading = ref(false);

const MOCK_DISHES = [
  { id: 101, name: '红烧排骨', canteen: '一食堂', floor: 'F2', averageScore: 4.8, totalVotes: 156, userScore: 0, price: 12 },
  { id: 102, name: '螺蛳粉', canteen: '二食堂', floor: 'B1', averageScore: 2.1, totalVotes: 89, userScore: 0, price: 10 },
  { id: 103, name: '菠萝咕咾肉', canteen: '三食堂', floor: 'F1', averageScore: 4.5, totalVotes: 42, userScore: 0, price: 15 },
  { id: 104, name: '仰望星空派', canteen: '四食堂', floor: 'F3', averageScore: 1.2, totalVotes: 230, userScore: 0, price: 8 },
];

const dishes = ref([...MOCK_DISHES]);

// ========== 搜索相关 ==========
const searchKeyword = ref('');
const searchWrapperRef = ref(null);
const searchInputRef = ref(null);
const searching = ref(false);
const selectedSearchIndex = ref(0);
const highlightedDishId = ref(null);

/** 是否显示搜索下拉（有输入且非空） */
const showSearchDropdown = computed(() => !!searchKeyword.value.trim());

/** 搜索结果（最多 10 条），依赖 filteredDishes */
const searchResults = computed(() => {
  const kw = searchKeyword.value.trim();
  if (!kw) return [];
  return searchDish(kw, filteredDishes.value, 10);
});

/** 防抖 300ms 执行搜索逻辑，用于控制 searching 状态 */
const runSearch = debounce(() => {
  searching.value = false;
}, 300);

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

function clearSearch(opts = {}) {
  const { focusInput = true } = opts;
  searchKeyword.value = '';
  searching.value = false;
  selectedSearchIndex.value = 0;
  highlightedDishId.value = null;
  if (focusInput) searchInputRef.value?.focus();
}

function onSearchKeydown(e) {
  if (!showSearchDropdown.value) {
    if (e.key === 'Escape') clearSearch();
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    clearSearch();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (searchResults.value.length > 0) {
      selectedSearchIndex.value = Math.min(selectedSearchIndex.value + 1, searchResults.value.length - 1);
    }
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (searchResults.value.length > 0) {
      selectedSearchIndex.value = Math.max(selectedSearchIndex.value - 1, 0);
    }
    return;
  }
  if (e.key === 'Enter' && searchResults.value.length > 0) {
    e.preventDefault();
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

/** 下拉列表滚动节流（100ms），优化滚动体验 */
const onDropdownScroll = throttle(() => {}, 100);

/** 点击外部关闭下拉 */
function handleClickOutside(e) {
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target)) {
    if (searchKeyword.value.trim()) {
      searchKeyword.value = '';
      searching.value = false;
    }
  }
}

function mapDish(item) {
  return {
    id: item.id,
    name: item.name ?? '未命名',
    canteen: item.restaurant_name ?? '',
    floor: item.floor ?? '',
    averageScore: Number(item.avg_score) || 0,
    totalVotes: Number(item.total_votes) ?? 0,
    userScore: 0,
    price: item.price ?? null,
    image: item.image ?? null,
  };
}

async function fetchRanking() {
  loading.value = true;
  try {
    const res = await getRanking({ type: currentTab.value, page: 1, pageSize: 50 });
    if (res?.code === 200 && res?.data?.list?.length) {
      dishes.value = res.data.list.map(mapDish);
    }
  } catch (_) {
    dishes.value = [...MOCK_DISHES];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchRanking();
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
watch(currentTab, fetchRanking);

const filteredDishes = computed(() => {
  const list = currentTab.value === 'red'
    ? dishes.value.filter(d => d.averageScore >= 3).sort((a, b) => b.averageScore - a.averageScore)
    : dishes.value.filter(d => d.averageScore < 3).sort((a, b) => a.averageScore - b.averageScore);
  return list;
});

/** 跳转：进入评论详情页，通过 state 传递菜品数据，直链打开时详情页用 params.id 兜底 */
function goToDetail(dish) {
  router.push({ name: 'DishDetail', params: { id: dish.id }, state: { dish } });
}

async function handleRate(dish) {
  if (!dish.userScore || dish.userScore < 1) return;
  try {
    await submitRating(dish.id, dish.userScore);
    const newTotal = (dish.totalVotes || 0) + 1;
    const newAvg = ((dish.averageScore * (dish.totalVotes || 0)) + dish.userScore) / newTotal;
    dish.averageScore = Math.round(newAvg * 100) / 100;
    dish.totalVotes = newTotal;
    alert(`打分成功！该菜品目前平均分：${dish.averageScore.toFixed(1)}`);
  } catch (e) {
    const newTotal = (dish.totalVotes || 0) + 1;
    dish.averageScore = ((dish.averageScore * (dish.totalVotes || 0)) + dish.userScore) / newTotal;
    dish.totalVotes = newTotal;
    alert(`打分已更新（本地）：${dish.averageScore.toFixed(1)}`);
  }
}
</script>

<style scoped>
.rank-container {
  padding: 24px;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-page);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dish-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.dish-card.top-three {
  border-color: #d4cfc4;
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.card-image-wrap {
  width: 100%;
  height: 0;
  padding-bottom: 40%;
  background: #ebebeb;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-body {
  padding: 14px 16px;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 17px;
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

.card-meta {
  margin-bottom: 10px;
}

.card-price {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.rating-box {
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.rating-label,
.rating-box p {
  font-size: 12px;
  color: var(--text-tertiary);
  margin: 0 0 6px 0;
  font-weight: 500;
}

.loading-tip {
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
  font-size: 14px;
}

/* ========== 搜索模块样式 ========== */
.search-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  color: var(--text-primary);
  background: var(--bg-card);
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  border-color: var(--accent);
}

.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background 0.2s;
}

.search-clear:hover {
  color: var(--text-primary);
  background: var(--accent-soft);
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 320px;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

/* 自定义滚动条，匹配页面风格 */
.search-dropdown::-webkit-scrollbar {
  width: 6px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: var(--bg-page);
  border-radius: 3px;
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.search-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}

.search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.12s ease;
  border-bottom: 1px solid var(--border);
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover,
.search-item--selected {
  background: var(--accent-soft);
}

.search-item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
}

.search-highlight {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
  padding: 0 1px;
  border-radius: 2px;
}

.search-item-stars {
  flex-shrink: 0;
  margin-left: 12px;
}

.search-loading,
.search-empty {
  padding: 20px 14px;
  text-align: center;
  font-size: 14px;
  color: var(--text-tertiary);
}

/* 下拉展开/收起动画 */
.search-dropdown-enter-active,
.search-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.search-dropdown-enter-from,
.search-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 选中菜品高亮 */
.dish-card--highlight {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

/* 响应式：移动端、平板 */
@media (max-width: 768px) {
  .search-input {
    font-size: 16px; /* 防止 iOS 缩放 */
  }
}

@media (min-width: 1200px) {
  .rank-container {
    max-width: 640px;
  }
}
</style>