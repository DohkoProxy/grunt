module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/styles/',
                        src: ['**/*', '!**/*.less'],        // tudo menos os .less
                        dest: 'dist/styles/'
                    },
                    {
                        expand: true,
                        cwd: 'src/',                         // caso tenha imagens na raiz ou outras pastas
                        src: ['images/**', 'fonts/**', 'js/**'],  // ajuste conforme sua estrutura
                        dest: 'dist/'
                    }
                ]
            }
        },

        // Garante o caminho correto do CSS dentro da pasta dist/
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'ENDERECO_DO_CSS',
                            replacement: './styles/main.min.css'   // ← agora está correto!
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['prebuild/index.html'],
                        dest: 'dist/'
                    }
                ]
            }
        },

        // COMPILA LESS
        less: {
            development: {
                files: {
                    'dev/styles/main.css': 'src/styles/main.less'
                }
            },
            production: {
                options: {
                    compress: true
                },
                files: {
                    'dist/styles/main.min.css': 'src/styles/main.less'
                }
            }
        },

        // WATCH (agora o less roda na primeira vez também)
        watch: {
            less: {
                files: ['src/styles/**/*.less'],
                tasks: ['less:development']
            },
            html: {
                files: ['src/index.html'],
                tasks: ['replace:dev']
            }
        },

        // REPLACE (substitui o placeholder no HTML)
        replace: {
            dev: {
                options: {
                    patterns: [
                        {
                            match: 'ENDERECO_DO_CSS',
                            replacement: './styles/main.css'
                        },
                        {
                            match: 'ENDERECO_DO_JS',
                            replacement: '../src/scripts/main.js'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,        // ← corrigido: flatten (não flattern)
                        src: ['src/index.html'],
                        dest: 'dev/'
                    }
                ]
            },
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'ENDERECO_DO_CSS',
                            replacement: './styles/main.min.css'   // ← caminho relativo correto dentro de dist/
                        },
                        {
                            match: 'ENDERECO_DO_JS',
                            replacement: './scripts/main.min.js'
                        }
                        // corrigido: era ENRERECO_DO_CSS → agora é ENDERECO_DO_CSS
                    ]
                },
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['prebuild/index.html'],
                        dest: 'dist/'
                    }
                ]
            }
        },

        // MINIFICA HTML antes do replace final
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'prebuild/index.html': 'src/index.html'
                }
            }
        },

        // Limpa pasta temporária
        clean: ['prebuild'],
        uglify: {
            target: {
                files: {
                    'dist/scripts/main.min.js':'src/scripts/main.js'
                }
            }
        }
    });

    // Carrega os plugins
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // TASKS
    // Desenvolvimento (roda tudo uma vez e fica no watch)
    grunt.registerTask('default', ['less:development', 'replace:dev', 'watch']);

    // Build para produção (roda tudo e termina)
    grunt.registerTask('build', [
        'less:production',   // gera dist/styles/main.min.css
        'copy:dist',         // ← copia fonts, imagens, etc.
        'htmlmin:dist',      // minifica o HTML → prebuild/index.html
        'replace:dist',      // troca o placeholder pelo CSS minificado
        'clean',
        'uglify'            
    ]);
};