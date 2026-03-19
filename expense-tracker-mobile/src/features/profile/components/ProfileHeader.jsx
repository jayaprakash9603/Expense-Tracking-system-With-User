import React from "react";
import { Pencil, Save, X, Camera, Mail, MapPin, Briefcase, Calendar } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { useLayout } from "@/shared/hooks/useLayout";
import { cn } from "@/lib/utils";

function getInitials(first, last) {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "U";
}

export function ProfileHeader({
  formData,
  user,
  isEditMode,
  isSaving,
  imageUploading,
  onEditToggle,
  onSave,
  onCancel,
  onImageUpload,
}) {
  const { t } = useLanguage();
  const { isMobile } = useLayout();
  const initials = getInitials(formData.firstName, formData.lastName);
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border">
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-primary/8 blur-2xl" />

      <div className={cn(
        "relative z-10 flex gap-4",
        isMobile ? "flex-col items-center p-4 pt-6" : "flex-row items-start p-6 lg:p-8"
      )}>
        <div className="relative shrink-0">
          <Avatar className={cn(isMobile ? "h-24 w-24" : "h-28 w-28", "border-4 border-card shadow-lg")}>
            <AvatarImage src={formData.profileImage} alt={formData.firstName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {isEditMode && (
            <label className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md cursor-pointer hover:bg-primary/90 transition-colors">
              {imageUploading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <AppIcon icon={Camera} color="inherit" size="sm" />
              )}
              <input type="file" className="hidden" accept="image/*" onChange={onImageUpload} disabled={imageUploading} />
            </label>
          )}
        </div>

        <div className={cn("flex-1 min-w-0", isMobile ? "text-center" : "text-left")}>
          <h2 className="text-xl font-bold truncate">
            {formData.firstName} {formData.lastName}
          </h2>

          <div className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5",
            isMobile && "justify-center"
          )}>
            <AppIcon icon={Mail} color="soft" size="xs" />
            <span className="truncate">{formData.email}</span>
          </div>

          <div className={cn("flex flex-wrap gap-2 mt-3", isMobile && "justify-center")}>
            {formData.occupation && (
              <StatChip icon={Briefcase} value={formData.occupation} />
            )}
            {formData.location && (
              <StatChip icon={MapPin} value={formData.location} />
            )}
            {joinDate && (
              <StatChip icon={Calendar} value={`Joined ${joinDate}`} />
            )}
          </div>

          {formData.bio && (
            <p className="mt-3 text-sm text-muted-foreground italic max-w-lg">
              &ldquo;{formData.bio}&rdquo;
            </p>
          )}
        </div>

        <div className={cn("flex gap-2 shrink-0", isMobile && "w-full")}>
          {!isEditMode ? (
            <button
              onClick={onEditToggle}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors tap-highlight-none",
                isMobile && "flex-1 justify-center"
              )}
            >
              <AppIcon icon={Pencil} color="inherit" size="xs" />
              {t("settings.editProfile")}
            </button>
          ) : (
            <>
              <button
                onClick={onSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors tap-highlight-none disabled:opacity-60",
                  isMobile && "flex-1 justify-center"
                )}
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AppIcon icon={Save} color="inherit" size="xs" />
                )}
                {isSaving ? t("common.processing") : t("common.save")}
              </button>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors tap-highlight-none disabled:opacity-50",
                  isMobile && "flex-1 justify-center"
                )}
              >
                <AppIcon icon={X} color="soft" size="xs" />
                {t("common.cancel")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon, value }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-xs">
      <AppIcon icon={icon} color="primary" size="xs" />
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default ProfileHeader;
