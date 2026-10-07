#!/usr/bin/env node
// Education channel production.
//
//   status [channel|all]                    commissioned lessons and where each stands
//   research <channel> <lesson>            research a lesson without producing a video
//   produce [channel|all] [lesson]          fill publication slots or advance a named lesson
//   artifacts <channel>                     list the channel notebook's NotebookLM videos
//   adopt <channel> <lesson> <artifact-id>  adopt the artifact of an uncertain video submission
//   begin-thumbnail <channel> <lesson>      claim the held account capacity before using its UI
//   adopt-thumbnail <channel> <lesson> <image> <spent-units>  accept operator image
//   release-thumbnail <channel> <lesson> <reason>  release a packet with no artifact
//   retry <channel> <lesson>                readmit a failed or abandoned video to its formats
//   verify [channel|all]                    confirm each channel's YouTube credential
//
// Production fills each channel's publication buffer. The provider's native
// compute readings govern submissions; saved artifacts govern resumption.
import { join } from "node:path";
import { homedir } from "node:os";
import { createNotebookAdapter } from "@red-cup-engineering/gemini-notebook-services-section/gemini-notebook-cli";
import { openGeminiNotebook } from "@red-cup-engineering/gemini-notebook-services-section/gemini-notebook-client";
import { channelIds, loadChannel, loadEnvironment, PACKAGE_ROOT, readJson, writeAtomic, nextSlot } from "./channel.mjs";
import { adoptArtifact, adoptOperatorThumbnail, advanceLesson, beginOperatorThumbnail, episodeState, isRequested, recordStep, releaseOperatorThumbnail, retryVideo } from "./lesson.mjs";
import { advanceCompanions, companionReady, companionsWanted } from "./companions.mjs";
import { createYouTube } from "@emsenn/youtube-engineering-services-section/api";
import { existsSync, readdirSync } from "node:fs";
import { extendCurriculum } from "./curriculum.mjs";
import { EducationCandidateRefusal, EducationInferenceUnavailable } from "./inference.mjs";
import { advanceShort, repairExistingShorts } from './shorts.mjs';
import { advanceFlowShort } from './flow-shorts.mjs';
import {authorizeYouTube} from '@emsenn/youtube-engineering-services-section/authorize';
import {retainYouTubeCredential} from '@emsenn/youtube-engineering-services-section/credentials';
import {refreshAudience,rankLessons} from './audience.mjs';
import {orderProductionWork} from './production-order.mjs';

loadEnvironment();
process.env.EXPECTED_RESOLUTION_PRICING_ROOT ||= join(
  process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"),
  "561-group", "computer-inference-engine", "expected-resolution-pricing",
);
const [command = "status", ...rest] = process.argv.slice(2);
const positional = rest.filter((value, i) => !value.startsWith("--") && !rest[i - 1]?.startsWith("--"));
const channelsOf = (value = "all", {includeDisabled=false}={}) => (value === "all" ? channelIds() : [value]).map((id) => loadChannel(id)).filter((config) => includeDisabled || config.enabled !== false);
const out = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);
const episodes = (config) => {
  const dir = join(config.directory, "production", "episodes");
  return existsSync(dir) ? readdirSync(dir).filter((id) => existsSync(join(dir, id, "state.json"))).map((id) => episodeState(config, id)) : [];
};
const FINISHED = new Set(["scheduled", "published"]);
const ABANDONED = "abandoned";
// Blocked statuses that mean retained state or provenance disagrees with itself.
const FAULT = /changed|missing|mismatch|corrupt|provenance|conflict|invalid|rejected/u;
// The publication buffer kept whatever capacity allows.
const BUFFER_SLOTS = 2;
const historyOf = (config) => readJson(join(config.directory, "history.json"), {});
const historyEntries = (history) => [...(history.publications ?? []), ...(history.ready ?? [])];
const normalizeTitle = (title) => String(title ?? "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const historicalLessons = (history, curriculum = []) => {
  const entries = historyEntries(history);
  const publishedTitles = new Set(entries.map((item) => normalizeTitle(item.title)).filter(Boolean));
  return new Set([...entries.map((item) => item.lessonId), ...curriculum.filter((lesson) => publishedTitles.has(normalizeTitle(lesson.title))).map((lesson) => lesson.id)].filter(Boolean));
};
const productionLesson = (config, upload) => {
  const marker = (upload.snippet?.description ?? "").match(/\[production:([^/\]]+)\/([a-z0-9-]+)\]/u);
  return marker?.[1] === config.id ? marker[2] : undefined;
};
const futureUploads = (uploads, now) => uploads.filter((upload) => {
  if (/\[production:[^\]]+\/short(?:\/[^\]]*)?\]/u.test(upload.snippet?.description ?? '')) return false;
  const publishAt = upload.status?.publishAt;
  return publishAt && new Date(publishAt) > now && !["failed", "rejected"].includes(upload.status?.uploadStatus);
});

