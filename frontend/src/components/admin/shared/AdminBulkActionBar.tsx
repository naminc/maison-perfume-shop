import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/shared/ButtonSpinner";

interface AdminBulkActionBarProps {
  selectedCount: number;
  itemLabel: string;
  isDeleting?: boolean;
  onDeleteSelected: () => void;
  onDeselectAll: () => void;
}

export function AdminBulkActionBar({
  selectedCount,
  itemLabel,
  isDeleting,
  onDeleteSelected,
  onDeselectAll,
}: AdminBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-14 z-50 flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 shadow-lg animate-in slide-in-from-bottom duration-300 md:bottom-0 md:pl-[276px] md:pr-6"
      role="toolbar"
      aria-label="Thao tác hàng loạt"
    >
      <span className="shrink-0 text-sm font-medium text-foreground">
        Đã chọn {selectedCount} {itemLabel}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
          onClick={onDeleteSelected}
          className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
        >
          {isDeleting ? <ButtonSpinner /> : <Trash2 className="h-3.5 w-3.5" />}
          Xoá đã chọn
        </Button>
        <Button variant="ghost" size="sm" disabled={isDeleting} onClick={onDeselectAll} className="h-8 gap-1 text-xs">
          <X className="h-3.5 w-3.5" />
          Bỏ chọn
        </Button>
      </div>
    </div>
  );
}
