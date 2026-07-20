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

    const timeout = setTimeout(() => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error("Video metadata loading timeout"));
    }, 10000); // 10 second timeout

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      clearTimeout(timeout);
      window.URL.revokeObjectURL(video.src);
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

    // Check video duration - we'll trim if longer than 60 seconds
    try {
      const duration = await getVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        console.log(
          `Video is ${Math.round(duration)}s, will be trimmed to ${MAX_VIDEO_DURATION_SECONDS}s`,
        );
        // Return valid but with flag indicating trimming needed
        return {
          valid: true,
          error: null,
          needsTrimming: true,
          originalDuration: duration,
        };
      }
    } catch (error) {
      console.error("Error checking video duration:", error);
      // Allow upload if we can't check duration
    }
  }

  return { valid: true, error: null, needsTrimming: false };
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

  console.log(`Starting ${mediaType} upload:`, file.name, file.type, file.size);

  // Validate the file first
  const validation = await validateMediaFile(file, mediaType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", upload_preset);

  // Note: For unsigned uploads, we cannot use eager transformations
  // We'll apply the trim transformation via URL after upload if needed
  const needsTrimming = mediaType === "video" && validation.needsTrimming;
  if (needsTrimming) {
    console.log(
      `Video is ${Math.round(validation.originalDuration)}s, will apply URL transformation to trim to ${MAX_VIDEO_DURATION_SECONDS}s`,
    );
  }

  try {
    // Cloudinary URL format: /v1_1/{cloud_name}/{resource_type}/upload
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${mediaType}/upload`;
    console.log(
      "Uploading to:",
      uploadUrl,
      validation.needsTrimming ? "(with trimming)" : "",
    );

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
          console.log("XHR load event, status:", xhr.status);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("Upload successful:", response.secure_url);

              let finalUrl = response.secure_url || response.url;
              let finalDuration = response.duration;
              let wasTrimmed = false;

              // For videos that need trimming, apply URL-based transformation
              if (needsTrimming && finalUrl) {
                // Insert transformation into Cloudinary URL
                // URL format: https://res.cloudinary.com/{cloud}/video/upload/{transformations}/{public_id}.{format}
                finalUrl = finalUrl.replace(
                  "/upload/",
                  `/upload/du_${MAX_VIDEO_DURATION_SECONDS}/`,
                );
                finalDuration = Math.min(
                  response.duration || MAX_VIDEO_DURATION_SECONDS,
                  MAX_VIDEO_DURATION_SECONDS,
                );
                wasTrimmed = true;
                console.log(
                  "Applied URL trim transformation:",
                  finalUrl,
                  "Duration capped at:",
                  finalDuration,
                );
              }

              resolve({
                url: finalUrl,
                publicId: response.public_id,
                duration: finalDuration,
                width: response.width,
                height: response.height,
                format: response.format,
                trimmed: wasTrimmed,
              });
            } catch (parseError) {
              console.error("Failed to parse response:", xhr.responseText);
              reject(new Error("Failed to parse upload response"));
            }
          } else {
            console.error(
              "Upload failed, status:",
              xhr.status,
              xhr.responseText,
            );
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(
                new Error(
                  errorResponse.error?.message ||
                    `Upload failed with status ${xhr.status}`,
                ),
              );
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", (e) => {
          console.error("XHR error event:", e);
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("timeout", () => {
          console.error("XHR timeout");
          reject(new Error("Upload timed out"));
        });

        xhr.timeout = 300000; // 5 minutes timeout for large videos
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

    let finalUrl = fileData.secure_url || fileData.url;
    let finalDuration = fileData.duration;
    let wasTrimmed = false;

    // For videos that need trimming, apply URL-based transformation
    if (needsTrimming && finalUrl) {
      // Insert transformation into Cloudinary URL
      finalUrl = finalUrl.replace(
        "/upload/",
        `/upload/du_${MAX_VIDEO_DURATION_SECONDS}/`,
      );
      finalDuration = Math.min(
        fileData.duration || MAX_VIDEO_DURATION_SECONDS,
        MAX_VIDEO_DURATION_SECONDS,
      );
      wasTrimmed = true;
      console.log(
        "Applied URL trim transformation:",
        finalUrl,
        "Duration capped at:",
        finalDuration,
      );
    }

    return {
      url: finalUrl,
      publicId: fileData.public_id,
      duration: finalDuration,
      width: fileData.width,
      height: fileData.height,
      format: fileData.format,
      trimmed: wasTrimmed,
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
