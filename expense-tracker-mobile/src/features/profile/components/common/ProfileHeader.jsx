import React from "react";
import { Pencil, Save, X, Camera, Mail, MapPin, Briefcase, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/shared/components/app-shadcn";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";
import { useLayout } from "@/shared/hooks/layout/useLayout";
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
    <div className="relative overflow-hidden border-b border-border bg-background">
      <div className={cn(
        "relative z-10 flex gap-4 lg:gap-6",
        isMobile ? "flex-col items-center p-4 pt-6" : "flex-row items-center p-6 lg:p-8"
      )}>
        <div className="relative shrink-0">
          <Avatar className={cn(isMobile ? "h-24 w-24" : "h-32 w-32", "border-none shadow-none")}>
            <AvatarImage src={formData.profileImage} alt={formData.firstName} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
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

        <div className={cn("flex-1 min-w-0 flex flex-col justify-center", isMobile ? "text-center items-center" : "text-left items-start")}>
          <h2 className="text-2xl font-bold truncate">
            {formData.firstName} {formData.lastName}
          </h2>

          <div className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground mt-1",
            isMobile && "justify-center"
          )}>
            <AppIcon icon={Mail} color="soft" size="xs" />
            <span className="truncate">{formData.email}</span>
          </div>

          <div className={cn("flex flex-wrap gap-2 mt-3", isMobile && "justify-center")}>
            {joinDate && (
              <StatChip icon={Calendar} value={t("profile.joinedWithDate", { date: joinDate })} />
            )}
          </div>
        </div>

        <div className={cn("flex gap-2 shrink-0 self-start", isMobile && "w-full mt-4")}>
          {!isEditMode ? (
            <Button
              type="button"
              onClick={onEditToggle}
              className={cn(
                "flex items-center gap-2 px-4 py-2 tap-highlight-none bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
                isMobile && "flex-1 justify-center",
              )}
            >
              <AppIcon icon={Pencil} color="inherit" size="xs" />
              {t("settings.editProfile")}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 tap-highlight-none disabled:opacity-60",
                  isMobile && "flex-1 justify-center",
                )}
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AppIcon icon={Save} color="inherit" size="xs" />
                )}
                {isSaving ? t("common.processing") : t("common.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 tap-highlight-none disabled:opacity-50",
                  isMobile && "flex-1 justify-center",
                )}
              >
                <AppIcon icon={X} color="soft" size="xs" />
                {t("common.cancel")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon, value }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 border border-border/50 text-xs text-muted-foreground">
      <AppIcon icon={icon} color="primary" size="xs" />
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default ProfileHeader;
