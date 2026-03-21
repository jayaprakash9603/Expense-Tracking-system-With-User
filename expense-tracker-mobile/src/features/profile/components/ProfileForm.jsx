import React from "react";
import { User, Phone, Briefcase, MapPin, FileText } from "lucide-react";
import { Input } from "@/shared/components/app-shadcn";
import { Label } from "@/shared/components/app-shadcn";
import { AppIcon, AppIconBox } from "@/shared/components/display/AppIcon";
import { AppCard } from "@/shared/components/display/AppCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";

const FIELDS = [
  { id: "firstName", labelKey: "profile.firstName", icon: User, type: "text" },
  { id: "lastName", labelKey: "profile.lastName", icon: User, type: "text" },
  { id: "email", labelKey: "profile.email", icon: User, type: "email", readOnly: true },
  { id: "mobile", labelKey: "profile.mobile", icon: Phone, type: "tel" },
  { id: "occupation", labelKey: "profile.occupation", icon: Briefcase, type: "text" },
  { id: "location", labelKey: "profile.location", icon: MapPin, type: "text" },
  { id: "dateOfBirth", labelKey: "profile.dateOfBirth", icon: User, type: "date" },
];

export function ProfileForm({ formData, isEditMode, onInputChange }) {
  const { t } = useLanguage();

  return (
    <AppCard>
      <AppCard.Header>
        <div className="flex items-center gap-3">
          <AppIconBox icon={User} color="primary" size="md" />
          <AppCard.Title>{t("profile.personalInfo")}</AppCard.Title>
        </div>
      </AppCard.Header>

      <AppCard.Content>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id} className="text-xs font-medium text-muted-foreground">
                {t(field.labelKey)}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <AppIcon icon={field.icon} color="soft" size="xs" />
                </div>
                <Input
                  id={field.id}
                  type={field.type}
                  value={formData[field.id] || ""}
                  onChange={(e) => onInputChange(field.id, e.target.value)}
                  readOnly={field.readOnly || !isEditMode}
                  className={cn(
                    "pl-9 h-10",
                    (!isEditMode || field.readOnly) && "bg-muted/50 cursor-default"
                  )}
                />
              </div>
            </div>
          ))}

          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-medium text-muted-foreground">
              {t("profile.bio")}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 pointer-events-none">
                <AppIcon icon={FileText} color="soft" size="xs" />
              </div>
              <textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => onInputChange("bio", e.target.value)}
                readOnly={!isEditMode}
                rows={3}
                className={cn(
                  "flex w-full rounded-md border border-input bg-background pl-9 pr-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none",
                  !isEditMode && "bg-muted/50 cursor-default"
                )}
              />
            </div>
          </div>
        </div>
      </AppCard.Content>
    </AppCard>
  );
}

export default ProfileForm;
