import { AsyncLocalStorage } from 'node:async_hooks';
import * as colors from "../utils/styledColors.js";

const asyncLocalStorage = new AsyncLocalStorage();
/**
 * 
 */
export class Bbb {
  /**
   * 
   */
  researchLogging() {
    colors.printColorfulMessages();
    console.group('Formatted Time');
    console.log('MM:SS.SSS[%s]', new Date().toISOString().slice(14, 23));
    console.log('HH:MM:SS.SSS[%s]', new Date().toISOString().slice(11, 23));
    console.groupEnd();
  }
  /**
   * 
   */
  researchAsyncLocalStorage() {
    console.log('-----------------------------------');
    this.logWithId('outside of the callback function - before');
    for(let index = 0; index < 3; index++) {
      asyncLocalStorage.run(index, () => this.theCallbackFunction());
      console.log('researchAsyncLocalStorage(): index[%d]', index);
    }
    this.logWithId('outside of the callback function - after');
    console.log('-----------------------------------');
  }
  /**
   * 
   */
  theCallbackFunction() {
    this.logWithId('Start');
    setImmediate(() => {
      this.logWithId('1st Immediate');
    });
    setImmediate(() => {
      this.logWithId('2nd Immediate');
    });
    this.logWithId('Finish');
  }
  /**
   * 
   * @param msg message
   */
  logWithId(msg: string) {
    const id = asyncLocalStorage.getStore();
    console.log('logWithId(): id[%s], msg[%s]', id !== undefined ? id : '-', msg);
  }
}
