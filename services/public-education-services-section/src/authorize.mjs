#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { authorizeYouTube } from '@emsenn/youtube-engineering-services-section/authorize';
import { loadChannel, loadEnvironment, PACKAGE_ROOT, writeAtomic } from './channel.mjs';
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
    const path = join(PACKAGE_ROOT, '.env');
    const text = existsSync(path) ? readFileSync(path, 'utf8') : '';
    const retained = text.split('\n').filter(line => !new RegExp(`^\\s*(?:export\\s+)?${config.refreshTokenEnv}\\s*=`).test(line)).join('\n').trimEnd();
    writeAtomic(path, `${retained}\n${config.refreshTokenEnv}=${token}\n`);
    console.log(JSON.stringify({channel:config.id,status:'authorized',youtubeChannelId:config.youtubeChannelId}));
  },
});
