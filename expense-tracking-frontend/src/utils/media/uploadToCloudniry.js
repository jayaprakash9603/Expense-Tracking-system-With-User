const cloud_name = "dtun8attk";
const upload_preset = "social-media";

export const uploadToCloudinary = async (pics, fileType) => {
  if (pics && fileType) {
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", upload_preset);
    data.append("cloud_name", cloud_name);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/${fileType}/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        // Handle unsuccessful responses (e.g., 400 or 500 errors)
        const errorData = await res.json();
        console.error("Error uploading image:", errorData);
        return;
      }

      const fileData = await res.json();
      console.log("res----", fileData.url);
      return fileData.url;
    } catch (error) {
      console.error("Request failed:", error);
    }
  } else {
    console.log("error: missing pics or fileType");
  }
};
