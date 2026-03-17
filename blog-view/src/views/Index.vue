<template>
	<div class="site">
		<!--顶部导航-->
		<Nav :blogName="siteInfo.blogName" :categoryList="categoryList"/>
		<!--首页大图 只在首页且pc端时显示-->
		<div class="m-mobile-hide">
			<Header v-if="$route.name==='home'"/>
		</div>

		<div class="main">
			<div class="m-padded-tb-big">
				<div class="ui container">
					<div class="ui stackable grid">
						<!--左侧-->
						<div class="three wide column m-mobile-hide">
							<Introduction :class="{'m-display-none':focusMode}"/>
              <CategoryToc
                  v-if="$route.name === 'category' && $route.params.id"
                  :categories="categoryList"
                  :currentBlogId="$route.params.id"
              />
						</div>
						<!--中间-->
						<div class="ten wide column">
							<keep-alive include="Home">
								<router-view/>
							</keep-alive>
						</div>
						<!--右侧-->
						<div class="three wide column m-mobile-hide">
							<RandomBlog :randomBlogList="randomBlogList" :class="{'m-display-none':focusMode}"/>
							<Tags :tagList="tagList" :class="{'m-display-none':focusMode}"/>
							<!--只在文章页面显示目录-->
							<Tocbot v-if="$route.name==='blog'"/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!--私密文章密码对话框-->
		<BlogPasswordDialog/>

		<!--APlayer-->
		<div class="m-mobile-hide">
			<meting-js :server="siteInfo.playlistServer" :id="siteInfo.playlistId" type="playlist" fixed="true" theme="#25CCF7" v-if="siteInfo.playlistServer && siteInfo.playlistId"></meting-js>
		</div>
		<!--回到顶部-->
		<div v-show="showBackTop" style="position: fixed;bottom: 50px;right: 50px;width: 40px;height: 40px;background-color: rgba(255,255,255,0.9);border-radius: 50%;display: flex;align-items: center;justify-content: center;box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);z-index: 9999;cursor: pointer;" @click="backToTop">
			<img src="/img/paper-plane.png" style="width: 24px;height: 24px;">
		</div>
		<!--底部footer-->
		<Footer :siteInfo="siteInfo" :badges="badges" :newBlogList="newBlogList" :hitokoto="hitokoto"/>
	</div>
</template>

<script>
	import {getHitokoto, getSite} from '@/api/index'
	import Nav from "@/components/index/Nav";
	import Header from "@/components/index/Header";
	import Footer from "@/components/index/Footer";
	import Introduction from "@/components/sidebar/Introduction";
	import Tags from "@/components/sidebar/Tags";
	import RandomBlog from "@/components/sidebar/RandomBlog";
	import Tocbot from "@/components/sidebar/Tocbot";
    import CategoryToc from "@/components/sidebar/CategoryToc";
	import BlogPasswordDialog from "@/components/index/BlogPasswordDialog";
	import {mapState} from 'vuex'
	import {SAVE_CLIENT_SIZE, SAVE_INTRODUCTION, SAVE_SITE_INFO, RESTORE_COMMENT_FORM} from "@/store/mutations-types";

	export default {
		name: "Index",
		components: {Header, BlogPasswordDialog, Tocbot, RandomBlog, Tags, Nav, Footer, Introduction, CategoryToc},
		data() {
			return {
				siteInfo: {
					blogName: '',
					webTitleSuffix: '',
					playlistServer: '',
					playlistId: ''
				},
				categoryList: [],
				tagList: [],
				randomBlogList: [],
				badges: [],
				newBlogList: [],
				hitokoto: {},
				showBackTop: false
			}
		},
		computed: {
			...mapState(['focusMode'])
		},
		watch: {
			//路由改变时，页面滚动至顶部
			'$route.path'() {
				this.scrollToTop()
			}
		},
		created() {
			this.getSite()
			this.getHitokoto()
			//从localStorage恢复之前的评论信息
			this.$store.commit(RESTORE_COMMENT_FORM)
		},
		mounted() {
			//保存可视窗口大小
			this.$store.commit(SAVE_CLIENT_SIZE, {clientHeight: document.body.clientHeight, clientWidth: document.body.clientWidth})
			window.onresize = () => {
				this.$store.commit(SAVE_CLIENT_SIZE, {clientHeight: document.body.clientHeight, clientWidth: document.body.clientWidth})
			}

			// 监听滚动事件
			const siteEl = document.querySelector('.site')
			if (siteEl) {
				siteEl.addEventListener('scroll', this.handleScroll)
			}
		},
		beforeDestroy() {
			const siteEl = document.querySelector('.site')
			if (siteEl) {
				siteEl.removeEventListener('scroll', this.handleScroll)
			}
		},
		methods: {
			getSite() {
				getSite().then(res => {
					if (res.code === 200) {
						this.siteInfo = res.data.siteInfo
						this.badges = res.data.badges
						this.newBlogList = res.data.newBlogList
						this.categoryList = res.data.categoryList
						this.tagList = res.data.tagList
						this.randomBlogList = res.data.randomBlogList
						this.$store.commit(SAVE_SITE_INFO, this.siteInfo)
						this.$store.commit(SAVE_INTRODUCTION, res.data.introduction)
						document.title = this.$route.meta.title + this.siteInfo.webTitleSuffix
					}
				})
			},
			//获取一言
			getHitokoto() {
				getHitokoto().then(res => {
					this.hitokoto = res
				})
			},
			backToTop() {
				const siteEl = document.querySelector('.site')
				if (siteEl) {
					siteEl.scrollTo({top: 0, behavior: 'smooth'})
				}
			},
			handleScroll() {
				const siteEl = document.querySelector('.site')
				this.showBackTop = siteEl && siteEl.scrollTop > 200
			}
		}
	}
</script>

<style scoped>
	.site {
		display: flex;
		height: 100vh;
		flex-direction: column;
		overflow-y: auto;
	}

	.main {
		margin-top: 40px;
		flex: 1;
		overflow-y: visible;
	}

	.main .ui.container {
		width: 100% !important;
		max-width: 100% !important;
		margin-left: 0 !important;
		margin-right: 0 !important;
		padding-left: 20px !important;
		padding-right: 20px !important;
	}

	.ui.grid .three.column {
		padding: 0;
	}

	.ui.grid .ten.column {
		padding-top: 0;
	}

	.m-display-none {
		display: none !important;
	}
</style>
