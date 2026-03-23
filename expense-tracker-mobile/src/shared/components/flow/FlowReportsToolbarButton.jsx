import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { AppButton } from "@/shared/components/form/AppButton";
import { AppIcon } from "@/shared/components/display/AppIcon";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

export function FlowReportsToolbarButton({ to, ariaLabelKey = "navigation.reportsAria" }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const label = t(ariaLabelKey);
  const handleClick = useCallback(() => navigate(to), [navigate, to]);

  return (
    <AppButton
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0 border-primary/40"
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <AppIcon icon={BarChart3} color="primary" size="sm" />
    </AppButton>
  );
}
