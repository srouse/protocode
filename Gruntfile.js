










module.exports = function( grunt ) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

	var configObj = {
		pkg: '<json:package.json>'
	};

    configObj.concat =  {
		protocode: {
		    src: [
				"source/protocode.js",
                "source/Rainbow/js/rainbow.min.js",
                "source/Rainbow/js/language/html.js",
                "source/Rainbow/js/language/css.js"
			],
		    dest:"dist/protocode.js",
	        options: {
	            debug: false,
				nonull: true,
	        }
		},
		protocode_css: {
		    src: [
				"source/protocode.css",
                "source/Rainbow/themes/blackboard.css"
			],
		    dest:"dist/protocode.css",
	        options: {
	            debug: false,
				nonull: true,
	        }
		}
	}

	configObj.watch =  {
		protocode: {
			tasks: ['concat'],
		    files: [
				"source/**/*.js"
		    ],
	        options: {
	            debug: false
	        }
		}
	}

	grunt.initConfig( configObj );
  	grunt.registerTask( 'default',['concat']);

};
