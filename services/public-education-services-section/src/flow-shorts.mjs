import {existsSync,readFileSync,mkdirSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {flowStateDir,queueFlowOrder} from '@red-cup-engineering/google-flow-services-section/flow-generate';
import {keepMediaInDrive,receiveMediaFromDrive,releaseMediaCache} from '@red-cup-engineering/google-drive-services-section/media';
import {episodeDirectory,lessonReportPath,readJson,writeAtomic} from './channel.mjs';
import {recordStep} from './lesson.mjs';
import {produceEducationArtifact,EducationCandidateRefusal,EducationInferenceUnavailable} from './inference.mjs';
import {publishPreparedShort,probeShort,notebookAngle,topicHashtags} from './shorts.mjs';

const PLAN_SCHEMA={type:'object',properties:{claim:{type:'string',maxLength:140},scene:{type:'string',maxLength:1400},hashtags:{type:'array',minItems:2,maxItems:4,items:{type:'string'}}},required:['claim','scene','hashtags']};
/** Select a complete source statement when no free drafting provider is available. */
export function sourceFlowPlan({lesson,report,metadata,angle}) {
 const words=lesson.title.toLowerCase().match(/[a-z]{4,}/gu)??[];
 // Markdown wrapping and list markers are presentation, not sentence boundaries.
 // Keep the source wording while making complete statements usable as captions.
 const paragraphs=report.split(/\n\s*\n/u).flatMap(p=>p.split(/\n(?=\s*[-*+]\s)/u));
 const segmenter=new Intl.Segmenter('en',{granularity:'sentence'}),secondaryStatements=new Set();let secondary=false;
 const candidates=paragraphs.flatMap(p=>{
  if(/^\s*#/u.test(p)){secondary=/^\s*#+\s*(?:Method|Limitations|Scope|Negative control|Cinematic|Primary sources|Sources|Rights)\b/iu.test(p);return [];}
  if(/^\s*Correction identity:/u.test(p))return [];
  const prose=p.replace(/^\s*[-*+]\s+/gmu,'').replace(/\s+/gu,' ').trim();
  return [...segmenter.segment(prose)].flatMap(({segment})=>{
   const sentence=segment.trim(),definition=sentence.match(/^(.{25,140}):\s+/u)?.[1];
   // A complete main clause before a colon can teach a definition without its
   // lengthy examples. Never detach a conditional or an uncertainty label.
   const standalone=definition&&!/^(?:If|When|Unless|Although|Because|While|Despite|Uncertainty|Warrants|Invalid inference)\b/u.test(definition)&&/\b(?:is|are|means|transmits|defines|requires)\b/u.test(definition);
   const statements=[sentence,...(standalone?[definition]:[])];
   if(secondary)for(const statement of statements)secondaryStatements.add(statement);
   return statements;
  });
 }).filter(s=>s.length>=25&&s.length<=140&&s.split(/\s+/u).length<=22&&/^[A-Z]/u.test(s)&&!/[?]$/u.test(s)&&!/[\[\]#*`]|https?:/u.test(s)&&!/^(?:This|These|That|Those|It|They|However|For example|In contrast)\b|^(?:Warrants:|Uncertainty:|Invalid inference:|Show |Fill |Take |Sweep |Pixelate )/u.test(s));
 const angleWords={misconception:/\bnot|cannot|rather than\b/iu,tradeoff:/\bcost|benefit|risk|tradeoff|depends\b/iu,mechanism:/\bbecause|when|through|input|output\b/iu,'worked-example':/\bexample|such as|case\b/iu};
 const score=s=>words.filter(w=>s.toLowerCase().includes(w)).length+Number(angleWords[angle.id]?.test(s));
 candidates.sort((a,b)=>Number(secondaryStatements.has(a))-Number(secondaryStatements.has(b))||score(b)-score(a)||b.length-a.length);
 const claim=candidates.find(s=>score(s)>0),hashtags=topicHashtags(metadata.tags);
 if(!claim||hashtags.length<2) throw new EducationCandidateRefusal('No standalone short report statement or specific topic hashtags could be selected');
 const scenes={
  'worked-example':'Show one concrete everyday illustration of the lesson statement, with a beginning and a visible consequence. Use an illustrative metaphor, not invented documentary evidence.',
  misconception:'Begin with a plausible visual assumption, then reveal the missing condition the statement names. Keep the change clear and grounded in the quoted statement.',
  mechanism:'Use a clear visual model: show an input, one meaningful transition, and its consequence. Preserve the mechanism and limitations in the quoted statement.',
  tradeoff:'Show two contrasting paths or choices and reveal the tradeoff named in the statement. Do not invent comparative numbers or imply a winner the source does not establish.',
 };
 return {claim,hashtags,scene:scenes[angle.id],drafting:'verbatim-report-selection'};
}
export function flowShortPrompt({title,claim,scene,angle}) {
 return `Create an eight-second vertical 9:16 educational micro-scene about ${title}. Teaching angle: ${angle}. ${scene} Show one clear action or change rather than a static thumbnail. Keep the subject in the central safe area, with room for a readable caption below. Ground the scene in this exact lesson statement: "${claim}". Do not invent statistics, equations, charts, or named events. No generated lettering, captions, logos or watermarks; the exact lesson caption is added afterward. Use natural sound appropriate to the scene; do not invent dialogue or unrelated narration.`;
}
function mediaFor(consumer) {
 const root=flowStateDir(),journal=join(root,'generations.jsonl'),custody=readJson(join(root,'drive-custody.json'),{}),rows=[];
 if(!existsSync(journal)) return [];
 for(const line of readFileSync(journal,'utf8').split('\n')) {
  try {
   const row=JSON.parse(line);
   if(row.type==='MediaDriveCustody'&&row.drive?.sha256===row.sha256) custody[row.sha256]=row.drive;
   else if((row.consumer===consumer||row.consumer?.startsWith(consumer+'--'))&&row.output?.mimeType==='video/mp4'&&row.resource?.sha256) rows.push(row);
  } catch { /* Ignore an incomplete journal tail. */ }
 }
 return rows.map(row=>({...row,drive:row.resource.drive??custody[row.resource.sha256]})).reverse();
}
const wrap=text=>{
 const lines=[];let line='';for(const word of text.split(/\s+/u)){if(line.length+word.length>31){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);return lines.join('\n');
};

/** A Flow scene and a Notebook brief remain distinct Shorts with the same parent. */
export async function advanceFlowShort(config,lessonId,{youtube,uploads,env=process.env}) {
 const lesson=config.curriculum.find(l=>l.id===lessonId),dir=episodeDirectory(config,lessonId),parent=readJson(join(dir,'state.json'),{});
 const out=(status,message)=>({channel:config.id,lesson:lessonId,origin:'google-flow',status:`short-flow-${status}`,parentVideoId:parent.youtubeVideoId,...(message?{message}:{})});
 if(!lesson||!parent.youtubeVideoId) return out('not-ready');
 const reportPath=lessonReportPath(config,lesson);if(!existsSync(reportPath)) return out('report-missing');
 const report=readFileSync(reportPath,'utf8'),reportSha256=createHash('sha256').update(report).digest('hex'),planPath=join(dir,'flow-short-plan.json');
 let plan=readJson(planPath,null);
 if(plan&&plan.reportSha256!==reportSha256) return out('report-changed','The retained Flow prompt belongs to different source bytes');
 if(!plan) {
  // Offset the angle so this lesson's Flow and Notebook Shorts teach it differently.
  const angle=notebookAngle(lessonId+'flow');
  const sourceDraft=sourceFlowPlan({lesson,report,metadata:readJson(join(dir,'metadata.json'),{}),angle});
  const reportContext=report.replace(/\s+/gu,' '),statementAt=reportContext.indexOf(sourceDraft.claim);
  try { await produceEducationArtifact({env,objective:'Design a distinct eight-second educational Flow Short grounded in the supplied lesson report. Return claim, scene and hashtags. Copy the supplied caption statement exactly as claim; it is already selected verbatim from the report. Preserve its wording and qualifications. The scene must show an action or mechanism that helps explain that statement, not a generic cinematic thumbnail. Use the requested teaching angle and retain qualifications. Give two to four specific topic hashtags, each starting with #; no generic viral, FYP or Shorts hashtags.',context:`Lesson: ${lesson.title}\nAngle: ${angle.instruction}\nEXACT CAPTION: ${sourceDraft.claim}\nSuggested topic hashtags: ${sourceDraft.hashtags.join(" ")}\nREPORT CONTEXT:\n${reportContext.slice(Math.max(0,statementAt-500),statementAt+1000)}`,schema:PLAN_SCHEMA,taskClass:'education-flow-short-prompt',maximumOutputTokens:700,artifactPath:planPath,
   assay:c=>{
    if(typeof c.claim!=='string'||c.claim.length<25||c.claim.length>140||c.claim.split(/\s+/u).length>22||c.claim!==sourceDraft.claim||typeof c.scene!=='string'||!c.scene.trim()||c.scene.length>1400||!Array.isArray(c.hashtags)||c.hashtags.length<2||c.hashtags.length>4||c.hashtags.some(t=>!/^#[\p{L}\p{N}_]{2,40}$/u.test(t)||/^#(?:viral|fyp|trending|shorts)$/iu.test(t))||c.hashtags.join(' ').length>100) throw new EducationCandidateRefusal('The Flow scene needs a short verbatim report statement and specific topic hashtags');
    return {...c,angle:angle.id,reportSha256,parentVideoId:parent.youtubeVideoId,consumer:`education-short--${config.id}--${lessonId}--${angle.id}`,prompt:flowShortPrompt({title:lesson.title,claim:c.claim,scene:c.scene,angle:angle.id})};
   },persist:v=>{writeAtomic(planPath,v);return v;}});
  } catch(error) {
   if(!(error instanceof EducationInferenceUnavailable)) throw error;
  const draft=sourceDraft;
   const fallback={...draft,angle:angle.id,reportSha256,parentVideoId:parent.youtubeVideoId,consumer:`education-short--${config.id}--${lessonId}--${angle.id}`,prompt:flowShortPrompt({title:lesson.title,...draft,angle:angle.id})};
   writeAtomic(planPath,fallback);recordStep(config,lessonId,{step:'short',provider:'google-flow',outcome:'prompt-grounded-in-report',angle:angle.id,drafting:draft.drafting});
  }
  plan=readJson(planPath);
 }
 if(plan.parentVideoId!==parent.youtubeVideoId) return out('parent-mismatch');
 const consumer=`education-short--${config.id}--${lessonId}`,media=mediaFor(consumer);
 if(!plan.queuedAt&&!media.some(row=>row.consumer===plan.consumer)) {
  const queued=queueFlowOrder([{consumer:plan.consumer,medium:'video',model:'veo_3_1_t2v_lite',aspect:'9:16',count:1,prompt:plan.prompt}],{name:`short-${config.id}-${lessonId}`});
  plan={...plan,queuedAt:new Date().toISOString(),queue:queued};writeAtomic(planPath,plan);recordStep(config,lessonId,{step:'short',provider:'google-flow',outcome:'queued',angle:plan.angle,parentVideoId:parent.youtubeVideoId});
 }
 const artifact=media.find(row=>row.consumer===plan.consumer)??media[0];
 if(!artifact) return out('queued','Flow will generate the retained scene on its next hosted run');
 const hash=artifact.resource.sha256,checkpointPath=join(dir,`flow-short-${hash.slice(0,16)}.json`),work=join(config.directory,'.work',lessonId,'flow-'+hash.slice(0,16)),source=join(work,'source.mp4'),output=join(work,'short.mp4');
 let state=readJson(checkpointPath,{origin:'google-flow',parentVideoId:parent.youtubeVideoId,artifactId:artifact.providerArtifactId});
 const save=updates=>{state={...state,...updates,updatedAt:new Date().toISOString()};writeAtomic(checkpointPath,state);};
 const record=entry=>recordStep(config,lessonId,{step:'short',provider:'google-flow',...entry});
 const marker=`${config.id}/${lessonId}/short/flow/${hash.slice(0,16)}`,existing=uploads.filter(v=>v.snippet.description.includes(`[production:${marker}]`));
 if(existing.length>1) return out('needs-reconcile','Multiple uploads carry this Flow Short marker');
 if(!state.youtubeVideoId&&existing.length) save({youtubeVideoId:existing[0].id});
 if(state.stage==='published') {
  if(artifact.consumer===plan.consumer&&plan.publishedConsumer!==plan.consumer) writeAtomic(planPath,{...plan,publishedConsumer:artifact.consumer,publishedVideoId:state.youtubeVideoId});
  return {...out('published'),videoId:state.youtubeVideoId};
 }
 mkdirSync(work,{recursive:true});
 if(!state.sourceDrive) {
  const drive=artifact.drive??(existsSync(artifact.resource.path)?await keepMediaInDrive(artifact.resource.path,{folder:`flow/${artifact.consumer}`,expectedSha256:hash}):null);
  if(!drive||drive.sha256!==hash) return out('drive-pending','The finished Flow media must have verified Drive custody before upload');
  save({sourceDrive:drive});
 }
 try {
  if(!state.drive) {
   await receiveMediaFromDrive(state.sourceDrive,source);
   const carrier=probeShort(source);if(!Number.isFinite(carrier.duration)||carrier.duration<=0||carrier.duration>180) return out('duration-review-required');
   const caption=join(work,'caption.txt');writeAtomic(caption,wrap(plan.claim));
   const filter=`scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,setsar=1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=${caption}:fontsize=34:fontcolor=white:line_spacing=9:box=1:boxcolor=black@0.7:boxborderw=16:x=(w-text_w)/2:y=h-390`;
   const encoded=spawnSync('ffmpeg',['-nostdin','-v','error','-y','-i',source,'-vf',filter,'-c:v','libx264','-preset','veryfast','-crf','23','-threads','1','-c:a','aac','-movflags','+faststart',output+'.part.mp4'],{encoding:'utf8',timeout:300_000});
   if(encoded.status!==0) throw new Error(`Flow Short framing failed: ${encoded.stderr.slice(-500)}`);
   renameSync(output+'.part.mp4',output);const framed=probeShort(output);if(framed.width>framed.height||framed.duration>180) throw new Error('Flow carrier is not a vertical Short within three minutes');
   const drive=await keepMediaInDrive(output,{folder:`education/${config.id}/${lessonId}/shorts`});if(!drive) return out('drive-required');
   save({drive,carrier:framed,claim:plan.claim,angle:plan.angle,actualFlowPrompt:artifact.promptText??artifact.prompt});record({outcome:'flow-short-received',artifactId:state.artifactId,drive:drive.url,...framed});
  }
  const metadataPath=join(dir,`flow-short-${hash.slice(0,16)}-metadata.json`);
  if(!existsSync(metadataPath)) writeAtomic(metadataPath,{title:plan.hashtags.join(' '),tags:plan.hashtags.map(t=>t.slice(1)),description:`The full lesson: https://youtu.be/${parent.youtubeVideoId}\n\n${plan.claim}`});
  const published=await publishPreparedShort({config,lessonId,parent,youtube,existing,state,save,record,work,output,marker,metadataPath,env});
  if(published.status==='short-published'&&artifact.consumer===plan.consumer) writeAtomic(planPath,{...plan,publishedConsumer:artifact.consumer,publishedVideoId:published.videoId});
  return published;
 } finally {if(state.sourceDrive) await releaseMediaCache(state.sourceDrive,source);if(state.drive) await releaseMediaCache(state.drive,output);}
}
