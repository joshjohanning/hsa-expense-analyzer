import { describe, test, expect } from '@jest/globals';
import { colorize } from '../src/main.js';

// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\u001b\[\d+m/g;
// eslint-disable-next-line no-control-regex
const CYAN_REGEX = /\u001b\[36m.*test.*\u001b\[0m/;
// eslint-disable-next-line no-control-regex
const YELLOW_REGEX = /\u001b\[33m.*warning.*\u001b\[0m/;
// eslint-disable-next-line no-control-regex
const RED_REGEX = /\u001b\[31m.*error.*\u001b\[0m/;
// eslint-disable-next-line no-control-regex
const GREEN_REGEX = /\u001b\[32m.*success.*\u001b\[0m/;
// eslint-disable-next-line no-control-regex
const DIM_REGEX = /\u001b\[2m.*dimmed.*\u001b\[0m/;
// eslint-disable-next-line no-control-regex
const EMPTY_CYAN_REGEX = /\u001b\[36m.*\u001b\[0m/;

describe('colorize', () => {
  test('should add cyan color codes', () => {
    const result = colorize('test', 'cyan');
    expect(result).toContain('test');
    expect(result).toMatch(CYAN_REGEX);
  });

  test('should add yellow color codes', () => {
    const result = colorize('warning', 'yellow');
    expect(result).toContain('warning');
    expect(result).toMatch(YELLOW_REGEX);
  });

  test('should add red color codes', () => {
    const result = colorize('error', 'red');
    expect(result).toContain('error');
    expect(result).toMatch(RED_REGEX);
  });

  test('should add green color codes', () => {
    const result = colorize('success', 'green');
    expect(result).toContain('success');
    expect(result).toMatch(GREEN_REGEX);
  });

  test('should add dim color codes', () => {
    const result = colorize('dimmed', 'dim');
    expect(result).toContain('dimmed');
    expect(result).toMatch(DIM_REGEX);
  });

  test('should return text unchanged when --no-color flag is present', () => {
    // Save original argv
    const originalArgv = process.argv;

    // Add --no-color flag
    process.argv = [...originalArgv, '--no-color'];

    const result = colorize('plain text', 'cyan');
    expect(result).toBe('plain text');
    expect(result).not.toMatch(ANSI_REGEX);

    // Restore original argv
    process.argv = originalArgv;
  });

  test('should handle empty string', () => {
    const result = colorize('', 'cyan');
    expect(result).toMatch(EMPTY_CYAN_REGEX);
  });

  test('should handle undefined color gracefully', () => {
    const result = colorize('test', 'invalidColor');
    // Should still wrap with reset even if color is undefined
    expect(result).toContain('test');
  });
});
