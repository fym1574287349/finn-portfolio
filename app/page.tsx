'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import ClickSpark from './components/ClickSpark';
import Masonry, { MasonryItem } from './components/Masonry';
import MemoryGame from './components/MemoryGame';
import { asset } from './asset';

type Lang = 'zh' | 'en';
type Section = 'resume' | 'projects' | 'life' | null;
type ProjectId = 'zhouhu' | 'tongcheng' | 'redesign' | 'other' | 'game';
type HeroObject = 'portrait' | 'computer' | 'files';

const copy = {
  zh: {
    role: 'AIGC 视觉设计师', intro: '在设计、技术与想象力之间，\n创造值得被记住的视觉体验。', explore: '点击场景中的物品，探索我的世界',
    resume: '个人简历', projects: '设计项目', life: '设计之外', back: '返回工作室', choose: '选择一个项目文件夹',
    aboutTitle: '我把生成式 AI，变成视觉表达的一部分。', lifeTitle: '工作之外，生活也是我的灵感素材库。',
  },
  en: {
    role: 'AIGC Visual Designer', intro: 'Creating memorable visual experiences\nacross design, technology and imagination.', explore: 'Click an object to explore my world',
    resume: 'About & Resume', projects: 'Selected Works', life: 'Beyond Design', back: 'Back to studio', choose: 'Choose a project folder',
    aboutTitle: 'I turn generative AI into a part of visual expression.', lifeTitle: 'Beyond work, everyday life is my library of inspiration.',
  },
};

const projectData: Array<{id:ProjectId; folder:string; title:string; en:string; color:string; available:boolean; interactive:boolean}> = [
  { id:'zhouhu', folder:asset('/assets/folders/zhouhu.png'), title:'昼虎记账 APP — IP设计', en:'Zhouhu APP — IP Design', color:'#50baff', available:true, interactive:false },
  { id:'tongcheng', folder:asset('/assets/folders/tongcheng.png'), title:'同程旅行 APP — 城市寻宝记', en:'Tongcheng Travel — City Treasure Hunt', color:'#ffb63c', available:true, interactive:true },
  { id:'redesign', folder:asset('/assets/folders/redesign.png'), title:'某某平台 — 优化改版', en:'Platform — UI/UX Redesign', color:'#68ef4e', available:false, interactive:true },
  { id:'other', folder:asset('/assets/folders/other.png'), title:'其他设计作品', en:'Other Design Works', color:'#bd80ff', available:false, interactive:false },
  { id:'game', folder:asset('/assets/folders/game.webp'), title:'游戏 Demo 体验', en:'Game Demo', color:'#ff55bb', available:true, interactive:false },
];

const lifeItems:MasonryItem[] = [
  {id:'01',img:asset('/assets/life/travel-01.jpg'),alt:'威尼斯水城与船只',ratio:1800/1080},
  {id:'02',img:asset('/assets/life/收藏到 Room.jpg'),alt:'生活空间灵感',ratio:1440/1080},
  {id:'03',img:asset('/assets/life/travel-07.jpg'),alt:'伦敦街头的春日光影',ratio:1080/1620},
  {id:'04',img:asset('/assets/life/travel-02.jpg'),alt:'加州盛夏海滩',ratio:1440/1080},
  {id:'05',img:asset('/assets/life/travel-03.jpg'),alt:'北京天坛建筑',ratio:1800/1080},
  {id:'06',img:asset('/assets/life/收藏到 Pins by you.jpg'),alt:'日常收藏与灵感',ratio:981/736},
  {id:'07',img:asset('/assets/life/travel-04.jpg'),alt:'城市街头群像',ratio:1621/1080},
  {id:'08',img:asset('/assets/life/travel-08.jpg'),alt:'伦敦城市天际线',ratio:1080/1621},
  {id:'09',img:asset('/assets/life/travel-05.jpg'),alt:'卢浮宫艺术参观',ratio:1440/1080},
  {id:'10',img:asset('/assets/life/收藏到 阳台.jpg'),alt:'阳台与空间观察',ratio:1200/800},
  {id:'11',img:asset('/assets/life/travel-06.jpg'),alt:'伦敦河畔风景',ratio:1440/1080},
  {id:'12',img:asset('/assets/life/travel-09.jpg'),alt:'揭阳古城烟花夜景',ratio:1440/1080},
  {id:'13',img:asset('/assets/life/收藏到 Sewing.jpg'),alt:'手作与缝纫灵感',ratio:920/736},
  {id:'14',img:asset('/assets/life/travel-10.jpg'),alt:'土耳其热气球旅行',ratio:1440/1080},
  {id:'15',img:asset('/assets/life/travel-11.jpg'),alt:'埃及金字塔与狮身人面像',ratio:1440/1080},
  {id:'16',img:asset('/assets/life/收藏到 你创建的 Pin 图.png'),alt:'日常视觉收藏',ratio:1086/833},
];

