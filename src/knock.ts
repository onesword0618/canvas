/**
 * Check Valid Argumentrs function.
 *
 * Copyright (c) 2021.
 * Kenichi Inoue.
 */
import { Command } from 'commander';
import { existsSync } from 'fs';
import { extname } from 'path';

/**
 * Valid Input Parameter.
 *
 * @param args input source SVG File Path.
 * @returns argument
 */
export function knock(args: string[]): string {
  const command = new Command().parse(args);
  if (command.args.length === 0) {
    console.error(`No Argument Parameter ! Require SVG file path.`);
    process.exit(9);
  }

  const argument = command.args[0];

  if (!existsSync(argument)) {
    console.error(`Check ! Argument Parameter ! Illegal file path. Argument is ${argument}.`);
    process.exit(9);
  }

  if (extname(argument) !== '.svg') {
    console.error(`Check ! Argument Parameter ! Require SVG file path. Argument is ${argument}.`);
    process.exit(9);
  }
  return argument;
}
