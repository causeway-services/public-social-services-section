import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceFlowPlan} from '../src/flow-shorts.mjs';

const plan = report => sourceFlowPlan({
  lesson: {title: 'Flood maps and climate risk'}, report,
  metadata: {tags: ['flood maps', 'climate risk']}, angle: {id: 'mechanism'},
});

test('wrapped Markdown prose retains the full source sentence and its qualification', () => {
  const report = '# Flood maps\n\n- Flood maps describe modeled risk,\n  not certain losses at any particular home.\n';
  const result = plan(report);
  assert.equal(result.claim, 'Flood maps describe modeled risk, not certain losses at any particular home.');
  assert(report.replace(/\s+/gu, ' ').includes(result.claim));
});

test('a source definition precedes a less useful limitation without truncating its negation', () => {
  const report = '# Flood maps\n\n- A flood map is a model used for decisions, not the hazard itself: different datasets can classify the same region differently and omit substantial exposure.\n\n## Limitations\n\nFlood maps and climate risk are studied only in selected regions.\n';
  assert.equal(plan(report).claim, 'A flood map is a model used for decisions, not the hazard itself');
});

test('negative controls and detached conditional clauses cannot become factual captions', () => {
  assert.throws(() => plan('Invalid inference: Flood maps are certain climate risk predictions.'), /No standalone/);
  assert.throws(() => plan('If a flood map is treated as certain: the decisions that follow can conceal important qualifications about modeled exposure and household losses.'), /No standalone/);
});
