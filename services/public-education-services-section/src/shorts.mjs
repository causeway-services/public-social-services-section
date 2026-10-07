import {admitNotebookQuota} from '@red-cup-engineering/gemini-notebook-services-section/quota';
// One Notebook brief per longform lesson. Drive retains both the source and the Short.
// Existing uploads keep their identity; their metadata and native Related Video are repaired.
import {existsSync,readFileSync,mkdirSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {advanceNotebookVideo,NotebookVideoBlocked} from '@red-cup-engineering/gemini-notebook-services-section/report-video';
import {createNotebookAdapter} from '@red-cup-engineering/gemini-notebook-services-section/gemini-notebook-cli';
import {keepMediaInDrive,receiveMediaFromDrive,releaseMediaCache} from '@red-cup-engineering/google-drive-services-section/media';
import {episodeDirectory,lessonReportPath,readJson,writeAtomic} from './channel.mjs';
import {recordStep} from './lesson.mjs';
import {produceEducationArtifact,EducationCandidateRefusal} from './inference.mjs';
import {transcribeMedia} from '@red-cup-engineering/computer-inference-engine/audio/transcription';

import {teachingInstructions} from './editorial.mjs';
import {selectTeachingAngle} from './audience.mjs';
const SCHEMA={type:'object',properties:{hashtags:{type:'array',minItems:2,maxItems:4,items:{type:'string'}},description:{type:'string',maxLength:2000}},required:['hashtags','description']};
export function admitShortMetadata(candidate,parentId,language='en') {
 const tags=candidate.hashtags;
 if(!Array.isArray(tags)||tags.length<2||tags.length>4||tags.some(t=>typeof t!=='string'||!/^#[\p{L}\p{N}_]{2,40}$/u.test(t))||new Set(tags.map(t=>t.toLowerCase())).size!==tags.length||tags.join(' ').length>100||tags.some(t=>/^#(?:viral|fyp|trending|shorts)$/iu.test(t))) throw new EducationCandidateRefusal('Use two to four distinct, relevant topic hashtags within a 100-character title');
 if(typeof candidate.description!=='string'||!candidate.description.trim()||candidate.description.length>2000) throw new EducationCandidateRefusal('Short summary is missing or oversized');
 const description=`${/^zh/iu.test(language)?'完整讲解：':'The full lesson:'} https://youtu.be/${parentId}\n\n${candidate.description}`;
 if(Buffer.byteLength(description,'utf8')>4500) throw new EducationCandidateRefusal('Short description exceeds its UTF-8 byte budget');
 return {title:tags.join(' '),tags:tags.map(t=>t.slice(1)),description};
}
/** Specific topics already approved for the longform remain valid for its Shorts. */
export function topicHashtags(tags=[]) {
 const hashtags=[];
 const broad=tag=>/^(?:ai|artificial intelligence|technology|science|mathematics|business)$/iu.test(String(tag).trim());
 for(const tag of [...tags.filter(t=>!broad(t)),...tags.filter(broad)]) {
  if(broad(tag)&&hashtags.length>=2) break;
  if(typeof tag!=='string'||/^(?:shorts?|education|learning|viral|fyp|trending)$/iu.test(tag.trim())) continue;
  const hashtag='#'+tag.split(/[^\p{L}\p{N}_]+/u).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join('');
  const concept=h=>/^#(?:AI|ArtificialIntelligence)$/iu.test(h)?'#artificialintelligence':h.toLowerCase();
  if(!/^#[\p{L}\p{N}_]{2,40}$/u.test(hashtag)||hashtags.some(h=>concept(h)===concept(hashtag))) continue;
  if([...hashtags,hashtag].join(' ').length<=100) hashtags.push(hashtag);
  if(hashtags.length===3) break;
 }
 return hashtags;
}

/** Audit every owned Short, including published checkpoints. Title repair never waits on Studio. */
export async function repairExistingShorts(config,{youtube,uploads,only}) {
 const prepared=[],results=[];
 for(const video of uploads) {
  const marker=video.snippet?.description?.match(/\[production:([^/\]]+)\/([a-z0-9-]+)\/short(?:\/([^\]]+))?\]/u);
  if(marker?.[1]!==config.id||(only&&marker[2]!==only)) continue;
  const lessonId=marker[2],dir=episodeDirectory(config,lessonId),parent=readJson(join(dir,'state.json'),{});
  if(!parent.youtubeVideoId) {results.push({channel:config.id,lesson:lessonId,videoId:video.id,status:'short-parent-missing'});continue;}
  const suffix=marker[3],stem=suffix==='notebook-vertical'?'notebook-short':/^flow\/[0-9a-f]{16}$/u.test(suffix??'')?'flow-short-'+suffix.slice(5):!suffix?'existing-short-'+video.id:null;
  if(!stem) continue;
  const path=join(dir,stem+'.json'),metadataPath=join(dir,stem+'-metadata.json');
  let state=readJson(path,{origin:suffix==='notebook-vertical'?'gemini-notebook':'google-flow',youtubeVideoId:video.id,parentVideoId:parent.youtubeVideoId});
  const save=updates=>{state={...state,...updates,updatedAt:new Date().toISOString()};writeAtomic(path,state);};
  if((state.youtubeVideoId&&state.youtubeVideoId!==video.id)||(state.parentVideoId&&state.parentVideoId!==parent.youtubeVideoId)) {results.push({channel:config.id,lesson:lessonId,videoId:video.id,status:'short-parent-mismatch'});continue;}
  save({youtubeVideoId:video.id,parentVideoId:parent.youtubeVideoId});
  try {
   const metadata=shortMetadata(config,lessonId,parent.youtubeVideoId,metadataPath);
   if(video.snippet.title!==metadata.title) {await youtube.setTitle({videoId:video.id,title:metadata.title});save({title:metadata.title,titleError:null});video.snippet.title=metadata.title;results.push({channel:config.id,lesson:lessonId,videoId:video.id,status:'short-title-repaired',title:metadata.title});}
   prepared.push({config,lessonId,parent,youtube,existing:[video],state,save,metadataPath,marker:marker[0].slice(12,-1),work:join(config.directory,'.work',lessonId),output:join(config.directory,'.work',lessonId,'existing-short.mp4'),record:entry=>recordStep(config,lessonId,{step:'short',provider:state.origin,...entry})});
  }catch(error){results.push({channel:config.id,lesson:lessonId,videoId:video.id,status:'short-metadata-review-required',message:error.message});}
 }
 for(const item of prepared) {
  try {results.push(await publishPreparedShort(item));}
  catch(error){results.push({channel:config.id,lesson:item.lessonId,videoId:item.state.youtubeVideoId,status:'short-repair-error',message:error.message});}
 }
 return results;
}

/** Retained metadata must pass the same admission as freshly drafted metadata. */
export function shortMetadata(config,lessonId,parentId,path) {
 const cached=readJson(path,{});
 try {admitShortMetadata({hashtags:cached.title?.split(' '),description:cached.description},parentId,config.video.language);return cached;}
 catch(error) {if(!(error instanceof EducationCandidateRefusal))throw error;}
 const lesson=config.curriculum.find(row=>row.id===lessonId),parent=readJson(join(episodeDirectory(config,lessonId),'metadata.json'),{});
 const hashtags=topicHashtags([...parent.tags??[],...lesson?.tags??[]]);
 const metadata=admitShortMetadata({hashtags,description:cached.description?.trim().slice(0,1500)||lesson?.title||lessonId},parentId,config.video.language);
 writeAtomic(path,metadata);return metadata;
}
const gatePath=config=>join(config.directory,'production/related-video-gate.json');
export function retryRelatedVideos(config) {writeAtomic(gatePath(config),{});}
function relatedGate(config) {
 const gate=readJson(gatePath(config),{});
 return gate.channelId===config.youtubeChannelId&&Date.parse(gate.retryAt)>Date.now()?gate:null;
}
function relatedFailure(config,error,videoId) {
 // Feature/account gates are observed, never bypassed. Periodic probes notice completed verification.
 const prior=readJson(gatePath(config),{}),code=error.code??'YOUTUBE_STUDIO_ERROR';
 const attempts=prior.code===code?(prior.attempts??0)+1:1;
 const human=/FEATURE_VERIFICATION_REQUIRED|SIGN_IN_REQUIRED|STUDIO_VERIFICATION_REQUIRED/u.test(code);
 const delay=code==='YOUTUBE_STUDIO_HUMAN_VERIFICATION_IN_PROGRESS'?5*60_000:human?6*3_600_000:Math.min(6*3_600_000,15*60_000*2**Math.min(attempts-1,5));
 const observedAt=new Date().toISOString();
 writeAtomic(gatePath(config),{channelId:config.youtubeChannelId,code,message:error.message,videoId,attempts,observedAt,retryAt:new Date(Date.now()+delay).toISOString()});
}
export function probeShort(path) {
 const result=spawnSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,width,height','-of','json',path],{encoding:'utf8',timeout:30_000});
 if(result.status!==0) throw new Error('Cannot inspect the Notebook video carrier');
 const data=JSON.parse(result.stdout),video=data.streams.find(s=>s.codec_type==='video');
 return {duration:Number(data.format.duration),width:video?.width,height:video?.height};
}
export async function advanceShort(config,lessonId,{youtube,uploads,env=process.env,notebook=createNotebookAdapter({env})}) {
 const lesson=config.curriculum.find(l=>l.id===lessonId),dir=episodeDirectory(config,lessonId),parent=readJson(join(dir,'state.json'),{});
 const path=join(dir,'notebook-short.json'),work=join(config.directory,'.work',lessonId),source=join(work,'notebook-vertical.mp4'),output=join(work,'short-vertical.mp4');
 const legacyPath=join(dir,'short.json'),legacy=readJson(legacyPath,{});
 if(!existsSync(path)&&legacy.notebook) {writeAtomic(path,legacy);writeAtomic(legacyPath,Object.fromEntries(Object.entries(legacy).filter(([k])=>['consumer','queuedAt'].includes(k))));}
 let state=readJson(path,{});
 const save=updates=>{state={...state,...updates,updatedAt:new Date().toISOString()};writeAtomic(path,state);};
 const record=entry=>recordStep(config,lessonId,{step:'short',...entry});
 const result=(status,message)=>({channel:config.id,lesson:lessonId,status:`short-${status}`,videoId:state.youtubeVideoId,parentVideoId:state.parentVideoId,...(message?{message}:{})});
 if(!lesson||!parent.youtubeVideoId||!parent.notebookId) return result('not-ready');
 // Retain accepted Brief work and its publication history, but replace the route
 // that turned a landscape summary into a square upload. Native Short is format 4.
 const briefPath=join(dir,'notebook-brief.json');
 if(state.notebook?.generationAttempt?.format==='brief'||(state.youtubeVideoId&&state.carrier?.width===state.carrier?.height)) {
  if(!existsSync(briefPath)) writeAtomic(briefPath,state);
  if(state.sourceDrive) await releaseMediaCache(state.sourceDrive,join(work,'notebook-short.mp4'));
  if(state.drive) await releaseMediaCache(state.drive,join(work,'short.mp4'));
  for(const [from,to] of [['notebook-short-metadata.json','notebook-brief-metadata.json'],['short-transcript.md','notebook-brief-transcript.md']]) {
   if(existsSync(join(dir,from))&&!existsSync(join(dir,to))) renameSync(join(dir,from),join(dir,to));
  }
  state={parentVideoId:parent.youtubeVideoId,supersededVideoId:state.youtubeVideoId};save({});
  record({outcome:'native-short-replaces-landscape-brief',previousVideoId:state.supersededVideoId});
 }
 const brief=readJson(briefPath,{});
 if(brief.notebook?.artifactId&&!brief.sourceDrive) {
  const artifact=await notebook.getVideo({notebookId:brief.notebook.notebookId??parent.notebookId,artifactId:brief.notebook.artifactId});
  if(artifact.status==='completed') {
   const retained=join(work,'notebook-brief.mp4');mkdirSync(work,{recursive:true});
   await notebook.downloadVideo({notebookId:artifact.notebookId,artifactId:artifact.artifactId,outputPath:retained});
   const sourceDrive=await keepMediaInDrive(retained,{folder:`education/${config.id}/${lessonId}/shorts`});
   if(!sourceDrive) return result('drive-required','The accepted landscape artifact must be retained in Drive');
   writeAtomic(briefPath,{...brief,sourceDrive});await releaseMediaCache(sourceDrive,retained);
  }
 }
 if(state.parentVideoId&&state.parentVideoId!==parent.youtubeVideoId) return result('parent-mismatch','The retained Short belongs to another longform upload');
 if(!state.parentVideoId) save({parentVideoId:parent.youtubeVideoId});
 const marker=`${config.id}/${lessonId}/short/notebook-vertical`,existing=uploads.filter(v=>v.snippet?.description?.includes(`[production:${marker}]`));
 if(existing.length>1) return result('needs-reconcile','Multiple uploads carry this Short marker');
 if(!state.youtubeVideoId&&existing.length) save({youtubeVideoId:existing[0].id,origin:'legacy-upload'});
 const metadataPath=join(dir,'notebook-short-metadata.json');
 if(!state.youtubeVideoId) {
  const reportPath=lessonReportPath(config,lesson);
  if(!existsSync(reportPath)) return result('report-missing');
  mkdirSync(work,{recursive:true});
  if(!state.sourceDrive) {
   let current={channel:config.id,lessonId,notebookId:parent.notebookId,...state.notebook};
   const saveNotebook=updates=>{current={...current,...updates};save({notebook:current});};

   const angle=notebookAngle(lessonId,{config,provider:'gemini-notebook'});
   const retained=current.generationAttempt?.prompt;
   const prompt=retained?.endsWith('\n'+lesson.title)?retained.slice(0,-lesson.title.length-1):teachingInstructions(config,lesson,{short:true})+'\n'+angle.instruction;
   if(state.prompt!==prompt) {
    const actual=retained?ANGLES.find(row=>prompt.includes(row.instruction)):angle;
    save({prompt,angle:actual?.id,angleSelection:retained?{mode:'retained-submission'}:angle.selection});
   }
   // Uploading a source does not submit a video. Before any generation attempt,
   // a new teaching angle can reuse that source without manufacturing another one.
   if(current.videoRequestSha256&&!current.generationAttempt&&!current.generationStarted&&!current.artifactId) saveNotebook({videoRequestSha256:undefined});
   const made=await advanceNotebookVideo({reportPath,outputPath:source,title:lesson.title,sourceTitle:`${config.id}/${lessonId}/short/${parent.reportSha256.slice(0,16)}`,video:{format:'short',style:'auto',language:current.generationAttempt?.language??config.video.language??'en',prompt},notebookId:parent.notebookId,checkpoint:current,notebook,
    onCheckpoint:saveNotebook,onRecord:e=>record({provider:'gemini-notebook',...e}),
    admitGeneration:async()=>{const a=await admitNotebookQuota({env});if(a.admitted)record({step:'short',outcome:'native-quota-observed',usage:a.usage});return a.admitted?true:{message:a.message};}});
   if(made instanceof NotebookVideoBlocked) return result(made.status,made.message);
   const drive=await keepMediaInDrive(source,{folder:`education/${config.id}/${lessonId}/shorts`,expectedSha256:current.downloadSha256?.replace(/^sha256:/u,'')});
   if(!drive) return result('drive-required','Short media must enter Drive before packaging or publication');
   save({origin:'gemini-notebook',sourceDrive:drive,artifactId:made.artifactId});record({outcome:'notebook-received',artifactId:made.artifactId,drive:drive.url});
  }
  if(!state.drive) {
   await receiveMediaFromDrive(state.sourceDrive,source);
   const carrier=probeShort(source);
   if(!Number.isFinite(carrier.duration)||carrier.duration<=0||carrier.duration>180) {await releaseMediaCache(state.sourceDrive,source);return result('duration-review-required',`Notebook produced ${carrier.duration} seconds; retain the complete artifact in Drive and review it`);}
   // Native Short can be 406×720: the provider rounds an odd 405-pixel width
   // for its encoder. Accept that rounding and normalize the full portrait frame.
   if(!carrier.width||carrier.width>=carrier.height||Math.abs(carrier.width-carrier.height*9/16)>2) {await releaseMediaCache(state.sourceDrive,source);return result('portrait-review-required',`Notebook returned ${carrier.width}×${carrier.height}; a native 9:16 Short is required`);}
   if(carrier.width===720&&carrier.height===1280) {
    renameSync(source,output);save({drive:state.sourceDrive,carrier,nativeCarrier:carrier});
    record({outcome:'native-vertical-short-received',drive:state.drive.url,...carrier});
   } else {
   const encoded=spawnSync('ffmpeg',['-nostdin','-v','error','-y','-i',source,'-vf','scale=720:1280,setsar=1','-c:v','libx264','-preset','veryfast','-crf','23','-threads','1','-c:a','aac','-movflags','+faststart',output+'.part.mp4'],{encoding:'utf8',timeout:600_000});
   if(encoded.status!==0) throw new Error(`Native portrait normalization failed: ${encoded.error?.message??encoded.stderr.slice(-500)}`);
   renameSync(output+'.part.mp4',output);
   const framed=probeShort(output);if(framed.width!==720||framed.height!==1280||framed.duration>180) throw new Error('Native Short is not a 720×1280 carrier within three minutes');
   const drive=await keepMediaInDrive(output,{folder:`education/${config.id}/${lessonId}/shorts`});
   if(!drive) return result('drive-required','The normalized portrait media must be retained in Drive');
   save({drive,carrier:framed,nativeCarrier:carrier});await releaseMediaCache(state.sourceDrive,source);record({outcome:'native-vertical-short-received',drive:drive.url,...framed});
   }
  }
  await receiveMediaFromDrive(state.drive,output);
  const transcriptPath=join(dir,'short-transcript.md');
  if(!existsSync(transcriptPath)) writeAtomic(transcriptPath,(await transcribeMedia(output,{env}))+'\n');
 }
 return publishPreparedShort({config,lessonId,parent,youtube,existing,state,save,record,work,output,marker,metadataPath,env});
}

/** Publish either provider's retained media through the same YouTube effects. */
export async function publishPreparedShort({config,lessonId,parent,youtube,existing=[],state,save,record,work,output,marker,metadataPath,env=process.env,metadataContext}) {
 const persist=save;save=updates=>{state={...state,...updates};persist(updates);};
 const dir=episodeDirectory(config,lessonId);
 const result=(status,message)=>({channel:config.id,lesson:lessonId,origin:state.origin,status:`short-${status}`,videoId:state.youtubeVideoId,parentVideoId:parent.youtubeVideoId,...(message?{message}:{})});
 try {
 if(!existsSync(metadataPath)) {
  const old=existing[0]??(state.youtubeVideoId?await youtube.getVideo(state.youtubeVideoId):null);
  const transcriptPath=join(dir,'short-transcript.md');
  const context=metadataContext??(existsSync(transcriptPath)?readFileSync(transcriptPath,'utf8'):`Existing Short title: ${old.snippet.title}\nExisting description: ${old.snippet.description}`);
  await produceEducationArtifact({env,objective:'Write accurate YouTube Short metadata with a hashtag-only title. Choose two to four specific topic hashtags that viewers seeking this subject would use. Exclude generic viral, FYP, trending and Shorts hashtags. Preserve the actual subject and qualifications. Return hashtags including # and a short description in the channel output language.',context:teachingInstructions(config,config.curriculum.find(l=>l.id===lessonId),{short:true})+'\n'+context,schema:/^zh/iu.test(config.video.language??'en')?{...SCHEMA,properties:{...SCHEMA.properties,description:{type:'string',maxLength:1100}}}:SCHEMA,taskClass:'education-short-metadata',maximumOutputTokens:600,artifactPath:metadataPath,assay:c=>admitShortMetadata(c,parent.youtubeVideoId,config.video.language),persist:v=>{writeAtomic(metadataPath,v);return v;}});
 }
 const metadata=shortMetadata(config,lessonId,parent.youtubeVideoId,metadataPath);
 if(!state.youtubeVideoId) {
  const uploadPath=join(work,marker.split('/').slice(-2).join('-')+'-upload.json');
  if(state.drive) await receiveMediaFromDrive(state.drive,output);
  const uploaded=await youtube.upload({filePath:output,metadata,language:config.video.language,marker,checkpoint:readJson(uploadPath,undefined),onCheckpoint:c=>writeAtomic(uploadPath,c)});
  save({youtubeVideoId:uploaded.id});record({outcome:'uploaded-private',videoId:uploaded.id,artifactId:state.artifactId});
 }
 if(state.drive) await releaseMediaCache(state.drive,output);
 let titleError;
 try {if(existing.find(video=>video.id===state.youtubeVideoId)?.snippet.title!==metadata.title)await youtube.setTitle({videoId:state.youtubeVideoId,title:metadata.title});save({title:metadata.title,titleError:null});}
 catch(error) {if(error.reason!=='insufficientPermissions') throw error;titleError=error;save({titleError:{code:'YOUTUBE_VIDEO_MANAGEMENT_CONSENT_REQUIRED',message:'Reconnect the channel with YouTube video-management permission to update its title'}});}
 if(config.enabled===false) return result('staged-private','Channel launch is disabled');
 const parentVideo=await youtube.getVideo(parent.youtubeVideoId);
 if(!['public','unlisted'].includes(parentVideo?.status.privacyStatus)) return result('awaiting-longform-publication','YouTube requires the Related Video target to be public or unlisted');
 const short=await youtube.getVideo(state.youtubeVideoId);
 if(short?.status.uploadStatus!=='processed') return result('youtube-processing');
 const receipt=state.relatedVideo;
 const verified=receipt?.videoId===state.youtubeVideoId&&receipt?.relatedVideoId===parent.youtubeVideoId&&receipt?.carrier==='youtube-studio-related-video'&&Date.now()-Date.parse(receipt.verifiedAt)<24*3_600_000;
 if(!verified) {
  const gate=relatedGate(config);if(gate)return {...result('related-video-pending',gate.message),code:gate.code,retryAt:gate.retryAt};
  try {const relatedVideo=await youtube.setRelatedVideo({videoId:state.youtubeVideoId,relatedVideoId:parent.youtubeVideoId});if(relatedVideo?.videoId!==state.youtubeVideoId||relatedVideo?.relatedVideoId!==parent.youtubeVideoId||relatedVideo?.carrier!=='youtube-studio-related-video'||!Number.isFinite(Date.parse(relatedVideo.verifiedAt)))throw new Error('Studio did not return verified Related Video identity');save({relatedVideo,relatedVideoError:null});retryRelatedVideos(config);record({outcome:'related-video-verified',...relatedVideo});}
  catch(error) {relatedFailure(config,error,state.youtubeVideoId);save({relatedVideoError:{code:error.code??'YOUTUBE_STUDIO_ERROR',message:error.message}});return {...result('related-video-pending',error.message),code:error.code,retryAt:relatedGate(config)?.retryAt};}
 }
 if(titleError) return result('management-consent-required',state.titleError?.message??'YouTube video-management permission is required');
 try {await youtube.publish({videoId:state.youtubeVideoId});}
 catch(error) {if(error.reason!=='insufficientPermissions') throw error;save({publishError:{code:'YOUTUBE_VIDEO_MANAGEMENT_CONSENT_REQUIRED',message:'Reconnect the channel with video-management permission to publish'}});return result('management-consent-required','Reconnect the channel with video-management permission to publish');}
 save({stage:'published'});
 if(state.supersededVideoId&&!state.supersededVideoUnlisted) {
  await youtube.unlist({videoId:state.supersededVideoId});save({supersededVideoUnlisted:true});
  record({outcome:'landscape-brief-unlisted',videoId:state.supersededVideoId,replacementVideoId:state.youtubeVideoId});
 }
 return result('published');
 } finally {if(state.drive) await releaseMediaCache(state.drive,output);}
}

const ANGLES=[
 {id:'worked-example',instruction:'Teach through one concrete worked example already supported by the source.'},
 {id:'misconception',instruction:'Start with a plausible misconception, then correct it using the source and a clear qualification.'},
 {id:'mechanism',instruction:'Show the mechanism step by step with a simple diagram and explain why it works.'},
 {id:'tradeoff',instruction:'Compare two choices, showing the tradeoff and who bears it; retain the source’s uncertainty.'},
];
export function notebookAngle(lessonId,{config,provider='gemini-notebook'}={}) {return selectTeachingAngle(ANGLES,lessonId,{config,provider});}
