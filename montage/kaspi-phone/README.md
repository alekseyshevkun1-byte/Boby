# Ролик «Тумба Монро»: телефон со страницей Каспи (Remotion)

23 с, 1080×1920, 30 fps. Экран телефона собран из 4 скриншотов Каспи (белый, зелёный, серый, терракотовый), цены и рассрочка как на скриншотах. Тайминги касаний и титров привязаны к голосу (секунды в `src/Kaspi.tsx`).

В `public/` положить: `s_white.png s_green.png s_gray.png s_terra.png` (скриншоты) и `fonts/MS-Bold.ttf`, `fonts/MS-Medium.ttf` (Montserrat с кириллицей).
Рендер: `npx remotion render src/index.ts Kaspi out/kaspi_silent.mp4 --codec=h264 --crf=16`; звук (голос + мелодия) накладывается ffmpeg.
