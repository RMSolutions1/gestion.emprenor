import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, getBucketConfig } from "./aws-config";

const s3 = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic = false
) {
  const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
    ContentDisposition: isPublic ? "attachment" : undefined,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return { uploadUrl, cloud_storage_path };
}

export async function getFileUrl(cloud_storage_path: string, isPublic: boolean) {
  if (isPublic) {
    const region = process.env.AWS_REGION ?? "us-east-1";
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`;
  }
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ResponseContentDisposition: "attachment",
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function deleteFile(cloud_storage_path: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
  });
  await s3.send(command);
}

export async function initiateMultipartUpload(fileName: string, isPublic: boolean) {
  const prefix = isPublic ? `${folderPrefix}public/uploads` : `${folderPrefix}uploads`;
  const cloud_storage_path = `${prefix}/${Date.now()}-${fileName}`;
  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentDisposition: isPublic ? "attachment" : undefined,
  });
  const response = await s3.send(command);
  return { uploadId: response?.UploadId ?? "", cloud_storage_path };
}

export async function getPresignedUrlForPart(
  cloud_storage_path: string,
  uploadId: string,
  partNumber: number
) {
  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function completeMultipartUpload(
  cloud_storage_path: string,
  uploadId: string,
  parts: { ETag: string; PartNumber: number }[]
) {
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts },
  });
  await s3.send(command);
}
