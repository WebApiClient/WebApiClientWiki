<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useData } from "vitepress";

// 版式开关：宽敞（默认）/ 留白。选择持久化在 localStorage，
// 首屏由 config.mts head 里的内联脚本提前恢复，避免闪烁。
const STORAGE_KEY = "wac-width-mode";

const { lang } = useData();
const compact = ref(false);
// SSR 阶段不知道用户的选择，图标延迟到 mounted 再渲染，避免闪错
const ready = ref(false);

function label() {
  const zh = lang.value.startsWith("zh");
  return compact.value
    ? zh
      ? "切换到宽敞版式"
      : "Switch to wide layout"
    : zh
      ? "切换到留白版式"
      : "Switch to compact layout";
}

function apply(value: boolean) {
  compact.value = value;
  document.documentElement.classList.toggle("wac-compact", value);
  try {
    localStorage.setItem(STORAGE_KEY, value ? "compact" : "wide");
  } catch {
    // 隐私模式等场景下静默降级：本次会话内仍可切换
  }
}

function toggle() {
  apply(!compact.value);
}

onMounted(() => {
  try {
    compact.value = localStorage.getItem(STORAGE_KEY) === "compact";
  } catch {
    compact.value = false;
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
    :aria-pressed="compact"
    @click="toggle"
  >
    <!-- 留白档：四角外扩（点击变宽敞） -->
    <svg
      v-if="ready && compact"
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
    <!-- 宽敞档：四角内收（点击变留白） -->
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
      <path d="M4 9h5V4" />
      <path d="M20 9h-5V4" />
      <path d="M4 15h5v5" />
      <path d="M20 15h-5v5" />
    </svg>
    <span v-else class="wac-width-toggle-ph"></span>
  </button>
</template>
