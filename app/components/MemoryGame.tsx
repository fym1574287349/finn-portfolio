'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { gameReducer, initialGame, shuffleDeck } from './memory-game';
import './MemoryGame.css';

const assetRoot = '/assets/game/';
const cardNames = ['幸运金币', '卡片二', '卡片三', '卡片四', '卡片五', '卡片六'];
const sources = ['background.webp', 'card-back.webp', ...Array.from({ length: 6 }, (_, i) => `card-${i + 1}.webp`)];

export default function MemoryGame({ lang, onBack }: { lang: 'zh' | 'en'; onBack: () => void }) {
  const zh = lang === 'zh';
  const [game, dispatch] = useReducer(gameReducer, initialGame);
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const replayRef = useRef<HTMLButtonElement>(null);
  const firstCardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(0);
    setFailed(false);
    // Decode the real assets before enabling Start; no artificial progress timer.
    for (const source of sources) {
      const image = new window.Image();
      image.src = assetRoot + source;
      image.decode().then(() => {
        if (!cancelled) setLoaded(count => count + 1);
      }).catch(() => {
        if (!cancelled) setFailed(true);
      });
    }
    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => {
    if (game.phase !== 'playing') return;
    const tick = () => dispatch({ type: 'tick', now: Date.now() });
    const interval = window.setInterval(tick, 80);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, [game.phase]);

  useEffect(() => {
    if (game.phase === 'won' || game.phase === 'lost') replayRef.current?.focus({ preventScroll: true });
    if (game.phase === 'playing') firstCardRef.current?.focus({ preventScroll: true });
  }, [game.phase]);

  useEffect(() => {
    if (game.matched.length) setAnnouncement(zh ? `配对成功，当前 ${game.matched.length * 5} 分` : `Match! Score: ${game.matched.length * 5}`);
  }, [game.matched.length, zh]);

  const ready = loaded === sources.length && !failed;
  const progress = Math.round(loaded / sources.length * 100);
  const finished = game.phase === 'won' || game.phase === 'lost';
  const score = game.matched.length * 5;
  const start = () => {
    if (!ready) return;
    setAnnouncement(zh ? '游戏开始，60 秒倒计时' : 'Round started. 60 seconds.');
    dispatch({ type: 'start', deck: shuffleDeck(), now: Date.now() });
  };

  return <div className="memory-demo">
    <div className="memory-toolbar">
      <button onClick={onBack}>← {zh ? '项目文件夹' : 'Projects'}</button>
      <b>{zh ? '游戏 Demo 体验' : 'Game Demo'}</b>
      <span>{zh ? '翻卡配对' : 'Memory Match'}</span>
    </div>
    <div className="memory-stage">
      <section className="memory-screen" aria-label={zh ? '卡牌翻翻乐，60 秒配对挑战' : 'Card matching, 60-second challenge'}>
        <img className="memory-background" src={assetRoot + 'background.webp'} alt="" aria-hidden="true" draggable={false}/>
        <h1 className="sr-only">{zh ? '卡牌翻翻乐' : 'Memory Match'}</h1>
        {!zh && <div className="memory-english-title">Memory Match</div>}
        <button className="memory-back" onClick={onBack} aria-label={zh ? '返回项目文件夹' : 'Back to projects'}/>
        <button className="memory-restart" onClick={start} disabled={!ready || finished} aria-label={zh ? '重新开始本局' : 'Restart round'}/>
        <div className="memory-sr" role="status" aria-live="polite">{announcement}</div>

        {game.phase === 'ready' ? <div className="memory-loading">
          <div className="memory-loader" role="progressbar" aria-label={zh ? '游戏素材加载进度' : 'Loading game assets'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="memory-loader-fill" style={{ width: `${progress}%` }}/>
            <span className="memory-loader-star" style={{ left: `${Math.min(94, Math.max(6, progress))}%` }} aria-hidden="true">✦</span>
          </div>
          <p>{failed ? (zh ? '素材加载失败，请重试' : 'Could not load images. Try again.') : ready ? (zh ? '加载完成 100%' : 'Ready 100%') : (zh ? `加载中 ${progress}%` : `Loading ${progress}%`)}</p>
          <div className="memory-start-area">
            {failed ? <button className="memory-primary" onClick={() => setAttempt(value => value + 1)}>{zh ? '重新加载' : 'Retry loading'}</button> : ready && <>
              <button className="memory-primary" onClick={start}>{zh ? '开始游戏' : 'Start game'}</button>
              <p className="memory-rules">{zh ? <>60 秒内找到 6 组相同卡牌<br/>每组 10 分 · 满分 60 分</> : <>Find 6 matching pairs in 60 seconds<br/>10 points per pair · 60 points to win</>}</p>
            </>}
          </div>
        </div> : <>
          <div className="memory-score" aria-label={zh ? `本轮分数：${score}` : `Score: ${score}`}><span>{zh ? '本轮分数：' : 'Score: '}</span><strong>{score}</strong></div>
          <div className={`memory-time ${game.seconds <= 10 ? 'memory-time-low' : ''}`} role="timer" aria-label={zh ? `剩余 ${game.seconds} 秒` : `${game.seconds} seconds left`}><span>{zh ? '剩余' : 'Left'}</span><strong>{game.seconds}</strong><span>{zh ? '秒' : 's'}</span></div>
          <div className="memory-board" aria-label={zh ? '12 张卡牌，3 列 4 行' : '12 cards in 3 columns and 4 rows'}>
            {game.deck.map((card, index) => {
              const matched = game.matched.includes(card.id);
              const revealed = matched || game.open.includes(card.id);
              const label = zh ? `第 ${index + 1} 张卡，${matched ? '已配对' : revealed ? cardNames[card.face - 1] : '未翻开'}` : `Card ${index + 1}, ${matched ? 'matched' : revealed ? `design ${card.face}` : 'face down'}`;
              return <button key={card.id} ref={index === 0 ? firstCardRef : undefined} className={`memory-card ${revealed ? 'is-flipped' : ''} ${matched ? 'is-matched' : ''}`} disabled={finished || revealed || game.resolveAt !== null} onClick={() => dispatch({ type: 'flip', id: card.id, now: Date.now() })} aria-label={label} aria-pressed={revealed}>
                <span className="memory-card-turn">
                  <span className="memory-card-side memory-card-back"><img src={assetRoot + 'card-back.webp'} alt="" draggable={false}/></span>
                  <span className="memory-card-side memory-card-front"><img src={assetRoot + `card-${card.face}.webp`} alt="" draggable={false}/></span>
                </span>
              </button>;
            })}
          </div>
          {finished && <div className="memory-result" role="dialog" aria-modal="true" aria-labelledby="memory-result-title" onKeyDown={event => {
            if (event.key !== 'Tab') return;
            const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }}>
            <div className="memory-result-card">
              <p className="memory-result-eyebrow">{game.phase === 'won' ? 'ALL MATCHED!' : 'TIME’S UP'}</p>
              <h2 id="memory-result-title">{game.phase === 'won' ? (zh ? '挑战成功！' : 'You did it!') : (zh ? '时间到！' : 'Time’s up!')}</h2>
              <p className="memory-result-score"><strong>{score}</strong><span> / 60</span></p>
              <p>{game.phase === 'won' ? (zh ? `成功配对 6 组，剩余 ${game.seconds} 秒` : `All 6 pairs found with ${game.seconds}s left`) : (zh ? `已找到 ${game.matched.length / 2} / 6 组，再试一次吧` : `${game.matched.length / 2} / 6 pairs found. Try again!`)}</p>
              <button ref={replayRef} className="memory-primary" onClick={start}>{zh ? '再玩一次' : 'Play again'}</button>
              <button className="memory-result-back" onClick={onBack}>{zh ? '返回项目' : 'Back to projects'}</button>
            </div>
          </div>}
        </>}
      </section>
    </div>
  </div>;
}
