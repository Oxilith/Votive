/**
 * @file shared/src/paths.ts
 * @purpose Path utilities for project navigation
 * @functionality
 * - Finds project root by traversing up to marker file
 * - Provides reliable path resolution across monorepo workspaces
 * @dependencies
 * - path for directory traversal
 * - fs for file existence checks
 */

import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * Find project root by traversing up to find a marker file.
 * Useful in monorepo where cwd may be a workspace subdirectory.
 *
 * @param markerFile - File to look for (default: 'Makefile')
 * @param startDir - Starting directory (default: process.cwd())
 * @returns Absolute path to project root, or startDir if marker not found
 */
export function findProjectRoot(
  markerFile = 'Makefile',
  startDir = process.cwd()
): string {
  let dir = startDir;
  let parent = dirname(dir);

  // Traverse up until we hit filesystem root (when dirname equals itself)
  while (dir !== parent) {
    if (existsSync(resolve(dir, markerFile))) {
      return dir;
    }
    dir = parent;
    parent = dirname(dir);
  }

  // Check root directory as well
  if (existsSync(resolve(dir, markerFile))) {
    return dir;
  }

  // Fallback to startDir if marker not found
  return startDir;
}