export default function Home() {
  const [lang,setLang] = useState<Lang>('zh');
  const [section,setSection] = useState<Section>(null);
  const [project,setProject] = useState<ProjectId|null>(null);
  const [zoom,setZoom] = useState(1);
  const [hoveredObject,setHoveredObject] = useState<HeroObject|null>(null);
  const t = copy[lang];

  useEffect(() => {
    const onKey = (e:KeyboardEvent) => { if(e.key==='Escape'){ if(project) setProject(null); else setSection(null); } };
    window.addEventListener('keydown',onKey); return () => window.removeEventListener('keydown',onKey);
  },[project]);

  const openSection = (next:Exclude<Section,null>) => { setSection(next); setProject(null); setZoom(1); };

  return <ClickSpark sparkColor="#baff69" sparkSize={12} sparkRadius={28} sparkCount={8} duration={450}><main className="site-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setSection(null)} aria-label="返回首页"><span>FINN</span><small>{t.role.toUpperCase()}</small></button>
      <div className="top-actions"><button className="language" onClick={() => setLang(lang==='zh'?'en':'zh')}>{lang==='zh'?'EN':'中文'}</button><a href="mailto:1574287349@qq.com">CONTACT ↗</a></div>
    </header>

    <section className={`hero ${section?'hero-zoom':''}`} aria-label="Finn 的创意工作空间">
      <Image src={asset('/assets/hero.png')} alt="深蓝色的设计师工作室场景" fill priority sizes="100vw" />
      <Image className={`hero-glow ${hoveredObject==='portrait'?'is-visible':''}`} src={asset('/assets/hero-states/portrait.webp')} alt="" fill priority sizes="100vw" aria-hidden="true" />
      <Image className={`hero-glow ${hoveredObject==='computer'?'is-visible':''}`} src={asset('/assets/hero-states/computer.webp')} alt="" fill priority sizes="100vw" aria-hidden="true" />
      <Image className={`hero-glow ${hoveredObject==='files'?'is-visible':''}`} src={asset('/assets/hero-states/files.webp')} alt="" fill priority sizes="100vw" aria-hidden="true" />
      <div className="hero-vignette" />
      <div className="intro"><p>WELCOME TO MY CREATIVE SPACE</p><h1>小明 <em>/ Finn</em></h1><h2>{t.intro.split('\n').map((line,i)=><span key={line}>{line}{i===0&&<br/>}</span>)}</h2><div className="status"><i/> AVAILABLE FOR CREATIVE PROJECTS</div></div>
      <Hotspot className="portrait" index="01" title={t.resume} en="ABOUT & RESUME" onActive={setHoveredObject} onClick={()=>openSection('resume')}/>
      <Hotspot className="computer" index="02" title={t.projects} en="SELECTED WORKS" onActive={setHoveredObject} onClick={()=>openSection('projects')}/>
      <Hotspot className="files" index="03" title={t.life} en="BEYOND DESIGN" onActive={setHoveredObject} onClick={()=>openSection('life')}/>
      <div className="scroll-cue">{t.explore}</div>
    </section>

    {section && <section className={`panel panel-${section}`} aria-label={section}>
      <div className="panel-nav"><button onClick={()=>setSection(null)}>← {t.back}</button><span>FINN / {section.toUpperCase()}</span><button onClick={()=>setSection(null)} aria-label="关闭">×</button></div>
      {section==='resume' && <Resume lang={lang}/>} 
      {section==='projects' && !project && <Projects lang={lang} choose={t.choose} onOpen={(id)=>{setProject(id);setZoom(1)}}/>}
      {section==='projects' && project && <ProjectViewer id={project} lang={lang} zoom={zoom} setZoom={setZoom} onBack={()=>setProject(null)}/>} 
      {section==='life' && <Life title={t.lifeTitle}/>} 
    </section>}
  </main></ClickSpark>;
}

