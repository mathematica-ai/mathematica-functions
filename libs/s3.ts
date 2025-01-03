import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "@/config";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Generate a unique file key
export const generateUniqueFileKey = (originalFilename: string) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop();
  return `uploads/${timestamp}-${randomString}.${extension}`;
};

// Generate a presigned URL for file upload
export const generatePresignedUrl = async (fileKey: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: config.aws?.bucket,
    Key: fileKey,
    ContentType: contentType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return {
      uploadUrl: signedUrl,
      fileUrl: `${config.aws?.cdn || config.aws?.bucketUrl}${fileKey}`,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

// Get the public URL for a file
export const getFileUrl = (fileKey: string) => {
  return `${config.aws?.cdn || config.aws?.bucketUrl}${fileKey}`;
}; 