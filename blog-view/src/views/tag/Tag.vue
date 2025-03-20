<template>
  <div class="tag-page">
    <!-- 标题部分 -->
    <div class="tag-header">
      <h2>标签 "{{ tagName }}" 下的文章</h2>
    </div>

    <!-- 博客列表 -->
    <div class="content-container">
      <BlogList :getBlogList="getBlogList" :blogList="blogList" :totalPage="totalPage" />
    </div>
  </div>
</template>


<script>
import BlogList from "@/components/blog/BlogList";
import { getBlogListByTagName } from "@/api/tag";

export default {
  name: "Tag",
  components: { BlogList },
  data() {
    return {
      blogList: [], // 博客列表数据
      totalPage: 0, // 总页数
    };
  },
  watch: {
    // 监听路由变化，重新加载博客列表
    '$route.fullPath'() {
      if (this.$route.name === 'tag') {
        this.getBlogList();
      }
    },
  },
  created() {
    this.getBlogList(); // 页面加载时获取博客列表
  },
  computed: {
    // 当前标签名称
    tagName() {
      return this.$route.params.name;
    },
  },
  methods: {
    getBlogList(pageNum = 1) {
      getBlogListByTagName(this.tagName, pageNum).then((res) => {
        if (res.code === 200) {
          this.blogList = res.data.list;
          this.totalPage = res.data.totalPage;
          this.$nextTick(() => {
            Prism.highlightAll(); // 高亮代码块
          });
        } else {
          this.msgError(res.msg); // 错误提示
        }
      }).catch(() => {
        this.msgError("请求失败");
      });
    },
    // 错误提示
    msgError(msg) {
      this.$notify.error({
        title: "错误",
        message: msg,
      });
    },
  },
};
</script>

<style scoped>
/* 页面整体样式 */
.tag-page {
  padding: 0px;
  background-color: #CCE7FF;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 标题部分 */
.tag-header {
  text-align: center;
  background: linear-gradient(90deg, #6a11cb, #2575fc); /* 渐变背景色 */
  padding: 13px;
  width: 100%;
  margin: 0 auto;
  max-width: 400px;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tag-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

/* 博客列表容器 */
.content-container {
  width: 100%;
  max-width: 1000px; /* 限制内容宽度，与标题对齐 */
  background: #CCEFFF;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tag-header h2 {
    font-size: 1.5rem;
  }

  .content-container {
    padding: 15px;
  }
}
</style>
