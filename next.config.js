const path = require('path')

/**
 * @aws-sdk/client-s3 打包时若命中 Node 版 runtimeConfig，
 * 会引入 @aws-sdk/credential-provider-node -> @smithy/node-config-provider
 * -> @smithy/shared-ini-file-loader -> node:fs/promises。
 *
 * 在 Cloudflare Workers (nodejs_compat) 环境下读取 ~/.aws/config 会抛出
 * "[unenv] fs.readFile is not implemented yet!"，导致上传接口 500。
 *
 * 这里把 runtimeConfig 替换为同目录的浏览器版本（fetch + WebCrypto），
 * Workers 与 Node 本地开发均可正常工作，且不会混用 CJS/ESM 产物。
 */
function replaceAwsRuntimeConfig(config) {
  const webpack = require('next/dist/compiled/webpack/webpack')
  webpack.init()

  config.plugins.push(
    new webpack.webpack.NormalModuleReplacementPlugin(
      /[\\/]@aws-sdk[\\/]client-s3[\\/]dist-(cjs|es)[\\/]runtimeConfig\.js$/,
      (resource) => {
        const data = resource.createData || resource
        if (data.resource) {
          data.resource = data.resource.replace(
            /runtimeConfig\.js$/,
            'runtimeConfig.browser.js'
          )
        }
      }
    )
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')

    if (isServer) {
      replaceAwsRuntimeConfig(config)
    }

    return config
  },
  transpilePackages: ['@aws-sdk/client-s3'],
}

module.exports = nextConfig
