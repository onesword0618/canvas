/**
 * Domain Process Test.
 *
 * Copyright (c) 2021.
 * Kenichi Inoue.
 */

import { readFileSync } from 'fs';
import { pack } from '../src/packer';

const fixturesFiles = {
  icon16 : 'ico-16x16.png',
  icon32 : 'ico-32x32.png'
}

const png = {
  iconDirHeaderSize: 6,
  iconDirEntrySize: 16,
};

const files = (pngs: string[]) => {
  const fixtures: Buffer[] = [];
  pngs.forEach((file) => {
    fixtures.push(readFileSync(`fixtures/${file}`))
  })
  return fixtures;
}

type PngFileProperty = {
  width: number;
  imageData: Buffer;
}

const pngFiles = (buffer:Buffer) :PngFileProperty[] => (
  [...Array(buffer.readUInt16LE(4))].map((_:number, index:number) => {
    const offset = png.iconDirHeaderSize + index * png.iconDirEntrySize;
    const width = buffer.readUInt8(offset + 0);
    const imageDataOffset = buffer.readUInt32LE(offset + 12);
    const imageData = buffer.slice(imageDataOffset, imageDataOffset + buffer.readUInt32LE(offset + 8));
    return { width, imageData };
  })
);

describe(`Small PNG image dimensions correctly.`,() => {
  test(`ICO file include ${fixturesFiles.icon16}.`, () => {
    const pngs = files([fixturesFiles.icon16]);
    const ico = pack(pngs);
    const result:PngFileProperty[] = pngFiles(ico);
    expect(result[0].width).toEqual(16);
  });

  test(`ICO file include ${fixturesFiles.icon32}.`, () => {
    const pngs = files([fixturesFiles.icon32]);
    const ico = pack(pngs);
    const result:PngFileProperty[] = pngFiles(ico);
    expect(result[0].width).toEqual(32);
  });

  test(`ICO file include ${fixturesFiles.icon16}, ${fixturesFiles.icon32}.`, () => {
    const pngs = files([fixturesFiles.icon16, fixturesFiles.icon32]);
    const ico = pack(pngs);
    const result:PngFileProperty[] = pngFiles(ico);
    expect(result.map((intoPng) => intoPng.width)).toEqual(expect.arrayContaining([16,32]));
  });
});