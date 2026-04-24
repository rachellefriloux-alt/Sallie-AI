'use client';
import dynamic from 'next/dynamic';
const SallieAvatar3D = dynamic(() => import('./SallieAvatar3D').then(m => ({ default: m.SallieAvatar3D })), { ssr: false, loading: () => <div className="flex items-center justify-center" style={{ width: '100%', height: '100%' }}><div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" /></div> });
export { SallieAvatar3D };
