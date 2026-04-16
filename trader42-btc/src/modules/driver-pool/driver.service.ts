import { buildDriverFeatures } from './driver.featureBuilder.js';
import { buildDriverThesis } from './driver.prompt.js';
import { scoreCandidateDrivers } from './driver.scorer.js';
import type { DriverPoolInput, DriverPoolOutput } from './driver.types.js';
import type { DriverPoolRepository } from './driver.repository.js';

export function buildDriverPoolResponse(
  input: DriverPoolInput,
  repository?: DriverPoolRepository,
): DriverPoolOutput {
  const features = buildDriverFeatures(input);
  const candidates = scoreCandidateDrivers({
    features,
    previousDriverKeys: input.previousDriverKeys ?? [],
    topN: input.topN ?? 5,
  }).map((driver) => ({
    ...driver,
    thesis: buildDriverThesis(driver),
  }));

  const output = { candidate_btc_drivers: candidates };
  repository?.save(output);
  return output;
}
