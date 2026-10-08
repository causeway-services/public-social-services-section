import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {syncLearning} from '../src/learning.mjs';

test('unchanged verified curricula make no playlist requests; a new public lesson changes the sequence',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'learning-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const config={id:'example',directory,learning:{course:true},course:{courseId:'institutions',title:'Institutions'},curriculum:[{id:'one',title:'One'},{id:'two',title:'Two'}]};
 const uploads=config.curriculum.map(({id,title},index)=>({id:'video'+index,snippet:{title,description:`[production:example/${id}]`},status:{privacyStatus:'public',uploadStatus:'processed'}}));
 let requests=0;const youtube={setLearningLinks:async()=>{},ensureLearningPlaylist:async({videoIds})=>{requests++;return {playlistId:'playlist-one',url:'https://www.youtube.com/playlist?list=playlist-one',videoIds,verifiedAt:new Date().toISOString()};}};
 await syncLearning(config,{youtube,uploads:uploads.slice(0,1)});assert.equal(requests,1);
 await syncLearning(config,{youtube,uploads:uploads.slice(0,1)});assert.equal(requests,1);
 const changed=await syncLearning(config,{youtube,uploads});assert.equal(requests,2);assert.deepEqual(changed.playlist.videoIds,['video0','video1']);
});
