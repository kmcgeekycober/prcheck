import * as core from '@actions/core';
import { buildMetrics, emitMetrics, startTimer, PRMetrics } from './metrics';

jest.mock('@actions/core');

const mockSetOutput = core.setOutput as jest.Mock;
const mockDebug = core.debug as jest.Mock;

describe('metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildMetrics', () => {
    it('should build a metrics object with correct values', () => {
      startTimer();
      const metrics = buildMetrics(5, 3, 1, 4, 2, true, false);

      expect(metrics.totalRulesEvaluated).toBe(5);
      expect(metrics.matchedRules).toBe(3);
      expect(metrics.unmatchedRequiredRules).toBe(1);
      expect(metrics.labelsChecked).toBe(4);
      expect(metrics.missingLabels).toBe(2);
      expect(metrics.descriptionChecked).toBe(true);
      expect(metrics.descriptionValid).toBe(false);
      expect(metrics.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should record elapsed time since startTimer', async () => {
      startTimer();
      await new Promise((r) => setTimeout(r, 20));
      const metrics = buildMetrics(0, 0, 0, 0, 0, false, false);
      expect(metrics.durationMs).toBeGreaterThanOrEqual(15);
    });
  });

  describe('emitMetrics', () => {
    it('should call core.setOutput for each metric field', () => {
      const metrics: PRMetrics = {
        totalRulesEvaluated: 10,
        matchedRules: 7,
        unmatchedRequiredRules: 2,
        labelsChecked: 3,
        missingLabels: 1,
        descriptionChecked: true,
        descriptionValid: true,
        durationMs: 42,
      };

      emitMetrics(metrics);

      expect(mockSetOutput).toHaveBeenCalledWith('total_rules_evaluated', '10');
      expect(mockSetOutput).toHaveBeenCalledWith('matched_rules', '7');
      expect(mockSetOutput).toHaveBeenCalledWith('unmatched_required_rules', '2');
      expect(mockSetOutput).toHaveBeenCalledWith('labels_checked', '3');
      expect(mockSetOutput).toHaveBeenCalledWith('missing_labels', '1');
      expect(mockSetOutput).toHaveBeenCalledWith('description_valid', 'true');
      expect(mockSetOutput).toHaveBeenCalledWith('duration_ms', '42');
      expect(mockDebug).toHaveBeenCalledWith(expect.stringContaining('[prcheck metrics]'));
    });
  });
});