const lastNotebookSubmission = (config, states) => states.flatMap(state=>{
  const dir=join(config.directory,'production/episodes',state.lessonId);
  return [state.generationAttempt?.startedAt,...['notebook-short.json','notebook-brief.json','short.json'].map(file=>readJson(join(dir,file),{}).notebook?.generationAttempt?.startedAt)];
}).filter(value=>Number.isFinite(Date.parse(value))).sort().at(-1);

function shortWork(inventories, channel = 'all', only) {
  const work=[];
  for (const inventory of inventories.filter(i=>channel==='all'||channel===i.config.id)) {
    const {config,episodes:states,uploads,youtube}=inventory;
    for (const [origin,advance] of [['gemini-notebook',advanceShort],['google-flow',advanceFlowShort]].filter(([origin])=>(config.shorts?.providers??['gemini-notebook','google-flow']).includes(origin))) {
      const candidates=states.filter(state=>state.youtubeVideoId&&state.notebookId&&(!only||state.lessonId===only)).map(state=>{
        const dir=join(config.directory,'production/episodes',state.lessonId);
        const short=readJson(join(dir,'notebook-short.json'),readJson(join(dir,'short.json'),{})),flow=readJson(join(dir,'flow-short-plan.json'),{});
        // Match the migration performed by advanceShort, including older shared
        // checkpoints whose YouTube ID has no Notebook carrier measurement.
        const legacy=short.notebook?.generationAttempt?.format==='brief'||Boolean(short.youtubeVideoId&&short.carrier?.width===short.carrier?.height);
        const wanted=origin==='gemini-notebook' ? short.stage!=='published'||legacy : flow.publishedConsumer!==flow.consumer||!flow.consumer;
        const accepted=origin==='gemini-notebook' ? !legacy&&Boolean(short.notebook?.generationStarted||short.notebook?.artifactId||short.youtubeVideoId) : Boolean(flow.queuedAt);
        const parent=uploads.find(video=>video.id===state.youtubeVideoId);
        return {channel:config.id,lesson:state.lessonId,origin,accepted,wanted,lastNotebookSubmission:inventory.lastNotebookSubmission,
          deadline:parent?.status?.publishAt??(parent?.status?.privacyStatus==='public'?parent.snippet.publishedAt:null)??state.publishAt??state.plannedPublishAt??state.createdAt,
          createdAt:state.createdAt,
          run:()=>advance(config,state.lessonId,{youtube,uploads})};
      }).filter(item=>(only||item.wanted)&&(config.enabled!==false||item.accepted));
      // Resume every accepted Short, including private uploads waiting on Studio.
      // Those waits must not monopolize the channel's next generation opportunity.
      work.push(...candidates.filter(item=>item.accepted));
      work.push(...orderProductionWork(candidates.filter(item=>!item.accepted)).slice(0,1));
    }
  }
  return work;
}
async function repairShorts(inventories) {
  for(const {config,youtube,uploads} of inventories) {
    try {for(const result of await repairExistingShorts(config,{youtube,uploads})) out(result);}
    catch(error) {failures++;out({channel:config.id,status:'existing-short-error',error:error.message});}
  }
}
async function runWork(work) {
  for(const item of orderProductionWork(work)) {
    out({channel:item.channel,lesson:item.lesson,origin:item.origin,status:'production-turn',accepted:item.accepted,deadline:item.deadline});
    try {const result=await item.run();out(result);if(FAULT.test(result.status)) failures++;}
    catch(error) {failures++;out({channel:item.channel,lesson:item.lesson,origin:item.origin,status:'production-error',error:error.message});}
  }
}

