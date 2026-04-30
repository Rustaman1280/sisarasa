export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary config is missing. Pastikan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ada di .env.local');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  // Jika parameter path memiliki folder (contoh: "meals/file.jpg")
  const lastSlash = path.lastIndexOf('/');
  if (lastSlash !== -1) {
    const folder = path.substring(0, lastSlash);
    formData.append('folder', `sisarasa/${folder}`);
  } else {
    formData.append('folder', 'sisarasa');
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Gagal mengunggah gambar ke Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}

export async function deleteImage(path: string): Promise<void> {
  console.warn('Penghapusan file via client-side tidak didukung secara default pada Unsigned Upload Cloudinary.');
}

export function generateImagePath(folder: string, fileName: string): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  return `${folder}/${timestamp}_${sanitized}`;
}
