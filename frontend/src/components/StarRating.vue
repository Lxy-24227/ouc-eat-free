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
  </div>
</template>

<script setup>
defineProps(['modelValue']); // 接收父组件传来的分数
defineEmits(['update:modelValue']); // 定义修改分数的事件
</script>

<style scoped>
.star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}
.star.active {
  color: #ffca28; /* 金黄色 */
}
</style>
