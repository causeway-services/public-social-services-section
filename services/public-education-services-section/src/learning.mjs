import {join} from 'node:path';
import {episodeDirectory,readJson,writeAtomic} from './channel.mjs';
import {shareTeachingMedia} from '@red-cup-engineering/google-drive-services-section/media';
import {offerToZelo} from '@red-cup-engineering/turntide-islands-discord-platform/placement-offer';

/** Stable prerequisite order, including the author's sequence within each frontier. */
export function learningOrder(lessons) {
 const byId=new Map(lessons.map(lesson=>[lesson.id,lesson])),done=new Set(),ordered=[];
 const pending=[...lessons].sort((a,b)=>(a.sequence??lessons.indexOf(a))-(b.sequence??lessons.indexOf(b)));
 while(pending.length) {
  const index=pending.findIndex(lesson=>(lesson.prerequisites??[]).every(id=>done.has(id)));
  if(index<0)throw new Error('The learning sequence has cyclic or missing prerequisites');
  const [lesson]=pending.splice(index,1);
  if((lesson.prerequisites??[]).some(id=>!byId.has(id)))throw new Error('Missing prerequisite lesson');
  ordered.push(lesson);done.add(lesson.id);
 }return ordered;
}
const normalized=title=>String(title).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
/** Only exact production identity or an unambiguous retained lesson title admits a longform. */
export function publicLearningVideos(config,uploads) {
 const history=readJson(join(config.directory,'history.json'),{});
 return learningOrder(config.curriculum).flatMap(lesson=>{
  const state=readJson(join(episodeDirectory(config,lesson.id),'state.json'),{});
  const prior=[...(history.publications??[]),...(history.ready??[])].filter(item=>item.lessonId===lesson.id).map(item=>item.videoId??item.youtubeVideoId);
  const eligible=uploads.filter(video=>video.status?.privacyStatus==='public'&&video.status?.uploadStatus==='processed'&&!video.contentDetails?.contentRating?.ytRating&&
   (video.snippet?.description??'').match(/\[production:([^\]]+)\]/u)?.[1]!==`${config.id}/${lesson.id}/short`&&
   ! /\[production:[^\]]+\/short(?:\/[^\]]*)?\]/u.test(video.snippet?.description??''));
  const current=eligible.filter(video=>video.id===state.youtubeVideoId);
  const marked=eligible.filter(video=>(video.snippet?.description??'').includes(`[production:${config.id}/${lesson.id}]`));
  const historical=eligible.filter(video=>prior.includes(video.id));
  const titled=eligible.filter(video=>normalized(video.snippet?.title)===normalized(lesson.title));
  const found=current.length?current:marked.length?marked:historical.length?historical:titled;
  if(found.length>1)throw new Error('Multiple public longforms represent lesson '+lesson.id);
  return found.length?[{lesson,video:found[0]}]:[];
 });
}

