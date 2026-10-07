import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {repairExistingShorts,publishPreparedShort} from '../src/shorts.mjs';
import {observeShortAngles,selectTeachingAngle} from '../src/audience.mjs';

const put=(path,data)=>{mkdirSync(join(path,'..'),{recursive:true});writeFileSync(path,JSON.stringify(data));};
function fixture(t) {
 const directory=mkdtempSync(join(tmpdir(),'short-publication-'));t.after(()=>rmSync(directory,{recursive:true,force:true}));
 const config={id:'example',youtubeChannelId:'UCexample',directory,video:{language:'en'},curriculum:[{id:'first',title:'Flood maps'},{id:'second',title:'Flood insurance'}]};
 for(const lesson of config.curriculum){const dir=join(directory,'production/episodes',lesson.id);put(join(dir,'state.json'),{youtubeVideoId:'parent'+lesson.id});put(join(dir,'metadata.json'),{tags:['flood maps','climate risk']});}
 return config;
}
const video=lesson=>({id:'short'+lesson,snippet:{title:'A prose title #Shorts',description:`[production:example/${lesson}/short]`,publishedAt:'2026-09-01T00:00:00Z'},status:{privacyStatus:'public',uploadStatus:'processed'}});

test('a channel verification gate cannot starve title repairs, including published checkpoints',async t=>{
 const config=fixture(t),uploads=['first','second'].map(video),titles=[],related=[];
 put(join(config.directory,'production/episodes/second/existing-short-shortsecond.json'),{youtubeVideoId:'shortsecond',parentVideoId:'parentsecond',stage:'published'});
 const youtube={setTitle:async v=>titles.push(v),getVideo:async id=>uploads.find(v=>v.id===id)??{status:{privacyStatus:'public'}},setRelatedVideo:async v=>{related.push(v);throw Object.assign(new Error('Verify phone'),{code:'YOUTUBE_STUDIO_FEATURE_VERIFICATION_REQUIRED'});},publish:async()=>assert.fail('Blocked Short cannot be published')};
 const results=await repairExistingShorts(config,{youtube,uploads});
 assert.equal(titles.length,2);assert(titles.every(v=>v.title==='#FloodMaps #ClimateRisk'));
 assert.equal(related.length,1);assert.equal(results.filter(v=>v.status==='short-related-video-pending').length,2);
 await repairExistingShorts(config,{youtube,uploads:uploads.map(v=>({...v,snippet:{...v.snippet,title:'#FloodMaps #ClimateRisk'}}))});
 assert.equal(related.length,1,'next production turn does not reopen an observed account gate');
});

test('a stale receipt for another parent and a malformed Studio result cannot authorize publication',async t=>{
 const config=fixture(t),metadataPath=join(config.directory,'metadata.json');put(metadataPath,{title:'Old prose #Shorts',description:'Flood models retain uncertainty.'});
 let state={youtubeVideoId:'shortfirst',relatedVideo:{videoId:'shortfirst',relatedVideoId:'wrong',verifiedAt:new Date().toISOString(),carrier:'youtube-studio-related-video'}},title;
 const result=await publishPreparedShort({config,lessonId:'first',parent:{youtubeVideoId:'parentfirst'},state,save:updates=>Object.assign(state,updates),metadataPath,record:()=>{},youtube:{setTitle:async v=>{title=v.title;},getVideo:async()=>({status:{privacyStatus:'public',uploadStatus:'processed'}}),setRelatedVideo:async()=>({relatedVideoId:'parentfirst'}),publish:async()=>assert.fail('Incomplete receipt cannot authorize publication')}});
 assert.equal(title,'#FloodMaps #ClimateRisk');assert.equal(result.status,'short-related-video-pending');
});

test('measured retention influences new prompt angles while unknown or private uploads teach nothing',t=>{
 const config=fixture(t),now=Date.now(),observedAt=new Date(now).toISOString();
 const uploads=['first','second'].map(video);for(const lesson of config.curriculum)put(join(config.directory,'production/episodes',lesson.id,'notebook-short.json'),{youtubeVideoId:'short'+lesson.id,angle:'mechanism'});
 const audience={observedAt,youtube:{videos:{rows:uploads.map(v=>({video:v.id,views:500,averageViewPercentage:90}))}}};
 const observed=observeShortAngles(config,uploads,audience,{now});assert.equal(observed.samples.length,2);
 assert.equal(observeShortAngles(config,uploads.map(v=>({...v,status:{privacyStatus:'private'}})),audience,{now}).samples.length,0);
 put(join(config.directory,'production/audience.json'),{shortAngles:observed});
 const angles=[{id:'worked-example'},{id:'misconception'},{id:'mechanism'},{id:'tradeoff'}];
 const selected=Array.from({length:100},(_,i)=>selectTeachingAngle(angles,'lesson-'+i,{config}));
 assert(selected.some(v=>v.selection.mode==='explore'));
 assert(selected.filter(v=>v.selection.mode==='measured-retention').every(v=>v.id==='mechanism'));
});
