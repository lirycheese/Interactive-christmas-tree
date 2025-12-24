import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { AppMode, HandGesture } from '../types';

export const UI: React.FC = () => {
  const { mode, addPhoto, setMode, photos, gesture } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Explicitly type the file as File to resolve the 'unknown' error when passing to createObjectURL
      Array.from(e.target.files).forEach((file: File) => {
        const url = URL.createObjectURL(file);
        addPhoto({
            id: Math.random().toString(36).substr(2, 9),
            url,
            aspectRatio: 1
        });
      });
      setMode(AppMode.CHAOS);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden">
      
      {/* Permanent Sidebar Container */}
      <div className={`fixed left-0 top-0 h-full ${sidebarOpen ? 'w-64 md:w-72' : 'w-0'} bg-black/80 backdrop-blur-2xl border-r border-[#D4AF37]/20 pointer-events-auto transition-all duration-300 flex flex-col shadow-2xl z-[50]`}>
        {sidebarOpen && (
          <div className="flex flex-col h-full p-6 md:p-8 gap-6 md:gap-8 overflow-hidden">
            <div className="space-y-1">
                <h2 className="text-[#D4AF37] luxury-font text-xl md:text-2xl border-b border-[#D4AF37]/30 pb-2 truncate">Memories</h2>
                <p className="text-[#D4AF37]/70 text-[8px] uppercase tracking-widest">Permanent Gallery</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video border-2 border-dashed border-[#D4AF37]/40 rounded-xl flex flex-col items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors group shrink-0"
                >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📸</span>
                    <span className="text-[10px] font-medium">Add Photos</span>
                </button>
                <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

                <div className="grid grid-cols-2 gap-2 mt-4">
                    {photos.map(photo => (
                        <div key={photo.id} className="aspect-square rounded-lg border border-[#D4AF37]/20 overflow-hidden bg-white/5 shadow-inner">
                            <img src={photo.url} alt="Memory" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                {photos.length === 0 && (
                    <p className="text-[#D4AF37]/40 text-center text-[10px] italic py-8">No photos yet...</p>
                )}
            </div>

            <div className="pt-4 border-t border-[#D4AF37]/20 text-[#D4AF37]/60 text-[8px] leading-relaxed shrink-0">
                <p>Upload memories to decorate the tree.</p>
            </div>
          </div>
        )}
        
        {/* Toggle Sidebar Button */}
        <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-12 bg-black/40 backdrop-blur-md rounded-r-lg flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 border-l-0 hover:bg-[#D4AF37]/40 transition-all pointer-events-auto"
        >
            {sidebarOpen ? '❮' : '❯'}
        </button>
      </div>

      {/* Centered Title Area */}
      <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full max-w-[90vw]">
        <div className="inline-block">
            <h1 className="text-6xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] via-[#FBE8A6] to-[#D4AF37] drop-shadow-[0_4px_15px_rgba(212,175,55,0.4)] whitespace-nowrap leading-[1.1] elegant-title font-normal p-2">
              Merry Christmas
            </h1>
            <p className="text-[#D4AF37] tracking-[0.4em] uppercase text-[8px] md:text-xs font-light mt-[-10px] opacity-70 playfair italic">
              Limited Edition Interactive Experience
            </p>
        </div>
      </div>

      {/* Centered Instruction Footer */}
      <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
          <div className="flex gap-4 md:gap-8 text-[#D4AF37] text-[8px] md:text-[10px] font-light bg-black/60 backdrop-blur-xl p-3 px-6 md:p-4 md:px-8 rounded-full border border-[#D4AF37]/30 shadow-2xl pointer-events-auto scale-90 md:scale-100">
            <div className="flex items-center gap-2">
                <span className="text-lg">✊</span>
                <span className="hidden sm:inline uppercase tracking-widest">Form</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-lg">🖐️</span>
                <span className="hidden sm:inline uppercase tracking-widest">Explode</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-lg">🤏</span>
                <span className="hidden sm:inline uppercase tracking-widest">Grab</span>
            </div>
          </div>
      </div>

      {/* Desktop Debug Mode Toggles */}
      <div className="absolute bottom-8 right-8 hidden md:flex flex-col gap-3 pointer-events-auto">
        <button 
          onClick={() => setMode(AppMode.FORMED)} 
          className="px-6 py-2 gold-wireframe rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg luxury-font"
        >
          FORM
        </button>
        <button 
          onClick={() => setMode(AppMode.CHAOS)} 
          className="px-6 py-2 gold-wireframe rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg luxury-font"
        >
          EXPLODE
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.4); border-radius: 10px; }
      `}</style>
    </div>
  );
};