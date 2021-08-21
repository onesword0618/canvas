/**
 * Domain Process function.
 *
 * PNG images to create ICO file Buffer.
 *
 * Copyright (c) 2021.
 * Kenichi Inoue.
 */

const png = {
  iconDirHeaderSize: 6,
  iconDirEntrySize: 16,
  header: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
};

const iconDirHeader = (buffers: Buffer[]) => {
  const allocate = Buffer.alloc(png.iconDirHeaderSize);
  allocate.writeUInt16LE(0, 0);
  allocate.writeUInt16LE(2, 2);
  allocate.writeUInt16LE(buffers.length, 4);
  return allocate;
};

const arrayLength = (callbackNumber: number, buffer: Buffer): number => callbackNumber + buffer.length;

function iconDirEntry(bufferMemory: Buffer, index: number, buffers: Buffer[]) {
  if (!bufferMemory.slice(0, 8).equals(png.header)) {
    const currentMemory = bufferMemory.slice(0, 8);
    throw new Error(`Images must be in PNG format : ${currentMemory}`);
  }

  const ihdr = (buffer: Buffer) => [buffer.readUInt32BE(16), buffer.readUInt32BE(20), buffer.readUInt8(25)];

  const [width, height, colorType] = ihdr(bufferMemory);

  if (width !== height) {
    throw new Error(`Images must be square. this image size [ witdth: ${width} , height: ${height} ]`);
  }

  if (width > 256) {
    throw new Error(`Images must be smaller than 256px. current size ${width}`);
  }

  const dimensions = width === 256 ? 0 : width;

  // https://www.w3.org/TR/PNG-DataRep.html#DR.Alpha-channel
  if (colorType !== 6) {
    throw new Error(`Images must be truecolor with alpha ${colorType}`);
  }

  const icoOffset =
    png.iconDirHeaderSize + png.iconDirEntrySize * buffers.length + buffers.slice(0, index).reduce(arrayLength, 0);

  const allocate = Buffer.alloc(png.iconDirEntrySize);
  allocate.writeUInt8(dimensions, 0);
  allocate.writeUInt8(dimensions, 1);
  allocate.writeUInt8(0, 2);
  allocate.writeUInt8(0, 3);
  allocate.writeUInt16LE(0, 4);
  allocate.writeUInt16LE(0, 6);
  allocate.writeUInt32LE(bufferMemory.length, 8);
  allocate.writeUInt32LE(icoOffset, 12);
  return allocate;
}

const iconInfoHeader = (buffers: Buffer[]) => [iconDirHeader(buffers), ...buffers.map(iconDirEntry)];

/**
 * Convert Png images Buffer to ICO File Buffer.
 *
 * @param buffers png Image File Buffers
 * @returns ico File Buffer
 */
export function pack(buffers: Buffer[]): Buffer {
  return Buffer.concat([...iconInfoHeader(buffers), ...buffers]);
}
