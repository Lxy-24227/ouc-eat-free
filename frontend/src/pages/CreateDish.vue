<template>
  <div class="create-dish-container">
    <h1>新增校园菜品</h1>

    <div class="form-group">
      <label>所属食堂</label>
      <select v-model="formData.canteen">
        <option value="一食堂">一食堂</option>
        <option value="二食堂">二食堂</option>
        <option value="三食堂">三食堂</option>
      </select>
    </div>

    <div class="form-group">
      <label>具体楼层</label>
      <select v-model="formData.floor">
        <option value="F1">1楼</option>
        <option value="F2">2楼</option>
        <option value="F3">3楼</option>
      </select>
    </div>

    <div class="form-group">
      <label>菜品名称</label>
      <input
        v-model="formData.name"
        type="text"
        placeholder="例如：红烧排骨"
      />
    </div>

    <button @click="handleSubmit" class="submit-btn">发布并去排行</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 定义表单数据对象
const formData = ref({
  canteen: '一食堂',
  floor: 'F1',
  name: ''
});

// 提交逻辑
const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    alert("请输入菜名！");
    return;
  }

  // 模拟发送数据给后端
  console.log("正在提交数据到后端...", formData.value);

  // 模拟提交成功后的跳转
  alert("提交成功！即将跳转到排行页");

  // 这里可以写跳转逻辑，比如跳转到 DishRank
  // router.push('/rank');
};
</script>

<style scoped>
.create-dish-container {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}
select, input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
