// Audience observations inform new work; scientific claims still require research.
import {join} from 'node:path';
import {existsSync,readdirSync} from 'node:fs';
import {readJson,writeAtomic} from './channel.mjs';

const normalize=value=>String(value??'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const number=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
const aliases={'new-york-city':['new york','nyc'],'portland':['portland'],'los-angeles':['los angeles','lax']};
const places=lesson=>aliases[lesson.id]??[normalize(lesson.id)];
async function response(url,fetchImpl) {
 const result=await fetchImpl(url,{signal:AbortSignal.timeout(20_000)});
 if(!result.ok)throw new Error(`Audience source HTTP ${result.status}`);
 return result;
}
export async function climateAttention({fetchImpl=fetch}={}) {
 const base='https://external-api.kalshi.com/trade-api/v2';
 const source=base+'/series?category=Climate%20and%20Weather&include_volume=true';
 const listing=await(await response(source,fetchImpl)).json();
 // Lifetime series volume only selects a bounded discovery set. Priority uses recent activity.
 const selected=(listing.series??[]).sort((a,b)=>number(b.volume_fp)-number(a.volume_fp)).slice(0,32);
 const rows=[];let cursor=0;
 await Promise.all(Array.from({length:3},async()=>{
  while(cursor<selected.length) {
   const series=selected[cursor++];let volume24h=0,openInterest=0,markets=0,pagination='',complete=true;
   try {
    for(let page=0;page<3;page++) {
     const url=base+'/markets?'+new URLSearchParams({series_ticker:series.ticker,status:'open',limit:'200',...(pagination?{cursor:pagination}:{})});
     const data=await(await response(url,fetchImpl)).json();
     for(const market of data.markets??[]) {volume24h+=number(market.volume_24h_fp);openInterest+=number(market.open_interest_fp);markets++;}
     pagination=data.cursor??'';if(!pagination)break;
    }
    complete=!pagination;
    rows.push({ticker:series.ticker,title:series.title,volume24h,openInterest,markets,complete,source:base+'/markets?series_ticker='+encodeURIComponent(series.ticker)+'&status=open'});
   }catch(error){rows.push({ticker:series.ticker,title:series.title,status:'unavailable',reason:error.message});}
  }
 }));
 return {status:'observed',source,coverage:'32 highest lifetime-volume weather/climate series; up to 600 open markets each',rows:rows.sort((a,b)=>number(b.volume24h)-number(a.volume24h))};
}
const decode=value=>value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gu,'$1').replace(/&amp;/gu,'&').replace(/&lt;/gu,'<').replace(/&gt;/gu,'>').replace(/&quot;/gu,'"').replace(/&#39;/gu,"'");
export async function publicSearchAttention({fetchImpl=fetch,geo='US'}={}) {
 const source='https://trends.google.com/trending/rss?geo='+encodeURIComponent(geo),xml=await(await response(source,fetchImpl)).text();
 const rows=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/gu)].slice(0,30).map(([,item])=>({title:decode(item.match(/<title>([\s\S]*?)<\/title>/u)?.[1]??''),traffic:item.match(/<ht:approx_traffic>([^<]*)/u)?.[1]??null,source:decode(item.match(/<link>([\s\S]*?)<\/link>/u)?.[1]??source)}));
 if(!rows.length)throw new Error('Google Trends returned no readable RSS items');
 return {status:'observed',source,rows};
}
export async function refreshAudience(config,{youtube,uploads=[],fetchImpl=fetch,force=false}={}) {
 const path=join(config.directory,'production/audience.json'),prior=readJson(path,{});
 if(!force&&Date.now()-Date.parse(prior.observedAt)<6*3_600_000)return prior;
 const result={observedAt:new Date().toISOString(),channelId:config.youtubeChannelId};
 const jobs=[['youtube',()=>youtube.audienceReports()],['search',()=>publicSearchAttention({fetchImpl,geo:config.editorial.trendsGeo??'US'})]];
 if(config.id==='climate-place-by-place')jobs.push(['kalshi',()=>climateAttention({fetchImpl})]);
 for(const [name,read]of jobs) {
  try {result[name]=await read();}catch(error){result[name]={status:'unavailable',reason:error.message};}
 }
 const analytics=new Map((result.youtube?.videos?.rows??[]).map(row=>[row.video,row]));
 result.topVideos=uploads.filter(video=>video.status?.privacyStatus==='public').map(video=>({id:video.id,title:video.snippet.title,tags:video.snippet.tags??[],publishedAt:video.snippet.publishedAt,statistics:video.statistics??{},analytics:analytics.get(video.id)??null})).sort((a,b)=>number(b.analytics?.views??b.statistics.viewCount)-number(a.analytics?.views??a.statistics.viewCount)).slice(0,25);
 result.shortAngles=observeShortAngles(config,uploads,result);
 writeAtomic(path,result);return result;
}
const words=lesson=>new Set(normalize([lesson.title,lesson.question,...lesson.tags??[]].join(' ')).split(' ').filter(word=>word.length>=4));
const overlap=(tokens,text)=>[...tokens].filter(word=>normalize(text).includes(word)).length;
export function rankLessons(config,candidates,{audience={},completed=new Set()}={}) {
 const eligible=candidates.filter(lesson=>(lesson.prerequisites??[]).every(id=>completed.has(id)));
 const marketScores=eligible.map(lesson=>(audience.kalshi?.rows??[]).filter(row=>row.status!=='unavailable'&&places(lesson).some(place=>normalize(row.title).includes(place))).reduce((sum,row)=>sum+number(row.volume24h)+number(row.openInterest)*0.1,0));
 const maximum=Math.max(0,...marketScores);
 return eligible.map((lesson,index)=>{
  const tokens=words(lesson),base=1-index/Math.max(1,eligible.length);
  const related=(audience.topVideos??[]).filter(video=>overlap(tokens,[video.title,...video.tags].join(' '))>=2);
  const viewers=Math.min(1,related.reduce((sum,video)=>sum+Math.log1p(number(video.analytics?.views??video.statistics.viewCount))*Math.min(1,number(video.analytics?.averageViewPercentage??50)/100),0)/10);
  const questions=Math.min(1,(audience.youtube?.questions?.rows??[]).filter(row=>overlap(tokens,row.text)>=2).length/3);
  const search=Math.min(1,(audience.search?.rows??[]).filter(row=>overlap(tokens,row.title)>=2).length/2);
  const market=maximum?Math.log1p(marketScores[index])/Math.log1p(maximum):0;
  const score=config.id==='climate-place-by-place'?0.5*base+0.3*market+0.1*viewers+0.05*questions+0.05*search:0.7*base+0.15*viewers+0.1*questions+0.05*search;
  return {lesson,index,score};
 }).sort((a,b)=>b.score-a.score||a.index-b.index).map(item=>item.lesson);
}

