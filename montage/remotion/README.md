# Remotion-монтаж ролика Евакод × 23 Skin Lab

Сборка: 27,3 с, 1080×1920, 30 fps. Анимированные титры и логотип, переходы привязаны к словам голоса (секунды в `src/Evakod.tsx`).

Запуск (в папке с этим проектом):
1. `npm install remotion@4 @remotion/cli@4 react@18 react-dom@18 typescript@5 @types/react@18`
2. Положить в `public/`: клипы `c1.mp4 c2.mp4 c3a.mp4 c3b.mp4 c3c.mp4 c3d.mp4 c4.mp4 c5.mp4 c6.mp4`, `logo_ec.png`, шрифты `fonts/MS-Medium.ttf` (Montserrat Medium) и `fonts/CG-SemiBold.ttf` (Cormorant Garamond SemiBold, оба с кириллицей).
3. `npx remotion render src/index.ts Evakod out/evakod_silent.mp4 --codec=h264 --crf=16`
4. Звук: голос + музыка накладываются ffmpeg (в Remotion видео без звука):
   `ffmpeg -i out/evakod_silent.mp4 -i voice.mp3 -i music_bed.wav -filter_complex "[1:a]volume=1.0,apad[va];[2:a]volume=0.55[ma];[va][ma]amix=inputs=2:duration=longest:normalize=0,atrim=duration=27.3,loudnorm=I=-16:TP=-1.5:LRA=11[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -t 27.3 final.mp4`

Клипы и голос: ссылки в `evacod_montage_brief.md`.
