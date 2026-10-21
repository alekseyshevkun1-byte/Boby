import React from 'react';
import {
  AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame,
} from 'remotion';

export const FPS = 30;
export const TOTAL = 23.0;
const f = (t: number) => Math.round(t * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const INK = '#2A1D18';
const TERRA = '#C2553A';

// ---- Phone geometry -----------------------------------------------------------------------------
const SW = 640;
const SH = Math.round((SW * 2796) / 1290);
const BZ = 22;
const PW = SW + BZ * 2, PH = SH + BZ * 2;

type Shot = 'white' | 'green' | 'gray' | 'terra';
const IMG: Record<Shot, string> = { white: 's_white.png', green: 's_green.png', gray: 's_gray.png', terra: 's_terra.png' };
type P = [number, number];
const THUMB: Record<Shot, P> = { white: [0.117, 0.759], green: [0.295, 0.759], gray: [0.472, 0.759], terra: [0.648, 0.759] };
const BUY: P = [0.262, 0.87];

// Voice timing (seconds)
const SWITCH: { t: number; shot: Shot }[] = [
  { t: 0, shot: 'white' }, { t: 7.9, shot: 'green' }, { t: 8.8, shot: 'gray' }, { t: 9.75, shot: 'terra' }, { t: 11.0, shot: 'white' },
];
const TAPS: { t: number; pos: P }[] = [
  { t: 7.85, pos: THUMB.green }, { t: 8.75, pos: THUMB.gray }, { t: 9.7, pos: THUMB.terra }, { t: 10.95, pos: THUMB.white }, { t: 19.5, pos: BUY },
];
const HIGHLIGHTS: { box: [number, number, number, number]; t0: number; t1: number }[] = [
  { box: [0.03, 0.626, 0.5, 0.666], t0: 12.0, t1: 14.3 },     // price
  { box: [0.035, 0.668, 0.59, 0.709], t0: 15.4, t1: 18.1 },    // installment
  { box: [0.04, 0.84, 0.485, 0.9], t0: 18.7, t1: 20.5 },       // buy button
  { box: [0.27, 0.066, 0.6, 0.117], t0: 20.45, t1: 22.7 },     // seller + rating
];

const useFonts = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    const faces = [
      new FontFace('KBold', `url(${staticFile('fonts/MS-Bold.ttf')})`),
      new FontFace('KMed', `url(${staticFile('fonts/MS-Medium.ttf')})`),
    ];
    Promise.all(faces.map((x) => x.load())).then((loaded) => {
      loaded.forEach((x) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(x));
      continueRender(handle);
    }).catch(() => continueRender(handle));
  }, [handle]);
};

// ---- Text ------------------------------------------------------------------------------------------
const Reveal: React.FC<{ t: number; out?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ t, out, style, children }) => {
  const frame = useCurrentFrame();
  const p = spring({ frame: frame - f(t), fps: FPS, durationInFrames: 20, config: { damping: 200 } });
  const o = out === undefined ? 1 : interpolate(frame, [f(out) - 9, f(out)], [1, 0], clamp);
  return (
    <span style={{ display: 'inline-block', opacity: p * o, transform: `translateY(${(1 - p) * 34}px)`, filter: `blur(${(1 - p) * 10}px)`, ...style }}>
      {children}
    </span>
  );
};

const Row: React.FC<{ top: number; size: number; font?: string; gap?: number; color?: string; children: React.ReactNode }> = ({ top, size, font = 'KBold', gap = 20, color = INK, children }) => (
  <div style={{ position: 'absolute', left: 40, right: 40, top, textAlign: 'center', fontFamily: font, fontSize: size, color, lineHeight: 1.08, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap, flexWrap: 'wrap' }}>
    {children}
  </div>
);

const Dot: React.FC<{ c: string; border?: boolean }> = ({ c, border }) => (
  <span style={{ display: 'inline-block', width: 28, height: 28, borderRadius: 14, background: c, marginRight: 12, border: border ? '2px solid #BFAE9C' : 'none', verticalAlign: -3 }} />
);

