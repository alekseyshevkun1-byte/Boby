import React from 'react';
import { Composition } from 'remotion';
import { Kaspi, FPS, TOTAL } from './Kaspi';

export const Root: React.FC = () => (
  <Composition id="Kaspi" component={Kaspi} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} />
);
