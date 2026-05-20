import React from 'react';

const Loader: React.FC<{ fullscreen?: boolean }> = ({ fullscreen }) => {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-zinc-950 z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-200 border-t-brand-500 animate-spin" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500 font-mono">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-7 w-7 rounded-full border-2 border-zinc-200 border-t-brand-500 animate-spin dark:border-zinc-700 dark:border-t-brand-400" />
    </div>
  );
};

export default Loader;
