'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import s from './room.module.css';
import RoomScene from './room-scene';

type Section = 'work' | 'about' | 'life' | 'play' | 'note';
const sections: { id: Section; name: string; en: string; object: string; x: number; y: number }[] = [
  { id: 'work', name: '设计作品', en: 'SELECTED WORK', object: '复古电脑', x: 30, y: 32 },
  { id: 'about', name: '我的简历', en: 'ABOUT ME', object: '桌上的履历册', x: 20, y: 44 },
  { id: 'life', name: '设计之外', en: 'OFF THE CLOCK', object: '生活收藏架', x: 70, y: 25 },
  { id: 'play', name: '玩一会儿', en: 'PLAY A LITTLE', object: '复古掌机', x: 46, y: 66 },
  { id: 'note', name: '留张纸条', en: 'LEAVE A NOTE', object: '明信片架', x: 84, y: 55 },
];

export default function Room() {
  const [active, setActive] = useState<Section | null>(null);
  const [hovered, setHovered] = useState<Section | null>(null);
  const [hints, setHints] = useState(true);
  const [command, setCommand] = useState({ type: '', seq: 0 });
  const [rotating, setRotating] = useState(false);
  const sceneAction = (type: string) => setCommand(value => ({ type, seq: value.seq + 1 }));
  const dialog = useRef<HTMLDialogElement>(null);
  const current = sections.find(item => item.id === active);

  useEffect(() => {
    if (active) {
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previous; };
    }
    dialog.current?.close();
  }, [active]);

  return <main className={s.room}>
    <header className={s.header}>
      <a className={s.brand} href="/room" aria-label="小明的工作室首页"><span className={s.monogram}>f.</span><span>小明的工作室<small>FINN’S LITTLE STUDIO</small></span></a>
      <span className={s.version}>3D 互动工作室 <span>360°</span></span>
    </header>

    <section className={s.stage} aria-label="可探索的真实 3D 工作室">
      <div className={s.intro}><p className={s.eyebrow}>MAKE YOURSELF AT HOME</p><h1>欢迎来到<br />我的<span>小小世界。</span></h1><p className={s.description}>我是小明，一名互联网设计师。<br />这里放着我的作品，也藏着一些日常。</p><button className={s.workButton} onClick={() => setActive('work')}>先看看作品 <span aria-hidden="true">↗</span></button></div>
      <RoomScene onSelect={setActive} hints={hints} command={command} highlighted={hovered} />
      <div className={s.sceneCaption}><span>THE STUDIO / 360°</span><p>拖动旋转 · 滚轮 / 双指缩放 · 点击物件探索</p></div>
      <div className={s.sceneTools} aria-label="3D 场景控制"><button onClick={() => setHints(!hints)} aria-pressed={hints}>{hints ? '隐藏' : '显示'}入口</button><button onClick={() => { sceneAction('rotate'); setRotating(!rotating); }} aria-pressed={rotating}>{rotating ? '停止' : '自动'}旋转</button><button onClick={() => { sceneAction('reset'); setRotating(false); }}>复位</button><button onClick={() => sceneAction('zoomOut')} aria-label="缩小房间">−</button><button onClick={() => sceneAction('zoomIn')} aria-label="放大房间">＋</button></div>
    </section>

    <footer className={s.footer}><span className={s.footerNote}>五个角落，一个我。</span><nav className={s.nav} aria-label="工作室导航">{sections.map((item, index) => <button key={item.id} onClick={() => setActive(item.id)} onPointerEnter={() => setHovered(item.id)} onPointerLeave={() => setHovered(null)}><small>0{index + 1}</small>{item.name}</button>)}</nav><span className={s.footerTag}>DESIGN & EVERYDAY</span></footer>

    <dialog ref={dialog} className={s.dialog} aria-labelledby="room-panel-title" onCancel={() => setActive(null)} onClose={() => setActive(null)} onClick={event => { if (event.target === event.currentTarget) setActive(null); }}>
      {current && <div className={s.panel}>
        <div className={s.panelHeader}><button onClick={() => setActive(null)}>← 返回房间</button><span>{current.en}</span><button className={s.close} onClick={() => setActive(null)} aria-label="关闭">×</button></div>
        <div className={s.panelBody}><p className={s.eyebrow}>{current.object}</p><h2 id="room-panel-title">{current.name}</h2>
          {active === 'work' && <Works />}
          {active === 'about' && <About />}
          {active === 'life' && <Life />}
          {active === 'play' && <MemoryGame />}
          {active === 'note' && <Note />}
        </div>
      </div>}
    </dialog>
  </main>;
}

