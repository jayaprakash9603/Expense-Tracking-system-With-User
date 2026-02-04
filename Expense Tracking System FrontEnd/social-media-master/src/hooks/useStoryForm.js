/**
 * useStoryForm Hook
 * Shared form logic for Create and Edit Story pages
 */
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../config/api";
import {
  uploadMediaToCloudinary,
  validateMediaFile,
  getMediaType,
} from "../utils/uploadMediaToCloudinary";

// Story types and options - exported for use in components
export const STORY_TYPES = [
  { value: "BUDGET_THRESHOLD_80", label: "Budget 80% Alert" },
  { value: "BUDGET_THRESHOLD_90", label: "Budget 90% Alert" },
  { value: "BUDGET_THRESHOLD_100", label: "Budget Exceeded" },
  { value: "BILL_REMINDER", label: "Bill Reminder" },
  { value: "BILL_OVERDUE", label: "Bill Overdue" },
  { value: "EXPENSE_SPIKE", label: "Expense Spike" },
  { value: "WEEKLY_SUMMARY", label: "Weekly Summary" },
  { value: "MONTHLY_SUMMARY", label: "Monthly Summary" },
  { value: "ACHIEVEMENT", label: "Achievement" },
  { value: "SAVINGS_GOAL", label: "Savings Goal" },
  { value: "TIP", label: "Financial Tip" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "SYSTEM_UPDATE", label: "System Update" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "CUSTOM", label: "Custom" },
];

export const SEVERITY_OPTIONS = [
  { value: "INFO", label: "Info", color: "#2196f3" },
  { value: "SUCCESS", label: "Success", color: "#4caf50" },
  { value: "WARNING", label: "Warning", color: "#ff9800" },
  { value: "CRITICAL", label: "Critical", color: "#f44336" },
];

export const CTA_TYPES = [
  { value: "VIEW_REPORT", label: "View Report" },
  { value: "GO_TO_BUDGET", label: "Go to Budget" },
  { value: "VIEW_EXPENSE", label: "View Expense" },
  { value: "VIEW_BILL", label: "View Bill" },
  { value: "VIEW_CATEGORY", label: "View Category" },
  { value: "MANAGE_BUDGETS", label: "Manage Budgets" },
  { value: "ADD_EXPENSE", label: "Add Expense" },
  { value: "PAY_BILL", label: "Pay Bill" },
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "DISMISS", label: "Dismiss" },
  { value: "CUSTOM", label: "Custom" },
];

// Default form data
export const getDefaultFormData = () => ({
  title: "",
  content: "",
  storyType: "ANNOUNCEMENT",
  severity: "INFO",
  imageUrl: "",
  videoUrl: "",
  backgroundColor: "#1a1a2e",
  backgroundGradient: "",
  durationSeconds: 5,
  expirationHours: 24,
  priority: 0,
  isGlobal: true,
  targetUserId: "",
  autoActivate: true,
  ctaButtons: [],
});

/**
 * Custom hook for story form logic
 * @param {Object} initialData - Initial form data (for edit mode)
 * @param {boolean} isEditMode - Whether in edit mode
 * @param {string} storyId - Story ID (for edit mode)
 */
