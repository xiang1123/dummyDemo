<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>抱歉，您访问的页面不存在</h2>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  color: #606266;
}
.not-found h1 {
  font-size: 120px;
  margin: 0;
  color: #409eff;
}
</style>
