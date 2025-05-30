<template>
	<div :class="{'fullscreen-container': isFullscreen}">
		<div class="ui padded attached segment m-padded-tb-large">
			<div class="ui large red right corner label" v-if="blog.top">
				<i class="arrow alternate circle up icon"></i>
			</div>
			<div class="ui middle aligned mobile reversed stackable">
				<div class="ui grid m-margin-lr">
					<!--标题-->
					<div class="row m-padded-tb-small">
						<h2 class="ui header m-center">{{ blog.title }}</h2>
					</div>
					<!--文章简要信息-->
					<div class="row m-padded-tb-small">
						<div class="ui horizontal link list m-center">
							<div class="item m-datetime">
								<i class="small calendar icon"></i><span>{{ blog.createTime | dateFormat('YYYY-MM-DD') }}</span>
							</div>
							<div class="item m-views">
								<i class="small eye icon"></i><span>{{ blog.views }}</span>
							</div>
							<div class="item m-common-black">
								<i class="small pencil alternate icon"></i><span>字数≈{{ blog.words }}字</span>
							</div>
							<div class="item m-common-black">
								<i class="small clock icon"></i><span>阅读时长≈{{ blog.readTime }}分</span>
							</div>
							<a class="item m-common-black" @click.prevent="bigFontSize=!bigFontSize">
								<div data-inverted="" data-tooltip="点击切换字体大小" data-position="top center">
									<i class="font icon"></i>
								</div>
							</a>
							<a class="item m-common-black" @click.prevent="changeFocusMode">
								<div data-inverted="" data-tooltip="专注模式" data-position="top center">
									<i class="book icon"></i>
								</div>
							</a>
              <a class="item m-common-black" @click.prevent="toggleFullscreen">
                <div data-inverted="" data-tooltip="全屏模式" data-position="top center">
                  <i class="expand arrows alternate icon" v-if="!isFullscreen"></i>
                  <i class="compress arrows alternate icon" v-else></i>
                </div>
              </a>
						</div>
					</div>
					<!--分类-->
					<router-link :to="`/category/${blog.category.name}`" class="ui orange large ribbon label" v-if="blog.category">
						<i class="small folder open icon"></i><span class="m-text-500">{{ blog.category.name }}</span>
					</router-link>
					<!--文章Markdown正文-->
          <div
              class="typo js-toc-content m-padded-tb-small match-braces rainbow-braces"
              v-lazy-container="{selector: 'img'}"
              v-html="blog.content"
              :class="{'m-big-fontsize': bigFontSize}"
              ref="blogContent">
          </div>

          <!--赞赏-->
					<div style="margin: 2em auto">
						<el-popover placement="top" width="220" trigger="click" v-if="blog.appreciation">
							<div class="ui orange basic label" style="width: 100%">
								<div class="image">
									<div style="font-size: 12px;text-align: center;margin-bottom: 5px;">一毛是鼓励</div>
									<img :src="$store.state.siteInfo.reward" alt="" class="ui rounded bordered image" style="width: 100%">
									<div style="font-size: 12px;text-align: center;margin-top: 5px;">一块是真爱</div>
								</div>
							</div>
							<el-button slot="reference" class="ui orange inverted circular button m-text-500">赞赏</el-button>
						</el-popover>
					</div>
					<!--横线-->
					<el-divider></el-divider>
					<!--标签-->
					<div class="row m-padded-tb-no">
						<div class="column m-padding-left-no">
							<router-link :to="`/tag/${tag.name}`" class="ui tag label m-text-500 m-margin-small" :class="tag.color" v-for="(tag,index) in blog.tags" :key="index">{{ tag.name }}</router-link>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!--博客信息-->
		<div class="ui attached positive message">
			<ul class="list">
				<li>作者：{{ $store.state.introduction.name }}
					<router-link to="/about">（联系作者）</router-link>
				</li>
				<li>发表时间：{{ blog.createTime | dateFormat('YYYY-MM-DD HH:mm') }}</li>
				<li>最后修改：{{ blog.updateTime | dateFormat('YYYY-MM-DD HH:mm') }}</li>
				<li>本站点采用<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank"> 署名 4.0 国际 (CC BY 4.0) </a>创作共享协议。可自由转载、引用，并且允许商业性使用。但需署名作者且注明文章出处。</li>
			</ul>
		</div>
		<!--评论-->
		<div class="ui bottom teal attached segment threaded comments">
			<CommentList :page="0" :blogId="blogId" v-if="blog.commentEnabled"/>
			<h3 class="ui header" v-else>评论已关闭</h3>
		</div>
	</div>
</template>

