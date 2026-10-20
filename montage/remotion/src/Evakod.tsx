import React from 'react';
import {
  AbsoluteFill, Easing, OffthreadVideo, Sequence, continueRender, delayRender, interpolate,
  spring, staticFile, useCurrentFrame,
} from 'remotion';

export const FPS = 30;
export const TOTAL = 27.3;
const f = (t: number) => Math.round(t * FPS);

const EMERALD = '#0F3D2E';
const GOLD = '#9A6F2B';

// ---- Shots, tied to the voiceover (seconds) -------------------------------------------------
// Word onsets in the voice: Тонер 10.61, Сыворотка 11.28, Крем 12.35, Маска 13.04, Целый ритуал 13.93,
// Тёплый свет 15.43, И кожа 21.66, Евакод 24.61, Подарите ей сияние 25.64.
type Shot = { clip: string; start: number; src: number; rate: number; fade: number; zoom?: boolean };
const SHOTS: Shot[] = [
  { clip: 'c1', start: 0.0, src: 0.0, rate: 0.84, fade: 0 },
  { clip: 'c2', start: 5.75, src: 0.0, rate: 1, fade: 0.25 },
  { clip: 'c3a', start: 10.5, src: 0.6, rate: 1, fade: 0 },   // Тонер
  { clip: 'c3b', start: 11.22, src: 0.3, rate: 1, fade: 0 },  // Сыворотка
  { clip: 'c3c', start: 12.29, src: 0.6, rate: 1, fade: 0 },  // Крем
  { clip: 'c3d', start: 12.98, src: 0.6, rate: 1, fade: 0 },  // Маска
  { clip: 'c2', start: 13.87, src: 3.2, rate: 1, fade: 0 },   // Целый ритуал
  { clip: 'c4', start: 15.2, src: 0.0, rate: 0.775, fade: 0.25, zoom: true },
  { clip: 'c5', start: 21.45, src: 0.3, rate: 1, fade: 0.25 },
  { clip: 'c6', start: 24.4, src: 0.0, rate: 1, fade: 0.25 },
];

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const opacity = shot.fade > 0 ? interpolate(frame, [0, f(shot.fade)], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo
        src={staticFile(`${shot.clip}.mp4`)}
        startFrom={f(shot.src)}
        playbackRate={shot.rate}
        muted
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: shot.zoom ? 'scale(1.2)' : undefined, transformOrigin: '50% 0%',
        }}
      />
    </AbsoluteFill>
  );
};

// ---- Fonts -------------------------------------------------------------------------------------
const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const faces = [
      new FontFace('EvSans', `url(${staticFile('fonts/MS-Medium.ttf')})`),
      new FontFace('EvSerif', `url(${staticFile('fonts/CG-SemiBold.ttf')})`),
    ];
    Promise.all(faces.map((x) => x.load())).then((loaded) => {
      loaded.forEach((x) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(x));
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};

// ---- Title helpers -----------------------------------------------------------------------------
const Reveal: React.FC<{ t: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, out, children, style }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - f(t), fps: FPS, durationInFrames: 20, config: { damping: 200 } });
  const o = out === undefined ? 1 : interpolate(frame, [f(out) - 9, f(out)], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span style={{ display: 'inline-block', opacity: p * o, transform: `translateY(${(1 - p) * 30}px)`, filter: `blur(${(1 - p) * 9}px)`, ...style }}>
      {children}
    </span>
  );
};

const ProductTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const T_OUT = 10.3;
  const line = interpolate(frame, [f(7.2), f(8.2)], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lineOut = interpolate(frame, [f(T_OUT) - 9, f(T_OUT)], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1580, textAlign: 'center', fontFamily: 'EvSans', fontSize: 52, color: EMERALD, letterSpacing: 1.5 }}>
      <Reveal t={6.0} out={T_OUT}>23 Skin Lab</Reveal>
      <Reveal t={7.0} out={T_OUT} style={{ margin: '0 22px', color: GOLD }}>·</Reveal>
      <Reveal t={7.66} out={T_OUT}>7 средств</Reveal>
      <div style={{ margin: '18px auto 0', height: 3, width: 360 * line, background: GOLD, opacity: lineOut, borderRadius: 2 }} />
    </div>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const T0 = 24.4;
  const p = spring({ frame: frame - f(T0), fps: FPS, config: { damping: 14, stiffness: 90 } });
  const o = interpolate(frame, [f(T0), f(T0) + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const float = Math.sin(((frame - f(T0)) / FPS) * Math.PI * 1.1) * 5 * Math.min(1, Math.max(0, (frame - f(T0)) / 20));
  const sweep = interpolate(frame, [f(25.0), f(25.95)], [-300, 300], { easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const SIZE = 230;
  return (
    <div style={{ position: 'absolute', left: (1080 - SIZE) / 2, top: 265, width: SIZE, height: SIZE, opacity: o, transform: `translateY(${float}px) scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -14}deg)` }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 14px 34px rgba(15,61,46,0.22)' }}>
        <img src={staticFile('logo_ec.png')} style={{ width: SIZE, height: SIZE, display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${sweep}px)`, background: 'linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 62%)', mixBlendMode: 'soft-light' }} />
      </div>
    </div>
  );
};

const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const T0 = 24.61;
  const p = interpolate(frame, [f(T0), f(T0) + 26], [0, 1], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 515, textAlign: 'center', fontFamily: 'EvSans', fontSize: 44, color: GOLD, opacity: p, letterSpacing: `${0.75 - 0.45 * p}em`, paddingLeft: `${0.75 - 0.45 * p}em` }}>
      ЕВАКОД
    </div>
  );
};

const Slogan: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', fontFamily: 'EvSerif', fontSize: 88, color: EMERALD, display: 'flex', justifyContent: 'center', gap: 24 }}>
    <Reveal t={25.64}>Подарите</Reveal>
    <Reveal t={26.08}>ей</Reveal>
    <Reveal t={26.3}>сияние</Reveal>
  </div>
);

export const Evakod: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b2a20' }}>
      {SHOTS.map((s, i) => {
        const next = SHOTS[i + 1];
        const end = next ? next.start + next.fade : TOTAL;
        return (
          <Sequence key={i} from={f(s.start)} durationInFrames={f(end) - f(s.start)}>
            <ShotView shot={s} />
          </Sequence>
        );
      })}
      <ProductTitle />
      <Logo />
      <Brand />
      <Slogan />
    </AbsoluteFill>
  );
};
