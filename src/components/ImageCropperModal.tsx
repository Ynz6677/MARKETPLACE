import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Scissors, X } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  aspectRatio: number; // 1 for profile (1:1), 16/9 for banner (16:9)
  title?: string;
  onCropComplete: (croppedImageBase64: string) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  aspectRatio,
  title = 'Pangkas & Sesuaikan Foto',
  onCropComplete,
  onClose
}) => {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentOffsetStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset parameters when source image changes
  useEffect(() => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    currentOffsetStart.current = { x: offsetX, y: offsetY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    // Convert pixel drag to relative offset values
    setOffsetX(currentOffsetStart.current.x + (dx / containerWidth));
    setOffsetY(currentOffsetStart.current.y + (dy / containerHeight));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    currentOffsetStart.current = { x: offsetX, y: offsetY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    setOffsetX(currentOffsetStart.current.x + (dx / containerWidth));
    setOffsetY(currentOffsetStart.current.y + (dy / containerHeight));
  };

  const handleSave = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Set standard high quality output dimensions
      const canvasWidth = aspectRatio === 1 ? 512 : 896;
      const canvasHeight = Math.round(canvasWidth / aspectRatio);
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Black background fallback
      ctx.fillStyle = '#121214';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const imageAspect = img.width / img.height;
      let baseWidth = canvasWidth;
      let baseHeight = canvasHeight;

      if (imageAspect > aspectRatio) {
        // Image is wider than cropping frame
        baseWidth = canvasHeight * imageAspect;
      } else {
        // Image is taller than cropping frame
        baseHeight = canvasWidth / imageAspect;
      }

      const finalWidth = baseWidth * zoom;
      const finalHeight = baseHeight * zoom;

      // Draw the image centered with additional manual offsets
      const drawX = (canvasWidth - finalWidth) / 2 + (offsetX * canvasWidth);
      const drawY = (canvasHeight - finalHeight) / 2 + (offsetY * canvasHeight);

      ctx.drawImage(img, drawX, drawY, finalWidth, finalHeight);

      try {
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
        onCropComplete(croppedBase64);
      } catch (err) {
        console.error('Failed to crop image on canvas:', err);
        // Fallback to original
        onCropComplete(imageSrc);
      }
    };
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Scissors size={18} className="text-primary" />
            <h3 className="font-extrabold text-sm sm:text-base text-zinc-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Batal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Cropper instructions */}
        <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
          Posisikan foto Anda di dalam bingkai pangkas di bawah. Klik dan geser gambar untuk mengatur posisi, dan gunakan slider di bawah untuk memperbesar foto.
        </p>

        {/* Dynamic Crop Viewport Area */}
        <div 
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-2xl bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          style={{ aspectRatio: `${aspectRatio}` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
        >
          {/* Draggable photo preview layer */}
          <div
            className="absolute transition-transform duration-75 pointer-events-none"
            style={{
              transform: `translate(${offsetX * 100}%, ${offsetY * 100}%) scale(${zoom})`,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={imageSrc}
              className="max-w-none w-full h-full object-contain"
              alt="To Crop"
              draggable={false}
            />
          </div>

          {/* Golden/White crop grid guides */}
          <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none rounded-xl">
            {/* Grid cross lines */}
            <div className="absolute inset-x-0 top-1/3 border-b border-white/20" />
            <div className="absolute inset-x-0 top-2/3 border-b border-white/20" />
            <div className="absolute inset-y-0 left-1/3 border-r border-white/20" />
            <div className="absolute inset-y-0 left-2/3 border-r border-white/20" />
            
            {/* Aspect ratio stamp watermark */}
            <span className="absolute top-2.5 left-2.5 bg-black/75 px-2 py-0.5 rounded text-[8px] font-bold text-zinc-300 uppercase tracking-widest border border-zinc-800">
              Rasio {aspectRatio === 1 ? '1:1 (Profile)' : '16:9 (Banner)'}
            </span>

            <div className="absolute bottom-2.5 right-2.5 bg-black/60 p-1 rounded-full text-white/55">
              <Move size={12} />
            </div>
          </div>
        </div>

        {/* Zoom adjustment Controls bar */}
        <div className="space-y-2 py-1 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-850">
          <div className="flex justify-between items-center text-[10.5px] text-zinc-400 font-extrabold uppercase">
            <span>Perbesaran Foto (Zoom)</span>
            <span className="text-primary">{zoom.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <ZoomOut size={14} className="text-zinc-500" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-primary h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <ZoomIn size={14} className="text-zinc-500" />
          </div>
        </div>

        {/* Crop controls confirm footer */}
        <div className="flex gap-2.5 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 text-center"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <Scissors size={13} />
            Selesai & Pangkas
          </button>
        </div>

      </div>
    </div>
  );
};
