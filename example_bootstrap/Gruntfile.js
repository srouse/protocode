






module.exports = function( grunt ) {

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');

	var configObj = {
		pkg: '<json:package.json>'
	};


	configObj.less =  {
		myapp: {
			nonull: true,
		    src: [
				"myapp/_global/global.less",
		    ],
		    dest: 'myapp/_final/myapp.css',
		}
	}

	configObj.watch =  {
		myapp: {
			tasks: ['less'],
		    files: [
				"myapp/**/*.less"
		    ],
	        options: {
	            debug: false
	        }
		}
	}

	grunt.initConfig( configObj );
  	grunt.registerTask( 'default',['less']);

};
