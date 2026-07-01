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

export async function uploadToCloudinary(file, options = {}) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadOptions = {
      folder: options.folder || 'sekolahku',
      resource_type: options.resourceType || 'image',
    };

    if (options.resourceType === 'raw') {
      uploadOptions.public_id = `${Date.now()}-${file.name}`;
    } else {
      uploadOptions.allowed_formats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      uploadOptions.transformation = [{ width: 1200, crop: 'limit' }];
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.error('[Cloudinary upload error]', error);
          reject(new Error(`Cloudinary: ${error.message || 'Upload gagal'}`));
        } else {
          resolve(result);
        }
      }).end(buffer);
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

  // Di Vercel: lokal tidak mungkin — filesystem ephemeral
  if (isVercelEnvironment) {
    throw new Error(
      'Cloudinary tidak terkonfigurasi. Upload tidak tersedia di production. ' +
      'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di Vercel.'
    );
  }

  // Local fallback hanya untuk development
  console.warn('[upload] Cloudinary not configured, falling back to local storage (dev only)');
  return await uploadToLocal(file, options.subdir);
}

export { isCloudinaryConfigured, isVercelEnvironment };