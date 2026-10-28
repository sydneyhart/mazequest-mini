const test=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js');
const play=()=>E.start(E.fresh());
function at(s,x,y){s.x=x;s.y=y;return s}
function route(from,to,blocked=[]){
 const queue=[[from,[]]],seen=new Set([E.pos(...from)]);
 for(let i=0;i<queue.length;i++){
  const [[x,y],path]=queue[i];if(x===to[0]&&y===to[1])return path;
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,p=E.pos(nx,ny);if(E.tile(nx,ny)==='#'||seen.has(p)||blocked.includes(p))continue;seen.add(p);queue.push([[nx,ny],[...path,[dx,dy]]])}
 }return null;
}
function walk(s,to){const blocked=[];if(!s.key&&!s.door)blocked.push(E.SPECIAL.door);if(!s.bridge)blocked.push(E.SPECIAL.bridge);const path=route([s.x,s.y],to,blocked);assert.ok(path,`Route to ${to}`);for(const [dx,dy]of path){if(E.pos(s.x+dx,s.y+dy)===E.SPECIAL.trap){while(E.active(s))E.tick(s);}E.move(s,dx,dy);}return path;}

test('map is 19 × 15 with wall boundaries and a valid entrance/exit',()=>{
 assert.equal(E.MAP.length,15);assert.ok(E.MAP.every(r=>r.length===19));
 assert.ok(E.MAP[0].split('').every(c=>c==='#'));assert.ok(E.MAP[14].split('').every(c=>c==='#'));
 assert.ok(E.MAP.every(r=>r[0]==='#'&&r[18]==='#'));
 assert.equal(E.tile(1,1),'.');assert.equal(E.tile(17,1),'.');
});
test('all collectibles and interactions are reachable on the connected floor graph',()=>{
 for(const p of [...Object.values(E.SPECIAL),...E.GEM_POS,'17,1'])assert.ok(route([1,1],p.split(',').map(Number)));
});
test('door, bridge and trap are each mandatory chokepoints',()=>{
 for(const p of [E.SPECIAL.door,E.SPECIAL.bridge,E.SPECIAL.trap])assert.equal(route([1,1],[17,1],[p]),null,p);
});
test('walls and invalid or diagonal moves do not move Pip',()=>{
 const s=play();E.move(s,0,-1);assert.deepEqual([s.x,s.y,s.moves],[1,1,0]);
 E.move(s,1,1);E.move(s,2,0);assert.deepEqual([s.x,s.y],[1,1]);
});
test('four cardinal directions move a single tile',()=>{
 const s=play();E.move(s,1,0);assert.deepEqual([s.x,s.y],[2,1]);E.move(s,-1,0);assert.equal(s.x,1);
 at(s,3,1);E.move(s,0,1);assert.equal(s.y,2);E.move(s,0,-1);assert.equal(s.y,1);
});
test('a locked gate blocks movement; collecting a key consumes it on unlock',()=>{
 const s=at(play(),5,9);E.move(s,1,0);assert.equal(s.x,5);assert.equal(s.door,false);
 at(s,3,2);E.move(s,0,1);assert.equal(s.key,true);
 at(s,5,9);E.move(s,1,0);assert.equal(s.x,6);assert.equal(s.door,true);assert.equal(s.key,false);
 E.move(s,-1,0);E.move(s,1,0);assert.equal(s.x,6);
});
test('bridge blocks before switch and allows crossing after adjacent click',()=>{
 const s=at(play(),13,6);E.move(s,0,1);assert.equal(s.y,6);
 at(s,10,7);E.interact(s,11,7);assert.equal(s.bridge,true);assert.equal(s.x,10);
 at(s,13,6);E.move(s,0,1);assert.equal(s.y,7);
});
test('stepping on switch activates it; distant click cannot activate it',()=>{
 const s=play();E.interact(s,11,7);assert.equal(s.bridge,false);
 at(s,10,7);E.move(s,1,0);assert.equal(s.bridge,true);
});
test('collecting a gem is unique and optional',()=>{
 const s=at(play(),2,3);E.move(s,-1,0);assert.equal(s.gems.length,1);E.move(s,1,0);E.move(s,-1,0);assert.equal(s.gems.length,1);
 at(s,17,2);E.move(s,0,-1);assert.equal(s.status,'won');
});
test('trap active entry costs a heart and preserves discoveries',()=>{
 const s=at(play(),17,6);s.key=true;s.bridge=true;s.gems=['1,3'];E.move(s,0,-1);
 assert.equal(s.hp,2);assert.deepEqual([s.x,s.y],[1,1]);assert.equal(s.key,true);assert.equal(s.bridge,true);assert.equal(s.gems.length,1);
});
test('trap has two active and two safe beats; waking under player hurts',()=>{
 const s=play();assert.equal(E.active(s),true);E.tick(s);assert.equal(E.active(s),true);E.tick(s);assert.equal(E.active(s),false);
 at(s,17,6);E.move(s,0,-1);assert.equal(s.y,5);E.tick(s);assert.equal(s.hp,3);E.tick(s);assert.equal(s.hp,2);
});
test('leaving a resting trap before the next active phase avoids damage',()=>{
 const s=at(play(),17,6);E.tick(s);E.tick(s);E.move(s,0,-1);E.move(s,0,-1);E.tick(s);E.tick(s);assert.equal(s.hp,3);assert.equal(s.y,4);
});
test('three hits cause defeat and terminal movement/ticks are ignored',()=>{
 const s=play();for(let i=0;i<3;i++){at(s,17,6);E.move(s,0,-1)}assert.equal(s.status,'lost');assert.equal(s.hp,0);
 const snapshot=JSON.stringify(s);E.move(s,1,0);E.tick(s);E.interact(s,11,7);assert.equal(JSON.stringify(s),snapshot);
});
test('pause freezes movement and pulse; resume continues',()=>{
 const s=play();E.pause(s);E.move(s,1,0);E.tick(s);assert.deepEqual([s.x,s.beat],[1,0]);E.resume(s);E.move(s,1,0);assert.equal(s.x,2);
});
test('ready state and victory prevent further movement',()=>{
 const fresh=E.fresh();E.move(fresh,1,0);assert.equal(fresh.x,1);const s=at(play(),17,2);E.move(s,0,-1);assert.equal(s.status,'won');E.move(s,0,1);E.tick(s);assert.equal(s.y,1);assert.equal(s.beat,0);
});
test('a complete legal playthrough collects six gems and wins with three hearts',()=>{
 const s=play();for(const target of [[3,3],[1,3],[7,5],[3,11],[6,9],[11,1],[11,7],[13,7],[15,9],[15,3],[17,1]])walk(s,target);
 assert.equal(s.status,'won');assert.equal(s.gems.length,6);assert.equal(s.hp,3);assert.equal(s.door,true);assert.equal(s.bridge,true);
});
test('fresh game resets all progress and does not share mutable arrays',()=>{
 const a=play();a.gems.push('1,3');a.key=true;a.hp=1;const b=E.fresh();assert.deepEqual(b.gems,[]);assert.equal(b.key,false);assert.equal(b.hp,3);assert.equal(b.status,'ready');
});
test('click adjacent tile moves, distant click gives guidance',()=>{
 const s=play();E.interact(s,2,1);assert.equal(s.x,2);E.interact(s,5,1);assert.equal(s.x,2);assert.match(s.message,/neighboring/);
});
