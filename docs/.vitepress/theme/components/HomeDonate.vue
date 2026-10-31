<script setup lang="ts">
// 内容忠实于 docs/reference/donate.md（中文）与 docs/en/reference/donate.md（英文）。
// 图片文件名以 docs/public 实际为准：donate2laojiu.png、donate2ezreal.png。
// 无 window/document 访问，SSR 安全。
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))
</script>

<template>
  <section class="wac-home-extra">
    <div class="wac-section">
      <h2>{{ isZh ? '为我们加油' : 'Support Us' }}</h2>
      <p class="wac-sub">
        {{ isZh ? '如果您觉得 WebApiClient 对你有所帮助，就请支持一下我们吧' : 'If you find WebApiClient helpful, please consider supporting us' }}
      </p>
      <div class="wac-donate-grid">
        <div class="wac-donate-card">
          <img src="/donate2laojiu.png" :alt="isZh ? '支持作者再出精品' : 'Support the author'" loading="lazy" />
          <p>{{ isZh ? '支持作者再出精品' : 'Support the author for more quality content' }}</p>
        </div>
        <div class="wac-donate-card">
          <img src="/donate2ezreal.png" :alt="isZh ? '感谢文档维护' : 'Thank the documentation maintainer'" loading="lazy" />
          <p>{{ isZh ? '感谢文档维护' : 'Thank you for maintaining the documentation' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
