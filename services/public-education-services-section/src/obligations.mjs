// What public education needs a person to do, as the driver for obligation records of kind
// `google-oauth-consent` (the operations console's declared obligations). A channel whose refresh
// token the node does not hold cannot upload, schedule or be syndicated, and only the person who
// holds its Google account can give consent. The record (data) says who it waits on, the words, the
// steps and what it unblocks; this driver supplies the occasions (one per channel without a token),
// the consent link, and what finishing does: exchange the pasted address for a refresh token and
// hold it in the credential custody the uploader reads. Channel directories are submodules a release
// does not carry, so channels are read from this package's place in the live repository the node
// works in.
import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { consentRequest, exchangeConsent, returnedConsent } from "@emsenn/youtube-engineering-services-section/authorize";
import { readYouTubeCredentials, retainYouTubeCredential } from "@emsenn/youtube-engineering-services-section/credentials";
import { channelDirectories, EDUCATION_ROOT, PACKAGE_ROOT, readJson } from "./channel.mjs";

const PORT = 8765;

function liveEducationRoot(repositoryRoot) {
  if (!repositoryRoot) return EDUCATION_ROOT;
  let workspace = PACKAGE_ROOT;
  while (!existsSync(join(workspace, "pnpm-workspace.yaml"))) {
    if (dirname(workspace) === workspace) return EDUCATION_ROOT;
    workspace = dirname(workspace);
  }
  return join(repositoryRoot, relative(workspace, EDUCATION_ROOT));
}

/**
 * The driver for education channels' Google consent.
 * @param {{ repositoryRoot?: string, env?: NodeJS.ProcessEnv }} options
 */
export function googleConsentDriver({ repositoryRoot, env = process.env } = {}) {
  const root = liveEducationRoot(repositoryRoot);
  const channels = () => channelDirectories(root).map((directory) => readJson(join(directory, "config.json")));
  const channelOf = (instance) => {
    const config = channels().find((candidate) => `youtube:${candidate.id}` === instance.id);
    if (!config) throw new TypeError(`no education channel answers ${instance.id}`);
    return config;
  };
  return {
    kind: "google-oauth-consent",
    instances: () => channels().map((config) => ({
      id: `youtube:${config.id}`,
      vars: { name: config.name, handleOrId: config.handle ?? config.youtubeChannelId, handleClause: config.handle ? ` (${config.handle})` : "" },
    })),
    held: (record, instance) => Boolean(readYouTubeCredentials(env)[channelOf(instance).refreshTokenEnv]),
    prepare(record, instance) {
      const { url, state, verifier, redirectUri } = consentRequest({ clientId: readYouTubeCredentials(env).YOUTUBE_OAUTH_CLIENT_ID, port: PORT });
      return { memo: { state, verifier, redirectUri }, link: { href: url }, vars: { redirectUri } };
    },
    async capture(record, instance, memo, value) {
      const config = channelOf(instance);
      const held = readYouTubeCredentials(env);
      const code = returnedConsent(value, memo);
      let token;
      try {
        token = await exchangeConsent({ channelId: config.youtubeChannelId, clientId: held.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: held.YOUTUBE_OAUTH_CLIENT_SECRET, code, verifier: memo.verifier, redirectUri: memo.redirectUri });
      } catch (error) {
        if (/does not identify configured channel/u.test(error.message)) throw new Error(`Google connected a different channel. Start again and pick ${config.name} when Google asks which account to use.`);
        throw error;
      }
      retainYouTubeCredential(config.refreshTokenEnv, token, env);
      return { custody: `the YouTube credential ${config.refreshTokenEnv}` };
    },
  };
}