<script>
	import {getBlogById} from "@/api/blog";
	import CommentList from "@/components/comment/CommentList";
	import {mapState} from "vuex";
	import {SET_FOCUS_MODE, SET_IS_BLOG_RENDER_COMPLETE} from '@/store/mutations-types';

	export default {
		name: "Blog",
		components: {CommentList},
		data() {
			return {
				blog: {},
				bigFontSize: false,
        isZoomed: false,
        zoomedImage: null,
        scrollTimeout: null,
        isFullscreen: false
			}
		},
		computed: {
			blogId() {
				return parseInt(this.$route.params.id)
			},
			...mapState(['siteInfo', 'focusMode'])
		},
		beforeRouteEnter(to, from, next) {
			//路由到博客文章页面之前，应将文章的渲染完成状态置为 false
			next(vm => {
				// 当 beforeRouteEnter 钩子执行前，组件实例尚未创建
				// vm 就是当前组件的实例，可以在 next 方法中把 vm 当做 this用
				vm.$store.commit(SET_IS_BLOG_RENDER_COMPLETE, false)
			})
		},
		beforeRouteLeave(to, from, next) {
			this.$store.commit(SET_FOCUS_MODE, false)
			// 从文章页面路由到其它页面时，销毁当前组件的同时，要销毁tocbot实例
			// 否则tocbot一直在监听页面滚动事件，而文章页面的锚点已经不存在了，会报"Uncaught TypeError: Cannot read property 'className' of null"
			tocbot.destroy()
			next()
		},
		beforeRouteUpdate(to, from, next) {
			// 一般有两种情况会触发这个钩子
			// ①当前文章页面跳转到其它文章页面
			// ②点击目录跳转锚点时，路由hash值会改变，导致当前页面会重新加载，这种情况是不希望出现的
			// 在路由 beforeRouteUpdate 中判断路径是否改变
			// 如果跳转到其它页面，to.path!==from.path 就放行 next()
			// 如果是跳转锚点，path不会改变，hash会改变，to.path===from.path, to.hash!==from.path 不放行路由跳转，就能让锚点正常跳转
			if (to.path !== from.path) {
				this.$store.commit(SET_FOCUS_MODE, false)
				//在当前组件内路由到其它博客文章时，要重新获取文章
				this.getBlog(to.params.id)
				//只要路由路径有改变，且停留在当前Blog组件内，就把文章的渲染完成状态置为 false
				this.$store.commit(SET_IS_BLOG_RENDER_COMPLETE, false)
				next()
			}
		},
		created() {
			this.getBlog()
		},
		methods: {
			getBlog(id = this.blogId) {
				//密码保护的文章，需要发送密码验证通过后保存在localStorage的Token
				const blogToken = window.localStorage.getItem(`blog${id}`)
				//如果有则发送博主身份Token
				const adminToken = window.localStorage.getItem('adminToken')
				const token = adminToken ? adminToken : (blogToken ? blogToken : '')
				getBlogById(token, id).then(res => {
					if (res.code === 200) {
						this.blog = res.data
						document.title = this.blog.title + this.siteInfo.webTitleSuffix
						//v-html渲染完毕后，渲染代码块样式
						this.$nextTick(() => {
							Prism.highlightAll()
							//将文章渲染完成状态置为 true
							this.$store.commit(SET_IS_BLOG_RENDER_COMPLETE, true)
						})
					} else {
						this.msgError(res.msg)
					}
				}).catch(() => {
					this.msgError("请求失败")
				})
			},
			changeFocusMode() {
				this.$store.commit(SET_FOCUS_MODE, !this.focusMode)
			},
      handleImageZoom(event) {
        const img = event.target;
        if (img.tagName.toLowerCase() === 'img') {
          // Reset previous zoomed image if exists
          if (this.zoomedImage && this.zoomedImage !== img) {
            this.resetZoom(this.zoomedImage);
          }

          if (!this.isZoomed || this.zoomedImage !== img) {
            // Zoom in
            this.zoomImage(img);
          } else {
            // Zoom out
            this.resetZoom(img);
          }
        }
      },
      // 切换图片放大效果
      zoomImage(img) {
        // Calculate the viewport center
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Get image dimensions and position
        const rect = img.getBoundingClientRect();

        // Calculate the scale factor (max 2.5x)
        const scaleX = Math.min(viewportWidth / rect.width * 0.8, 2.5);
        const scaleY = Math.min(viewportHeight / rect.height * 0.8, 2.5);
        const scale = Math.min(scaleX, scaleY);

        // Apply transforms
        img.style.transform = `scale(${scale})`;
        img.style.zIndex = '1000';
        img.style.position = 'relative';

        // Update state
        this.isZoomed = true;
        this.zoomedImage = img;

        // Add zoomed class for additional styling
        img.classList.add('zoomed');
      },
      resetZoom(img) {
        if (img) {
          img.style.transform = 'scale(1)';
          img.style.zIndex = 'auto';
          img.style.position = 'static';
          img.classList.remove('zoomed');
        }
        this.isZoomed = false;
        this.zoomedImage = null;
      },
      handleScroll() {
        // Clear the previous timeout
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }

        // Set a new timeout
        this.scrollTimeout = setTimeout(() => {
          if (this.isZoomed && this.zoomedImage) {
            this.resetZoom(this.zoomedImage);
          }
        }, 150); // Debounce time
      },
      setupImageHandling() {
        const blogContent = this.$refs.blogContent;
        if (blogContent) {
          const images = blogContent.getElementsByTagName('img');
          Array.from(images).forEach(img => {
            img.style.cursor = 'pointer';
            // Ensure images are above other content when zoomed
            img.addEventListener('click', this.handleImageZoom);
          });
        }
      },
      toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
          document.body.style.overflow = 'hidden';
          // 滚动到顶部
          window.scrollTo(0, 0);
        } else {
          document.body.style.overflow = 'auto';
        }
      },
      handleKeydown(event) {
        if (event.key === 'Escape' && this.isFullscreen) {
          this.toggleFullscreen();
        }
      }
		},
    mounted() {
      // Setup image handling after content is loaded
      this.$nextTick(() => {
        this.setupImageHandling();
      });

      window.addEventListener('scroll', this.handleScroll);

      // 新增 ESC 键监听
      window.addEventListener('keydown', this.handleKeydown);
    },
    updated() {
      // Refresh image handling when content updates
      this.$nextTick(() => {
        this.setupImageHandling();
      });
    },
    beforeDestroy() {

      // 清理全屏状态
      if (this.isFullscreen) {
        document.body.style.overflow = 'auto';
      }

      // Clean up
      window.removeEventListener('scroll', this.handleScroll);

      const blogContent = this.$refs.blogContent;
      if (blogContent) {
        const images = blogContent.getElementsByTagName('img');
        Array.from(images).forEach(img => {
          img.removeEventListener('click', this.handleImageZoom);
        });
      }
    }
  }