/** Join measured public uploads to their actual production variant; unknown variants teach nothing. */
export function observeShortAngles(config,uploads,audience,{now=Date.now()}={}) {
 const analytics=new Map((audience.youtube?.videos?.rows??[]).map(row=>[row.video,row]));
 const published=new Map(uploads.filter(video=>video.status?.privacyStatus==='public').map(video=>[video.id,video]));
 const root=join(config.directory,'production/episodes'),seen=new Set(),samples=[];
 if(existsSync(root))for(const entry of readdirSync(root,{withFileTypes:true})) {
  if(!entry.isDirectory())continue;
  const dir=join(root,entry.name);
  for(const file of readdirSync(dir).filter(file=>file==='notebook-short.json'||/^flow-short-[0-9a-f]{16}\.json$/u.test(file))) {
   const state=readJson(join(dir,file),{}),video=published.get(state.youtubeVideoId),row=analytics.get(state.youtubeVideoId);
   const views=Number(row?.views),retention=Number(row?.averageViewPercentage);
   if(!video||seen.has(video.id)||!state.angle||!row||!Number.isFinite(views)||views<50||!Number.isFinite(retention)||retention<0||!Number.isFinite(Date.parse(video.snippet.publishedAt))||now-Date.parse(video.snippet.publishedAt)<2*86_400_000)continue;
   const provider=file==='notebook-short.json'?'gemini-notebook':'google-flow';
   // Old fallback clips were generated before the angle plan. Do not credit that plan.
   if(provider==='google-flow') {
    const plan=readJson(join(dir,'flow-short-plan.json'),{});
    if(!plan.prompt||state.actualFlowPrompt!==plan.prompt)continue;
   }
   seen.add(video.id);samples.push({videoId:video.id,provider,angle:state.angle,views,averageViewPercentage:retention,score:Math.min(150,retention)/100,weight:Math.min(1,views/200)});
  }
 }
 return {observedAt:audience.observedAt,minimumViews:50,minimumAgeDays:2,metric:'averageViewPercentage',samples};
}

/** Learn within each channel/provider, shrink small samples, and keep 25% exploration. */
export function selectTeachingAngle(angles,lessonId,{config,provider='gemini-notebook'}={}) {
 const seed=[...lessonId].reduce((n,c)=>n+c.codePointAt(0),0),fallback=angles[seed%angles.length];
 const audience=config?readJson(join(config.directory,'production/audience.json'),{}):{};
 const samples=(audience.shortAngles?.samples??[]).filter(sample=>sample.provider===provider&&angles.some(angle=>angle.id===sample.angle));
 const fresh=Date.now()-Date.parse(audience.shortAngles?.observedAt)<7*86_400_000;
 if(!fresh||samples.length<2)return {...fallback,selection:{mode:'explore',reason:!fresh?'no-recent-observations':'insufficient-observations',samples:samples.length}};
 const ranked=angles.map(angle=>{
  const rows=samples.filter(sample=>sample.angle===angle.id),weight=rows.reduce((sum,row)=>sum+row.weight,0);
  return {angle,samples:rows.length,score:(0.5+rows.reduce((sum,row)=>sum+row.score*row.weight,0))/(1+weight)};
 }).filter(row=>row.samples>0).sort((a,b)=>b.score-a.score||a.angle.id.localeCompare(b.angle.id));
 const explore=Math.floor(seed/angles.length)%4===0;
 const selected=explore?fallback:ranked[0].angle;
 return {...selected,selection:{mode:explore?'explore':'measured-retention',observedAt:audience.shortAngles.observedAt,samples:samples.length,scores:ranked.map(({angle,...row})=>({angle:angle.id,...row}))}};
}
