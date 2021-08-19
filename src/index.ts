/**
 * Enrty File.
 *
 * Copyright (c) 2021.
 * Kenichi Inoue.
 */
import { canvas } from './canvas';
import { knock } from './knock';

/**
 * Main Process.
 */
async function convert(): Promise<void> {
  await canvas(knock(process.argv));
}

convert()
  .then(() => {
    console.log(`complete convert.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`convert error : ${error}`);
    process.exit(1);
  });
