# 👯 Contributors

## Thanks to the following contributors for building and improving the project

<a href="https://github.com/dotnetcore/WebApiClient/graphs/contributors">
  <img :src="webapiUrl" alt="Contributors" loading="lazy" />
</a>

## Thanks to the following contributors for improving the documentation

<a href="https://github.com/WebApiClient/WebApiClientWiki/graphs/contributors">
  <img :src="wikiUrl" alt="Documentation Contributors" loading="lazy" />
</a>

> 💡 Click the image to view the full contributors list on GitHub

<script setup>
import { ref } from 'vue'

// Use year-week as cache-bust parameter, auto-refresh weekly
const getYearWeek = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now - start
  const oneWeek = 604800000 // one week in milliseconds
  const week = Math.ceil(diff / oneWeek)
  return `${now.getFullYear()}-${week}`
}

const yearWeek = getYearWeek()
const webapiUrl = ref(`https://contrib.rocks/image?repo=dotnetcore/WebApiClient&max=100&v=${yearWeek}`)
const wikiUrl = ref(`https://contrib.rocks/image?repo=WebApiClient/WebApiClientWiki&max=100&v=${yearWeek}`)
</script>