function Hotspot({className,index,title,en,onClick,onActive}:{className:HeroObject;index:string;title:string;en:string;onClick:()=>void;onActive:(next:HeroObject|null)=>void}){
  return <button className={`hotspot ${className}`} onClick={onClick} onMouseEnter={()=>onActive(className)} onMouseLeave={()=>onActive(null)} onFocus={()=>onActive(className)} onBlur={()=>onActive(null)} aria-label={`${title} / ${en}`}>
    <span className="hotspot-card"><span className="hotspot-index">{index}</span><b>{title}</b><small>{en}</small></span>
  </button>;
}

function Resume({lang}:{lang:Lang}){
  return <div className="content resume-layout">
    <div className="resume-copy"><p className="eyebrow">ABOUT / RESUME</p><h2>{copy[lang].aboutTitle}</h2><p className="lead">{lang==='zh'?'我是小明，一名专注于视觉表达与智能创作的 AIGC 视觉设计师。我关注设计、技术与叙事之间的连接，持续探索生成式人工智能在真实设计场景中的更多可能。':'I’m Finn, an AIGC Visual Designer exploring the intersection of visual communication, intelligent tools and storytelling.'}</p>
      <div className="resume-meta"><div><span>ROLE</span><b>{copy[lang].role}</b></div><div><span>FOCUS</span><b>AIGC · Visual · UI/UX · IP</b></div><div><span>CONTACT</span><b>1574287349@qq.com<br/>888888</b></div></div>
      <div className="social-row"><span>站酷 · 剥虾的霸王龙</span><span>小红书 · 剥虾霸王龙</span><span>抖音 · 剥虾的霸王龙</span></div>
      <a className="primary-btn" href={asset('/assets/resume/resume.jpg')} download>{lang==='zh'?'下载简历（占位版）':'Download Resume (placeholder)'} ↓</a>
    </div>
    <div className="resume-card"><Image src={asset('/assets/resume/resume.jpg')} alt="实验性简历风格占位图" width={1240} height={1755}/><span>信息将在最终版本中替换 / Content placeholder</span></div>
  </div>;
}

function Projects({lang,choose,onOpen}:{lang:Lang;choose:string;onOpen:(id:ProjectId)=>void}){
  return <div className="content projects-content"><p className="eyebrow">SELECTED WORKS / 2026</p><div className="section-heading"><h2>{choose}</h2><p>{String(projectData.length).padStart(2,'0')} PROJECT FOLDERS<br/>{String(projectData.filter(p=>p.available).length).padStart(2,'0')} AVAILABLE NOW</p></div><div className="folder-grid">{projectData.map((p,i)=><button key={p.id} style={{'--folder-color':p.color} as React.CSSProperties} onClick={()=>onOpen(p.id)}><span className="project-no">0{i+1}</span><Image src={p.folder} alt={p.title} width={1500} height={1500}/><b>{lang==='zh'?p.title:p.en}</b><small>{p.id==='game'?'PLAY DEMO ↗':p.available?'OPEN PROJECT ↗':'COMING SOON'}</small></button>)}</div></div>;
}

