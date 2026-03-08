import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export type R2Bucket = 'pubgmaptile'

export async function uploadFile(
  bucket: R2Bucket,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await r2Client.send(command)
  return `https://${process.env.NEXT_PUBLIC_R2_DOMAIN}/${key}`
}

export async function deleteFile(bucket: R2Bucket, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  await r2Client.send(command)
}

export async function getSignedUploadUrl(
  bucket: R2Bucket,
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(r2Client, command, { expiresIn })
}

export { r2Client }