let failures = 0;
if (command === "status") {
  for (const config of channelsOf(positional[0])) {
    const byLesson = new Map(episodes(config).map((state) => [state.lessonId, state]));
    out({ channel: config.id, format: config.video.format, credentialPresent: Boolean(process.env[config.refreshTokenEnv]),
      requested: config.curriculum.filter((l) => isRequested(l, byLesson.get(l.id))).map((l) => ({ lesson: l.id, stage: byLesson.get(l.id)?.stage ?? "new", videoId: byLesson.get(l.id)?.youtubeVideoId, error: byLesson.get(l.id)?.lastError?.message })) });
  }
} else if (command === "research") {
  const [channel, lesson] = positional;
  if (!channel || !lesson || channel === "all") throw new Error("usage: research <channel> <lesson>");
  out(await advanceLesson(loadChannel(channel), lesson, { researchOnly: true }));
} else if (command === "produce") {
  const [channel = "all", only] = positional;
  const production = readJson(join(PACKAGE_ROOT, "production.json"), {});
  // Every enabled channel is inventoried, since all of them share the account's windows.
  const inventories = [];
  // Disabling a launch must not strand media already accepted by the provider.
  for (const config of channelsOf("all",{includeDisabled:true}).filter(config=>config.enabled!==false||episodes(config).some(state=>state.generationStarted||state.artifactId))) {
    try {
      const byLesson = new Map(episodes(config).map((state) => [state.lessonId, state]));
      const history = historyOf(config);
      const historical = historicalLessons(history, config.curriculum);
      const youtube = createYouTube({ channelId: config.youtubeChannelId, refreshTokenEnv: config.refreshTokenEnv, env: process.env, fetchImpl: globalThis.fetch, authorize: async () => {} });
      let uploads = [], inventoryAvailable = true;
      try { uploads = await youtube.listUploads(); }
      catch (error) {
        inventoryAvailable = false;
        if (channel === "all" || channel === config.id) { failures += 1; out({ channel: config.id, status: "youtube-inventory-unavailable", error: error.message }); }
      }
      const represented = new Set(uploads.map((upload) => productionLesson(config, upload)).filter(Boolean));
      const pending = config.curriculum.filter((lesson) => {
        const state = byLesson.get(lesson.id);
        return state?.stage === "scheduled" || (!historical.has(lesson.id) && isRequested(lesson, state) && !FINISHED.has(state?.stage) && state?.stage !== ABANDONED);
      });
      const unpublished = pending.filter((lesson) => !byLesson.get(lesson.id)?.youtubeVideoId && !represented.has(lesson.id));
      const future = futureUploads(uploads, new Date());
      inventories.push({ config, byLesson, history, historical, represented, inventoryAvailable, pending, future, uploads, youtube,
        lastNotebookSubmission:lastNotebookSubmission(config,[...byLesson.values()]),
        pendingReservations: unpublished.length, episodes: [...byLesson.values()],
        queued: unpublished.filter((lesson) => { const state = byLesson.get(lesson.id); return !state?.generationStarted && !state?.artifactId; }).length,
        scheduled: future.length + unpublished.length });
    } catch (error) {
      failures += 1;
      out({ channel: config.id, error: error.message });
    }
  }
  const selected=inventories.filter(({config})=>channel==='all'||channel===config.id);
  const work=[];
  for (const inventory of selected) {
    const { config, byLesson, history, historical, represented, inventoryAvailable, pending, future, pendingReservations } = inventory;
    try {
    const audience=await refreshAudience(config,{youtube:inventory.youtube,uploads:inventory.uploads});
    let lessons;
    if (only) {
      const named = config.curriculum.find((lesson) => lesson.id === only);
      if (!named) throw new Error(`${config.id} has no curriculum lesson ${only}`);
      lessons = historical.has(only) || (represented.has(only) && !byLesson.get(only)?.youtubeVideoId) ? [] : [named];
      if (!lessons.length) out({ channel: config.id, lesson: only, status: "already-covered" });
    } else {
      const pendingIds = new Set(pending.map(({ id }) => id));
      lessons = [...pending];
      const needed = inventoryAvailable && config.enabled!==false ? Math.max(0, BUFFER_SLOTS - future.length - pendingReservations) : 0;
      const available = () => config.curriculum.filter((lesson) => !historical.has(lesson.id) && !represented.has(lesson.id) && !byLesson.get(lesson.id)?.youtubeVideoId && byLesson.get(lesson.id)?.stage !== ABANDONED && !pendingIds.has(lesson.id));
      let candidates = available();
      if (candidates.length < needed) {
        try {
          const added = await extendCurriculum(config, Math.min(3, needed - candidates.length), { history, audience, env: process.env });
          config.curriculum.push(...added);
          candidates = available();
        } catch (error) {
          if (!(error instanceof EducationInferenceUnavailable || error instanceof EducationCandidateRefusal)) failures += 1;
          out({ channel: config.id, status: "curriculum-extension-failed", error: error.message });
        }
      }
      lessons.push(...rankLessons(config,candidates,{audience,completed:new Set([...historical,...represented,...[...byLesson.values()].filter(state=>FINISHED.has(state?.stage)).map(state=>state.lessonId)])}).slice(0,needed));
    }
    const occupied=inventory.uploads.map(video=>video.status?.publishAt||(video.status?.privacyStatus==='public'&&video.snippet?.publishedAt)).filter(Boolean);
    for (const lesson of lessons) {
      const state=byLesson.get(lesson.id);
      const accepted=Boolean(state?.generationStarted||state?.artifactId||state?.youtubeVideoId);
      if(config.enabled===false&&!accepted) continue;
      const uploaded=inventory.uploads.find(video=>video.id===state?.youtubeVideoId);
      const deadline=uploaded?.status?.publishAt??(uploaded?.status?.privacyStatus==='public'?uploaded.snippet.publishedAt:null)??(state?.plannedPublishAt&&Date.parse(state.plannedPublishAt)>Date.now()?state.plannedPublishAt:nextSlot(config.schedule,new Date(),occupied));
      occupied.push(deadline);
      work.push({channel:config.id,lesson:lesson.id,origin:'longform',deadline,createdAt:state?.createdAt,lastNotebookSubmission:inventory.lastNotebookSubmission,
        accepted,
        run:()=>advanceLesson(config,lesson.id,{commissioned:true})});
    }
    } catch (error) {
      failures += 1;
      out({ channel: config.id, error: error.message });
    }
  }
  if (!only) {
    const enabled=selected.filter(({config})=>config.enabled!==false);
    await repairShorts(enabled);
    work.push(...shortWork(selected,channel));
  }
  await runWork(work);
  // A just-uploaded longform can acquire its Shorts on this turn as well.
  // Refresh checkpoints, and only add parents absent from the initial inventory.
  if (!only) await runWork(shortWork(selected.filter(({config})=>config.enabled!==false).map(inventory=>({...inventory,
    episodes:episodes(inventory.config).filter(state=>!inventory.episodes.some(previous=>previous.lessonId===state.lessonId&&previous.youtubeVideoId))})),channel));
  // companions: lessons already in flight first, then the newest made lessons, until the window is spent.
  const { kinds = [], lessonsPerTurn = 3, maxFailures = 2 } = production.companions ?? {};
  if (kinds.length && !only) {
    const candidates = inventories.filter(({ config }) => config.enabled!==false&&(channel === "all" || channel === config.id)).flatMap(({ config, episodes: states }) => states
      .filter((state) => companionReady(state))
      .map((state) => ({ config, state, checkpoint: readJson(join(config.directory, "production", "episodes", state.lessonId, "companions.json"), null) }))
      .filter(({ checkpoint }) => companionsWanted(checkpoint, kinds, { maxFailures }).length || (checkpoint?.source?.owned && !checkpoint.source.removed)))
      // Reconcile accepted or uncertain submissions before a new request can wait on their holds.
      .sort((a, b) => {
        const unresolved = (checkpoint) => Object.values(checkpoint?.kinds ?? {}).some((kind) => kind.work?.attempt || (kind.work?.artifactId && !kind.receipt));
        return Number(unresolved(b.checkpoint)) - Number(unresolved(a.checkpoint)) || Number(Boolean(b.checkpoint)) - Number(Boolean(a.checkpoint)) || String(b.state.createdAt).localeCompare(String(a.state.createdAt));
      });
    let client;
    const notebook = createNotebookAdapter();
    for (const { config, state } of candidates.slice(0, lessonsPerTurn)) {
      try {
        client ??= await openGeminiNotebook();
        const result = await advanceCompanions(config, state.lessonId, { client, notebook, kinds, maxFailures, recordStep });
        out(result);
        if (FAULT.test(result.status)) failures += 1;
        if (result.status === "companions-awaiting-capacity") break;
      } catch (error) { failures += 1; out({ channel: config.id, lesson: state.lessonId, status: "companions-error", error: error.message }); break; }
    }
  }
} else if (command === "shorts") {
  const inventories=[];
  for(const config of channelsOf(positional[0])) {
    const youtube=createYouTube({channelId:config.youtubeChannelId,refreshTokenEnv:config.refreshTokenEnv,env:process.env,fetchImpl:globalThis.fetch,authorize:async()=>{}});
    const states=episodes(config);
    inventories.push({config,episodes:states,uploads:await youtube.listUploads(),youtube,lastNotebookSubmission:lastNotebookSubmission(config,states)});
  }
  await repairShorts(inventories);
  await runWork(shortWork(inventories,positional[0]??'all',positional[1]));
} else if (command === "artifacts") {
  const config = loadChannel(positional[0]);
  const notebookId = config.notebookId ?? readJson(join(config.directory, "production", "notebook.json"), {}).notebookId;
  out(await createNotebookAdapter().listVideos({ notebookId }));
} else if (command === "adopt") {
  const [channel, lesson, artifactId] = positional;
  out({ channel, lesson, status: "adopted", artifact: await adoptArtifact(loadChannel(channel), lesson, artifactId) });
} else if (command === "begin-thumbnail") {
  const [channel, lesson] = positional;
  if (!channel || !lesson) throw new Error("usage: begin-thumbnail <channel> <lesson>");
  out({ channel, lesson, ...await beginOperatorThumbnail(loadChannel(channel), lesson) });
} else if (command === "adopt-thumbnail") {
  const [channel, lesson, image, spent] = positional;
  if (!channel || !lesson || !image || !/^(0|[1-9][0-9]*)$/u.test(spent ?? "")) throw new Error("usage: adopt-thumbnail <channel> <lesson> <image> <spent-units>");
  out({ channel, lesson, status: "thumbnail-adopted", ...await adoptOperatorThumbnail(loadChannel(channel), lesson, image, Number(spent)) });
} else if (command === "release-thumbnail") {
  const [channel, lesson, reason] = positional;
  if (!channel || !lesson || !reason) throw new Error("usage: release-thumbnail <channel> <lesson> <expired|logged-out|quota-exhausted|ui-changed|operator-declined>");
  out({ channel, lesson, status: "thumbnail-released", ...await releaseOperatorThumbnail(loadChannel(channel), lesson, reason) });
} else if (command === "retry") {
  const [channel, lesson] = positional;
  if (!channel || !lesson) throw new Error("usage: retry <channel> <lesson>");
  retryVideo(loadChannel(channel), lesson);
  out({ channel, lesson, status: "readmitted" });
} else if (command === "authorize") {
  const configs=positional.map(id=>loadChannel(id));
  if(!configs.length)throw new Error('authorize requires one or more channel identifiers');
  const handoffIndex=rest.indexOf('--handoff'),prefix=handoffIndex>=0?rest[handoffIndex+1]:undefined;
  if(handoffIndex>=0&&!prefix)throw new Error('--handoff requires a new unique file path');
  for(const config of configs) {
    const handoff=prefix&&(configs.length===1?prefix:prefix+'-'+config.id+'.json');
    if(handoff&&existsSync(handoff))throw new Error('Consent handoff file already exists; choose a fresh path to prevent stale links');
    let connected=false;
    await new Promise((resolve,reject)=>{
      const server=authorizeYouTube({channelId:config.youtubeChannelId,clientId:process.env.YOUTUBE_OAUTH_CLIENT_ID,clientSecret:process.env.YOUTUBE_OAUTH_CLIENT_SECRET,
        onToken:async token=>{retainYouTubeCredential(config.refreshTokenEnv,token);connected=true;out({channel:config.id,youtubeChannelId:config.youtubeChannelId,status:'connected'});},
        onAuthorizationUrl:url=>{if(handoff)writeAtomic(handoff,{channel:config.id,url,readyAt:new Date().toISOString()});out({channel:config.id,status:'consent-ready',...(handoff?{handoff}:{url})});},
      });
      server.once('error',reject);server.once('close',()=>connected?resolve():reject(new Error('Channel authorization expired')));
    });
  }
} else if (command === "verify") {
  for (const config of channelsOf(positional[0])) {
    try {
      const identity = await createYouTube({ channelId: config.youtubeChannelId, refreshTokenEnv: config.refreshTokenEnv, env: process.env, fetchImpl: globalThis.fetch, authorize: async () => {} }).verifyIdentity();
      out({ channel: config.id, youtubeChannelId: identity.id, status: "authenticated" });
    } catch (error) { failures += 1; out({ channel: config.id, error: error.message }); }
  }
} else {
  throw new Error("usage: status|research|produce|authorize|artifacts|adopt|begin-thumbnail|adopt-thumbnail|release-thumbnail|retry|verify (see src/cli.mjs)");
}
if (failures) process.exitCode = 1;
