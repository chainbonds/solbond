const path = require('path');
const webpack = require('webpack');

// Using storybook compatible with tailwind
// https://theodorusclarence.com/blog/nextjs-storybook-tailwind

module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    /** Expose public folder to storybook as static */
    staticDirs: ['../public'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        {
            /**
             * Fix Storybook issue with PostCSS@8
             * @see https://github.com/storybookjs/storybook/issues/12668#issuecomment-773958085
             */
            name: '@storybook/addon-postcss',
            options: {
                postcssLoaderOptions: {
                    implementation: require('postcss'),
                },
            },
        },
    ],
    core: {
        builder: 'webpack5',
    },
    webpackFinal: (config) => {
        /**
         * Add support for alias-imports
         * @see https://github.com/storybookjs/storybook/issues/11989#issuecomment-715524391
         */
        config.resolve.alias = {
            ...config.resolve?.alias,
            '@': [path.resolve(__dirname, '../src/'), path.resolve(__dirname, '../')],
        };

        /**
         * Fixes font import with /
         * @see https://github.com/storybookjs/storybook/issues/12844#issuecomment-867544160
         */
        config.resolve.roots = [
            path.resolve(__dirname, '../public'),
            'node_modules',
        ];

        config.resolve.modules = [path.resolve("./src"), ...config.resolve.modules],
            config.resolve.fallback = {
                timers: false,
                tty: false,
                os: false,
                http: false,
                https: false,
                zlib: false,
                util: false,
                fs: false,
                "buffer": require.resolve("buffer"),
                "bigint-buffer": false,
                browser: false,
                process: false,
                ...config.resolve.fallback,
            };

        // config.resolve.plugins = [
        //     // Work around for Buffer is undefined:
        //     // https://github.com/webpack/changelog-v5/issues/10
        //     new webpack.ProvidePlugin({
        //         Buffer: ['buffer', 'Buffer'],
        //     }),
        //     // new webpack.ProvidePlugin({
        //     //     process: 'process/browser',
        //     // }),
        // ]

        config.plugins.push(
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            })
        );

        // config.resolve.plugins = [
        //     // Work around for Buffer is undefined:
        //     // https://github.com/webpack/changelog-v5/issues/10
        //     new webpack.ProvidePlugin({
        //         Buffer: ['buffer', 'Buffer'],
        //     }),
        //     // new webpack.ProvidePlugin({
        //     //     process: 'process/browser',
        //     // }),
        // ];

        return config;
    },
    typescript: {
        check: false,
        checkOptions: {},
        reactDocgen: false,
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
        },
    },
};