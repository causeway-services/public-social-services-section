import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const configuration = JSON.parse(readFileSync(new URL("../content/configurations/discord-native-onboarding.json", import.meta.url), "utf8"));

test("native Discord onboarding opens a bounded newcomer path without changing member authority", () => {
  assert.equal(configuration.status, "live");
  assert.equal(configuration.guildId, "1184863861065658419");
  assert.equal(configuration.welcomeScreen.enabled, true);
  assert.equal(configuration.welcomeScreen.channels.length, 5);
  assert.equal(configuration.onboarding.enabled, true);
  assert.equal(configuration.onboarding.belowRequirements, false);
  assert.equal(configuration.onboarding.defaultChannelIds.length, 7);
  assert.equal(configuration.onboarding.prompts.length, 1);
  assert.equal(configuration.onboarding.prompts[0].options.length, 4);
  assert.deepEqual(configuration.publicPermissionOverwrites.meaning, ["view-channel", "send-messages", "read-message-history"]);
  assert.equal(configuration.boundaries.ordinaryParticipationIsCommercialConsent, false);
  assert.equal(configuration.boundaries.interestSelectionCreatesPaymentOrEntitlement, false);
  assert.equal(configuration.boundaries.memberAndStaffLanesChanged, false);
});
