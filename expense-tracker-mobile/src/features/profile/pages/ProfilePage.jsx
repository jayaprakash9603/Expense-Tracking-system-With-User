import React from "react";
import { useSelector } from "react-redux";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ProfileHeader } from "../components/common/ProfileHeader";
import { ProfileForm } from "../components/form/ProfileForm";
import { useProfileForm } from "../hooks/useProfileForm";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function ProfilePage() {
  const { t } = useLanguage();
  const user = useSelector((state) => state.auth?.user);

  const {
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
  } = useProfileForm();

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ProfileHeader
        formData={formData}
        user={user}
        isEditMode={isEditMode}
        isSaving={isSaving}
        imageUploading={imageUploading}
        onEditToggle={() => setIsEditMode(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onImageUpload={handleImageUpload}
      />

      <PageContainer maxWidth="md" padding="default">
        {saveError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-700 dark:text-green-400">
            {t("profile.updateSuccess")}
          </div>
        )}
        <ProfileForm
          formData={formData}
          isEditMode={isEditMode}
          onInputChange={handleInputChange}
        />
      </PageContainer>
    </div>
  );
}

export default ProfilePage;
