<!-- 星级评分：极简写实风格，线条干净、渐变克制，无卡通动效。未修改任何跳转逻辑。 -->
<template>
  <div
    class="star-rating"
    ref="containerRef"
    :class="{ readonly }"
    @click="onClick"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
  >
    <svg ref="svgRef" class="star-rating-svg" viewBox="0 0 140 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="starGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#b8a990" />
          <stop offset="100%" stop-color="#9a8b72" />
        </linearGradient>
      </defs>
      <g
        v-for="star in 5"
        :key="star"
        class="star-wrap"
        :class="{ active: star <= displayValue, animate: star === lastTouchedStar }"
        :data-index="star"
        :transform="`translate(${(star - 1) * 28}, 0) scale(${28/24}, 1)`"
      >
        <path
          class="star-path"
          :class="star <= displayValue ? 'filled' : 'outline'"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </g>
    </svg>
    <!-- 隐藏输入框兼容原有表单提交逻辑，星级数值同步至此 -->
    <input
      v-if="bindInput"
      type="hidden"
      :name="inputName"
      :value="modelValue"
    />
    <span class="score-text" v-if="modelValue > 0 && showScoreText">{{ modelValue }}分</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  /** 只读展示（如排行榜综合星级），不触发 emit */
  readonly: { type: Boolean, default: false },
  /** 是否在组件内渲染隐藏 input，便于表单提交 */
  bindInput: { type: Boolean, default: false },
  inputName: { type: String, default: 'score' },
  showScoreText: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue']);

const containerRef = ref(null);
const svgRef = ref(null);
const lastTouchedStar = ref(0);
const displayValue = computed(() => Math.min(5, Math.max(0, props.modelValue)));

// 根据点击/触摸位置计算应选星数（1–5），以 SVG 区域为准保证与星星对齐
function getStarIndexFromEvent(e) {
  const el = svgRef.value || containerRef.value;
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const rel = (x - rect.left) / rect.width;
  const index = Math.min(5, Math.max(1, Math.ceil(rel * 5)));
  return index;
}

function setValue(n) {
  const val = Math.min(5, Math.max(0, n));
  if (!props.readonly) emit('update:modelValue', val);
  lastTouchedStar.value = val;
  setTimeout(() => { lastTouchedStar.value = 0; }, 150);
}

function onClick(e) {
  if (props.readonly) return;
  const index = getStarIndexFromEvent(e);
  setValue(index);
}

let touchStartX = 0;
function onTouchStart(e) {
  if (props.readonly) return;
  touchStartX = e.touches[0].clientX;
  const index = getStarIndexFromEvent(e);
  setValue(index);
}
function onTouchMove(e) {
  if (props.readonly) return;
  const index = getStarIndexFromEvent(e);
  setValue(index);
}
function onTouchEnd() {}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  --outline: #E5E7EB;
}
.star-rating:not(.readonly) {
  cursor: pointer;
}
.star-rating.readonly {
  pointer-events: none;
}

.star-wrap {
  transition: transform 0.12s ease;
}
.star-rating:not(.readonly) .star-wrap {
  cursor: pointer;
}
.star-wrap.animate {
  animation: starTap 0.12s ease;
}
@keyframes starTap {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

.star-rating-svg {
  width: 140px;
  height: 28px;
  display: block;
}
.star-path.outline {
  fill: none;
  stroke: #dfddd9;
  stroke-width: 1.1;
  stroke-linejoin: round;
}
.star-path.filled {
  fill: url(#starGold);
  stroke: none;
}
.score-text {
  margin-left: 6px;
  font-size: 13px;
  color: #8a7f6f;
  font-weight: 500;
}
</style>
