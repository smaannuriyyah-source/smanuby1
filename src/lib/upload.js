import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const isVercelEnvironment = process.env.VERCEL === '1';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[upload] Cloudinary configured for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.warn('[upload] Cloudinary NOT configured, will use local file storage');
}

function sanitizePublicId(name) {
  if (!name) return 'file';
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf',
    doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain', zip: 'application/zip',
  };
  return map[ext] || 'application/octet-stream';
}

export async function uploadToCloudinary(file, options = {}) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = file.name || 'unnamed';
    const safeName = sanitizePublicId(originalName);
    const mimeType = getMimeType(originalName);

    // Convert buffer to base64 data URI — more reliable than upload_stream on Vercel
    const base64String = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64String}`;

    const uploadOptions = {
      resource_type: options.resourceType || 'image',
    };

    if (options.resourceType === 'raw') {
      uploadOptions.folder = options.folder || 'sekolahku/files';
      uploadOptions.public_id = `${Date.now()}-${safeName}`;
    } else {
      uploadOptions.folder = options.folder || 'sekolahku';
      uploadOptions.allowed_formats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      uploadOptions.transformation = [{ width: 1200, crop: 'limit' }];
    }

    console.log('[Cloudinary] Uploading via base64:', {
      name: originalName,
      resource_type: uploadOptions.resource_type,
      folder: uploadOptions.folder,
      public_id: uploadOptions.public_id,
      size: file.size,
    });

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataUri, uploadOptions, (error, result) => {
        if (error) {
          console.error('[Cloudinary upload error]', JSON.stringify(error, null, 2));
          reject(new Error(`Cloudinary error: ${error.message || JSON.stringify(error)}`));
        } else {
          console.log('[Cloudinary] Upload success:', result.public_id);
          resolve(result);
        }
      });
    });
  } catch (err) {
    console.error('[uploadToCloudinary error]', err);
    throw new Error(`Gagal upload ke Cloudinary: ${err.message}`);
  }
}

export async function uploadToLocal(file, subdir = '') {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = file.name.split('.').pop();
  const filename = uniqueSuffix + '.' + ext;

  const fs = await import('fs');
  const path = await import('path');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subdir);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);

  const urlPath = subdir ? `/uploads/${subdir}/${filename}` : `/uploads/${filename}`;
  return {
    url: urlPath,
    filename,
    originalName: file.name,
    size: file.size,
  };
}

export async function handleUpload(file, options = {}) {
  if (isCloudinaryConfigured) {
    const result = await uploadToCloudinary(file, options);
    return {
      url: result.secure_url,
      filename: result.public_id,
      originalName: file.name,
      size: file.size,
    };
  }

  if (isVercelEnvironment) {
    throw new Error(
      'Cloudinary tidak terkonfigurasi. Upload tidak tersedia di production. ' +
      'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di Vercel.'
    );
  }

  console.warn('[upload] Cloudinary not configured, falling back to local storage (dev only)');
  return await uploadToLocal(file, options.subdir);
}

export { isCloudinaryConfigured, isVercelEnvironment };
