/**
 * CreateStory Page
 * Full page component for creating new stories with media upload support
 */
import React from "react";
import { AutoStories } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import { useStoryForm } from "../../hooks/useStoryForm";
import PageHeader from "../../components/PageHeader";
import StoryFormFields from "../../components/Stories/StoryFormFields";
import ToastNotification from "../Landingpage/ToastNotification";

const CreateStory = () => {
  const { colors } = useTheme();

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
  } = useStoryForm(null, false, null);

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
          title="Create New Story"
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
          isEditMode={false}
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

export default CreateStory;
