const resolve = require("rollup-plugin-node-resolve");
const string = require("rollup-plugin-string");
const babel = require("rollup-plugin-babel");

module.exports = function(grunt) {

	return {

		options: {
			plugins() {

				return [
					resolve({
						jsnext: true
					}),
					string({
						include: [
							"**/*.frag",
							"**/*.vert",
							"**/*.tmp"
						]
					})
				].concat(grunt.option("production") ? [babel()] : []);

			}
		},

		worker: {
			options: {
				format: "iife"
			},
			src: "src/worker/worker.js",
			dest: "src/worker/worker.tmp"
		},

		lib: {
			options: {
				globals: {
					"three": "THREE"
				},
				external: [
					"three"
				],
				format: "umd",
				moduleName: "<%= package.name.replace(/-/g, \"\").toUpperCase() %>",
				banner: "<%= banner %>"
			},
			src: "<%= package.module %>",
			dest: "build/<%= package.name %>.js"
		},

		editor: {
			options: {
				globals: {
					"dat.gui": "dat",
					"stats.js": "Stats",
					"three": "THREE"
				},
				external: [
					"dat.gui",
					"stats.js",
					"three"
				],
				format: "iife"
			},
			src: "editor/src/index.js",
			dest: "public/editor/index.js"
		},

		demo: {
			options: {
				globals: {
					"dat.gui": "dat",
					"stats.js": "Stats",
					"three": "THREE"
				},
				external: [
					"dat.gui",
					"stats.js",
					"three"
				],
				format: "iife"
			},
			src: "demo/src/index.js",
			dest: "public/demo/index.js"
		}

	};

};
