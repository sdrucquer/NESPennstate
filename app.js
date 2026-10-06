const LEADERBOARD_URL='/api/leaderboard';
const board=document.getElementById('leaderboard');
const expand=document.getElementById('race-expand');
const status=document.getElementById('race-status');
let members=[],expanded=false,pending=false;
function normalizedEntries(data){
 if(!data||!Array.isArray(data.entries))throw new Error('Invalid leaderboard');
 return data.entries.filter(e=>Number.isInteger(e.position)&&e.position>0&&typeof e.displayName==='string'&&e.displayName.trim()&&Number.isInteger(e.points)&&e.points>=0).map(e=>({position:e.position,displayName:e.displayName,points:e.points})).sort((a,b)=>a.position-b.position).slice(0,20);
}
function renderMembers(){
 const list=document.createElement('ol');list.className='standings';list.setAttribute('aria-label','NYC attendance positions');
 for(const m of members.slice(0,expanded?20:5)){
  const row=document.createElement('li');row.className='standing'+(m.position<=3?' is-top':'');row.value=m.position;
  const position=document.createElement('span');position.className='standing-number';position.textContent=String(m.position).padStart(2,'0');position.setAttribute('aria-label','Position '+m.position);
  const name=document.createElement('span');name.className='standing-name';name.textContent=m.displayName;
  const points=document.createElement('span');points.className='standing-points';points.textContent=m.points+' '+(m.points===1?'point':'points');
  row.append(position,name,points);list.append(row);
 }
 board.replaceChildren(list);expand.hidden=members.length<=5;expand.setAttribute('aria-expanded',String(expanded));expand.textContent=expanded?'Show top five ↑':`View all ${members.length} ↓`;
}
async function refreshLeaderboard(){
 if(pending)return;pending=true;board.setAttribute('aria-busy','true');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(LEADERBOARD_URL,{signal:controller.signal,credentials:'omit',headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('Leaderboard unavailable');
  const data=await response.json();members=normalizedEntries(data);renderMembers();
  status.textContent=members.length?'':'The race starts here. Standings will appear after attendance is recorded.';
  if(typeof data.season==='string')document.getElementById('race-season').textContent=data.season;
  const updated=new Date(data.updatedAt);document.getElementById('race-updated').textContent=Number.isNaN(updated.valueOf())?'Refreshes every 5 minutes':'Updated '+new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York',timeZoneName:'short'}).format(updated)+' · Refreshes every 5 min';
 }catch{
  board.replaceChildren();expand.hidden=true;status.textContent='Leaderboard temporarily unavailable';document.getElementById('race-updated').textContent='We’ll try again automatically in 5 minutes.';
 }finally{clearTimeout(timeout);pending=false;board.setAttribute('aria-busy','false');}
}
expand.addEventListener('click',()=>{expanded=!expanded;renderMembers();});
refreshLeaderboard();setInterval(refreshLeaderboard,300000);
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.documentElement.classList.add('motion-ready');const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}},{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