const Headlines: React.FC = () => {
  const frame = useCurrentFrame();
  const sp = interpolate(frame, [f(20.45), f(20.45) + 28], [0.7, 0.3], { easing: Easing.out(Easing.cubic), ...clamp });
  const bo = interpolate(frame, [f(20.45), f(20.45) + 20], [0, 1], clamp);
  return (
    <>
      <Row top={125} size={96}>
        <Reveal t={0.15} out={2.0}>Хорошие</Reveal>
        <Reveal t={0.6} out={2.0} style={{ color: TERRA }}>новости!</Reveal>
      </Row>
      <Row top={105} size={78}><Reveal t={2.4} out={5.45}>Тумба «Монро»</Reveal></Row>
      <Row top={205} size={78} color={TERRA}><Reveal t={4.3} out={5.45}>со скидкой</Reveal></Row>
      <Row top={92} size={56} font="KMed"><Reveal t={5.7} out={10.95}>Выбирайте свой цвет</Reveal></Row>
      <Row top={200} size={46} font="KMed" gap={34}>
        <Reveal t={7.1} out={10.95}><Dot c="#F4F1EA" border />белый</Reveal>
        <Reveal t={7.93} out={10.95}><Dot c="#4F6B5B" />зелёный</Reveal>
        <Reveal t={8.82} out={10.95}><Dot c="#8B8B90" />серый</Reveal>
        <Reveal t={9.78} out={10.95}><Dot c={TERRA} />терракотовый</Reveal>
      </Row>
      <Row top={92} size={56} font="KMed"><Reveal t={11.05} out={14.5}>Цена</Reveal></Row>
      <Row top={170} size={120} color={TERRA}><Reveal t={11.5} out={14.5}>от 26 500 ₸</Reveal></Row>
      <Row top={92} size={56} font="KMed"><Reveal t={14.5} out={18.45}>А в рассрочку</Reveal></Row>
      <Row top={170} size={108} color={TERRA}><Reveal t={15.5} out={18.45}>от 2 209 ₸</Reveal></Row>
      <Row top={300} size={44} font="KMed"><Reveal t={17.35} out={18.45}>в месяц · 12 месяцев</Reveal></Row>
      <Row top={105} size={74}>
        <Reveal t={18.65}>Заказывайте</Reveal>
        <Reveal t={19.15}>на</Reveal>
        <Reveal t={19.35} style={{ color: TERRA }}>Каспи</Reveal>
      </Row>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 215, textAlign: 'center', fontFamily: 'KBold', fontSize: 52, color: INK, opacity: bo, letterSpacing: `${sp}em`, paddingLeft: `${sp}em` }}>
        ART ROOM HOME
      </div>
    </>
  );
};

// ---- Phone screen ------------------------------------------------------------------------------------
const ScreenLayers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SWITCH.map((s, i) => {
        const o = i === 0 ? 1 : interpolate(frame, [f(s.t) - 2, f(s.t) + 5], [0, 1], clamp);
        return <Img key={i} src={staticFile(IMG[s.shot])} style={{ position: 'absolute', inset: 0, width: SW, height: SH, objectFit: 'cover', opacity: o }} />;
      })}
    </>
  );
};

