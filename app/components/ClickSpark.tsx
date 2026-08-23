'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';

type Spark = { x:number; y:number; angle:number; startTime:number };

type ClickSparkProps = {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-in-out' | 'ease-out';
  extraScale?: number;
  children: ReactNode;
};

export default function ClickSpark({
  sparkColor='#baff69', sparkSize=12, sparkRadius=28, sparkCount=8,
  duration=450, easing='ease-out', extraScale=1, children,
}:ClickSparkProps){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const sparksRef=useRef<Spark[]>([]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const resize=()=>{
      const ratio=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(window.innerWidth*ratio);
      canvas.height=Math.round(window.innerHeight*ratio);
      canvas.style.width=`${window.innerWidth}px`;
      canvas.style.height=`${window.innerHeight}px`;
      canvas.getContext('2d')?.setTransform(ratio,0,0,ratio,0,0);
    };
    resize();
    window.addEventListener('resize',resize);
    return ()=>window.removeEventListener('resize',resize);
  },[]);

  const easeFunc=useCallback((t:number)=>{
    if(easing==='linear') return t;
    if(easing==='ease-in') return t*t;
    if(easing==='ease-in-out') return t<.5?2*t*t:-1+(4-2*t)*t;
    return t*(2-t);
  },[easing]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext('2d');
    if(!canvas||!ctx) return;
    let animationId=0;
    const draw=(timestamp:number)=>{
      ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
      sparksRef.current=sparksRef.current.filter(spark=>{
        const elapsed=timestamp-spark.startTime;
        if(elapsed>=duration) return false;
        const eased=easeFunc(elapsed/duration);
        const distance=eased*sparkRadius*extraScale;
        const lineLength=sparkSize*(1-eased);
        const x1=spark.x+distance*Math.cos(spark.angle);
        const y1=spark.y+distance*Math.sin(spark.angle);
        ctx.globalAlpha=1-eased;
        ctx.strokeStyle=sparkColor;
        ctx.lineWidth=2;
        ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x1+lineLength*Math.cos(spark.angle),y1+lineLength*Math.sin(spark.angle));
        ctx.stroke();
        return true;
      });
      ctx.globalAlpha=1;
      animationId=requestAnimationFrame(draw);
    };
    animationId=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(animationId);
  },[duration,easeFunc,extraScale,sparkColor,sparkRadius,sparkSize]);

  const handleClick=(event:React.MouseEvent<HTMLDivElement>)=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const now=performance.now();
    sparksRef.current.push(...Array.from({length:sparkCount},(_,i)=>({
      x:event.clientX, y:event.clientY, angle:(Math.PI*2*i)/sparkCount, startTime:now,
    })));
  };

  return <div className="click-spark-root" onClick={handleClick}>
    <canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true"/>
    {children}
  </div>;
}
