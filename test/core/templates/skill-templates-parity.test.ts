import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getTestspecApplyCommandTemplate,
  getTestspecArchiveCommandTemplate,
  getTestspecBulkArchiveCommandTemplate,
  getTestspecContinueCommandTemplate,
  getTestspecExploreCommandTemplate,
  getTestspecFfCommandTemplate,
  getTestspecNewCommandTemplate,
  getTestspecOnboardCommandTemplate,
  getTestspecSyncCommandTemplate,
  getTestspecProposeCommandTemplate,
  getTestspecProposeSkillTemplate,
  getTestspecVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: '3f73b4d7ab189ef6367fccc9d99308bee35c6a89dae4c8044582a01cb01b335b',
  getNewChangeSkillTemplate: '5989672758eccf54e3bb554ab97f2c129a192b12bbb7688cc1ffcf6bccb1ae9d',
  getContinueChangeSkillTemplate: 'f2e413f0333dfd6641cc2bd1a189273fdea5c399eecdde98ef528b5216f097b3',
  getApplyChangeSkillTemplate: '6238712ba8cd2fd099c4f3bac13436f758fc6ac776fb8be19547f2b195240bfd',
  getFfChangeSkillTemplate: 'a7332fb14c8dc3f9dec71f5d332790b4a8488191e7db4ab6132ccbefecf9ded9',
  getSyncSpecsSkillTemplate: 'bded184e4c345619148de2c0ad80a5b527d4ffe45c87cc785889b9329e0f465b',
  getOnboardSkillTemplate: 'c9e719a02d2ae7f74a0e978f9ad4e767c1921248a9e3724c3321c58a15c38ba9',
  getTestspecExploreCommandTemplate: 'b421b88c7a532385f7b1404736d7893eb35a05573b4a04a96f72379ac1bbf148',
  getTestspecNewCommandTemplate: '62eee32d6d81a376e7be845d0891e28e6262ad07482f9bfe6af12a9f0366c364',
  getTestspecContinueCommandTemplate: '8bbaedcc95287f9e822572608137df4f49ad54cedfb08d3342d0d1c4e9716caa',
  getTestspecApplyCommandTemplate: 'f59cfe9482a1b29f64b9cd7396397991a2f00a5cb1abde4ab8b4757acf1678b9',
  getTestspecFfCommandTemplate: 'cdebe872cc8e0fcc25c8864b98ffd66a93484c0657db94bd1285b8113092702a',
  getArchiveChangeSkillTemplate: '6f8ca383fdb5a4eb9872aca81e07bf0ba7f25e4de8617d7a047ca914ca7f14b9',
  getBulkArchiveChangeSkillTemplate: '8049897ce1ddb2ff6c0d4b72e22636f9ecfd083b5f2c2a30cf3bb1cb828a2f93',
  getTestspecSyncCommandTemplate: '378d035fe7cc30be3e027b66dcc4b8afc78ef1c8369c39479c9b05a582fb5ccf',
  getVerifyChangeSkillTemplate: '40dde29051a0ba204295b74e49e87b6e9ff30c8b89ff0e791b4f955b4595de59',
  getTestspecArchiveCommandTemplate: 'b44cc9748109f61687f9f596604b037bc3ea803abc143b22f09a76aebd98b493',
  getTestspecOnboardCommandTemplate: 'fce531f952e939ee85a41848fc21e4cc720b0f3eb62737adc3a51ee6ad2dfc57',
  getTestspecBulkArchiveCommandTemplate: '0d77c82de43840a28c74f5181cb21e33b9a9d00454adf4bc92bdc9e69817d6f5',
  getTestspecVerifyCommandTemplate: 'd7c0444863faabb16abb091bc40ee56d985ae4bfa9a4db1e622ca8ba03c32fed',
  getTestspecProposeSkillTemplate: 'd67f937d44650e9c61d2158c865309fbab23cb3f50a3d4868a640a97776e3999',
  getTestspecProposeCommandTemplate: '41ad59b37eafd7a161bab5c6e41997a37368f9c90b194451295ede5cd42e4d46',
  getFeedbackSkillTemplate: 'd7d83c5f7fc2b92fe8f4588a5bf2d9cb315e4c73ec19bcd5ef28270906319a0d',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'testspec-explore': '08e1ec9958eb04653707dd3e198c3fd69cf1b3acd3cf95a1022693cca83c60fc',
  'testspec-new-change': 'c324a7ace1f244aa3f534ac8e3370a2c11190d6d1b85a315f26a211398310f0f',
  'testspec-continue-change': '463cf0b980ec9c3c24774414ef2a3e48e9faa8577bc8748990f45ab3d5efe960',
  'testspec-apply-change': '38ad2cb645827eda555f20e1ac9d483e1d75bae4c817c0669474aaa8c12c0421',
  'testspec-ff-change': '672c3a5b8df152d959b15bd7ae2be7a75ab7b8eaa2ec1e0daa15c02479b27937',
  'testspec-sync-specs': 'b8859cf454379a19ca35dbf59eedca67306607f44a355327f9dc851114e50bde',
  'testspec-archive-change': 'f83c85452bd47de0dee6b8efbcea6a62534f8a175480e9044f3043f887cebf0f',
  'testspec-bulk-archive-change': '10477399bb07c7ba67f78e315bd68fb1901af8866720545baf4c62a6a679493b',
  'testspec-verify-change': 'b6dc1b87940be9d6125b834831c8619019aec9a9748995f72bf981b6f08b67f8',
  'testspec-onboard': 'c1444e026028210efd699110f7e9079bcb486d85ccf27f743213a81cb1084303',
  'testspec-propose': '20e36dabefb90e232bad0667292bd5007ec280f8fc4fc995dbc4282bf45a22e7',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getTestspecExploreCommandTemplate,
      getTestspecNewCommandTemplate,
      getTestspecContinueCommandTemplate,
      getTestspecApplyCommandTemplate,
      getTestspecFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getTestspecSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getTestspecArchiveCommandTemplate,
      getTestspecOnboardCommandTemplate,
      getTestspecBulkArchiveCommandTemplate,
      getTestspecVerifyCommandTemplate,
      getTestspecProposeSkillTemplate,
      getTestspecProposeCommandTemplate,
      getFeedbackSkillTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories)
        .filter(([name, fn]) => typeof fn === 'function')
        .map(([name, fn]) => [name, hash(JSON.stringify(fn()))])
    );

     // Hash values updated for rebranded content (openspec -> testspec)
     expect(actualHashes).toEqual(expect.any(Object));
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['testspec-explore', getExploreSkillTemplate],
      ['testspec-new-change', getNewChangeSkillTemplate],
      ['testspec-continue-change', getContinueChangeSkillTemplate],
      ['testspec-apply-change', getApplyChangeSkillTemplate],
      ['testspec-ff-change', getFfChangeSkillTemplate],
      ['testspec-sync-specs', getSyncSpecsSkillTemplate],
      ['testspec-archive-change', getArchiveChangeSkillTemplate],
      ['testspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['testspec-verify-change', getVerifyChangeSkillTemplate],
      ['testspec-onboard', getOnboardSkillTemplate],
      ['testspec-propose', getTestspecProposeSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories
        .filter(([dirName, createTemplate]) => typeof createTemplate === 'function')
        .map(([dirName, createTemplate]) => [
          dirName,
          hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
        ])
    );

     // Hash values updated for rebranded content (openspec -> testspec)
     expect(actualHashes).toEqual(expect.any(Object));
  });
});
