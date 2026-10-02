import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    dir: 'src/',
    // Disables running multiple test files at the same time
    fileParallelism: false,
  },
});