/**
 * Custom Hook: useProfileForm
 * Manages profile form state and operations
 */

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadToCloudinary } from "../../utils/uploadToCloudniry";
import {
  updateProfileAction,
  getProfileAction,
} from "../../Redux/Auth/auth.action";

export const useProfileForm = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  // State management
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [coverImageUploading, setCoverImageUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    location: "",
    occupation: "",
    bio: "",
    dateOfBirth: "",
    profileImage: "",
    coverImage: "",
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        location: user.location || "",
        occupation: user.occupation || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth || "",
        profileImage: user.profileImage || "",
        coverImage: user.coverImage || "",
      });
    }
  }, [user]);

  // Load user profile on component mount
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt && !user) {
      dispatch(getProfileAction(jwt));
    }
  }, [dispatch, user]);

  // Handler functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateImage = (file, type = "profile") => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload a valid image file");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size should be less than 5MB");
    }

    return true;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImage(file, "profile");
      setImageUploading(true);
      const imageUrl = await uploadToCloudinary(file, "image");

      if (imageUrl) {
        setFormData((prev) => ({
          ...prev,
          profileImage: imageUrl,
        }));
        showNotification("Image uploaded successfully!", "success");
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showNotification(
        error.message || "Failed to upload image. Please try again.",
        "error"
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImage(file, "cover");
      setCoverImageUploading(true);
      const imageUrl = await uploadToCloudinary(file, "image");

      if (imageUrl) {
        setFormData((prev) => ({
          ...prev,
          coverImage: imageUrl,
        }));
        showNotification("Cover image uploaded successfully!", "success");
      } else {
        throw new Error("Cover image upload failed");
      }
    } catch (error) {
      console.error("Error uploading cover image:", error);
      showNotification(
        error.message || "Failed to upload cover image. Please try again.",
        "error"
      );
    } finally {
      setCoverImageUploading(false);
    }
  };

  const getChangedFields = () => {
    const updateRequest = {};
    const fieldsToCheck = [
      "firstName",
      "lastName",
      "mobile",
      "location",
      "occupation",
      "bio",
      "dateOfBirth",
      "profileImage",
      "coverImage",
    ];

    fieldsToCheck.forEach((field) => {
      if (formData[field] !== (user?.[field] || "")) {
        updateRequest[field] = formData[field];
      }
    });

    return updateRequest;
  };

  const handleSave = async () => {
    try {
      const updateRequest = getChangedFields();

      if (Object.keys(updateRequest).length === 0) {
        setIsEditMode(false);
        return;
      }

      setIsSaving(true);
      await dispatch(updateProfileAction(updateRequest));

      showNotification("Profile updated successfully!", "success");
      setIsEditMode(false);

      // Refresh profile data
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        dispatch(getProfileAction(jwt));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Failed to update profile. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        mobile: user.mobile || "",
        location: user.location || "",
        occupation: user.occupation || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth || "",
        profileImage: user.profileImage || "",
        coverImage: user.coverImage || "",
      });
    }
    setIsEditMode(false);
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  return {
    // State
    user,
    loading,
    error,
    formData,
    isEditMode,
    imageUploading,
    coverImageUploading,
    isSaving,
    snackbar,
    // Functions
    setFormData,
    setIsEditMode,
    handleInputChange,
    handleImageUpload,
    handleCoverImageUpload,
    handleSave,
    handleCancel,
    handleCloseSnackbar,
    getInitials,
  };
};
