import type { LucideIcon } from "lucide-react";

interface AdminModulePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function AdminModulePlaceholder({ icon: Icon, title, description }: AdminModulePlaceholderProps) {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <section className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-stone-100">
          <Icon className="h-6 w-6 text-stone-500" />
        </div>
        <h2 className="text-base font-semibold text-stone-900">Module đang được chuẩn bị</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
          Giao diện điều hướng đã sẵn sàng. Phần nghiệp vụ chi tiết sẽ được triển khai trong module riêng.
        </p>
      </section>
    </div>
  );
}
