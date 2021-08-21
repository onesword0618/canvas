/**
 * Main Process function.
 *
 * From SVG file to create ICO file containg PNG images.
 *
 * Copyright (c) 2021.
 * Kenichi Inoue.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { pack } from './packer';

const makeDirectory = (): string => {
  const date = new Date();
  const executeDate = date
    .getFullYear()
    .toString()
    .concat(
      date.getMonth().toString(),
      date.getDate().toString(),
      date.getHours().toString(),
      date.getMinutes().toString(),
    );
  const directory = join(process.cwd(), executeDate);
  mkdirSync(directory);
  return directory;
};

const definePngFileProperty = (input: string, directory: string) => {
  const pixels = [16, 32, 48, 128];
  const pngNames = pixels.map((pixel) => join(directory, `ico-${pixel}x${pixel}.png`));
  const pngFiles = pngNames.map((name, index) => ({
    sourceSVGFilePath: input,
    outputFilePath: `${name}`,
    size: pixels[index],
  }));

  return pngFiles;
};

const createPngFile = async (
  definePngFiles: {
    sourceSVGFilePath: string;
    outputFilePath: string;
    size: number;
  }[],
) => {
  const createFiles = [];
  // TODO Heavy Loop ...
  // Reference : https://eslint.org/docs/rules/no-restricted-syntax
  // eslint-disable-next-line no-restricted-syntax
  for (const file of definePngFiles) {
    createFiles.push(
      sharp(file.sourceSVGFilePath)
        .resize({ width: file.size, height: file.size })
        .png({quality: 100})
        .toFile(file.outputFilePath)
        .catch((error) => error),
    );
  }
  await Promise.all(createFiles);
};

const packingIco = async (
  definePngFiles: {
    sourceSVGFilePath: string;
    outputFilePath: string;
    size: number;
  }[],
  directory: string,
) => {
  const ico: Buffer[] = [];
  definePngFiles.forEach((definePngFile) => {
    ico.push(readFileSync(definePngFile.outputFilePath));
  });

  writeFileSync(join(directory, `favicon.ico`), pack(ico));
};

/**
 * Convert SVG File to ICO File.
 *
 * @param inputSVGPath input SVG File Path.
 */
export async function canvas(inputSVGPath: string): Promise<void> {
  const outPutDirectory = makeDirectory();
  const definePngFiles = definePngFileProperty(inputSVGPath, outPutDirectory);

  await createPngFile(definePngFiles);
  packingIco(definePngFiles, outPutDirectory);
}
