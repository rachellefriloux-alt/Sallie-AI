export default function RootLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-900"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400">Loading Sallie...</p>
      </div>
    </div>
  );
}
