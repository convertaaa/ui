module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            default : {
                src: ["src/**/*.ts", "src/*.ts"],
                tsconfig: './tsconfig.json',
                options: {
                    fast: 'never',
                    baseDir: false
                }
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'src/', src: ['assets/**.**'], dest: 'dist/'},
                    {expand: true, cwd: 'src/', src: ['index.html'], dest: 'dist/'}
                ]
            }
        },
        sass: {
            options: {
                sourceMap: false,
                implementation: require('sass')
            },
            dist: {
                files: {
                    'dist/styles.css': 'src/styles/*.scss'
                }
            }
        },
        exec: {
            run_electron: {
                command: 'electron .'
            }
        },
        clean: {
            build: ['dist/']
        },
    });

    grunt.registerTask('build', 'Builds the application', () => {
        grunt.task.run('clean');
        grunt.task.run('ts');
        grunt.task.run('copy');
        grunt.task.run('sass');
    });

    grunt.registerTask('run', 'Runs the application', () => {
        grunt.task.run('build');
        grunt.task.run('exec:run_electron');
    });

    grunt.registerTask('package', 'Builds the executable for the application', () => {
        grunt.task.run('build');
    });

    grunt.registerTask('default', ['run']);
}