<template>
  <div class="category-page">
    <!-- 标题部分 -->
    <div class="category-header">
      <h2>分类 "{{ categoryName }}" 下的文章</h2>
    </div>

    <!-- BlogList 组件 -->
    <div class="content-container">
      <BlogList :getBlogList="getBlogList" :blogList="blogList" :totalPage="totalPage" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
    </div>
  </div>
</template>


<script>
import BlogList from "@/components/blog/BlogList";
import { getBlogListByCategoryName } from "@/api/category";

export default {
  name: "Category",
  components: { BlogList },
  data() {
    return {
      blogList: [], // 文章列表
      totalPage: 0, // 总页数
      loading: false, // 加载状态
    };
  },
  watch: {
    '$route.fullPath'() {
      if (this.$route.name === 'category') {
        this.getBlogList(); // 路由变化时重新加载数据
      }
    }
  },
  created() {
    this.getBlogList(); // 页面创建时加载数据
  },
  computed: {
    // 当前分类名称
    categoryName() {
      return this.$route.params.name;
    }
  },
  methods: {
    // 获取文章列表
    getBlogList(pageNum = 1) {
      this.loading = true; // 开始加载
      getBlogListByCategoryName(this.categoryName, pageNum).then(res => {
        if (res.code === 200) {
          this.blogList = res.data.list; // 设置文章列表
          this.totalPage = res.data.totalPage; // 设置总页数
        } else {
          this.msgError(res.msg); // 错误提示
        }
      }).catch(() => {
        this.msgError("请求失败"); // 网络错误处理
      }).finally(() => {
        this.loading = false; // 加载结束
      });
    },
    // 错误提示
    msgError(msg) {
      this.$notify.error({
        title: "错误",
        message: msg,
      });
    }
  }
};
</script>

<style scoped>
/* 页面整体样式 */
.category-page {
  padding: 0px;
  background-color: #CCE7FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

/* 标题部分 */
.category-header {
  text-align: center;
  width: 100%;
  max-width: 350px; /* 限制宽度 */
  margin: 0 auto;
  padding: 13px;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.category-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

/* 主内容容器 */
.content-container {
  width: 100%;
  max-width: 1200px; /* 与标题部分对齐 */
  margin-top: 3px;
  background: #CFEFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 加载器样式 */
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.loader {
  width: 50px;
  height: 50px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 加载器动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-header h2 {
    font-size: 1.5rem;
  }

  .content-container {
    padding: 15px;
  }
}
</style>

