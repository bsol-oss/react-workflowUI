
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import external from 'rollup-plugin-peer-deps-external'
import babel from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss';

import packageJSON from './package.json'
const input = './src/export.js'
 
export default [
    {
        input,
        output: [
            {
                file: packageJSON.main,
                format: 'cjs',
                exports: 'auto'
            },
            {
                file: packageJSON.module,
                format: 'es',
                exports: 'auto'
            }
        ],

        plugins: [
            babel({
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
            }),
            external(),
            commonjs(),
            resolve(),
            postcss()
        ]
    }
]