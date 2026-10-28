/* Standalone deterministic rules; shared by the browser and Node tests. */
(function(root){
'use strict';
const W=19,H=15,START={x:1,y:1},EXIT={x:17,y:1};
const SPECIAL={key:'3,3',door:'6,9',switch:'11,7',bridge:'13,7',trap:'17,5'};
const GEM_POS=['1,3','7,5','3,11','11,1','15,9','15,3'];
const grid=Array.from({length:H},()=>Array(W).fill('#'));
function carve(x1,y1,x2,y2){for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)grid[y][x]='.';}
[[1,1,5,1],[5,1,5,5],[1,5,5,5],[1,5,1,9],[1,9,9,9],[9,3,9,9],[9,3,13,3],[13,3,13,11],[13,11,17,11],[17,1,17,11],[3,1,3,3],[1,3,3,3],[5,5,7,5],[3,9,3,11],[11,1,11,3],[9,7,11,7],[15,9,15,11],[15,3,17,3]].forEach(a=>carve(...a));
const MAP=grid.map(r=>r.join(''));
const pos=(x,y)=>`${x},${y}`;
function fresh(){return {x:START.x,y:START.y,hp:3,key:false,door:false,bridge:false,gems:[],beat:0,moves:0,status:'ready',message:'The garden is waiting. Start your adventure.'};}
function active(s){return s.beat%4<2;}
function tile(x,y){return MAP[y]?.[x]||'#';}
function start(s){if(s.status==='ready'){s.status='playing';s.message='Find the brass key. A glimmer waits in the western branch.';}return s;}
function damage(s){s.hp--;s.x=START.x;s.y=START.y;s.status=s.hp<=0?'lost':'playing';s.message=s.hp<=0?'Your lantern has dimmed. Try again with a fresh start.':'Ouch! The pulse sent you to the entrance. Your discoveries are safe.';}
function activate(s){s.bridge=true;s.message='The old switch hums. The moonstone bridge is awake!';}
function move(s,dx,dy){
 if(s.status!=='playing'||Math.abs(dx)+Math.abs(dy)!==1)return s;
 const x=s.x+dx,y=s.y+dy,p=pos(x,y);
 if(tile(x,y)==='#'){s.message='Ancient stone blocks the way. Try another direction.';return s;}
 if(p===SPECIAL.door&&!s.door){if(!s.key){s.message='A brass gate. Find its key in a side passage.';return s;}s.door=true;s.key=false;s.message='Click! The brass gate opens.';}
 else if(p===SPECIAL.bridge&&!s.bridge){s.message='The bridge is asleep. Find the round green switch.';return s;}
 else if(p===SPECIAL.trap&&active(s)){damage(s);return s;}
 else s.message='Keep exploring. Every little detour has a story.';
 s.x=x;s.y=y;s.moves++;
 if(p===SPECIAL.key&&!s.key&&!s.door){s.key=true;s.message='A brass key! It will open the gate in the lower passage.';}
 if(p===SPECIAL.switch)activate(s);
 if(GEM_POS.includes(p)&&!s.gems.includes(p)){s.gems.push(p);s.message=`A garden gem! ${s.gems.length} of ${GEM_POS.length} discovered.`;}
 if(x===EXIT.x&&y===EXIT.y){s.status='won';s.message='Sunlight at last. You found your way home!';}
 return s;
}
function interact(s,x,y){if(s.status!=='playing')return s;const distance=Math.abs(s.x-x)+Math.abs(s.y-y);if(pos(x,y)===SPECIAL.switch&&distance<=1){activate(s);return s;}if(distance===1)return move(s,x-s.x,y-s.y);s.message='Move with the arrows, or click a neighboring tile. Click the switch from beside it.';return s;}
function tick(s){if(s.status!=='playing')return s;s.beat++;if(pos(s.x,s.y)===SPECIAL.trap&&active(s))damage(s);return s;}
function pause(s){if(s.status==='playing')s.status='paused';return s;}
function resume(s){if(s.status==='paused')s.status='playing';return s;}
function objective(s){if(!s.key&&!s.door)return 'Find the brass key';if(!s.door)return 'Unlock the brass gate';if(!s.bridge)return 'Wake the moonstone bridge';return 'Cross the pulse. Reach the Sun Gate.';}
const api={W,H,MAP,START,EXIT,SPECIAL,GEM_POS,pos,tile,fresh,start,active,move,interact,tick,pause,resume,objective};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MazeEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
