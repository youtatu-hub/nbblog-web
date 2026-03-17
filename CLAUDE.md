# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

NBlog 是一个前后端分离的博客系统，包含两个独立的 Vue 2 应用：

- **blog-view**: 博客前台展示页面
- **blog-cms**: 博客后台管理系统

## 开发命令

### blog-view (前台)
```bash
cd blog-view
npm install          # 安装依赖
npm run serve        # 开发服务器
npm run build        # 生产构建
```

### blog-cms (后台)
```bash
cd blog-cms
npm install          # 安装依赖
npm run serve        # 开发服务器 (默认端口 8079)
npm run build        # 生产构建
```

## API 配置

### blog-cms
- 开发环境: `http://localhost:8090/admin`
- 生产环境: `/api/admin/`
- 配置文件: `blog-cms/src/util/request.js`
- 认证方式: localStorage 存储 token，请求头携带 Authorization

### blog-view
- 开发环境: `http://localhost:8090/`
- 生产环境: `/api`
- 配置文件: `blog-view/src/plugins/axios.js`
- 认证方式: localStorage 存储 identification，请求头携带 identification

## 架构说明

### blog-view 结构
- 路由模式: history
- 主要页面: 首页、归档、博客详情、标签、分类、动态、友链、关于
- 路由守卫: 仅设置页面标题
- 代码分割: 按 npm 包名分割 vendor chunks (50KB-200KB)

### blog-cms 结构
- 路由模式: history
- 布局系统: 使用 Layout 组件包裹所有页面
- 路由守卫: 检查 localStorage 中的 token，未登录跳转 /login
- 主要功能模块:
  - 博客管理: 文章/动态的增删改查、分类/标签/评论管理
  - 页面管理: 站点设置、友链、关于页
  - 图床管理: GitHub/又拍云/腾讯云图床配置
  - 系统管理: 账户修改、定时任务
  - 日志管理: 任务/登录/操作/异常/访问日志
  - 数据统计: 访客统计
- SVG 图标: 使用 svg-sprite-loader 处理 `src/icons` 目录下的 SVG
- 演示模式: 非 admin 角色的用户只能执行 GET 请求

## 关键配置

### blog-cms 特殊配置
- 开发端口: 8079 (可通过环境变量修改)
- 默认展开菜单: blog, page, pictureHosting, system, log, statistics
- 生产环境关闭 source map

### 依赖说明
- UI 框架: Element UI 2.13.2
- Markdown 编辑器 (CMS): mavon-editor
- 图表库 (CMS): ECharts 4.9.0
- 图片查看器: v-viewer
- 日期处理: moment
- HTML 清理 (View): sanitize-html
- 目录生成 (View): tocbot
