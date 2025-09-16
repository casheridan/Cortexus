import { nanoid } from '@reduxjs/toolkit';
import type { LineConfig } from '../features/lineConfiguration/types';

const sampleLine = (name = 'SMT Line A'): LineConfig => ({
  id: nanoid(8),
  name,
  machines: [
    {
      id: nanoid(8),
      name: 'Pick & Place 1',
      type: 'JUKI LX-8',
      x: 120,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.10', port: 1883, topic: 'cfx/line-a/pnp1' },
      params: { feederCount: '8', lane: '1' },
    },
    {
      id: nanoid(8),
      name: 'SPI',
      type: 'CyberOptics',
      x: 420,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.11', port: 1883, topic: 'cfx/line-a/spi' },
      params: { threshold: '0.85' },
    },
    {
      id: nanoid(8),
      name: 'Reflow',
      type: 'Ersa Hotflow 3',
      x: 720,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.12', port: 1883, topic: 'cfx/line-a/reflow' },
      params: { zones: '8' },
    },
    {
      id: nanoid(8),
      name: 'AOI',
      type: 'CyberOptics AOI',
      x: 1020,
      y: 160,
      imageUrl: '',
      cfx: { host: '10.0.0.13', port: 1883, topic: 'cfx/line-a/aoi' },
      params: { passMark: '99.0' },
    },
  ],
  connections: [],
});

export const initialLines: LineConfig[] = [
  sampleLine('SMT Line A'),
  sampleLine('SMT Line B'),
];
