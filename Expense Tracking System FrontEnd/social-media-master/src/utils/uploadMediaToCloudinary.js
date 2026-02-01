/**
 * Upload media (image or video) to Cloudinary
 * Supports both images and videos up to 1 minute
 */

const cloud_name = "dtun8attk";
const upload_preset = "social-media";

// Max video duration in seconds (1 minute)
const MAX_VIDEO_DURATION_SECONDS = 60;
// Max file sizes
const MAX_IMAGE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 100;

/**
 * Get video duration using HTML5 video element
 * @param {File} file - The video file
 * @returns {Promise<number>} - Duration in seconds
 */
const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      reject(new Error("Failed to load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Validate media file
 * @param {File} file - The file to validate
 * @param {string} mediaType - 'image' or 'video'
 * @returns {Promise<{valid: boolean, error: string|null}>}
 */
export const validateMediaFile = async (file, mediaType) => {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (mediaType === "image") {
    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      return {
        valid: false,
        error: "Please upload a valid image file (JPEG, PNG, GIF, WebP)",
      };
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
      return {
        valid: false,
        error: `Image size should be less than ${MAX_IMAGE_SIZE_MB}MB`,
      };
    }
  } else if (mediaType === "video") {
    // Check if it's a video
    if (!file.type.startsWith("video/")) {
      return {
        valid: false,
        error: "Please upload a valid video file (MP4, WebM, MOV)",
      };
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
      return {
        valid: false,
        error: `Video size should be less than ${MAX_VIDEO_SIZE_MB}MB`,
      };
    }

    // Check video duration
    try {
      const duration = await getVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        return {
          valid: false,
          error: `Video duration should be less than ${MAX_VIDEO_DURATION_SECONDS} seconds (1 minute). Current duration: ${Math.round(duration)}s`,
        };
      }
    } catch (error) {
      console.error("Error checking video duration:", error);
      // Allow upload if we can't check duration (Cloudinary will reject if too long)
    }
  }

  return { valid: true, error: null };
};

/**
 * Upload media to Cloudinary
 * @param {File} file - The file to upload
 * @param {'image' | 'video'} mediaType - Type of media to upload
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<{url: string, publicId: string, duration?: number} | null>}
 */
export const uploadMediaToCloudinary = async (
  file,
  mediaType,
  onProgress = null,
) => {
  if (!file || !mediaType) {
    console.error("Missing file or mediaType");
    return null;
  }

  // Validate the file first
  const validation = await validateMediaFile(file, mediaType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", upload_preset);
  data.append("cloud_name", cloud_name);

  // For videos, add eager transformation to optimize
  if (mediaType === "video") {
    data.append("resource_type", "video");
  }

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${mediaType}/upload`;

    // Use XMLHttpRequest for progress tracking if callback provided
    if (onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100,
            );
            onProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url || response.url,
              publicId: response.public_id,
              duration: response.duration,
              width: response.width,
              height: response.height,
              format: response.format,
            });
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", uploadUrl);
        xhr.send(data);
      });
    }

    // Regular fetch for non-progress uploads
    const res = await fetch(uploadUrl, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error uploading media:", errorData);
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const fileData = await res.json();
    return {
      url: fileData.secure_url || fileData.url,
      publicId: fileData.public_id,
      duration: fileData.duration,
      width: fileData.width,
      height: fileData.height,
      format: fileData.format,
    };
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

/**
 * Determine media type from file
 * @param {File} file
 * @returns {'image' | 'video' | null}
 */
export const getMediaType = (file) => {
  if (!file || !file.type) return null;

  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";

  return null;
};

export default uploadMediaToCloudinary;
