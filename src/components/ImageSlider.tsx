import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { cn } from '../lib/utils';
import { GripVertical } from 'lucide-react';

interface ImageSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export function ImageSlider({ beforeImage, afterImage, className }: ImageSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - left, width));
    const percent = Math.max(0, Math.min((x / width) * 100, 100));
    setPosition(percent);
  };

  const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
  const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  const onMouseDown = (e: ReactMouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };
  
  const onTouchStart = (e: ReactTouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-[400px] overflow-hidden rounded-xl select-none group bg-surface cursor-ew-resize", className)}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{ touchAction: 'none' }}
    >
      {/* Before Image (Base) */}
      <img src={beforeImage} alt="Before colour correction" loading="lazy" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      
      {/* After Image (Overlay, clipped) */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img 
          src={afterImage} 
          alt="After colour correction" 
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
          draggable={false} 
        />
      </div>
      
      {/* Slider handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        role="slider"
        aria-valuenow={position}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Image comparison slider"
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
          <GripVertical size={16} />
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">Before</div>
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm z-20">After</div>
    </div>
  );
}