function ProjectViewer({id,lang,zoom,setZoom,onBack}:{id:ProjectId;lang:Lang;zoom:number;setZoom:(n:number)=>void;onBack:()=>void}){
  const [showPrototype,setShowPrototype] = useState(true);
  const p=projectData.find(x=>x.id===id)!;
  if(id==='game') return <MemoryGame lang={lang} onBack={onBack}/>;
  if(!p.available) return <div className="content coming-soon"><button onClick={onBack}>← {lang==='zh'?'返回文件夹':'Back to folders'}</button><Image src={p.folder} alt={p.title} width={1500} height={1500}/><h2>{lang==='zh'?p.title:p.en}</h2><p>{lang==='zh'?'项目内容正在整理，之后只需替换项目长图即可上线。':'Project content is being prepared. A new long image can be swapped in later.'}</p></div>;
  const slices=Array.from({length:8},(_,i)=>asset(`/assets/projects/${id}/${String(i+1).padStart(2,'0')}.webp`));
  return <div className="viewer">
    <div className="viewer-toolbar"><button onClick={onBack}>← {lang==='zh'?'项目文件夹':'Projects'}</button><div><b>{lang==='zh'?p.title:p.en}</b></div><div className="zoom-tools"><button onClick={()=>setZoom(Math.max(.6,zoom-.1))}>−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(Math.min(1.8,zoom+.1))}>＋</button><button onClick={()=>setZoom(1)}>↺</button></div></div>
    {p.interactive&&<button className="prototype-toggle" onClick={()=>setShowPrototype(!showPrototype)} aria-expanded={showPrototype}>{showPrototype?(lang==='zh'?'隐藏演示':'Hide demo'):(lang==='zh'?'显示演示':'Show demo')}</button>}
    <div className="viewer-canvas"><div className="long-image" style={{width:`${zoom*100}%`}}>{slices.map((src,i)=><img src={src} alt={`${p.title} ${i+1}`} key={src}/>)}</div>{p.interactive&&showPrototype&&<aside className="prototype-placeholder"><PhonePrototype/><p>{lang==='zh'?'点击手机页面体验完整交互':'Click the phone screen to explore'}</p></aside>}</div>
  </div>;
}

function PhonePrototype(){
  return <div className="iphone prototype-phone"><iframe title="同程旅行城市寻宝记 Figma 交互原型" src="https://embed.figma.com/proto/KagjxVHJIh8JD3erpi0UN8/%E4%BA%A4%E4%BA%92%E6%BC%94%E7%A4%BA?node-id=1-535&embed-host=share&hide-ui=1&scaling=scale-down&content-scaling=fixed&portfolio-version=20260823-2" allowFullScreen/></div>;
}

function Life({title}:{title:string}){
  const [selected,setSelected]=useState<MasonryItem|null>(null);
  useEffect(()=>{
    if(!selected) return;
    const previous=document.body.style.overflow;
    const close=(event:KeyboardEvent)=>event.key==='Escape'&&setSelected(null);
    document.body.style.overflow='hidden';
    window.addEventListener('keydown',close);
    return ()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',close)};
  },[selected]);
  return <div className="content life-content"><p className="eyebrow">BEYOND DESIGN / LIFE ARCHIVE</p><h2>{title}</h2><Masonry items={lifeItems} onSelect={setSelected}/><div className="life-note"><b>生活、空间、手作与日常观察</b><p>这里记录旅行、城市、艺术与日常生活中的视觉灵感。</p></div>{selected&&<button className="life-lightbox" onClick={()=>setSelected(null)} aria-label="关闭大图"><img src={selected.img} alt={selected.alt}/><span>点击任意位置关闭　×</span></button>}</div>;
}
