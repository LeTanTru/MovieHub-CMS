import { NextRequest, NextResponse } from 'next/server';
import { uploadVideo } from '@/lib/minio';
import { randomBytes } from 'crypto';
import { logger } from '@/logger';

export const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3GB

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function generateRandomFileName(length = 10): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Không có file' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File quá lớn. Kích thước tối đa là 3GB' },
        { status: 413 }
      );
    }

    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported format' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const randomFileName = generateRandomFileName(10);
    const objectName = await uploadVideo(buffer, randomFileName, file.type);

    return NextResponse.json({ data: { filePath: objectName } });
  } catch (error) {
    logger.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
