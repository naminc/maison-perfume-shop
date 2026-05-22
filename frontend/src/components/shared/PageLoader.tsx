export function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf8f5]">
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-stone-800" />
      </div>
      <p className="text-[10px] tracking-[0.25em] text-stone-400 uppercase">Maison</p>
    </div>
  );
}
