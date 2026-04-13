import { styleText } from "node:util";

import { RepositoryType } from '../repositories/repository-type.js';
/**
 * Utility functions for styled console output.
 * Optimized for readability on dark/standard Windows consoles.
 */
export const red = (text: string) => styleText('redBright', text);
export const green = (text: string) => styleText('greenBright', text);
export const cyan = (text: string) => styleText('cyanBright', text);
export const magenta = (text: string) => styleText('magentaBright', text);
export const yellow = (text: string) => styleText('yellowBright', text);

export const redOnWhite = (text: string) => styleText(['redBright', 'bgWhiteBright'], text);
export const greenOnWhite = (text: string) => styleText(['green', 'bgWhiteBright'], text);
export const blueOnWhite = (text: string) => styleText(['blueBright', 'bgWhiteBright'], text);
export const cyanOnWhite = (text: string) => styleText(['cyan', 'bgWhiteBright'], text);
export const magentaOnWhite = (text: string) => styleText(['magentaBright', 'bgWhiteBright'], text);
export const blackOnWhite = (text: string) => styleText(['black', 'bgWhiteBright'], text);

export const blackOnRed = (text: string) => styleText(['black', 'bgRedBright'], text);
export const blackOnGreen = (text: string) => styleText(['black', 'bgGreenBright'], text);
export const blackOnCyan = (text: string) => styleText(['black', 'bgCyanBright'], text);
export const blackOnMagenta = (text: string) => styleText(['black', 'bgMagentaBright'], text);
export const blackOnYellow = (text: string) => styleText(['black', 'bgYellowBright'], text);
/**
 * Logging with repository type.
 */
export const repo: Record<RepositoryType, (text: string) => string> = {
  [RepositoryType.Cassandra]: (text) => styleText(['black', 'bgRedBright'], text),
  [RepositoryType.Chroma]: (text) => styleText(['black', 'bgGreenBright'], text),
  [RepositoryType.Elasticsearch]: (text) => styleText(['black', 'bgCyanBright'], text),
  [RepositoryType.MongoDB]: (text) => styleText(['black', 'bgMagentaBright'], text),
  [RepositoryType.MySQL]: (text) => styleText(['black', 'bgYellowBright'], text),
  [RepositoryType.Neo4j]: (text) => styleText('redBright', text),
  [RepositoryType.Oracle]: (text) => styleText('greenBright', text),
  [RepositoryType.PostgreSQL]: (text) => styleText('cyanBright', text),
  [RepositoryType.Redis]: (text) => styleText('magentaBright', text),
  [RepositoryType.SQLServer]: (text) => styleText('yellowBright', text),
};
/**
 * Presents example messages.
 */
export function printColorfulMessages() {
  console.log(red('Console Log Message Red'));
  console.log(green('Console Log Message Green'));
  console.log(cyan('Console Log Message Cyan'));
  console.log(magenta('Console Log Message Magenta'));
  console.log(yellow('Console Log Message Yellow'));

  console.log(redOnWhite('Console Log Message Red On White'));
  console.log(greenOnWhite('Console Log Message Green On White'));
  console.log(blueOnWhite('Console Log Message Blue On White'));
  console.log(cyanOnWhite('Console Log Message Cyan On White'));
  console.log(magentaOnWhite('Console Log Message Magenta On White'));

  console.log(blackOnRed('Console Log Message Black On Red'));
  console.log(blackOnGreen('Console Log Message Black On Green'));
  console.log(blackOnCyan('Console Log Message Black On Cyan'));
  console.log(blackOnMagenta('Console Log Message Black On Magenta'));
  console.log(blackOnYellow('Console Log Message Black On Yellow'));
  console.log(blackOnWhite('Console Log Message Black On White'));

}