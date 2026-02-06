import { S3Client } from "@aws-sdk/client-s3";

export function getBucketConfig() {
  const bucketName = process.env.AWS_BUCKET_NAME ?? "";
  const folderPrefix = process.env.AWS_FOLDER_PREFIX ?? "";
  
  // Validação para facilitar debug
  if (!bucketName) {
    console.error('❌ AWS_BUCKET_NAME não configurado!');
  }
  
  return {
    bucketName,
    folderPrefix
  };
}

export function createS3Client() {
  const region = process.env.AWS_REGION || 'us-west-2';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  // Validação
  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ Credenciais AWS não configuradas!');
    throw new Error('AWS credentials not configured');
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}