import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
// custom.css 由站点样式负责人维护
import './custom.css';
import HomeTags from './components/HomeTags.vue';
import HomeContributors from './components/HomeContributors.vue';
import HomeDonate from './components/HomeDonate.vue';

export default {
  ...DefaultTheme,
  // 首页 features 下方追加三段（tags / 贡献者 / 赞助）。
  // 说明：VitePress 1.x 不支持在 markdown 里写 <template #home-features-after>
  // （页面正文会被包进 <template><div> 导致 Vue 编译失败），官方方式是包一层 Layout。
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-features-after': () => [h(HomeTags), h(HomeContributors), h(HomeDonate)],
    }),
  enhanceApp({ app }) {
    // 全局注册，markdown 里也可直接使用 <HomeTags /> 等组件
    app.component('HomeTags', HomeTags);
    app.component('HomeContributors', HomeContributors);
    app.component('HomeDonate', HomeDonate);
  },
} satisfies Theme;
