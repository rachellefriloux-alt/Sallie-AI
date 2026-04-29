export default function AvatarLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-peacock-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading avatar workshop">
        <div className="w-12 h-12 rounded-full border-2 border-peacock-500 border-t-transparent animate-spin" />
        <p className="text-sm text-peacock-600 dark:text-peacock-400">Loading Avatar Workshop...</p>
      </div>
    </div>
  );
}
