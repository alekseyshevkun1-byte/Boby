import React from 'react';
import {
  AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame,
} from 'remotion';

export const FPS = 30;
export const TOTAL = 22.5;
const f = (t: number) => Math.round(t * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const INK = '#2A1D18';
const TERRA = '#C2553A';
const BG_TOP = '#F6EDE2';

// ---- Phone geometry -----------------------------------------------------------------------------
const SW = 640;
const SH = Math.round((SW * 2796) / 1290);
const BZ = 22;
const PW = SW + BZ * 2, PH = SH + BZ * 2;
const PL = (1080 - PW) / 2, PT = 395;   // phone position on the canvas

type Shot = 'white' | 'green' | 'gray' | 'terra';
const IMG: Record<Shot, string> = { white: 's_white.png', green: 's_green.png', gray: 's_gray.png', terra: 's_terra.png' };
const ORDER: Shot[] = ['white', 'green', 'gray', 'terra'];
type P = [number, number];
const THUMB: Record<Shot, P> = { white: [0.117, 0.759], green: [0.295, 0.759], gray: [0.472, 0.759], terra: [0.648, 0.759] };
const BUY: P = [0.262, 0.87];

// ---- Voice timing (seconds), take 2 ------------------------------------------------------------
const SWITCH: { t: number; shot: Shot }[] = [
  { t: 0, shot: 'white' }, { t: 7.9, shot: 'green' }, { t: 8.72, shot: 'gray' }, { t: 9.66, shot: 'terra' }, { t: 10.88, shot: 'white' },
];
const TAPS: { t: number; pos: P; size: number }[] = [
  { t: 7.84, pos: THUMB.green, size: 150 }, { t: 8.66, pos: THUMB.gray, size: 150 }, { t: 9.6, pos: THUMB.terra, size: 150 },
  { t: 10.82, pos: THUMB.white, size: 150 }, { t: 19.2, pos: BUY, size: 260 },
];
const HIGHLIGHTS: { box: [number, number, number, number]; t0: number; t1: number }[] = [
  { box: [0.035, 0.592, 0.265, 0.622], t0: 4.35, t1: 5.7 },
  { box: [0.03, 0.626, 0.5, 0.666], t0: 11.75, t1: 14.2 },
  { box: [0.035, 0.668, 0.59, 0.709], t0: 15.1, t1: 18.2 },
  { box: [0.04, 0.84, 0.485, 0.9], t0: 18.55, t1: 20.3 },
  { box: [0.27, 0.066, 0.6, 0.117], t0: 20.3, t1: 21.9 },
];
// camera: scale and focus point on the screen (ratios)
const CAM: { t: number; s: number; fx: number; fy: number }[] = [
  { t: 0, s: 1, fx: 0.5, fy: 0.5 }, { t: 3.8, s: 1, fx: 0.5, fy: 0.5 },
  { t: 4.3, s: 1.35, fx: 0.22, fy: 0.605 }, { t: 5.7, s: 1.35, fx: 0.22, fy: 0.605 },
  { t: 6.8, s: 1.4, fx: 0.4, fy: 0.74 }, { t: 10.5, s: 1.4, fx: 0.4, fy: 0.74 },
  { t: 11.2, s: 1.4, fx: 0.27, fy: 0.655 }, { t: 14.1, s: 1.4, fx: 0.27, fy: 0.655 },
  { t: 14.7, s: 1.4, fx: 0.32, fy: 0.69 }, { t: 18.1, s: 1.4, fx: 0.32, fy: 0.69 },
  { t: 18.55, s: 1.4, fx: 0.27, fy: 0.865 }, { t: 20.0, s: 1.4, fx: 0.27, fy: 0.865 },
  { t: 20.5, s: 1.3, fx: 0.43, fy: 0.12 }, { t: 21.7, s: 1.3, fx: 0.43, fy: 0.12 },
  { t: 22.4, s: 1, fx: 0.5, fy: 0.5 }, { t: 22.5, s: 1, fx: 0.5, fy: 0.5 },
];
const SMAX = 1.4;

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
  const sp = interpolate(frame, [f(20.2), f(20.2) + 28], [0.7, 0.3], { easing: Easing.out(Easing.cubic), ...clamp });
  const bo = interpolate(frame, [f(20.2), f(20.2) + 20, f(21.9), f(22.3)], [0, 1, 1, 0], clamp);
  return (
    <>
      {/* soft cover so that the zoomed phone never fights with the headlines */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 420, background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_TOP} 72%, rgba(246,237,226,0) 100%)` }} />
      <Row top={125} size={96}>
        <Reveal t={0.15} out={1.95}>Хорошие</Reveal>
        <Reveal t={0.6} out={1.95} style={{ color: TERRA }}>новости!</Reveal>
      </Row>
      <Row top={105} size={78}><Reveal t={2.3} out={5.6}>Тумба «Монро»</Reveal></Row>
      <Row top={205} size={78} color={TERRA}><Reveal t={4.4} out={5.6}>со скидкой</Reveal></Row>
      <Row top={92} size={56} font="KMed"><Reveal t={5.7} out={10.95}>Выбирайте свой цвет</Reveal></Row>
      <Row top={200} size={46} font="KMed" gap={34}>
        <Reveal t={7.12} out={10.95}><Dot c="#F4F1EA" border />белый</Reveal>
        <Reveal t={7.88} out={10.95}><Dot c="#4F6B5B" />зелёный</Reveal>
        <Reveal t={8.7} out={10.95}><Dot c="#8B8B90" />серый</Reveal>
        <Reveal t={9.68} out={10.95}><Dot c={TERRA} />терракотовый</Reveal>
      </Row>
      <Row top={92} size={56} font="KMed"><Reveal t={10.95} out={14.3}>Цена</Reveal></Row>
      <Row top={170} size={120} color={TERRA}><Reveal t={11.5} out={14.3}>от 26 500 ₸</Reveal></Row>
      <Row top={92} size={56} font="KMed"><Reveal t={14.3} out={18.3}>А в рассрочку</Reveal></Row>
      <Row top={170} size={108} color={TERRA}><Reveal t={15.3} out={18.3}>от 2 209 ₸</Reveal></Row>
      <Row top={300} size={44} font="KMed"><Reveal t={17.3} out={18.3}>в месяц · 12 месяцев</Reveal></Row>
      <Row top={105} size={74}>
        <Reveal t={18.4} out={22.2}>Заказывайте</Reveal>
        <Reveal t={18.9} out={22.2}>на</Reveal>
        <Reveal t={19.1} out={22.2} style={{ color: TERRA }}>Каспи</Reveal>
      </Row>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 215, textAlign: 'center', fontFamily: 'KBold', fontSize: 52, color: INK, opacity: bo, letterSpacing: `${sp}em`, paddingLeft: `${sp}em` }}>
        ART ROOM HOME
      </div>
    </>
  );
};

// ---- Phone screen: region-wise transitions like in the real app ------------------------------------------
const ease = (x: number) => Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, x)));

const useSwitchState = () => {
  const frame = useCurrentFrame();
  let idx = 0;
  SWITCH.forEach((s, i) => { if (frame >= f(s.t)) idx = i; });
  const a = idx > 0 ? SWITCH[idx - 1].shot : SWITCH[0].shot;
  const b = SWITCH[idx].shot;
  const raw = idx === 0 ? 1 : (frame - f(SWITCH[idx].t)) / (0.34 * FPS);
  return { a, b, p: ease(raw), done: raw >= 1, dir: ORDER.indexOf(b) >= ORDER.indexOf(a) ? 1 : -1 };
};

const Region: React.FC<{ y0: number; y1: number; mode: 'slide' | 'fade'; a: Shot; b: Shot; p: number; dir: number }> = ({ y0, y1, mode, a, b, p, dir }) => {
  const layer = (shot: Shot, style: React.CSSProperties) => (
    <Img src={staticFile(IMG[shot])} style={{ position: 'absolute', left: 0, top: -y0 * SH, width: SW, height: SH, ...style }} />
  );
  return (
    <div style={{ position: 'absolute', left: 0, top: y0 * SH, width: SW, height: (y1 - y0) * SH, overflow: 'hidden' }}>
      {mode === 'slide' ? (
        <>
          {layer(a, { transform: `translateX(${-dir * p * SW}px)` })}
          {layer(b, { transform: `translateX(${dir * (1 - p) * SW}px)` })}
        </>
      ) : (
        <>
          {layer(a, { opacity: 1 - p })}
          {layer(b, { opacity: p, transform: `translateY(${(1 - p) * 16}px)` })}
        </>
      )}
    </div>
  );
};

const ScreenLayers: React.FC = () => {
  const { a, b, p, dir } = useSwitchState();
  return (
    <>
      <Img src={staticFile(IMG.white)} style={{ position: 'absolute', inset: 0, width: SW, height: SH }} />
      <Region y0={0.178} y1={0.535} mode="slide" a={a} b={b} p={p} dir={dir} />
      <Region y0={0.535} y1={0.905} mode="fade" a={a} b={b} p={p} dir={dir} />
    </>
  );
};

// ---- Touch feedback ---------------------------------------------------------------------------------------
const Cursor: React.FC = () => {
  const frame = useCurrentFrame();
  const START: P = [0.8, 1.04];
  let pos: P = START;
  for (let i = 0; i < TAPS.length; i++) {
    const prev: P = i === 0 ? START : TAPS[i - 1].pos;
    const t = TAPS[i].t;
    const k = interpolate(frame, [f(t) - 14, f(t)], [0, 1], { easing: Easing.inOut(Easing.cubic), ...clamp });
    if (frame >= f(t) - 14) pos = [prev[0] + (TAPS[i].pos[0] - prev[0]) * k, prev[1] + (TAPS[i].pos[1] - prev[1]) * k];
  }
  const vis = interpolate(frame, [f(7.2), f(7.6), f(11.1), f(11.5), f(18.7), f(18.95), f(19.8), f(20.1)], [0, 1, 1, 0, 0, 1, 1, 0], clamp);
  let press = 1;
  TAPS.forEach((tp) => { press = Math.min(press, interpolate(frame, [f(tp.t) - 4, f(tp.t), f(tp.t) + 6], [1, 0.7, 1], clamp)); });
  return (
    <div style={{ position: 'absolute', left: pos[0] * SW - 44, top: pos[1] * SH - 44, width: 88, height: 88, opacity: vis, transform: `scale(${press})` }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 44, background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(235,235,240,0.75) 55%, rgba(60,60,70,0.25) 100%)', border: '3px solid rgba(255,255,255,0.98)', boxShadow: '0 10px 26px rgba(0,0,0,0.35)' }} />
      <div style={{ position: 'absolute', left: 33, top: 33, width: 22, height: 22, borderRadius: 11, background: 'rgba(40,40,48,0.5)' }} />
    </div>
  );
};

const Ripples: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {TAPS.map((tp, i) => {
        const base = frame - f(tp.t);
        if (base < -2 || base > 26) return null;
        const press = interpolate(base, [-2, 0, 10], [0, 0.22, 0], clamp);
        const ring = (delay: number, w: number) => {
          const p = (base - delay) / 20;
          if (p < 0 || p > 1) return null;
          return <div style={{ position: 'absolute', left: tp.pos[0] * SW - 70, top: tp.pos[1] * SH - 70, width: 140, height: 140, borderRadius: 70, border: `${w}px solid rgba(255,255,255,0.95)`, boxShadow: '0 0 0 2px rgba(194,85,58,0.35)', transform: `scale(${0.35 + 1.5 * p})`, opacity: 0.9 * (1 - p) }} />;
        };
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: tp.pos[0] * SW - tp.size / 2, top: tp.pos[1] * SH - (tp.size > 200 ? 46 : tp.size / 2), width: tp.size, height: tp.size > 200 ? 92 : tp.size, borderRadius: tp.size > 200 ? 18 : 28, background: `rgba(30,20,10,${press})` }} />
            {ring(0, 6)}
            {ring(5, 4)}
          </React.Fragment>
        );
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
        const pulse = 1 + 0.022 * Math.sin(((frame - f(h.t0)) / FPS) * Math.PI * 3.4);
        const [x0, y0, x1, y1] = h.box;
        return <div key={i} style={{ position: 'absolute', left: x0 * SW, top: y0 * SH, width: (x1 - x0) * SW, height: (y1 - y0) * SH, borderRadius: 18, border: `6px solid ${TERRA}`, boxShadow: '0 0 0 5px rgba(255,255,255,0.75), 0 0 34px rgba(194,85,58,0.55)', opacity: o, transform: `scale(${pulse})` }} />;
      })}
    </>
  );
};

// ---- Camera ---------------------------------------------------------------------------------------------------
const useCamera = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1].t) i++;
  const A = CAM[i], B = CAM[i + 1];
  const k = ease((t - A.t) / Math.max(0.001, B.t - A.t));
  return { s: A.s + (B.s - A.s) * k, fx: A.fx + (B.fx - A.fx) * k, fy: A.fy + (B.fy - A.fy) * k };
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = useCamera();
  const w = Math.min(1, Math.max(0, (cam.s - 1) / (SMAX - 1)));
  const enter = spring({ frame: frame - 3, fps: FPS, config: { damping: 16, stiffness: 70 } });
  // little bounce when the finger touches the screen
  let bounce = 0;
  TAPS.forEach((tp) => { bounce += interpolate(frame, [f(tp.t), f(tp.t) + 4, f(tp.t) + 12], [0, 7, 0], clamp); });
  const exit = ease((t - 21.75) / 0.7);
  const y = (1 - enter) * 1500 + exit * 1500 + Math.sin(t * 1.3) * 7 + bounce;
  const ry = interpolate(t, [0, 12, 22.5], [-17, -11, -14]) * (1 - 0.8 * w);
  const rx = (4 + Math.sin(t * 0.8) * 1.2) * (1 - 0.7 * w);
  const rz = (-2.2 + Math.sin(t * 0.6) * 0.5) * (1 - 0.8 * w);
  // camera: bring the focus point (screen ratio) to a fixed target
  const Fx = PL + BZ + cam.fx * SW, Fy = PT + BZ + cam.fy * SH;
  const tx = (Fx - cam.s * Fx) + w * (540 - Fx);
  const ty = (Fy - cam.s * Fy) + w * (1010 - Fy);
  const glare = interpolate(((t * 0.18) % 1), [0, 1], [-60, 160]);
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${cam.s})` }}>
      <div style={{ position: 'absolute', left: PL, top: PT, width: PW, height: PH, perspective: 2600, transform: `translateY(${y}px)` }}>
        <div style={{ width: PW, height: PH, transform: `rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`, transformStyle: 'preserve-3d', filter: 'drop-shadow(0 60px 50px rgba(70,35,20,0.38))' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 100, background: 'linear-gradient(145deg,#4a4a50 0%,#1b1b1e 38%,#2d2d31 100%)', boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.12)' }} />
          <div style={{ position: 'absolute', left: BZ, top: BZ, width: SW, height: SH, borderRadius: 78, overflow: 'hidden', background: '#fff' }}>
            <ScreenLayers />
            <Highlights />
            <Ripples />
            <Cursor />
            <div style={{ position: 'absolute', left: SW / 2 - 85, top: 16, width: 170, height: 46, borderRadius: 23, background: '#0b0b0c' }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${glare - 22}%, rgba(255,255,255,0.18) ${glare}%, rgba(255,255,255,0) ${glare + 22}%)`, pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Background: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const W2 = 2 * Math.PI;
  const orbs = Array.from({ length: 12 }, (_, i) => {
    const sx = (i * 197) % 1080, sy = (i * 331) % 1920;
    const r = 40 + (i % 4) * 34;
    const k = 1 + (i % 3), n = 1 + (i % 2);
    return { x: sx + Math.sin((W2 * k * t) / TOTAL + i) * 60, y: ((((sy - n * 2000 * (t / TOTAL)) % 2000) + 2000) % 2000) - 40, r, o: 0.12 + (i % 3) * 0.05 };
  });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(165deg,${BG_TOP} 0%,#EBD7C3 48%,#D9A388 100%)` }}>
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: 450, left: -240 + Math.sin((W2 * t) / TOTAL) * 60, top: 1000, background: 'radial-gradient(circle, rgba(255,255,255,0.65), rgba(255,255,255,0) 70%)' }} />
      <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: 400, right: -260 + Math.cos((W2 * t) / TOTAL) * 60, top: 300, background: 'radial-gradient(circle, rgba(194,85,58,0.28), rgba(194,85,58,0) 70%)' }} />
      {orbs.map((o, i) => (
        <div key={i} style={{ position: 'absolute', left: o.x - o.r, top: o.y - o.r, width: o.r * 2, height: o.r * 2, borderRadius: o.r, background: `radial-gradient(circle, rgba(255,255,255,${o.o + 0.15}), rgba(255,255,255,0) 70%)` }} />
      ))}
    </AbsoluteFill>
  );
};

export const Kaspi: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Background />
      <Phone />
      <Headlines />
    </AbsoluteFill>
  );
};
