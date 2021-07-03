let fileswatch = 'html,htm,txt,json,md,woff2'  //Файлы, при изменениях которых будет происходить жесткая перезагрузка страницы в браузере
const prjFolder = require("path").basename(__dirname); 		// Дирректория с готовой версткой
const srcFolder = "app";																	// Рабочая дирректория
const path = {
	build: {
		html: `${prjFolder}/`,
		css: `${prjFolder}/css/`,
		js: `${prjFolder}/js/`,
		img: `${prjFolder}/images/`,
		fonts: `${prjFolder}/fonts/`,
		resources: `${prjFolder}/resources/`,
	},
	src: {
		html: `${srcFolder}/*.html`,
		css: `${srcFolder}/styles/main.scss`,
		js: `${srcFolder}/js/*.js`,
		svg: `${srcFolder}/images/icons/**/*.svg`,
		img: `${srcFolder}/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}`,
		fonts: `${srcFolder}/fonts/*.ttf`,
		resources: `${srcFolder}/resources/**/**`,
	},
	watch: {
		html: `${srcFolder}/**/*.html`,
		css: `${srcFolder}/styles/**/*.scss`,
		js: `${srcFolder}/js/**/*.js`,
		svg: `${srcFolder}/images/icons/**/*.svg`,
		img: `${srcFolder}/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}`,
		resources: `${srcFolder}/resources/**/**`,
	},
	clean: [`./${prjFolder}/`, `!${prjFolder}/images/ || !${prjFolder}/resouces/`]
}

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const bssi = require('browsersync-ssi');
const ssi = require('ssi');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const webpack = require('webpack-stream');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const ttf2woff2 = require('gulp-ttf2woff2');



// Browser-Sync
const server = () => {
	browserSync.init({
		server: {
			baseDir: `./${prjFolder}/`,
			middleware: bssi({ baseDir: `./${prjFolder}/`, ext: '.html' })
		},
		notify: false,
		online: true,
		//tunnel: 'rusichsitename', 	/*  Использовать URL https://rusichsitename.loca.lt  */
		browser: "chrome",
	});
};
exports.server = server;

// HTML
async function html() {
	let includes = new ssi(`./${srcFolder}/`, `./${prjFolder}/`, `/**/*.html`)
	includes.compile()
	del(`${path.build.html}/html`, { force: true })
};

// Styles
const scss = () => {
	return src(path.src.css)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
		.pipe(cleanCSS({ level: { 1: { specialComments: 1 } },/* format: 'beautify' */ }))
		.pipe(rename({ suffix: ".min" }))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(path.build.css))
		.pipe(browserSync.stream())
};
exports.scss = scss;

//Scripts
function js() {
	return src(path.src.js)
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('main.min.js'))
		.pipe(dest(path.build.js))
		.pipe(browserSync.stream())
}
exports.js = js;

//Images
const images = () => {
	return src(path.src.img)
		.pipe(changed(path.build.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3, 													// 0 to 7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browserSync.stream());
};
exports.images = images;

// Fonts
const fonts = () => {
	src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
};
exports.fonts = fonts;

//Resources
const resources = () => {
	return src(path.src.resources)
		.pipe(changed(path.build.resources))
		.pipe(dest(path.build.resources))
		.pipe(browserSync.stream());
};
exports.resources = resources;

// Clean
const clean = () => {
	return del(path.clean, { force: true })
};
exports.clean = clean;

// Watch
const watchFils = () => {
	watch([path.watch.html], { usePolling: true }, html);
	watch([path.watch.css], { usePolling: true }, scss);
	watch([path.watch.js], { usePolling: true }, js);
	watch([path.watch.img], { usePolling: true }, images);
	watch([path.watch.resources], { usePolling: true }, resources);
	watch(`${prjFolder}/**/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload);
};
exports.watchFils = watchFils;

const build = series(clean, parallel(html, scss, js, resources, images, fonts));
const Watch = parallel(build, watchFils, server);

exports.build = build;
exports.Watch = Watch;
exports.default = Watch;
