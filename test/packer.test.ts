/**
 * Domain Process Test.
 *
 * Copyright (c) 2021.
 * Kenichi Inoue.
 */

import { readFileSync } from 'fs';
import { pack } from '../src/packer';

const fixtureFiles = {
  icon16 : 'ico-16x16.png',
  icon32 : 'ico-32x32.png',
  icon48 : 'ico-48x48.png',
  icon128 : 'ico-128x128.png',
  icon256 : 'ico-256x256.png',
  icon290 : 'ico-290x290.png',
  rectangle : 'rectangle.png',
  type3 : 'ico-128x128-type.png',
  gif : 'sample.gif',
  empty: '',
}

const png = {
  iconDirHeaderSize: 6,
  iconDirEntrySize: 16,
};

const fixtures = (pngs: string[]) => {
  const files: Buffer[] = [];
  pngs.forEach((file) => {
    files.push(readFileSync(`fixtures/${file}`))
  })
  return files;
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

describe(`PNG images dimensions correctly.`,() => {
  test(`The ICO file must contain a PNG image of width ${fixtureFiles.icon16}.`, () => {
    const sut = pack(fixtures([fixtureFiles.icon16]));
    const actual:PngFileProperty[] = pngFiles(sut);
    expect(actual[0].width).toEqual(16);
  });

  test(`The ICO file must contain a PNG image of width ${fixtureFiles.icon32}.`, () => {
    const sut = pack(fixtures([fixtureFiles.icon32]));
    const actual:PngFileProperty[] = pngFiles(sut);
    expect(actual[0].width).toEqual(32);
  });

  test(`The ICO file must contain a PNG image of width ${fixtureFiles.icon48}.`, () => {
    const sut = pack(fixtures([fixtureFiles.icon48]));
    const actual:PngFileProperty[] = pngFiles(sut);
    expect(actual[0].width).toEqual(48);
  });

  test(`The ICO file must contain a PNG image of width ${fixtureFiles.icon128}.`, () => {
    const sut = pack(fixtures([fixtureFiles.icon128]));
    const actual:PngFileProperty[] = pngFiles(sut);
    expect(actual[0].width).toEqual(128);
  });

  test(`The ICO file must contain a PNG image of width ${fixtureFiles.icon256}.`, () => {;
    const sut = pack(fixtures([fixtureFiles.icon256]));
    const actual:PngFileProperty[] = pngFiles(sut);
    expect(actual[0].width).toEqual(0);
  });

  test(`The ICO file should contain PNG images of width ${fixtureFiles.icon16} and width ${fixtureFiles.icon32}.`, () => {
    const sut = pack(fixtures([fixtureFiles.icon16, fixtureFiles.icon32]));
    const actual:PngFileProperty[] = pngFiles(sut);
    expect(actual.map((intoPng) => intoPng.width)).toEqual(expect.arrayContaining([16,32]));
  });
});

describe(`If the target image cannot be processed.`,() => {
  test(`If a gif image is specified, ${fixtureFiles.gif}.`, () => {
    const gif = fixtures([fixtureFiles.gif]);
    const actual = Buffer.from(gif[0]).slice(0,8);
    expect(() => {pack(gif)}).toThrowError(Error(`Images must be in PNG format : ${actual}`));
  });

  test(`If a rectangular image is specified, ${fixtureFiles.rectangle}.`, () => {
    const rectangle = fixtures([fixtureFiles.rectangle]);
    expect(() => {pack(rectangle)}).toThrowError(Error(`Images must be square. this image size [ witdth: 773 , height: 1105 ]`));
  });

  test(`If you want to specify an image with a width of 290, ${fixtureFiles.icon290}.`, () => {
    const icon290 = fixtures([fixtureFiles.icon290]);
    expect(() => {pack(icon290)}).toThrowError(Error(`Images must be smaller than 256px. current size 290`));
  });

  test(`If you specify an image that is not 32bpp, ${fixtureFiles.type3}.`, () => {
    const type3 = fixtures([fixtureFiles.type3]);
    expect(() => {pack(type3)}).toThrowError(Error(`Images must be truecolor with alpha 3`));
  });

  test(`If an empty image is specified, empty file.`, () => {
    expect(() => {pack(fixtures([fixtureFiles.empty]))}).toThrowError(Error(`EISDIR: illegal operation on a directory, read`));
  });
});