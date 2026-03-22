import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "@/config/api";
import { getProfileAction } from "@/redux/auth/auth.actions";
import { safeApiCall } from "@/shared/utils/network/safeApiCall";
import { getActiveJwt } from "@/shared/utils/authStorage";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

const EMPTY_FORM = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  occupation: "",
  location: "",
  bio: "",
  dateOfBirth: "",
  profileImage: "",
  coverImage: "",
};

export function useProfileForm() {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);
  const jwtFromStore = useSelector((state) => state.auth?.jwt);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFormData({
      id: user.id || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      mobile: user.mobile || "",
      occupation: user.occupation || "",
      location: user.location || "",
      bio: user.bio || "",
      dateOfBirth: user.dateOfBirth || "",
      profileImage: user.profileImage || "",
      coverImage: user.coverImage || "",
    });
  }, [user]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const token = jwtFromStore || getActiveJwt();
    if (!token) {
      setSaveError(t("session.expired"));
      setIsSaving(false);
      return { success: false };
    }

    const payload = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
    };

    const authHeaders = { Authorization: `Bearer ${token}` };
    const { error } = await safeApiCall(() =>
      api.put("/api/user", payload, { headers: authHeaders }),
    );

    if (error) {
      setSaveError(error.message || "Failed to update profile");
      setIsSaving(false);
      return { success: false };
    }

    await dispatch(getProfileAction());
    setIsEditMode(false);
    setSaveSuccess(true);
    setIsSaving(false);
    return { success: true };
  }, [formData, dispatch, jwtFromStore, t]);

  const handleCancel = useCallback(() => {
    if (!user) return;
    setFormData({
      id: user.id || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      mobile: user.mobile || "",
      occupation: user.occupation || "",
      location: user.location || "",
      bio: user.bio || "",
      dateOfBirth: user.dateOfBirth || "",
      profileImage: user.profileImage || "",
      coverImage: user.coverImage || "",
    });
    setIsEditMode(false);
    setSaveError(null);
  }, [user]);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setSaveError("Image must be smaller than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setSaveError("Please select a valid image file");
      return;
    }

    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      setImageUploading(false);
    };
    reader.onerror = () => {
      setSaveError("Failed to read image");
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  return {
    formData,
    isEditMode,
    isSaving,
    imageUploading,
    saveError,
    saveSuccess,
    setIsEditMode,
    handleInputChange,
    handleSave,
    handleCancel,
    handleImageUpload,
  };
}
