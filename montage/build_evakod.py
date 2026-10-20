#!/usr/bin/env python3
"""Assemble the Evakod x 23 Skin Lab Reels ad.
Usage: build.py <workdir> <out.mp4>
workdir must contain c1.mp4 c2.mp4 c3a.mp4 c3b.mp4 c3c.mp4 c3d.mp4 c4.mp4 c5.mp4 c6.mp4,
voice.mp3, music_bed.wav, logo_ec.png"""
import subprocess, sys, os

W, H, FPS = 1080, 1920, 30
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf'
CLIPS = ['c1', 'c2', 'c3a', 'c3b', 'c3c', 'c3d', 'c4', 'c5', 'c6']
# visible length of each plan (s), sum ~ voice length 27.25
D = [5.8, 4.8, 1.1, 1.1, 1.1, 1.1, 6.0, 3.2, 3.1]
# crossfade after each plan (s); short hard-ish cuts inside the product block
T = [0.25, 0.25, 0.06, 0.06, 0.06, 0.25, 0.25, 0.25, 0.0]
CLIP_LEN = 5.0

work, out = sys.argv[1], sys.argv[2]
total = sum(D)
inputs, fc = [], []
for i, name in enumerate(CLIPS):
    inputs += ['-i', os.path.join(work, name + '.mp4')]
inputs += ['-i', os.path.join(work, 'voice.mp3'), '-i', os.path.join(work, 'music_bed.wav'),
           '-loop', '1', '-t', f'{total:.2f}', '-i', os.path.join(work, 'logo_ec.png')]
n = len(CLIPS); VOICE, MUSIC, LOGO = n, n + 1, n + 2

for i in range(n):
    L = D[i] + T[i]
    base = (f'[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,'
            f'fps={FPS},eq=saturation=1.04:contrast=1.02')
    if L <= CLIP_LEN:
        fc.append(f'{base},trim=duration={L:.3f},setpts=PTS-STARTPTS[v{i}]')
    else:  # slow down slightly to fill the plan
        k = L / CLIP_LEN
        fc.append(f'{base},setpts=PTS*{k:.4f},trim=duration={L:.3f},setpts=PTS-STARTPTS[v{i}]')

cur, start = 'v0', D[0]
for i in range(1, n):
    t = T[i - 1]
    if t <= 0:
        continue
    fc.append(f'[{cur}][v{i}]xfade=transition=fade:duration={t}:offset={start:.3f}[x{i}]')
    cur = f'x{i}'; start += D[i]
vid = cur

def txt(name, s):
    p = os.path.join(work, name); open(p, 'w', encoding='utf-8').write(s); return p

def dtext(f, size, y, t0, t1, color='0xF6EBD9'):
    a = (f"if(lt(t,{t0}),0,if(lt(t,{t0+0.4}),(t-{t0})/0.4,if(lt(t,{t1-0.4}),1,max(0,({t1}-t)/0.4))))")
    return (f"drawtext=fontfile={FONT}:textfile={f}:fontsize={size}:fontcolor={color}:"
            f"alpha='{a}':x=(w-text_w)/2:y={y}:shadowcolor=black@0.35:shadowx=2:shadowy=2")

t_title = txt('t_title.txt', '23 Skin Lab  ·  7 средств')
t_cta = txt('t_cta.txt', 'Подарите ей сияние')
t_brand = txt('t_brand.txt', 'Евакод')
S2 = D[0] + 0.5; E2 = S2 + 3.6        # title over plan 2
S6 = total - D[-1] + 0.2               # final card
fc.append(f'[{vid}]' + ','.join([
    dtext(t_title, 46, H - 430, S2, E2),
    dtext(t_cta, 72, 690, S6, total + 0.5),
    dtext(t_brand, 56, 800, S6 + 0.3, total + 0.5, '0xE8C57A'),
]) + '[vt]')
fc.append(f'[{LOGO}:v]scale=300:300,format=rgba,fade=t=in:st={S6:.2f}:d=0.6:alpha=1[lg]')
fc.append(f'[vt][lg]overlay=x=(W-w)/2:y=330:shortest=1[vout]')
fc.append(f'[{VOICE}:a]volume=1.0,apad[va]')
fc.append(f'[{MUSIC}:a]volume=0.28[ma]')
fc.append(f'[va][ma]amix=inputs=2:duration=longest:normalize=0,atrim=duration={total:.2f},loudnorm=I=-16:TP=-1.5:LRA=11[aout]')

cmd = ['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fc),
       '-map', '[vout]', '-map', '[aout]', '-t', f'{total:.2f}',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
       '-r', str(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]
print(' '.join(cmd[:6]), '...')
subprocess.run(cmd, check=True)
print('done', out)
