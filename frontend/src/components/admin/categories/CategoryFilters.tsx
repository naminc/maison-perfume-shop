import { Filter, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/admin/ui/input";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/constants/category";
import { cn } from "@/lib/utils";
import type { CategoryListStatusFilter } from "@/types/category";

interface CategoryFiltersProps {
  search: string;
  status: CategoryListStatusFilter;
  isFetching?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CategoryListStatusFilter) => void;
  onClear: () => void;
  onRefresh: () => void;
}

export function CategoryFilters({
  search,
  status,
  isFetching,
  onSearchChange,
  onStatusChange,
  onClear,
  onRefresh,
}: CategoryFiltersProps) {
  const activeCount = [search.trim(), status !== "all" ? status : ""].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-9 w-full rounded-md bg-white sm:w-64"
        placeholder="Tìm tên hoặc slug..."
      />

      <Select value={status} onValueChange={(value) => onStatusChange(value as CategoryListStatusFilter)}>
        <SelectTrigger className="h-9 w-full focus:border-primary focus:ring-0 sm:w-44">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 text-muted-foreground">
          <X className="h-3 w-3" />
          Xoá lọc
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 sm:ml-auto"
        disabled={isFetching}
        onClick={onRefresh}
      >
        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        Làm mới
      </Button>

      {activeCount > 0 && (
        <span className="inline-flex h-6 items-center gap-1 rounded-full bg-primary/10 px-2 text-xs font-medium text-primary sm:hidden">
          <Filter className="h-3 w-3" />
          {activeCount} bộ lọc
        </span>
      )}
    </div>
  );
}
