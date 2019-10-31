import { defaultDevServerHost, defaultDevServerOptions, defaultDevServerPort } from '../defaults';
import { IBuildConfig } from '../interface/ibuild-config';
import { getEnv } from './config-getters';
import { getDevelopmentConfig } from './get-development-config';
import { getProductionConfig } from './get-production-config';
import { log } from './log';

export const startSingle = async (config: IBuildConfig, resolve: Function, reject: Function): Promise<void> => {
    const webpackConfig = getEnv(config) === 'production' ? getProductionConfig(config) : getDevelopmentConfig(config);
    const compiler = require('webpack')(webpackConfig);

    if (getEnv(config) === 'development' && !config.serverMode) {
        log('Entering DevServer watch mode...');

        const devServer = new (require('webpack-dev-server'))(compiler, {
            ...defaultDevServerOptions,
            publicPath: webpackConfig!.output!.publicPath,
            port: config.port || defaultDevServerPort,
            proxy: config.proxy,
            public: config.public,
            disableHostCheck: config.proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
            contentBase: config.assetsPath || webpackConfig.context,
            stats: webpackConfig.stats,
        });

        devServer.listen(config.port || defaultDevServerPort, defaultDevServerHost, (err: any) => {
            if (err) {
                reject(err);
            }
        });
    } else {
        compiler.run((err: any, stats: any) => {
            if (err || stats.hasErrors()) {
                reject(err || stats.toJson('minimal'));
            } else {
                resolve();
            }
        });
    }
};
