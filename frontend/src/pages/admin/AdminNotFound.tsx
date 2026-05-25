import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-4 text-center text-stone-950">
      <section className="flex flex-col items-center">
        <Package className="h-10 w-10 text-emerald-600" strokeWidth={2.4} />
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-sm text-slate-600">The page you're looking for doesn't exist or has moved.</p>
        <Button asChild className="mt-5 h-10 rounded-lg bg-emerald-600 px-5 font-semibold text-white shadow-sm hover:bg-emerald-700">
          <Link to="/admin/dashboard">Back to home</Link>
        </Button>
      </section>
    </main>
  );
}
