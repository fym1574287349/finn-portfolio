'use client';

import { useEffect, useRef, useState } from 'react';
import type { RoomSection } from './build-room';
import s from './room.module.css';

const items: { id: RoomSection; name: string }[] = [{ id: 'work', name: '设计作品' }, { id: 'about', name: '我的简历' }, { id: 'life', name: '设计之外' }, { id: 'play', name: '玩一会儿' }, { id: 'note', name: '留张纸条' }];

export default function RoomScene({ onSelect, hints, command, highlighted }: { onSelect: (id: RoomSection) => void; hints: boolean; command: { type: string; seq: number }; highlighted: RoomSection | null }) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const engine = useRef<ReturnType<typeof import('./build-room').createRoom> | null>(null);
  const onSelectRef = useRef(onSelect); onSelectRef.current = onSelect;
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [hovered, setHovered] = useState<RoomSection | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState('loading');
    import('./build-room').then(({ createRoom }) => {
      if (cancelled || !host.current || !labels.current) return;
      try { engine.current = createRoom(host.current, labels.current, { onSelect: id => onSelectRef.current(id), onHover: setHovered, onError: () => setState('error') }); setState('ready'); } catch { setState('error'); }
    }).catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; engine.current?.dispose(); engine.current = null; };
  }, [retry]);
  useEffect(() => { engine.current?.action(command.type); }, [command]);
  return <div className={s.viewport3d}>
    <div className={s.canvasHost} ref={host} data-testid="room-webgl" />
    <div ref={labels} className={`${s.labels3d} ${hints ? s.labelsVisible : ''}`} aria-label="房间内的交互物件">{items.map((item, index) => <button key={item.id} data-section={item.id} className={`${s.label3d} ${hovered === item.id || highlighted === item.id ? s.labelActive : ''}`} onClick={() => onSelect(item.id)} aria-label={`打开${item.name}`} style={{ visibility: state === 'ready' ? undefined : 'hidden' }}><span>0{index + 1}</span><b>{item.name}</b></button>)}</div>
    {state === 'loading' && <div className={s.sceneState} role="status"><span className={s.loaderRing} /><p>正在布置你的 3D 工作室…</p></div>}
    {state === 'error' && <div className={s.sceneState} role="alert"><p>3D 场景暂时无法打开</p><span>请使用支持 WebGL 的浏览器，并开启图形加速。<br />你仍然可以通过底部导航浏览内容。</span><button onClick={() => setRetry(value => value + 1)}>重新载入</button></div>}
  </div>;
}
