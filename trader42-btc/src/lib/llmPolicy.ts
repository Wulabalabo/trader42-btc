export type StepLlmKey = 'step0' | 'step1' | 'step2' | 'step3' | 'step5' | 'weekly-audit';

export type StepLlmPolicy = {
  model: 'openai' | 'deepseek';
  fallback: 'openai' | 'deepseek';
};

export function getStepLlmPolicy(step: StepLlmKey): StepLlmPolicy {
  if (step === 'step2' || step === 'step3') {
    return { model: 'openai', fallback: 'deepseek' };
  }

  return { model: 'deepseek', fallback: 'openai' };
}
