import React from "react";
import { ChevronRight } from "lucide-react";
import { Switch } from "@/shared/components/app-shadcn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/app-shadcn";
import { Button } from "@/shared/components/app-shadcn";
import { ThemePicker } from "@/shared/components/ThemePicker";
import { AppIcon } from "@/shared/components/AppIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { cn } from "@/lib/utils";

function ItemIcon({ icon, variant }) {
  if (!icon) return null;
  const color = variant === "destructive" ? "error" : "soft";
  return <AppIcon icon={icon} color={color} size="sm" />;
}

export function SettingItem({ item, value, onChange, onAction, disabled = false, className }) {
  const { t } = useLanguage();
  const { type, labelKey, descriptionKey, icon: Icon, options, variant, actionId, switchValueMapping } = item;

  const label = t(labelKey);
  const description = descriptionKey ? t(descriptionKey) : null;

  if (type === "themePicker") {
    return (
      <div className={cn("py-3", className)}>
        <div className="mb-3">
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <ThemePicker compact />
      </div>
    );
  }

  if (type === "switch") {
    const isChecked = switchValueMapping
      ? value === switchValueMapping.on
      : Boolean(value);

    const handleChange = (checked) => {
      const newValue = switchValueMapping
        ? (checked ? switchValueMapping.on : switchValueMapping.off)
        : checked;
      onChange?.(newValue);
    };

    return (
      <div className={cn("flex items-center justify-between py-3", disabled && "opacity-50", className)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ItemIcon icon={Icon} variant={variant} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{label}</p>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <Switch checked={isChecked} onCheckedChange={handleChange} disabled={disabled} />
      </div>
    );
  }

  if (type === "select") {
    return (
      <div
        className={cn(
          "flex items-center justify-between py-3 gap-4",
          disabled && "opacity-50",
          className,
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ItemIcon icon={Icon} variant={variant} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{label}</p>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-[120px] md:w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(options || []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label || t(opt.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (type === "button") {
    const isDestructive = variant === "destructive";
    const buttonVariant = isDestructive ? "outline" : (variant || "outline");

    return (
      <div className={cn("flex items-center justify-between py-3", className)}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ItemIcon icon={Icon} variant={variant} />
          <div className="min-w-0">
            <p className={cn("text-sm font-medium truncate", isDestructive && "text-destructive")}>{label}</p>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <Button
          variant={buttonVariant}
          size="sm"
          onClick={() => onAction?.(actionId)}
          className={cn(isDestructive && "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground")}
        >
          {item.buttonLabel || label}
        </Button>
      </div>
    );
  }

  if (type === "navigation") {
    return (
      <button
        type="button"
        className={cn(
          "flex items-center justify-between py-3 w-full text-left hover:bg-muted/50 rounded-md px-1 -mx-1 transition-colors",
          className,
        )}
        onClick={() => onAction?.(actionId)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ItemIcon icon={Icon} variant={variant} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{label}</p>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        <AppIcon icon={ChevronRight} color="muted" size="sm" />
      </button>
    );
  }

  return null;
}

export default SettingItem;
