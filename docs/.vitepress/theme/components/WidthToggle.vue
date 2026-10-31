<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useData } from "vitepress";

// 版式开关：宽屏（默认，两侧留呼吸空间）/ 全屏（内容吃满宽度，左右无留白）。
// 选择持久化在 localStorage，首屏由 config.mts head 里的内联脚本提前恢复，避免闪烁。
const STORAGE_KEY = "wac-width-mode";

const { lang } = useData();
const full = ref(false);
// SSR 阶段不知道用户的选择，图标延迟到 mounted 再渲染，避免闪错
const ready = ref(false);

function label() {
  const zh = lang.value.startsWith("zh");
  return full.value
    ? zh
      ? "切换到宽屏版式"
      : "Switch to wide layout"
    : zh
      ? "切换到全屏版式"
      : "Switch to full-width layout";
}

function apply(value: boolean) {
  full.value = value;
  document.documentElement.classList.toggle("wac-full", value);
  try {
    localStorage.setItem(STORAGE_KEY, value ? "full" : "wide");
  } catch {
    // 隐私模式等场景下静默降级：本次会话内仍可切换
  }
}

function toggle() {
  apply(!full.value);
}

onMounted(() => {
  try {
    full.value = localStorage.getItem(STORAGE_KEY) === "full";
  } catch {
    full.value = false;
  }
  ready.value = true;
});
</script>

<template>
  <button
    type="button"
    class="wac-width-toggle"
    :title="label()"
    :aria-label="label()"
    :aria-pressed="full"
    @click="toggle"
  >
    <!-- 全屏档：四角内收（点击回宽屏） -->
    <svg
      v-if="ready && full"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4 9h5V4" />
      <path d="M20 9h-5V4" />
      <path d="M4 15h5v5" />
      <path d="M20 15h-5v5" />
    </svg>
    <!-- 宽屏档：四角外扩（点击进全屏） -->
    <svg
      v-else-if="ready"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M9 3H3v6" />
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M15 21h6v-6" />
    </svg>
    <span v-else class="wac-width-toggle-ph"></span>
  </button>
</template>