/** Share received companions for public parents and keep their learner navigation current. */
export async function syncLearning(config,{youtube,uploads,courseStudio,limit=4,offer=offerToZelo}={}) {
 const lessons=publicLearningVideos(config,uploads),path=join(config.directory,'production/learning.json');
 let checkpoint=readJson(path,{}),playlist=checkpoint.playlist;
 const save=change=>{checkpoint={...checkpoint,...change};writeAtomic(path,checkpoint);};
 if(config.learning?.course) {
  const competencies=(config.course.competencies??[]).map(item=>item.statement??item.description).filter(Boolean);
  playlist=await youtube.ensureLearningPlaylist({marker:config.id+'/'+config.course.courseId,title:config.learning.title??config.course.title,
   description:[config.course.promise??config.course.purpose??'',`For: ${config.course.audience??'curious learners'}.`,competencies.length?'By the end, you will be able to:\n'+competencies.map(item=>'- '+item).join('\n'):'Trace the mechanism, identify who bears costs and makes decisions, and assess the evidence and its limits.',
    'Follow the lessons in order. Each video is a worked explanation; use its teaching resources and retrieval questions to check understanding. New lessons are added as they become public.'].join('\n\n'),
   videoIds:lessons.map(item=>item.video.id),privacyStatus:lessons.length?'public':'private',checkpoint:checkpoint.transport??{},onCheckpoint:transport=>save({transport})});
  save({playlist});
 }
 let advanced=0,offered=false;const resources=[];
 for(let index=0;index<lessons.length;index++) {
  const {lesson,video}=lessons[index],dir=episodeDirectory(config,lesson.id),distributionPath=join(dir,'distribution.json');
  let distribution=readJson(distributionPath,{resources:{}});
  const companions=readJson(join(dir,'companions.json'),{});
  const ready=Object.entries(companions.kinds??{}).filter(([kind,value])=>['infographic','slide-deck'].includes(kind)&&value.receipt&&value.drive);
  const needs=ready.some(([kind,value])=>distribution.resources?.[kind]?.sha256!==value.drive.sha256);
  if(needs&&advanced<limit) {
   for(const [kind,value]of ready) {
    if(distribution.resources?.[kind]?.sha256===value.drive.sha256)continue;
    const resource=shareTeachingMedia(value.drive);
    distribution={...distribution,resources:{...distribution.resources,[kind]:resource},videoId:video.id};writeAtomic(distributionPath,distribution);
   }advanced++;
  }
  const linked=Object.entries(distribution.resources??{});
  resources.push({lesson:lesson.id,videoId:video.id,resources:distribution.resources??{}});
  const navigation=[...(playlist?[`Learning sequence: ${playlist.url}`]:[]),...(config.learning?.course&&index+1<lessons.length?[`Next lesson: https://www.youtube.com/watch?v=${lessons[index+1].video.id}`]:[]),...linked.map(([kind,item])=>`${kind==='slide-deck'?'Teaching slides (PDF)':'Lesson infographic'}: ${item.url}`)].join('\n');
  if(navigation&&distribution.linkedText!==navigation&&advanced<limit) {
   await youtube.setLearningLinks({videoId:video.id,text:navigation});distribution={...distribution,linkedText:navigation,videoId:video.id};writeAtomic(distributionPath,distribution);advanced++;
  }
  const identity=linked.map(([kind,item])=>kind+':'+item.sha256).sort().join('|');
  if(config.turntide?.subjects?.length&&identity&&distribution.offeredIdentity!==identity&&!offered) {
   const key=`teaching:${config.id}:${lesson.id}:${linked.map(([,item])=>item.sha256.slice(0,12)).join('-')}`;
   const report=await offer([{type:'TTIPlacementOffer',version:1,key,kind:'video',source:{id:config.id,name:config.name},subjects:config.turntide.subjects,
    item:{url:`https://www.youtube.com/watch?v=${video.id}`,title:lesson.title,summary:lesson.whyItMayMatter??lesson.promise??'',tags:lesson.tags??[],published:video.snippet.publishedAt,
     resources:linked.map(([kind,item])=>({label:kind==='slide-deck'?'Teaching slides (PDF)':'Lesson infographic',url:item.url,mimeType:kind==='slide-deck'?'application/pdf':'image/png'}))}}]);
   const admitted=report.admitted.find(item=>item.key===key);
   if(admitted){distribution={...distribution,offeredIdentity:identity,placement:{key,admitted,placements:report.placements,offeredAt:new Date().toISOString()}};writeAtomic(distributionPath,distribution);offered=true;}
  }
 }
 const courseTime=Date.parse(checkpoint.course?.verifiedAt??checkpoint.course?.checkedAt??'');
 const due=checkpoint.course?.retryAt?Date.now()>=Date.parse(checkpoint.course.retryAt):!Number.isFinite(courseTime)||Date.now()-courseTime>(checkpoint.course?.status==='enabled'?86400000:20*60000);
 const convert=courseStudio??youtube.ensureLearningCourse;
 if(config.learning?.course&&lessons.length>=3&&convert&&due) {
  try {const course=await convert({channelId:config.youtubeChannelId,channelName:lessons[0].video.snippet.channelTitle,playlistId:playlist.playlistId,title:config.learning.title??config.course.title,videoIds:lessons.map(item=>item.video.id)});save({course});}
  catch(error){const wait=/FEATURE|VERIFICATION|SIGN_IN/u.test(error.code??'')?6*3600000:20*60000;save({course:{status:'blocked',code:error.code??'COURSE_STUDIO_UNAVAILABLE',message:error.message,checkedAt:new Date().toISOString(),retryAt:new Date(Date.now()+wait).toISOString()}});}
 }
 if(config.learning?.course&&lessons.length<3)save({course:{status:'awaiting-public-lessons',required:3,available:lessons.length,checkedAt:new Date().toISOString()}});
 return {channel:config.id,status:'learning-synchronized',playlist,course:checkpoint.course,publicLessons:lessons.length,resources};
}
