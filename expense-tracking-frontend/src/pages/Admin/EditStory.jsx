/**
 * EditStory Page
 * Full page component for editing existing stories with media upload support
 */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { AutoStories } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useStoryForm } from "../../hooks/useStoryForm";
import PageHeader from "../../components/PageHeader";
import StoryFormFields from "../../components/Stories/StoryFormFields";
import ToastNotification from "../Landingpage/ToastNotification";

const EditStory = () => {
  const { colors } = useTheme();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const {
    formData,
    handleFormChange,
    mediaType,
    mediaPreview,
    uploadProgress,
    isUploading,
    uploadError,
    fileInputRef,
    handleFileSelect,
    handleRemoveMedia,
    addCtaButton,
    removeCtaButton,
    updateCtaButton,
    handleSubmit,
    handleClose,
    snackbar,
    handleCloseSnackbar,
    isSubmitting,
    loadStoryData,
    setMediaType,
    setMediaPreview,
  } = useStoryForm(id, true, null);

  // Load story data on mount
  useEffect(() => {
    const fetchStory = async () => {
      setIsLoading(true);
      try {
        await loadStoryData(id);
      } catch (error) {
        console.error("Failed to load story:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: colors.primary_bg,
          height: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: colors.primary, mb: 2 }} />
          <Typography sx={{ color: colors.primary_text }}>
            Loading story...
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex lg:w-[calc(100vw-370px)] flex-col sm:w-full"
        style={{
          height: "90vh",
          maxHeight: "90vh",
          backgroundColor: colors.secondary_bg,
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: `1px solid ${colors.border_color}`,
          padding: "20px",
          marginRight: "20px",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <PageHeader
          title="Edit Story"
          onClose={handleClose}
          icon={<AutoStories sx={{ fontSize: 28, color: colors.primary }} />}
        />

        <StoryFormFields
          formData={formData}
          handleFormChange={handleFormChange}
          mediaType={mediaType}
          mediaPreview={mediaPreview}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          uploadError={uploadError}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          handleRemoveMedia={handleRemoveMedia}
          addCtaButton={addCtaButton}
          removeCtaButton={removeCtaButton}
          updateCtaButton={updateCtaButton}
          handleSubmit={handleSubmit}
          handleClose={handleClose}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      </div>

      {/* Toast Notification */}
      <ToastNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </>
  );
};

export default EditStory;
