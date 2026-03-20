import React, { useMemo, useState } from "react";
import { AppDialog } from "@/shared/components/overlay/AppDialog";
import { AppInput } from "@/shared/components/form/AppInput";
import { AppButton } from "@/shared/components/form/AppButton";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * @param {{open: boolean, onOpenChange: (next: boolean) => void, members: Array<{id: string|number, name: string}>, amount: number, onApply?: (splits: Array<{memberId: string|number, amount: number}>) => void}} props
 */
export function SplitCalculatorModal({ open, onOpenChange, members = [], amount = 0, onApply }) {
  const [mode, setMode] = useState("equal");
  const [customValues, setCustomValues] = useState({});

  const equalAmount = useMemo(() => {
    if (!members.length) return 0;
    return Number((amount / members.length).toFixed(2));
  }, [amount, members.length]);

  const computedSplits = useMemo(() => {
    if (mode === "equal") {
      return members.map((member) => ({ memberId: member.id, amount: equalAmount }));
    }

    return members.map((member) => ({
      memberId: member.id,
      amount: toNumber(customValues[member.id]),
    }));
  }, [members, mode, equalAmount, customValues]);

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Split Calculator"
      description="Calculate equal or custom split amounts for group expenses"
      footer={
        <div className="flex w-full justify-end gap-2">
          <AppButton intent="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </AppButton>
          <AppButton
            onClick={() => {
              onApply?.(computedSplits);
              onOpenChange(false);
            }}
          >
            Apply Split
          </AppButton>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <AppButton
            intent={mode === "equal" ? "primary" : "secondary"}
            onClick={() => setMode("equal")}
          >
            Equal
          </AppButton>
          <AppButton
            intent={mode === "custom" ? "primary" : "secondary"}
            onClick={() => setMode("custom")}
          >
            Custom
          </AppButton>
        </div>

        {members.map((member) => (
          <div key={member.id} className="grid grid-cols-2 items-center gap-2">
            <p className="text-sm font-medium">{member.name}</p>
            {mode === "equal" ? (
              <p className="text-sm text-right">{equalAmount.toFixed(2)}</p>
            ) : (
              <AppInput
                type="number"
                value={customValues[member.id] ?? ""}
                onChange={(event) =>
                  setCustomValues((prev) => ({ ...prev, [member.id]: event.target.value }))
                }
                placeholder="0.00"
              />
            )}
          </div>
        ))}
      </div>
    </AppDialog>
  );
}

export default SplitCalculatorModal;
