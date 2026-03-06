import api from "./api";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

/**
 * Upload an image to Cloudinary using signed upload.
 * 1. Gets signature from backend
 * 2. Uploads directly to Cloudinary
 * 3. Returns { public_id, url, alt }
 *
 * @param {File} file - The image file
 * @param {string} type - 'product' | 'seller' | 'banner' | 'user'
 * @param {string} alt - Alt text for the image
 * @returns {Promise<{ public_id: string, url: string, alt: string }>}
 */
export const uploadImage = async (file, type = "product", alt = "") => {
  // 1. Get signature from backend
  const { data } = await api.get(`/cloudinary/sign?type=${type}`);
  const { timestamp, signature, folder, api_key } = data;

  // 2. Upload to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("api_key", api_key);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const result = await response.json();

  return {
    public_id: result.public_id,
    url: result.secure_url,
    alt: alt || file.name,
  };
};

/**
 * Upload multiple images to Cloudinary.
 * @param {File[]} files
 * @param {string} type
 * @returns {Promise<Array<{ public_id, url, alt }>>}
 */
export const uploadMultipleImages = async (files, type = "product") => {
  const uploads = Array.from(files).map((file) => uploadImage(file, type));
  return Promise.all(uploads);
};
