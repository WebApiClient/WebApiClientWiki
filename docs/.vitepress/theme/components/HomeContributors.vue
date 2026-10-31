<script setup lang="ts">
// 内容忠实于 docs/reference/contributors.md（中文）与
// docs/en/reference/contributors_en.md（英文），按站点语言切换文案。
// 仅使用 Date 做年-周缓存破坏参数，无 window/document 访问，SSR 安全。
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))

// 使用年-周作为缓存破坏参数，每周自动刷新（与源文件逻辑一致）
function getYearWeek(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 604800000 // 一周的毫秒数
  const week = Math.ceil(diff / oneWeek)
  return `${now.getFullYear()}-${week}`
}

const yearWeek = getYearWeek()
const webapiUrl = `https://contrib.rocks/image?repo=dotnetcore/WebApiClient&max=100&v=${yearWeek}`
const wikiUrl = `https://contrib.rocks/image?repo=WebApiClient/WebApiClientWiki&max=100&v=${yearWeek}`
</script>

<template>
  <section class="wac-home-extra">
    <div class="wac-section">
      <h2>{{ isZh ? '贡献者' : 'Contributors' }}</h2>
      <p class="wac-sub">
        {{ isZh ? '感谢以下贡献者添砖加瓦，完善项目' : 'Thanks to the following contributors for building and improving the project' }}
      </p>
      <a
        class="wac-contributors"
        href="https://github.com/dotnetcore/WebApiClient/graphs/contributors"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="webapiUrl" :alt="isZh ? '贡献者列表' : 'Contributors'" loading="lazy" />
      </a>
      <h3>
        {{ isZh ? '感谢以下贡献者锦上添花，贡献文档' : 'Thanks to the following contributors for improving the documentation' }}
      </h3>
      <a
        class="wac-contributors"
        href="https://github.com/WebApiClient/WebApiClientWiki/graphs/contributors"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img :src="wikiUrl" :alt="isZh ? '文档贡献者列表' : 'Documentation Contributors'" loading="lazy" />
      </a>
      <p class="wac-note">
        {{ isZh ? '💡 点击图片可在 GitHub 查看完整贡献者列表' : '💡 Click the image to view the full contributors list on GitHub' }}
      </p>
    </div>
  </section>
</template>
