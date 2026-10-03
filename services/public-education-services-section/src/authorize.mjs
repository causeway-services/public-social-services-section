#!/usr/bin/env node
// Connect one education channel from the machine whose browser gives consent.
// A person signed in elsewhere connects it from their obligations instead (src/obligations.mjs).
import { authorizeYouTube } from '@emsenn/youtube-engineering-services-section/authorize';
import { retainYouTubeCredential } from '@emsenn/youtube-engineering-services-section/credentials';
import { loadChannel, loadEnvironment } from './channel.mjs';
loadEnvironment();
if (!process.argv[2]) throw new Error('usage: authorize.mjs <channel>');
const config = loadChannel(process.argv[2]);
authorizeYouTube({
  channelId: config.youtubeChannelId,
  clientId: process.env.YOUTUBE_OAUTH_CLIENT_ID,
  clientSecret: process.env.YOUTUBE_OAUTH_CLIENT_SECRET,
  port: Number(process.env.OAUTH_LOOPBACK_PORT || 8765),
  onAuthorizationUrl: (authorizationUrl) => console.log(JSON.stringify({channel: config.id, authorizationUrl})),
  onToken: async (token) => {
    retainYouTubeCredential(config.refreshTokenEnv, token);
    console.log(JSON.stringify({channel:config.id,status:'authorized',youtubeChannelId:config.youtubeChannelId}));
  },
});
