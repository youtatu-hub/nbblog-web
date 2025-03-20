<template>
  <div class="ui segments toc-container">
    <div class="ui secondary segment">
      <div class="toc-header">
        <i class="list icon"></i>
        <span>分类目录</span>
      </div>
    </div>
    <div class="ui segment">
      <div class="toc-content">
        <ul class="toc-list">
          <li v-for="blog in blogList" :key="blog.id" class="toc-item">
            <a href="javascript:;"
               @click="handleClick(blog)"
               :class="{ 'active': currentBlogId === blog.id }">
              <span class="title">{{ blog.title }}</span>
              <div class="meta">
                <span class="date">{{ blog.createTime | dateFormat('YYYY-MM-DD') }}</span>
                <span class="views"><i class="eye icon"></i>{{ blog.views }}</span>
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryToc',
  props: {
    blogList: {
      type: Array,
      required: true
    },
    currentBlogId: {
      type: Number,
      default: null
    }
  },
  methods: {
    handleClick(blog) {
      this.$store.dispatch('goBlogPage', blog)
    }
  },
  filters: {
    dateFormat(value, format) {
      // 使用与BlogItem相同的日期格式化方法
      return value
    }
  }
}
</script>

<style scoped>
.toc-container {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.toc-header {
  display: flex;
  align-items: center;
  padding: 10px;
  font-size: 1.1em;
  font-weight: bold;
  color: #2c3e50;
}

.toc-header i {
  margin-right: 8px;
}

.toc-content {
  padding: 10px 0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin: 8px 0;
}

.toc-item a {
  display: block;
  padding: 8px 15px;
  color: #34495e;
  text-decoration: none;
  transition: all 0.3s ease;
}

.toc-item a:hover {
  background-color: #f5f5f5;
}

.toc-item a.active {
  background-color: #e6f7ff;
  border-right: 3px solid #1890ff;
}

.title {
  display: block;
  font-size: 0.95em;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #999;
}

.views i {
  margin-right: 4px;
}
</style>
