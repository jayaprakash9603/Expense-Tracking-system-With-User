import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutGrid,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  RotateCcw,
  Check,
  X,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSectionCustomization } from "@/shared/hooks/customization/useSectionCustomization";
import { usePresentation } from "@/shared/hooks/settings/usePresentation";
import { useLanguage } from "@/shared/hooks/i18n/useLanguage";

const TYPE_VARIANT = {
  full: "default",
  half: "secondary",
  bottom: "outline",
};

export function SectionCustomizationModal({
  open,
  onOpenChange,
  sections,
  onSaveLayout,
  onResetLayout,
  title: titleProp,
  subtitle: subtitleProp,
  showReset = true,
  labels = {},
}) {
  const { t } = useLanguage();
  const { animation } = usePresentation();
  const title = titleProp ?? t("customization.sectionModal.title");
  const subtitle = subtitleProp ?? t("customization.sectionModal.subtitle");

  const {
    activeSections,
    availableSections,
    selectedAvailable,
    selectedActive,
    handleToggle,
    handleReorder,
    handleSelectAvailable,
    handleSelectActive,
    moveSelectedToActive,
    moveSelectedToAvailable,
    moveAllToActive,
    moveAllToAvailable,
    handleSave,
    handleReset,
  } = useSectionCustomization({
    sections,
    open,
    onSave: onSaveLayout,
    onReset: onResetLayout,
    onClose: () => onOpenChange(false),
  });

  const mergedLabels = {
    save: t("customization.sectionModal.saveLayout"),
    reset: t("customization.sectionModal.resetDefault"),
    cancel: t("customization.cancel"),
    active: t("customization.active"),
    available: t("customization.available"),
    ...labels,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription className="text-xs hidden sm:block">
                {subtitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-center gap-4 py-3 border-b border-border">
          <Badge variant="default" className="gap-1">
            <Check className="h-3 w-3" />
            {activeSections.length} {mergedLabels.active}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <EyeOff className="h-3 w-3" />
            {availableSections.length} {mergedLabels.available}
          </Badge>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row min-h-0">
          <ColumnPanel
            title={`\uD83D\uDCE6 ${mergedLabels.available} ${t("customization.sectionModal.sectionsSuffix")}`}
            sections={availableSections}
            selectedIds={selectedAvailable}
            onSelect={handleSelectAvailable}
            onToggle={handleToggle}
            isActive={false}
            emptyMessage={t("customization.sectionModal.emptyAllActive")}
            animated={animation.enabled}
          />

          <div className="flex sm:flex-col items-center justify-center gap-1.5 px-2 py-2 sm:py-0 border-t sm:border-t-0 sm:border-x border-border">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!availableSections.length}
              onClick={moveAllToActive}
              title={t("customization.sectionModal.moveAllToActive")}
            >
              <ChevronsRight className="h-4 w-4 hidden sm:block" />
              <ChevronDown className="h-4 w-4 sm:hidden" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!selectedAvailable.length}
              onClick={moveSelectedToActive}
              title={t("customization.sectionModal.moveSelectedToActive", {
                count: selectedAvailable.length,
              })}
            >
              <ChevronDown className="h-4 w-4 sm:hidden" />
              <svg className="h-4 w-4 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!selectedActive.length}
              onClick={moveSelectedToAvailable}
              title={t("customization.sectionModal.removeSelected", {
                count: selectedActive.length,
              })}
            >
              <ChevronUp className="h-4 w-4 sm:hidden" />
              <svg className="h-4 w-4 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={!activeSections.length}
              onClick={moveAllToAvailable}
              title={t("customization.sectionModal.removeAll")}
            >
              <ChevronsLeft className="h-4 w-4 hidden sm:block" />
              <ChevronUp className="h-4 w-4 sm:hidden" />
            </Button>
          </div>

          <ColumnPanel
            title={`\u2713 ${mergedLabels.active} ${t("customization.sectionModal.sectionsSuffix")}`}
            sections={activeSections}
            selectedIds={selectedActive}
            onSelect={handleSelectActive}
            onToggle={handleToggle}
            onReorder={handleReorder}
            isActive
            emptyMessage={t("customization.sectionModal.emptyDragHere")}
            animated={animation.enabled}
          />
        </div>

        <DialogFooter className="flex-row items-center gap-2 px-5 py-4 border-t border-border">
          {showReset && (
            <Button variant="outline" size="sm" onClick={handleReset} className="mr-auto text-destructive border-destructive/30 hover:bg-destructive/10">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {mergedLabels.reset}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {mergedLabels.cancel}
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            {mergedLabels.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ColumnPanel({
  title,
  sections,
  selectedIds,
  onSelect,
  onToggle,
  onReorder,
  isActive,
  emptyMessage,
  animated,
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 sm:min-h-[300px]">
      <div className="px-4 py-2.5 border-b border-border">
        <h4 className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>
          {title}
        </h4>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            {isActive ? <EyeOff className="h-10 w-10 opacity-30 mb-2" /> : <Eye className="h-10 w-10 opacity-30 mb-2" />}
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          sections.map((section, idx) => (
            <SectionItem
              key={section.id}
              section={section}
              isSelected={selectedIds.includes(section.id)}
              onSelect={() => onSelect(section.id)}
              onToggle={() => onToggle(section.id)}
              onMoveUp={isActive && onReorder && idx > 0 ? () => onReorder(section.id, "up") : null}
              onMoveDown={isActive && onReorder && idx < sections.length - 1 ? () => onReorder(section.id, "down") : null}
              isActive={isActive}
              animated={animated}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SectionItem({ section, isSelected, onSelect, onToggle, onMoveUp, onMoveDown, isActive, animated }) {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer select-none",
        isSelected ? "border-primary bg-primary/5" : "border-border",
        animated && "transition-all duration-150",
        animated && "hover:border-primary/50",
      )}
      onClick={onSelect}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="h-4 w-4 rounded border-border accent-primary shrink-0"
        onClick={(e) => e.stopPropagation()}
      />

      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

      <span className="text-sm font-medium flex-1 truncate">{section.name}</span>

      <Badge variant={TYPE_VARIANT[section.type] || "secondary"} className="text-[10px] px-1.5 py-0 h-5 shrink-0">
        {section.type === "full"
          ? t("customization.sectionModal.sectionTypeFull")
          : t("customization.sectionModal.sectionTypeHalf")}
      </Badge>

      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="p-1 rounded hover:bg-muted shrink-0"
        title={isActive ? t("customization.sectionModal.hide") : t("customization.sectionModal.show")}
      >
        {isActive ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-primary" />}
      </button>

      {onMoveUp && (
        <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 rounded hover:bg-muted shrink-0">
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
      {onMoveDown && (
        <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 rounded hover:bg-muted shrink-0">
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

export default SectionCustomizationModal;
