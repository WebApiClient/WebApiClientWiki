# 👯 Contributors (贡献者)

## 感谢以下贡献者添砖加瓦，完善项目

<a href="https://github.com/dotnetcore/WebApiClient/graphs/contributors">
  <img :src="webapiUrl" alt="贡献者列表" loading="lazy" />
</a>

## 感谢以下贡献者锦上添花，贡献文档

<a href="https://github.com/WebApiClient/WebApiClientWiki/graphs/contributors">
  <img :src="wikiUrl" alt="文档贡献者列表" loading="lazy" />
</a>

> 💡 点击图片可在 GitHub 查看完整贡献者列表

<script setup>
import { ref } from 'vue'

// 使用年-周作为缓存破坏参数，每周自动刷新
const getYearWeek = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now - start
  const oneWeek = 604800000 // 一周的毫秒数
  const week = Math.ceil(diff / oneWeek)
  return `${now.getFullYear()}-${week}`
}

const yearWeek = getYearWeek()
const webapiUrl = ref(`https://contrib.rocks/image?repo=dotnetcore/WebApiClient&max=100&v=${yearWeek}`)
const wikiUrl = ref(`https://contrib.rocks/image?repo=WebApiClient/WebApiClientWiki&max=100&v=${yearWeek}`)
</script>
