import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/app-shadcn";
import { cn } from "@/lib/utils";

const Z_STACK = 9990;

function SpeedDialActionRow({ action, index, onActivate }) {
  const Icon = action.icon;
  return (
    <div
      className="expense-speed-dial-action flex flex-row-reverse items-center"
      style={{ animationDelay: `${index * 55}ms` }}
    >
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
  const rootRef = useRef(null);

  useEffect(() => {
    setMountNode(document.body);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        close();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, close]);

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
      ref={rootRef}
      className="fixed bottom-20 right-4 flex flex-col-reverse items-end gap-3 pb-1 md:bottom-6 md:right-6"
      style={{ zIndex: Z_STACK }}
    >
      <Button
        type="button"
        size="icon"
        className={cn(
          "h-14 w-14 shrink-0 cursor-pointer touch-manipulation select-none rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 ease-out hover:bg-primary/90",
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
