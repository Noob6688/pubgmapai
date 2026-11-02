/**
 * 验证 AWS SDK v3 在模拟 Cloudflare Workers (unenv) 环境下能否正常上传 R2。
 *
 * unenv 中 node:fs/promises 的 readFile 是 notImplemented，调用即抛出
 * "[unenv] fs.readFile is not implemented yet!"。
 *
 * 用法：node scripts/verify-r2-upload.cjs
 * 退出码：0=成功  2=触发 fs.readFile（未修复）  3=其他错误
 */
const fs = require('fs')
const path = require('path')
const Module = require('module')

// ---- 1. 模拟 unenv：node:fs/promises 的 readFile 调用即抛错 ----
const unenvMessage = '[unenv] fs.readFile is not implemented yet!'
const realFsPromises = require('fs/promises')
const stubbedFsPromises = {
  ...realFsPromises,
  readFile: () => {
    throw new Error(unenvMessage)
  },
  readFileSync: () => {
    throw new Error(unenvMessage)
  },
}
const origLoad = Module._load
Module._load = function (request) {
  if (request === 'node:fs/promises' || request === 'fs/promises') {
    return stubbedFsPromises
  }
  return origLoad.apply(this, arguments)
}

// ---- 2. 模拟 webpack NormalModuleReplacementPlugin：runtimeConfig -> browser 版 ----
const browserRuntimeConfigPath = require.resolve(
  '@aws-sdk/client-s3/dist-cjs/runtimeConfig.browser'
)
const origResolve = Module._resolveFilename
Module._resolveFilename = function (request, parent) {
  if (
    typeof request === 'string' &&
    /^\.\/runtimeConfig$/.test(request) &&
    parent &&
    /@aws-sdk[\\/]client-s3[\\/]dist-(cjs|es)[\\/]/.test(parent.filename)
  ) {
    return browserRuntimeConfigPath
  }
  return origResolve.apply(this, arguments)
}

// ---- 3. 加载环境变量 ----
const envPath = path.resolve('.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

// ---- 4. 使用与 src/lib/r2.ts 相同的配置上传 ----
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

;(async () => {
  const key = `test-verify/${Date.now()}.txt`
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: 'pubgmaptile',
        Key: key,
        Body: Buffer.from('hello from verification'),
        ContentType: 'text/plain',
      })
    )
    console.log('UPLOAD_OK key=' + key)
  } catch (err) {
    if (String(err.message).includes('fs.readFile is not implemented')) {
      console.log('FAIL_UNENV_READFILE: ' + err.message)
      process.exit(2)
    }
    console.log('OTHER_ERROR: ' + err.name + ': ' + err.message)
    process.exit(3)
  }
})()
