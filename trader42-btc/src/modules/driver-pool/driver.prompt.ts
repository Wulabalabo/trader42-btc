import type { CandidateDriver } from './driver.types.js';

export function buildDriverThesis(driver: CandidateDriver): string {
  return `${driver.driver.replace(/-/g, ' ')} is active because ${driver.thesis.toLowerCase()}`;
}
