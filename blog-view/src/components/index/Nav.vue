<template>
  <div ref="nav" class="ui fixed inverted stackable pointing menu" :class="{'transparent': $route.name === 'home' && clientSize.clientWidth > 768}">
    <div class="ui container">
      <router-link to="/">
        <h3 class="ui header item m-blue">{{ blogName }}</h3>
      </router-link>
      <!-- 首页 -->
      <router-link to="/home" class="item" :class="{'m-mobile-hide': mobileHide, 'active': $route.name === 'home'}">
        <i class="home icon"></i>首页
      </router-link>
      <!-- 分类下拉 -->
      <el-dropdown trigger="click" @command="categoryRoute">
				<span class="el-dropdown-link item" :class="{'m-mobile-hide': mobileHide, 'active': $route.name === 'category'}">
					<i class="idea icon"></i>分类<i class="caret down icon"></i>
				</span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :command="category.name" v-for="(category, index) in categoryList" :key="index">{{ category.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <!-- 更多导航项 -->
      <router-link to="/archives" class="item" :class="{'m-mobile-hide': mobileHide, 'active': $route.name === 'archives'}">
        <i class="clone icon"></i>归档
      </router-link>
      <router-link to="/moments" class="item" :class="{'m-mobile-hide': mobileHide, 'active': $route.name === 'moments'}">
        <i class="comment alternate outline icon"></i>动态
      </router-link>
      <router-link to="/friends" class="item" :class="{'m-mobile-hide': mobileHide, 'active': $route.name === 'friends'}">
        <i class="users icon"></i>友人帐
      </router-link>
      <router-link to="/about" class="item" :class="{'m-mobile-hide': mobileHide, 'active': $route.name === 'about'}">
        <i class="info icon"></i>关于我
      </router-link>
      <!-- 搜索框 -->
      <el-autocomplete v-model="queryString" :fetch-suggestions="debounceQuery" placeholder="搜索文章..."
                       class="right item m-search" :class="{'m-mobile-hide': mobileHide}" popper-class="m-search-item" @select="handleSelect">
        <i class="search icon el-input__icon" slot="suffix"></i>
        <template slot-scope="{ item }">
          <div class="title">{{ item.title }}</div>
          <span class="content">{{ item.content }}</span>
        </template>
      </el-autocomplete>
      <!-- 移动端显示菜单按钮 -->
      <button class="ui menu black icon button m-right-top m-mobile-show" @click="toggle">
        <i class="sidebar icon"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { getSearchBlogList } from "@/api/blog";
import { mapState } from 'vuex';

export default {
  name: "Nav",
  props: {
    blogName: {
      type: String,
      required: true
    },
    categoryList: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      mobileHide: true,
      queryString: '',
      queryResult: [],
      timer: null
    }
  },
  computed: {
    ...mapState(['clientSize']) // 获取客户端的窗口大小
  },
  watch: {
    '$route.path'() {
      this.mobileHide = true; // 路由变化时收起菜单
    }
  },
  mounted() {
    // 页面滚动时动态控制菜单的透明度
    window.addEventListener('scroll', () => {
      if (this.$route.name === 'home' && this.clientSize.clientWidth > 768) {
        if (window.scrollY > this.clientSize.clientHeight / 2) {
          this.$refs.nav.classList.remove('transparent');
        } else {
          this.$refs.nav.classList.add('transparent');
        }
      }
    });

    // 点击页面其他地方时，收起移动端菜单
    document.addEventListener('click', (e) => {
      let flag = this.$refs.nav.contains(e.target);
      if (!this.mobileHide && !flag) {
        this.mobileHide = true;
      }
    });
  },
  methods: {
    // 切换移动端菜单的显示
    toggle() {
      this.mobileHide = !this.mobileHide;
    },
    // 分类选择事件，路由跳转
    categoryRoute(name) {
      this.$router.push(`/category/${name}`);
    },
    // 防抖查询处理
    debounceQuery(queryString, callback) {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => this.querySearchAsync(queryString, callback), 1000);
    },
    // 异步获取搜索结果
    querySearchAsync(queryString, callback) {
      if (queryString == null || queryString.trim() === '') {
        return;
      }
      getSearchBlogList(queryString).then(res => {
        if (res.code === 200) {
          this.queryResult = res.data;
          if (this.queryResult.length === 0) {
            this.queryResult.push({ title: '无相关搜索结果' });
          }
          callback(this.queryResult);
        }
      }).catch(() => {
        this.msgError("请求失败");
      });
    },
    // 选择搜索结果后跳转
    handleSelect(item) {
      if (item.id) {
        this.$router.push(`/blog/${item.id}`);
      }
    }
  }
}
</script>

<style scoped>
.ui.fixed.menu .container {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.ui.fixed.menu {
  transition: .3s ease-out;
}

.ui.inverted.pointing.menu.transparent {
  background: rgba(0, 0, 0, 0.6) !important;
}

.ui.inverted.pointing.menu.transparent .active.item:after {
  background: transparent !important;
  transition: .3s ease-out;
}

.ui.inverted.pointing.menu.transparent .active.item:hover:after {
  background: transparent !important;
}

.el-dropdown-link {
  outline-style: none !important;
  outline-color: unset !important;
  height: 100%;
  cursor: pointer;
}

.el-dropdown-menu {
  margin: 7px 0 0 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: #1b1c1d !important;
}

.el-dropdown-menu__item {
  padding: 0 15px !important;
  color: rgba(255, 255, 255, .9) !important;
}

.el-dropdown-menu__item:hover {
  background: rgba(255, 255, 255, .08) !important;
}

.el-popper .popper__arrow::after {
  content: none !important;
}

.popper__arrow {
  display: none !important;
}

.m-search {
  min-width: 220px;
  padding: 0 !important;
}

.m-search input {
  color: rgba(255, 255, 255, .9) !important;
  border: 0px !important;
  background-color: inherit;
  padding: .67857143em 2.1em .67857143em 1em;
}

.m-search i {
  color: rgba(255, 255, 255, .9) !important;
}

.m-search-item {
  min-width: 350px !important;
}

.m-search-item li {
  line-height: normal !important;
  padding: 8px 10px !important;
}

.m-search-item li .title {
  text-overflow: ellipsis;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.87);
}

.m-search-item li .content {
  text-overflow: ellipsis;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.56);
}

.m-right-top.m-mobile-show {
  border-radius: 50%;
  background: #333;
  transition: .3s ease-in-out;
}

.m-right-top.m-mobile-show:hover {
  background: #1b1c1d;
}

.m-right-top.m-mobile-show i {
  color: white;
}

@media only screen and (max-width: 768px) {
  .m-mobile-hide {
    display: none !important;
  }
}
</style>
