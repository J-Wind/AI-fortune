import { sql } from 'drizzle-orm';
import { customType } from 'drizzle-orm/pg-core';

export type UserProfile = {
  user_id: string;
};

export const userProfile = customType<{
  data: UserProfile;
  driverData: unknown;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: UserProfile) {
    return sql`ROW(${value.user_id})::user_profile`;
  },
  fromDriver(value: unknown): UserProfile {
    if (typeof value !== 'string') {
      throw new Error('Invalid user profile value');
    }
    const [userId] = value.slice(1, -1).split(',');
    return { user_id: userId.trim() };
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: unknown;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: unknown): FileAttachment {
    if (typeof value !== 'string') {
      throw new Error('Invalid file attachment value');
    }
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});