const projects = [
  { id: 'zhouhu', category: 'IP 设计', title: '昼虎记账 APP', subtitle: 'IP 角色设计', image: '/assets/projects/zhouhu/01.webp' },
  { id: 'tongcheng', category: '运营活动设计', title: '同程旅行 · 城市寻宝记', subtitle: '活动视觉与互动体验', image: '/assets/projects/tongcheng/01.webp' },
];

function Works() {
  const [category, setCategory] = useState('全部作品');
  const [selected, setSelected] = useState<string | null>(null);
  const detailTop = useRef<HTMLDivElement>(null);
  const project = projects.find(item => item.id === selected);
  useEffect(() => { if (selected) detailTop.current?.scrollIntoView({ block: 'start' }); }, [selected]);
  if (project) return <div ref={detailTop} className={s.projectDetail}>
    <button className={s.textButton} onClick={() => setSelected(null)}>← 返回作品列表</button>
    <h3>{project.title}</h3><p className={s.bodyText}>{project.subtitle}</p>
    <div className={s.projectPages}>{Array.from({ length: 8 }, (_, index) => <img key={index} src={`/assets/projects/${project.id}/${String(index + 1).padStart(2, '0')}.webp`} alt={`${project.title} · 第 ${index + 1} 页`} loading="lazy" />)}</div>
  </div>;
  const visible = projects.filter(item => category === '全部作品' || item.category === category);
  return <>
    <p className={s.bodyText}>从一个角色，到一场活动，再到更多设计探索。</p>
    <div className={s.filters} role="group" aria-label="作品分类">{['全部作品', 'IP 设计', '运营活动设计', '其他设计'].map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {visible.length > 0 ? <div className={s.projectGrid}>{visible.map((item, index) => <button key={item.id} className={s.projectCard} onClick={() => setSelected(item.id)}><div className={s.projectCover}><img src={item.image} alt={item.title} /></div><div className={s.projectCardText}><span>0{index + 1} / {item.category}</span><h3>{item.title}</h3><p>{item.subtitle}<span aria-hidden="true">↗</span></p></div></button>)}</div> : <div className={s.empty}><span>03</span><h3>其他设计，留在这里。</h3><p>这一格留给你的更多作品，素材补充后就可以展示。</p></div>}
    <p className={s.previewNote}>版式预览使用工作区内现有项目素材，后续可替换与补充。</p>
  </>;
}

function About() {
  return <div className={s.aboutGrid}><div><p className={s.bigName}>小明 <span>/ Finn</span></p><p className={s.bodyText}>互联网设计师<br />关注 IP 设计、运营活动设计与视觉表达。</p><div className={s.disciplines}><span>IP DESIGN</span><span>CAMPAIGN DESIGN</span><span>VISUAL DESIGN</span></div></div><div className={s.resumeSheet}><p>ABOUT THE DESIGNER</p><h3>每一段经历，<br />都留下设计的痕迹。</h3><dl><div><dt>个人介绍</dt><dd>等待补充你的介绍与设计理念</dd></div><div><dt>工作经历</dt><dd>等待补充公司、时间与负责内容</dd></div><div><dt>专业能力</dt><dd>等待补充擅长的领域与工具</dd></div></dl><span className={s.previewNote}>简历内容待提供，正式版本支持下载。</span></div></div>;
}

function Life() {
  return <><p className={s.bodyText}>设计之外，也想让你认识日常里的我。</p><div className={s.lifeGrid}><figure><img src="/assets/life/travel-01.jpg" alt="水城与船只 · 生活栏目示例" loading="lazy" /><figcaption>城市与旅行</figcaption></figure><figure><img src="/assets/life/收藏到 Room.jpg" alt="室内空间 · 灵感栏目示例" loading="lazy" /><figcaption>空间与收藏</figcaption></figure><figure><img src="/assets/life/收藏到 Sewing.jpg" alt="手作灵感 · 兴趣栏目示例" loading="lazy" /><figcaption>日常的小爱好</figcaption></figure></div><p className={s.previewNote}>这里沿用现有图库演示排版，之后根据你的真实兴趣重新整理。</p></>;
}

const swatches = [
  { color: '#cb593c', name: '柿子橙', symbol: '◒' }, { color: '#437e79', name: '松石绿', symbol: '△' },
  { color: '#4a6ed0', name: '屏幕蓝', symbol: '✦' }, { color: '#ad7448', name: '焦糖棕', symbol: '◎' },
  { color: '#9a6375', name: '莓果粉', symbol: '◇' }, { color: '#7b7847', name: '橄榄绿', symbol: '✳' },
];

function newDeck() {
  const deck = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function MemoryGame() {
  const [deck, setDeck] = useState<number[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  useEffect(() => { setDeck(newDeck()); }, []);
  useEffect(() => {
    if (open.length !== 2) return;
    const timer = window.setTimeout(() => {
      if (deck[open[0]] === deck[open[1]]) setMatched(previous => [...previous, ...open]);
      setOpen([]);
    }, deck[open[0]] === deck[open[1]] ? 250 : 800);
    return () => window.clearTimeout(timer);
  }, [open, deck]);
  function flip(index: number) {
    if (open.length === 2 || open.includes(index) || matched.includes(index)) return;
    setOpen(previous => [...previous, index]);
    if (open.length === 1) setMoves(previous => previous + 1);
  }
  return <div className={s.game}><div className={s.gameIntro}><div><h3>找回我的调色盘</h3><p className={s.bodyText}>翻开色卡，找到 6 对相同的颜色与图形。</p></div><button className={s.textButton} onClick={() => { setOpen([]); setMatched([]); setMoves(0); setDeck(newDeck()); }}>重新开始 ↻</button></div><div className={s.gameStats} aria-live="polite"><span>已配对 <b>{matched.length / 2} / 6</b></span><span>尝试 <b>{moves} 次</b></span></div><div className={s.cardGrid}>{deck.map((value, index) => { const revealed = open.includes(index) || matched.includes(index); return <button key={index} className={`${s.memoryCard} ${revealed ? s.revealed : ''} ${matched.includes(index) ? s.matched : ''}`} style={{ '--card-color': swatches[value].color } as CSSProperties} aria-label={revealed ? `第 ${index + 1} 张：${swatches[value].name}${matched.includes(index) ? '，已配对' : ''}` : `翻开第 ${index + 1} 张色卡`} aria-disabled={open.length === 2 || revealed} onClick={() => flip(index)}><span className={s.cardBack} aria-hidden="true">f.</span><span className={s.cardFront} aria-hidden="true">{swatches[value].symbol}<small>{swatches[value].name}</small></span></button>; })}</div><p className={s.gameMessage} role="status">{matched.length === 12 ? `调色盘找齐了！你用了 ${moves} 次尝试。` : '慢慢来，好颜色值得多看一眼。'}</p></div>;
}

function Note() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  return <div className={s.noteGrid}><div><p className={s.bodyText}>想聊设计、交流灵感，<br />或只是打个招呼，都可以写在这里。</p><p className={s.notice}>当前是留言样式预览，内容不会发送或保存。</p><form onSubmit={event => { event.preventDefault(); if (message.trim()) setPreview(true); }}><label className={s.field}>你的称呼 <span>选填</span><input value={name} onChange={event => { setName(event.target.value); setPreview(false); }} maxLength={24} placeholder="路过的朋友" autoComplete="nickname" /></label><label className={s.field}>想说的话<textarea value={message} onChange={event => { setMessage(event.target.value); setPreview(false); }} maxLength={300} minLength={1} required rows={4} placeholder="很高兴在这里遇见你……" /></label><div className={s.formBottom}><span>{message.length} / 300</span><button className={s.primaryButton} disabled={!message.trim()} type="submit">预览明信片 ↗</button></div></form></div><div className={s.postcard} aria-live="polite"><span className={s.postcardTop}>A NOTE FOR FINN <span>✳</span></span><p>{preview ? message.trim() : '在这里，\n留下一点你的声音。'}</p><div>FROM / {preview ? name.trim() || '路过的朋友' : 'YOU'}<small>{preview ? '明信片预览 · 尚未发送' : '写点什么，让这张卡片属于你。'}</small></div></div></div>;
}