</script>

<style scoped>
	.el-divider {
		margin: 1rem 0 !important;
	}

	h1::before, h2::before, h3::before, h4::before, h5::before, h6::before {
		display: block;
		content: " ";
		height: 55px;
		margin-top: -55px;
		visibility: hidden;
	}
  /* 为图片增加平滑的缩放动画 */
  .typo img {
    cursor: pointer;
    transition: all 0.3s ease;
    transform-origin: center;
    max-width: 100%;
    height: auto;
    position: relative;
  }

  .typo img.zoomed {
    cursor: zoom-out;
    position: relative;
    z-index: 1000;
    transform-origin: center;
    will-change: transform;
  }

  /* Ensure zoomed images are always on top */
  .typo {
    position: relative;
  }

  /* Add smooth transition for zoom effect */
  .typo img {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* Prevent text selection while zooming */
  .typo img.zoomed {
    user-select: none;
    -webkit-user-select: none;
  }

  /* 全屏模式样式 */
  .fullscreen-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    overflow-y: auto;
    z-index: 9999;
    padding: 20px;
    box-sizing: border-box;
  }

  /* 全屏模式下的内容容器 */
  .fullscreen-container .ui.padded.attached.segment {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    max-width: 1000px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* 标题美化 */
  .fullscreen-container h2.ui.header {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2rem;
  }

  /* 文章内容区域美化 */
  .fullscreen-container .typo {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    padding: 2rem;
    line-height: 1.8;
    font-size: 16px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  /* 按钮组美化 */
  .fullscreen-container .ui.horizontal.link.list .item {
    transition: all 0.3s ease;
  }

  .fullscreen-container .ui.horizontal.link.list .item:hover {
    transform: translateY(-2px);
    color: #667eea !important;
  }

  /* 标签美化 */
  .fullscreen-container .ui.tag.label {
    transition: all 0.3s ease;
    margin: 0.2em;
  }

  .fullscreen-container .ui.tag.label:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  /* 滚动条美化（webkit浏览器） */
  .fullscreen-container::-webkit-scrollbar {
    width: 8px;
  }

  .fullscreen-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  .fullscreen-container::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 4px;
  }

  .fullscreen-container::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #764ba2, #667eea);
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .fullscreen-container {
      padding: 10px;
    }

    .fullscreen-container .typo {
      padding: 1rem;
      font-size: 14px;
    }
  }
</style>
