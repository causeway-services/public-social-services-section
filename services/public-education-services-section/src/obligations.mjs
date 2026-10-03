// What public education needs a person to do. A channel whose refresh token
// the node does not hold cannot upload, schedule or be syndicated, and only the
// person who holds its Google account can give consent. Each such channel is an
// obligation on that person, walked in their own browser: open Google's consent
// link, choose the channel, and paste back the address Google returns them to.
// Channel directories are submodules a release does not carry, so channels are
// read from this package's place in the live repository the node works in.
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
 * The obligation source for education channels.
 * @param {{ accountHolder: string, repositoryRoot?: string, env?: NodeJS.ProcessEnv }} options
 *   accountHolder is the character who holds the channels' Google account.
 */
export function educationObligations({ accountHolder, repositoryRoot, env = process.env }) {
  if (typeof accountHolder !== "string" || accountHolder === "") throw new TypeError("education obligations need the character who holds the channels' Google account");
  const root = liveEducationRoot(repositoryRoot);
  const channels = () => channelDirectories(root).map((directory) => readJson(join(directory, "config.json")));
  const channelOf = (id) => {
    const config = channels().find((candidate) => `youtube:${candidate.id}` === id);
    if (!config) throw new TypeError(`no education channel answers ${id}`);
    return config;
  };
  return {
    id: "education",
    title: "Public education",
    obligations() {
      const held = readYouTubeCredentials(env);
      return channels().filter((config) => !held[config.refreshTokenEnv]).map((config) => ({
        id: `youtube:${config.id}`,
        to: [accountHolder],
        title: `Connect ${config.name} to the house`,
        why: `${config.name} (${config.handle ?? config.youtubeChannelId}) has no YouTube connection on the node, so the house cannot upload or schedule its videos, or share them on Turntide Islands. Only the holder of its Google account can connect it, and it takes about two minutes.`,
      }));
    },
    start(id) {
      const config = channelOf(id);
      const { url, state, verifier, redirectUri } = consentRequest({ clientId: readYouTubeCredentials(env).YOUTUBE_OAUTH_CLIENT_ID, port: PORT });
      return {
        memo: { state, verifier, redirectUri },
        link: { href: url, label: `Open Google to connect ${config.name}` },
        steps: [
          `Press "Open Google to connect ${config.name}". Google opens in a new tab.`,
          `Sign in to Google if it asks. When it asks you to choose an account, pick ${config.name}${config.handle ? ` (${config.handle})` : ""}, not your own name. If it's missing, choose "Use another account" or switch to it on youtube.com first.`,
          `If Google says it hasn't verified this app, press "Advanced", then "Go to …". The app is the house's own.`,
          `Tick every permission box, then press "Continue".`,
          `The tab lands on a page that won't load, with an address starting ${redirectUri}. That is expected. Click the address bar and copy the whole address.`,
          `Come back to this tab, paste the address below, and press "Connect".`,
        ],
        input: { label: "the address Google sent you to", placeholder: `${redirectUri}/?state=…&code=…`, description: "Paste the whole address from the tab that wouldn't load." },
      };
    },
    async finish(id, memo, value) {
      const config = channelOf(id);
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
      return { title: `${config.name} is connected`, content: `The house can now upload, schedule and share ${config.name}'s videos.` };
    },
  };
}
