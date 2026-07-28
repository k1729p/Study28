import assert from 'node:assert/strict';
import {
  describe,
  it,
  before,
  beforeEach,
  after,
  afterEach,
  expectFailure,
  mock,
  run
} from 'node:test';
import { tap } from 'node:test/reporters';
import process from 'node:process';
import path from 'node:path';

// ##################################################################################
//run({ files: [path.resolve('./tests/test.js')] }).compose(tap).pipe(process.stdout);
// ##################################################################################

const cities = ["Madrid", "Rome", "Paris", "London"];
describe('isBlank', () => {
  for (const city of cities) {
    it(`should return false when arg is "${city}"`, () => {
      assert.strictEqual(isBlank(city), false);
    });
  }
});
function isBlank(str: string): boolean {
  return !str || str.trim().length === 0;
}

describe('t t t', () => {
  
  it('synchronous passing test', (t) => {
    // This test passes because it does not throw an exception.
    assert.strictEqual(1, 1);
  });

  it('synchronous failing test', (t) => {
    // This test fails because it throws an exception.
    assert.strictEqual(1, 2);
  });

  it('asynchronous passing test', async (t) => {
    // This test passes because the Promise returned by the async function is settled and not rejected.
    assert.strictEqual(1, 1);
  });

  it('asynchronous failing test', async (t) => {
    // This test fails because the Promise returned by the async function is rejected.
    assert.strictEqual(1, 2);
  });

  it('failing test using Promises', (t) => {
    // Promises can be used directly as well.
    return new Promise((resolve, reject) => {
      setImmediate(() => {
        reject(new Error('this will cause the test to fail'));
      });
    });
  });

  it.expectFailure('should do the thing', () => {
    assert.strictEqual(1, 2);
  });

  it('should do the thing', { expectFailure: true }, () => {
    assert.strictEqual(1, 2);
  });

  it('should do the thing', { expectFailure: 'feature not implemented' }, () => {
    assert.strictEqual(1, 2);
  });

  it('fails because regex does not match', {
    expectFailure: /expected message/,
  }, () => {
    throw new Error('different message');
  });

  it('fails because object matcher does not match', {
    expectFailure: { message: 'ERR_EXPECTED' },
  }, () => {
    const err = new Error('boom');
    err.message = 'ERR_ACTUAL';
    throw err;
  });



  it('callback passing test', (t, done) => {
    // done() is the callback function. When the setImmediate() runs, it invokes
    // done() with no arguments.
    setImmediate(done);
  });

  it('callback failing test', (t, done) => {
    // When the setImmediate() runs, done() is invoked with an Error object and the test fails.
    setImmediate(() => {
      done(new Error('callback failure'));
    });
  });

  it('top level test', async (t) => {
    await t.test('subtest 1', (t) => {
      assert.strictEqual(1, 1);
    });
    await t.test('subtest 2', (t) => {
      assert.strictEqual(2, 2);
    });
  });

  it('spies on a function', () => {
    const sum = mock.fn((a, b) => {
      return a + b;
    });
    assert.strictEqual(sum.mock.callCount(), 0);
    assert.strictEqual(sum(3, 4), 7);
    assert.strictEqual(sum.mock.callCount(), 1);
    const call = sum.mock.calls[0];
    assert.deepStrictEqual(call.arguments, [3, 4]);
    assert.strictEqual(call.result, 7);
    assert.strictEqual(call.error, undefined);
    // Reset the globally tracked mocks.
    mock.reset();
  });
});

// import { describe, it } from 'node:test';
// describe('A thing', () => {
//   it('should work', () => {
//     assert.strictEqual(1, 1);
//   });
// });
