import { createPortal } from "react-dom";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Z_STACK = 9990;

function SpeedDialActionRow({ action, index, onActivate }) {
  const Icon = action.icon;
  return (
    <div
      className="expense-speed-dial-action flex flex-row-reverse items-center gap-3"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span
        className={cn(
          "pointer-events-none select-none rounded-lg border border-border",
          "bg-popover px-3 py-2 text-sm font-medium text-popover-foreground shadow-md",
        )}
      >
        {action.label}
      </span>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="h-11 w-11 shrink-0 cursor-pointer touch-manipulation select-none rounded-full shadow-md"
        aria-label={action.label}
        onClick={() => onActivate(action.onClick)}
      >
        <Icon className="h-5 w-5 pointer-events-none" />
      </Button>
    </div>
  );
}

export function ExpenseSpeedDial({ actions, mainAriaLabel }) {
  const [mountNode, setMountNode] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMountNode(document.body);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const runAction = useCallback(
    (fn) => {
      close();
      fn?.();
    },
    [close],
  );

  if (!mountNode) return null;

  return createPortal(
    <div
      className="fixed bottom-20 right-4 flex flex-col-reverse items-end gap-3 pb-1 md:bottom-6 md:right-6"
      style={{ zIndex: Z_STACK }}
    >
      <Button
        type="button"
        size="icon"
        className={cn(
          "h-14 w-14 shrink-0 cursor-pointer touch-manipulation select-none rounded-full shadow-lg transition-transform duration-200 ease-out",
          open && "rotate-45",
        )}
        aria-label={mainAriaLabel}
        aria-expanded={open}
        onClick={toggle}
      >
        <Plus className="h-6 w-6 pointer-events-none" />
      </Button>
      {open
        ? actions.map((action, index) => (
            <SpeedDialActionRow
              key={action.key}
              action={action}
              index={index}
              onActivate={runAction}
            />
          ))
        : null}
    </div>,
    mountNode,
  );
}
