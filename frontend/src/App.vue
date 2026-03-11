<template>
  <div id="app-container">
    <router-view />
  </div>
</template>

<style>
:root {
  --bg-page: #f4faf3;
  --bg-card: #ffffff;
  --border: #d9e8dc;
  --text-primary: #1f2c22;
  --text-secondary: #58705f;
  --text-tertiary: #8ca191;
  --accent: #60a073;
  --accent-soft: rgba(96, 160, 115, 0.12);
}
body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-page);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

button,
input,
select,
textarea {
  font: inherit;
}
</style>