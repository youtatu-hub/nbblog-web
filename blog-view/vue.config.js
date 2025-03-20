module.exports = {
	configureWebpack: {
		resolve: {
			alias: {
				'assets': '@/assets',
				'common': '@/common',
				'components': '@/components',
				'api': '@/api',
				'views': '@/views',
				'plugins': '@/plugins'
			}
		},
		optimization: {
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name(module) {
							// Get the package name
							const packageName = module.context.match(
								/[\\/]node_modules[\\/](.*?)([\\/]|$)/
							)[1];
							return `npm.${packageName.replace('@', '')}`;
						},
						chunks: 'all',
						enforce: true,
						priority: 10,
						minSize: 50000, // 50KB
						maxSize: 200000, // 200KB
						reuseExistingChunk: true,
					},
				},
			},
		},
	},
};
