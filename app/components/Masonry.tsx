'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

export type MasonryItem = { id:string; img:string; alt:string; ratio:number };

export default function Masonry({items,onSelect}:{items:MasonryItem[];onSelect:(item:MasonryItem)=>void}){
  const containerRef=useRef<HTMLDivElement|null>(null);
  const [width,setWidth]=useState(0);
  const [columns,setColumns]=useState(4);
  const [imagesReady,setImagesReady]=useState(false);
  const mounted=useRef(false);

  useEffect(()=>{
    const updateColumns=()=>setColumns(window.innerWidth>=1500?5:window.innerWidth>=1000?4:window.innerWidth>=600?3:window.innerWidth>=420?2:1);
    updateColumns();
    window.addEventListener('resize',updateColumns);
    return ()=>window.removeEventListener('resize',updateColumns);
  },[]);

  useLayoutEffect(()=>{
    if(!containerRef.current) return;
    const observer=new ResizeObserver(([entry])=>setWidth(entry.contentRect.width));
    observer.observe(containerRef.current);
    return ()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    let active=true;
    Promise.all(items.map(item=>new Promise<void>(resolve=>{
      const image=new window.Image();
      image.onload=image.onerror=()=>resolve();
      image.src=item.img;
    }))).then(()=>active&&setImagesReady(true));
    return ()=>{active=false};
  },[items]);

  const {grid,height}=useMemo(()=>{
    if(!width) return {grid:[],height:0};
    const gap=14;
    const columnWidth=(width-gap*(columns-1))/columns;
    const heights=new Array(columns).fill(0);
    const placed=items.map(item=>{
      const column=heights.indexOf(Math.min(...heights));
      const itemHeight=columnWidth*item.ratio;
      const positioned={...item,x:column*(columnWidth+gap),y:heights[column],w:columnWidth,h:itemHeight};
      heights[column]+=itemHeight+gap;
      return positioned;
    });
    return {grid:placed,height:Math.max(...heights)-gap};
  },[columns,items,width]);

  useLayoutEffect(()=>{
    if(!imagesReady||!grid.length) return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    grid.forEach((item,index)=>{
      const element=containerRef.current?.querySelector<HTMLElement>(`[data-key="${item.id}"]`);
      if(!element) return;
      const target={x:item.x,y:item.y,width:item.w,height:item.h};
      if(!mounted.current&&!reduced){
        gsap.fromTo(element,{...target,y:item.y+70,opacity:0,filter:'blur(10px)'},{...target,opacity:1,filter:'blur(0px)',duration:.65,ease:'power3.out',delay:index*.045});
      }else gsap.to(element,{...target,opacity:1,duration:reduced?0:.45,ease:'power3.out',overwrite:'auto'});
    });
    mounted.current=true;
  },[grid,imagesReady]);

  return <div ref={containerRef} className="masonry-list" style={{height}}>
    {grid.map(item=><button
      key={item.id}
      data-key={item.id}
      className="masonry-item"
      onClick={()=>onSelect(item)}
      onMouseEnter={event=>gsap.to(event.currentTarget,{scale:.97,duration:.25,ease:'power2.out'})}
      onMouseLeave={event=>gsap.to(event.currentTarget,{scale:1,duration:.25,ease:'power2.out'})}
      aria-label={`查看大图：${item.alt}`}
    ><img src={item.img} alt={item.alt}/><span>VIEW ↗</span></button>)}
  </div>;
}
