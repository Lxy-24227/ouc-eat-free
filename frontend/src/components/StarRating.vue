<template>
  <div class="star-rating">
    <span
      v-for="star in 5"
      :key="star"
      class="star"
      :class="{ active: star <= modelValue }"
      @click="$emit('update:modelValue', star)"
    >
      ★
    </span>
    <span class="score-text" v-if="modelValue > 0">{{ modelValue }}分</span>
  </div>
</template>

<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.star {
  font-size: 26px;
  color: #e0e0e0;
  cursor: pointer;
  transition: transform 0.1s, color 0.2s;
}
.star:hover {
  transform: scale(1.2);
}
.star.active {
  color: #ffca28; /* 经典的五星金黄色 */
  text-shadow: 0 0 5px rgba(255, 202, 40, 0.3);
}
.score-text {
  margin-left: 8px;
  font-size: 14px;
  color: #ffca28;
  font-weight: bold;
}
</style>