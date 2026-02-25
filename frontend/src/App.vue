<template>
  <div id="app-container">
    <router-view />
  </div>
</template>

<style>
/* 全局：低饱和度、黑白灰基底，成熟工具类产品气质 */
:root {
  --bg-page: #f7f7f7;
  --bg-card: #ffffff;
  --border: #e8e8e8;
  --text-primary: #1a1a1a;
  --text-secondary: #6b6b6b;
  --text-tertiary: #9a9a9a;
  --accent: #7d6e5c;
  --accent-soft: rgba(125, 110, 92, 0.12);
}
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-page);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}
</style>