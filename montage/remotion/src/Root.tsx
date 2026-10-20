import React from 'react';
import { Composition } from 'remotion';
import { Evakod, FPS, TOTAL } from './Evakod';

export const Root: React.FC = () => (
  <Composition id="Evakod" component={Evakod} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} />
);
