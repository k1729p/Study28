/**
 * Asynchronous read/write lock.
 */
export class RepositoryLock {
  private activeReaders = 0;
  private writerActive = false;
  private writerWaiting = false;
  private readQueue: Array<() => void> = [];
  private writeQueue: Array<() => void> = [];

  /**
   * Acquires shared lock.
   * @returns void
   */
  async acquireShared(): Promise<() => void> {
    return new Promise((resolve) => {
      const grant = () => {
        this.activeReaders++;
        resolve(() => this.releaseShared());
      };

      if (!this.writerActive && !this.writerWaiting && this.writeQueue.length === 0) {
        grant();
      } else {
        this.readQueue.push(grant);
      }
    });
  }
  /**
   * Releases shared lock.
   * @returns void
   */
  private releaseShared(): void {
    this.activeReaders--;
    if (this.activeReaders === 0 && this.writeQueue.length > 0) {
      this.writerActive = true;
      const nextWriter = this.writeQueue.shift();
      if (nextWriter) nextWriter();
    }
  }
  /**
   * Acquires exclusive lock.
   * @returns void
   */
  async acquireExclusive(): Promise<() => void> {
    return new Promise((resolve) => {
      const grant = () => {
        this.writerActive = true;
        this.writerWaiting = false;
        resolve(() => this.releaseExclusive());
      };

      if (!this.writerActive && this.activeReaders === 0) {
        grant();
      } else {
        this.writerWaiting = true;
        this.writeQueue.push(grant);
      }
    });
  }
  /**
   * Releases exclusive lock.
   * @returns void
   */
  private releaseExclusive(): void {
    this.writerActive = false;
    if (this.readQueue.length > 0) {
      const readersToDrain = [...this.readQueue];
      this.readQueue = [];
      readersToDrain.forEach((grant) => grant());
    } else if (this.writeQueue.length > 0) {
      this.writerActive = true;
      const nextWriter = this.writeQueue.shift();
      if (nextWriter) nextWriter();
    }
  }
}
