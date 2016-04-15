/**
 * Created by g.kosharov on 25.2.2016 ã..
 */
var webpack = require('karma-webpack');

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine', 'jasmine-matchers', 'sinon'],
        files: [
            './node_modules/phantomjs-polyfill/bind-polyfill.js',
            './node_modules/jasmine-sinon/lib/jasmine-sinon.js',
            './tests/*Spec.js'
        ],
        plugins: [webpack, 'karma-jasmine', 'karma-sinon', 'karma-jasmine-matchers', 'karma-phantomjs-launcher', 'karma-chrome-launcher', 'karma-ie-launcher','karma-firefox-launcher','karma-coverage', 'karma-spec-reporter', 'karma-babel-preprocessor'],
        browsers: ['Chrome'],
        preprocessors: {
            '!(node_modules)/**/*.js': ['webpack']
        },
        reporters: ['spec', 'coverage'],
        coverageReporter: {
            dir: 'build/reports/coverage',
            reporters: [
                {type: 'html', subdir: 'report-html'},
                {type: 'lcov', subdir: 'report-lcov'},
                {type: 'cobertura', subdir: '.', file: 'cobertura.txt'}
            ]
        },
        webpack: {
            module: {
                loaders: [{
                    test: /\.(js|jsx)$/, exclude: /(bower_components|node_modules)/,
                    loader: 'babel'
                }]
            }
        },
        webpackMiddleware: {noInfo: true},
        externals: {
            'cheerio': 'window'
        }
    });
};