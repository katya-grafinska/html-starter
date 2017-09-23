var gulp = require('gulp'),
	scss = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	plumber = require('gulp-plumber'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	notify = require('gulp-notify'),
	nunjucksRender = require('gulp-nunjucks-render'),
	sourcemaps = require('gulp-sourcemaps'),
	fs = require('fs');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'src'
		},
		notify: false
	});
});

gulp.task('scss', function() {
	return gulp.src('src/scss/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(scss().on("error", notify.onError()))
		.pipe(autoprefixer({
			browsers: ['> 1%', 'last 2 versions'],
			cascade: true
		}))
		// .pipe(combineMq({
		// 	beautify: true
		// }))
		// .pipe(cleanCSS({compatibility: 'ie11'}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('src/css'))
		.pipe(browserSync.reload({ stream: true }))
});

gulp.task('libs', function() {
	return gulp.src([,
			'src/libs/jquery.js',
			'src/libs/*.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('src/js'));
});

gulp.task('libs-css', function() {
	return gulp.src([
			'src/libs/*.css'
		])
		.pipe(concat('libs.min.css'))
		.pipe(cleanCSS({ compatibility: 'ie11' }))
		.pipe(gulp.dest('src/css'));
});

gulp.task('watch', ['scss', 'libs', 'nunjucks', 'browser-sync', 'libs-css'], function() {
	gulp.watch('src/scss/**/*.scss', ['scss']);
	gulp.watch('src/libs/**/*.js', ['libs']);
	gulp.watch('src/libs/**/*.css', ['libs-css']);
	gulp.watch(['src/pages/**/*.html', 'src/templates/**/*.html'], ['bsync:html']);
	gulp.watch(['src/js/**/*.js', 'src/libs/**/*.js']).on('change', browserSync.reload)
});

gulp.task('imagemin', function() {
	return gulp.src('src/images/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/images'));
});

function loadData(data_file) {
	var content = fs.readFileSync(data_file);
	return JSON.parse(content)
}

gulp.task('nunjucks', function() {
	return gulp.src('src/pages/**/*.html')
		.pipe(plumber())
		.pipe(nunjucksRender({
			data: loadData('src/templates/data/template_data.json'),
			path: ['src/templates/']
		}))
		.pipe(gulp.dest('src'));
});

gulp.task('bsync:html', ['nunjucks'], function() {
	browserSync.reload();
});

gulp.task('removedist', function() {
	return del.sync('dist');
});

gulp.task('build', ['removedist', 'nunjucks', 'imagemin', 'scss', 'libs', 'libs-css'], function() {

	var buildCss = gulp.src(['src/css/**/*.css'])
		.pipe(gulp.dest('dist/css'));

	var buildFiles = gulp.src([
		'src/*.html'
	]).pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('src/js/**/*').pipe(gulp.dest('dist/js'));

});

gulp.task('clearcache', function() {
	return cache.clearAll();
});

gulp.task('default', ['watch']);