'use strict';
const E=MazeEngine,$=id=>document.getElementById(id);let state=E.fresh(),lastFocus=null,modalKind='',hintIndex=0;
const board=$('board'),cells=[];
for(let y=0;y<E.H;y++)for(let x=0;x<E.W;x++){const cell=document.createElement('button');cell.type='button';cell.className='tile';cell.tabIndex=-1;cell.dataset.x=x;cell.dataset.y=y;cell.addEventListener('click',()=>{E.interact(state,x,y);render()});board.append(cell);cells.push(cell)}
function render(){
 $('intro').hidden=state.status!=='ready';$('game').hidden=state.status==='ready';
 const sp=E.SPECIAL;
 cells.forEach(cell=>{const x=Number(cell.dataset.x),y=Number(cell.dataset.y),p=E.pos(x,y);let name='Path',symbol='',cls='floor';
 if(E.tile(x,y)==='#'){cls='wall';name='Wall'}
 else if(x===1&&y===1){cls='start';name='Entrance';symbol='⌂'}
 else if(x===17&&y===1){cls='exit';name='Sun Gate exit';symbol='☀'}
 else if(p===sp.key&&!state.key&&!state.door){cls='key';name='Brass key';symbol='⚿'}
 else if(p===sp.door){cls='door'+(state.door?' open':'');name=state.door?'Open brass gate':'Locked brass gate';symbol=state.door?'┆':'▥'}
 else if(p===sp.switch){cls='switch'+(state.bridge?' on':'');name='Bridge switch'+(state.bridge?' activated':'');symbol='◉'}
 else if(p===sp.bridge){cls='bridge'+(state.bridge?' on':'');name=state.bridge?'Active bridge':'Inactive bridge';symbol='═'}
 else if(p===sp.trap){cls='trap'+(!E.active(state)?' safe':'');name=E.active(state)?'Active pulse trap':'Safe pulse trap';symbol=E.active(state)?'✹':'✧'}
 else if(E.GEM_POS.includes(p)&&!state.gems.includes(p)){cls='gem';name='Garden gem';symbol='◆'}
 cell.className='tile '+cls;cell.textContent=symbol;cell.setAttribute('aria-label',`${name}, column ${x+1}, row ${y+1}`);
 if(x===state.x&&y===state.y){const player=document.createElement('span');player.className='player';player.setAttribute('aria-hidden','true');const lantern=document.createElement('span');lantern.className='player-lantern';player.append(lantern);cell.append(player);cell.setAttribute('aria-label',`Pip at ${name}, column ${x+1}, row ${y+1}`)}
 });
 $('hearts').textContent='♥ '.repeat(state.hp)+'♡ '.repeat(3-state.hp);$('hearts').setAttribute('aria-label',`${state.hp} hearts remaining`);$('gems').textContent=`◇ ${state.gems.length} / 6`;$('key').textContent=state.key?'⚿':state.door?'✓':'—';$('move-count').textContent=`${state.moves} moves`;$('objective').textContent=E.objective(state);
 for(const [id,done]of [['quest-key',state.door],['quest-bridge',state.bridge],['quest-exit',state.status==='won']]){$(id).classList.toggle('complete',done);$(id).querySelector('b').textContent=done?'✓':''}
 const safe=!E.active(state);$('trap-status').classList.toggle('safe',safe);$('trap-label').textContent=safe?'Pulse is resting':'Pulse is active';$('trap-icon').textContent=safe?'✧':'✹';$('trap-detail').textContent=safe?'Mint glow: cross, then keep moving.':'Coral glow: wait before crossing.';
 if($('message').textContent!==state.message)$('message').textContent=state.message;
 document.querySelectorAll('[data-dir]').forEach(b=>b.disabled=state.status!=='playing');
 if((state.status==='won'||state.status==='lost')&&!$('modal').open)showResult();
}
function begin(){state=E.start(E.fresh());hintIndex=0;render();$('pause').focus()}
$('start').onclick=begin;
document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>{E.move(state,...b.dataset.dir.split(',').map(Number));render()});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&state.status==='playing'){event.preventDefault();openPause();return}
 if(state.status!=='playing'||$('modal').open||event.ctrlKey||event.metaKey||event.altKey)return;
 const directions={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};const dir=directions[event.key]||directions[event.key.toLowerCase()];if(dir){event.preventDefault();E.move(state,...dir);render()}
});
function modal(title,kicker,body,buttons,icon='✦'){
 lastFocus=document.activeElement;$('modal-title').textContent=title;$('modal-kicker').textContent=kicker;$('modal-body').innerHTML=body;$('modal-icon').textContent=icon;$('modal-actions').replaceChildren();
 buttons.forEach(([label,fn,secondary])=>{const b=document.createElement('button');b.className=secondary?'quiet':'gold';b.textContent=label;b.onclick=fn;$('modal-actions').append(b)});$('modal').showModal();
}
function closeModal(){ $('modal').close();modalKind='';E.resume(state);render();if(lastFocus?.isConnected)lastFocus.focus()}
function openPause(){E.pause(state);modalKind='pause';modal('A moment to breathe.','ADVENTURE PAUSED','<p>Your lantern and the pulse are resting. Pick up right where you left off.</p>',[['Continue adventure',closeModal],['How to play',openHelp,true]]);render()}
function openHelp(){if($('modal').open)$('modal').close();E.pause(state);modalKind='help';modal('A few little pointers.','A FIELD GUIDE','<ul><li><strong>Move Pip:</strong> arrows, WASD, D-pad, or click an adjacent tile.</li><li><strong>Brass gate:</strong> find the key, then walk into the gate.</li><li><strong>Moonstone bridge:</strong> step on the round switch, or click it from beside it.</li><li><strong>Pulse trap:</strong> coral hurts; mint is safe. Each phase lasts two seconds. Cross and move off before it wakes.</li><li><strong>Three hearts:</strong> a hit returns you to the entrance. Discoveries stay with you.</li><li><strong>Explore:</strong> six optional gems await. Reach the sun to finish. Pause freezes the pulse.</li></ul>',[['Got it — let’s explore',closeModal]]);render()}
$('pause').onclick=openPause;$('help').onclick=openHelp;
$('modal').addEventListener('cancel',event=>{event.preventDefault();if(modalKind==='result')return;closeModal()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.status==='playing')openPause()});
$('restart').onclick=()=>{E.pause(state);modalKind='restart';modal('A fresh trail?','RESTART LEVEL','<p>This resets your hearts, key, bridge, gems, and move count.</p>',[['Restart adventure',()=>{$('modal').close();modalKind='';begin()}],['Keep exploring',closeModal,true]],'↺');render()};
$('hint').onclick=()=>{const hints=!state.key&&!state.door?['From the entrance, follow the upper path to the second downward branch.','The brass key is at column 4, row 4. Turn down before the long eastern corridor.']:!state.door?['Follow the western corridor down, then turn east along the lower path.','The brass gate is at column 7, row 10. Walk into it with your key.']:!state.bridge?['Beyond the gate, head up. A short branch to the east holds the switch.','The round green switch is at column 12, row 8. Step on it or click from beside it.']:['Cross the bridge and follow the winding eastern path toward the sun.','The pulse trap is at column 18, row 6. Wait for mint, then cross and move away.'];state.message=hints[hintIndex++%hints.length];render()};
function showResult(){modalKind='result';const won=state.status==='won';modal(won?'A little courage. A way home.':'Every explorer starts again.',won?'GARDEN COMPLETE':'LANTERN OUT',`<p>${won?'The garden opens to the sunlight. You solved all three obstacles and brought a little wonder back with you.':'The pulse got the better of you. Watch for mint light, and keep moving after crossing.'}</p><div class="stat-row"><div><strong>${state.gems.length}/6</strong>gems found</div><div><strong>${state.moves}</strong>moves</div><div><strong>${state.hp}</strong>hearts</div></div>`,[['Play again',()=>{$('modal').close();modalKind='';begin()}],['Back to title',()=>{$('modal').close();modalKind='';state=E.fresh();render();$('start').focus()},true]],won?'☀':'♡')}
setInterval(()=>{if(state.status==='playing'&&!$('modal').open){E.tick(state);render()}},1000);
render();