export const useStoryForm = (
  initialData = null,
  isEditMode = false,
  storyId = null,
) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState(initialData || getDefaultFormData());

  // Upload state
  const [mediaType, setMediaType] = useState(
    initialData?.videoUrl ? "video" : initialData?.imageUrl ? "image" : null,
  );
  const [mediaPreview, setMediaPreview] = useState(
    initialData?.videoUrl || initialData?.imageUrl || null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Determine media type
      const type = getMediaType(file);
      if (!type) {
        showSnackbar("Please select a valid image or video file", "error");
        return;
      }

      // Validate file
      const validation = await validateMediaFile(file, type);
      if (!validation.valid) {
        showSnackbar(validation.error, "error");
        return;
      }

      setMediaType(type);
      setUploadError(null);

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);

      // Upload to Cloudinary
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const result = await uploadMediaToCloudinary(file, type, (progress) => {
          setUploadProgress(progress);
        });

        if (result && result.url) {
          setMediaPreview(result.url);

          if (type === "image") {
            handleFormChange("imageUrl", result.url);
            handleFormChange("videoUrl", "");
          } else {
            handleFormChange("videoUrl", result.url);
            handleFormChange("imageUrl", "");
            if (result.duration) {
              handleFormChange(
                "durationSeconds",
                Math.min(Math.ceil(result.duration), 60),
              );
            }
          }

          if (type === "video" && result.trimmed) {
            showSnackbar(`Video uploaded and trimmed to 60 seconds!`, "info");
          } else {
            showSnackbar(
              `${type === "image" ? "Image" : "Video"} uploaded successfully!`,
              "success",
            );
          }
        } else {
          throw new Error("Upload returned empty result");
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError(error.message || "Upload failed");
        showSnackbar(error.message || "Failed to upload media", "error");
        setMediaPreview(null);
        setMediaType(null);
      } finally {
        setIsUploading(false);
      }

      event.target.value = "";
    },
    [handleFormChange, showSnackbar],
  );

  // Remove media
  const handleRemoveMedia = useCallback(() => {
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    setMediaType(null);
    setUploadProgress(0);
    setUploadError(null);
    handleFormChange("imageUrl", "");
    handleFormChange("videoUrl", "");
  }, [mediaPreview, handleFormChange]);

  // CTA Button handlers
  const addCtaButton = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: [
        ...prev.ctaButtons,
        {
          label: "",
          ctaType: "CUSTOM",
          routePath: "",
          isPrimary: false,
          displayOrder: prev.ctaButtons.length,
        },
      ],
    }));
  }, []);

  const removeCtaButton = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.filter((_, i) => i !== index),
    }));
  }, []);

  const updateCtaButton = useCallback((index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ctaButtons: prev.ctaButtons.map((cta, i) =>
        i === index ? { ...cta, [field]: value } : cta,
      ),
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.title.trim()) {
        showSnackbar("Title is required", "error");
        return;
      }

      if (!formData.content.trim()) {
        showSnackbar("Content is required", "error");
        return;
      }

      setIsSubmitting(true);

      try {
        if (isEditMode && storyId) {
          await api.put(`/api/admin/stories/${storyId}`, formData);
          showSnackbar("Story updated successfully!", "success");
        } else {
          await api.post("/api/admin/stories", formData);
          showSnackbar("Story created successfully!", "success");
        }

        setTimeout(() => {
          navigate("/admin/stories");
        }, 1000);
      } catch (error) {
        console.error("Error saving story:", error);
        showSnackbar(
          error.response?.data?.message ||
            `Failed to ${isEditMode ? "update" : "create"} story`,
          "error",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEditMode, storyId, navigate, showSnackbar],
  );

  const handleClose = useCallback(() => {
    navigate("/admin/stories");
  }, [navigate]);

  // Load story data for edit mode
  const loadStoryData = useCallback(
    async (id) => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/api/admin/stories/${id}`);
        setFormData({
          title: data.title || "",
          content: data.content || "",
          storyType: data.storyType || "ANNOUNCEMENT",
          severity: data.severity || "INFO",
          imageUrl: data.imageUrl || "",
          videoUrl: data.videoUrl || "",
          backgroundColor: data.backgroundColor || "#1a1a2e",
          backgroundGradient: data.backgroundGradient || "",
          durationSeconds: data.durationSeconds || 5,
          expirationHours: data.expirationHours || 24,
          priority: data.priority || 0,
          isGlobal: data.isGlobal !== undefined ? data.isGlobal : true,
          targetUserId: data.targetUserId || "",
          autoActivate:
            data.autoActivate !== undefined ? data.autoActivate : true,
          ctaButtons: data.ctaButtons || [],
        });

        // Set media preview
        if (data.videoUrl) {
          setMediaType("video");
          setMediaPreview(data.videoUrl);
        } else if (data.imageUrl) {
          setMediaType("image");
          setMediaPreview(data.imageUrl);
        }
      } catch (error) {
        console.error("Error loading story:", error);
        showSnackbar("Failed to load story data", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [showSnackbar],
  );

  return {
    // Form state
    formData,
    setFormData,
    handleFormChange,

    // Media state
    mediaType,
    mediaPreview,
    uploadProgress,
    isUploading,
    uploadError,
    fileInputRef,

    // Actions
    handleFileSelect,
    handleRemoveMedia,
    addCtaButton,
    removeCtaButton,
    updateCtaButton,
    handleSubmit,
    handleClose,
    loadStoryData,

    // Snackbar
    snackbar,
    showSnackbar,
    handleCloseSnackbar,

    // Loading states
    isSubmitting,
    isLoading,
  };
};

export default useStoryForm;
