const project_folder = require("path").basename(__dirname);
const source_folder = "src";

const path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/images/",
		fonts: project_folder + "/fonts/",
		resources: project_folder + "/resources/",
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/main.js",
		svg: source_folder + "/images/icons/**/*.svg",
		img: [source_folder + "/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", "!" + source_folder + "/images/icons/**/*.svg"],
		fonts: source_folder + "/fonts/*.ttf",
		resources: source_folder + "/resources/**/**",
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		svg: source_folder + "/images/icons/**/*.svg",
		img: source_folder + "/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
		resources: source_folder + "/resources/**/**",
	},
	clean: "./" + project_folder + "/",
};
const { src, dest } = require("gulp");
const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const del = require("del");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const shorthand = require("gulp-shorthand");
const autoprefixer = require("gulp-autoprefixer");
const group_media = require("gulp-group-css-media-queries");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const svgSprite = require("gulp-svg-sprite");
const fonter = require("gulp-fonter");

// Browser-Sync
const server = () => {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/",
		},
		notify: false,
		online: true,
		ui: false,
		browser: "chrome",
	});
};
exports.server = server;

// Resources
const resources = () => {
	return src(path.src.resources)
		.pipe(dest(path.build.resources))
		.pipe(browsersync.stream());
};
exports.resources = resources;

// HTML
const html = () => {
	return src(path.src.html)
		.pipe(fileinclude({
			prefix: '@',
			basepath: '@file'
		}))
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
};
exports.html = html;

// Styles
const scss = () => {
	return src(path.src.css)
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: "expanded",
		}))
		.pipe(group_media())
		.pipe(shorthand())
		.pipe(autoprefixer({
			overrideBrowserslist: ["last 5 versions"],
			cascade: false,
			grid: true,
		}))
		.pipe(dest(path.build.css))
		.pipe(clean_css({
			level: 2
		}))
		.pipe(rename({
			extname: ".min.css",
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
};
exports.scss = scss;

// Scripts
const js = () => {
	return src(path.src.js)
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(
			babel({
				presets: ["@babel/preset-env"],
			})
		)
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(
			rename({
				extname: ".min.js",
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
};
exports.js = js;

// Images
const images = () => {
	return src(path.src.img)
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3, // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream());
};
exports.images = images;

const svgSprites = () => {
	return src(path.src.svg)
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../sprite.svg", //sprite file name
					example: true,
				},
			},
		}))
		.pipe(dest(path.build.img));
}
exports.svgSprites = svgSprites;

// Fonts
const fonts = () => {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
};
exports.fonts = fonts;

const otf2ttf = () => {
	return src([source_folder + "/fonts/*.otf"])
		.pipe(
			fonter({
				formats: ["ttf"],
			})
		)
		.pipe(dest(source_folder + "/fonts/"));
};
exports.otf2ttf = otf2ttf;

const fs = require("fs");
const fontStyle = () => {
	let file_content = fs.readFileSync(source_folder + "/scss/fonts.scss");
	if (file_content == "") {
		fs.writeFile(source_folder + "/scss/fonts.scss", "", cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (let i = 0; i < items.length; i++) {
					let fontname = items[i].split(".");
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(
							source_folder + "/scss/fonts.scss",
							'@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n',
							cb
						);
					}
					c_fontname = fontname;
				}
			}
		});
	}
};
const cb = () => { }
exports.fontStyle = fontStyle;

// Clean
const clean = () => {
	return del(path.clean);
};

// Watch
const watchFils = () => {
	gulp.watch([path.watch.html], { usePolling: true }, html);
	gulp.watch([path.watch.css], { usePolling: true }, scss);
	gulp.watch([path.watch.js], { usePolling: true }, js);
	gulp.watch([path.watch.svg], { usePolling: true }, svgSprites);
	gulp.watch([path.watch.img], { usePolling: true }, images);
	gulp.watch([path.watch.resources], { usePolling: true }, resources);
};

const build = gulp.series(clean, gulp.parallel(js, scss, html, svgSprites, images, fonts, resources), fontStyle);
const watch = gulp.parallel(build, watchFils, server);

exports.build = build;
exports.watch = watch;
exports.default = watch;
