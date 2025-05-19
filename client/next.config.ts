import type { NextConfig } from 'next';
import webpack from 'webpack';
import withTM from 'next-transpile-modules';

// 👇 Add the esm package that needs transpilation
const withTranspile = withTM(['janus-gateway']);

const nextConfig: NextConfig = {
  webpack(config) {
    // 1) Export the UMD Janus global from the npm package
    config.module?.rules?.push({
      test: require.resolve('janus-gateway'),
      use: {
        loader: 'exports-loader',
        options: { exports: 'Janus' },
      },
    });

    // 2) Provide the WebRTC adapter globally (Janus.js expects `adapter` on the window)
    config.plugins?.push(
      new webpack.ProvidePlugin({
        adapter: ['webrtc-adapter', 'default'],
      })
    );

    return config;
  },
};

export default withTranspile(nextConfig);