const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const START: P = [0.78, 1.02];
  // piecewise path: move toward each tap during the 0.4 s before it
  let pos: P = START;
  for (let i = 0; i < TAPS.length; i++) {
    const prev: P = i === 0 ? START : TAPS[i - 1].pos;
    const t = TAPS[i].t;
    const k = interpolate(frame, [f(t) - 12, f(t)], [0, 1], { easing: Easing.inOut(Easing.cubic), ...clamp });
    if (frame >= f(t) - 12) pos = [prev[0] + (TAPS[i].pos[0] - prev[0]) * k, prev[1] + (TAPS[i].pos[1] - prev[1]) * k];
  }
  const first = f(TAPS[0].t) - 14, last = f(TAPS[TAPS.length - 1].t) + 12;
  const vis = interpolate(frame, [first, first + 8, last - 8, last], [0, 1, 1, 0], clamp);
  // the cursor also glides in for the first taps and leaves between 11.4 and 19.0
  const hide = interpolate(frame, [f(11.35), f(11.7), f(18.75), f(19.1)], [1, 0, 0, 1], clamp);
  let press = 1;
  TAPS.forEach((tp) => { press = Math.min(press, interpolate(frame, [f(tp.t) - 3, f(tp.t), f(tp.t) + 5], [1, 0.72, 1], clamp)); });
  return (
    <div style={{ position: 'absolute', left: pos[0] * SW - 32, top: pos[1] * SH - 32, width: 64, height: 64, borderRadius: 32, background: 'rgba(40,40,44,0.30)', border: '3px solid rgba(255,255,255,0.95)', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', transform: `scale(${press})`, opacity: vis * hide }} />
  );
};

const Ripples: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {TAPS.map((tp, i) => {
        const p = (frame - f(tp.t)) / (0.6 * FPS);
        if (p < 0 || p > 1) return null;
        return <div key={i} style={{ position: 'absolute', left: tp.pos[0] * SW - 60, top: tp.pos[1] * SH - 60, width: 120, height: 120, borderRadius: 60, border: '5px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.28)', transform: `scale(${0.35 + 1.3 * p})`, opacity: 0.85 * (1 - p) }} />;
      })}
    </>
  );
};

const Highlights: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {HIGHLIGHTS.map((h, i) => {
        const o = interpolate(frame, [f(h.t0), f(h.t0) + 8, f(h.t1) - 8, f(h.t1)], [0, 1, 1, 0], clamp);
        if (o <= 0) return null;
        const pulse = 1 + 0.018 * Math.sin(((frame - f(h.t0)) / FPS) * Math.PI * 3.2);
        const [x0, y0, x1, y1] = h.box;
        return <div key={i} style={{ position: 'absolute', left: x0 * SW, top: y0 * SH, width: (x1 - x0) * SW, height: (y1 - y0) * SH, borderRadius: 18, border: `6px solid ${TERRA}`, boxShadow: `0 0 0 5px rgba(255,255,255,0.75), 0 0 34px rgba(194,85,58,0.55)`, opacity: o, transform: `scale(${pulse})` }} />;
      })}
    </>
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const enter = spring({ frame: frame - 3, fps: FPS, config: { damping: 16, stiffness: 70 } });
  const y = (1 - enter) * 900 + Math.sin(t * 1.3) * 7;
  const ry = interpolate(t, [0, 12, 23], [-17, -11, -14]);
  const rx = 4 + Math.sin(t * 0.8) * 1.2;
  const rz = -2.2 + Math.sin(t * 0.6) * 0.5;
  return (
    <div style={{ position: 'absolute', left: (1080 - PW) / 2, top: 395, width: PW, height: PH, perspective: 2600, transform: `translateY(${y}px) scale(1.0)` }}>
      <div style={{ width: PW, height: PH, transform: `rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`, transformStyle: 'preserve-3d', filter: 'drop-shadow(0 60px 50px rgba(70,35,20,0.38))' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 100, background: 'linear-gradient(145deg,#4a4a50 0%,#1b1b1e 38%,#2d2d31 100%)', boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.12)' }} />
        <div style={{ position: 'absolute', left: BZ, top: BZ, width: SW, height: SH, borderRadius: 78, overflow: 'hidden', background: '#fff' }}>
          <ScreenLayers />
          <Highlights />
          <Ripples />
          <Cursor />
          <div style={{ position: 'absolute', left: SW / 2 - 85, top: 16, width: 170, height: 46, borderRadius: 23, background: '#0b0b0c' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 32%)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
};

const Background: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(165deg,#F6EDE2 0%,#EBD7C3 48%,#D9A388 100%)' }}>
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: 450, left: -240 + Math.sin(t * 0.5) * 40, top: 1000, background: 'radial-gradient(circle, rgba(255,255,255,0.65), rgba(255,255,255,0) 70%)' }} />
      <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: 400, right: -260 + Math.cos(t * 0.45) * 40, top: 300, background: 'radial-gradient(circle, rgba(194,85,58,0.25), rgba(194,85,58,0) 70%)' }} />
    </AbsoluteFill>
  );
};

export const Kaspi: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Background />
      <Headlines />
      <Phone />
    </AbsoluteFill>
  );
};
