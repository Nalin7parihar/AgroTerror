'use client';

import { useEffect, useRef } from 'react';

export function DNAHelixAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;
      const segments = 20;
      
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * Math.PI * 2 + time;
        const angle2 = (i / segments) * Math.PI * 2 + time + Math.PI;
        
        const x1 = centerX + Math.cos(angle1) * radius;
        const y1 = centerY + Math.sin(angle1) * radius * 0.5;
        const x2 = centerX + Math.cos(angle2) * radius;
        const y2 = centerY + Math.sin(angle2) * radius * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'var(--primary)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      time += 0.02;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: 'transparent' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          backgroundColor: 'transparent',
          display: 'block',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />
    </div>
  );
}

