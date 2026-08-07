const GAMES = [
  {id:'scratch',name:'Classic Scratch',icon:'🎟️',unlock:0,desc:'Scratch-style reveal. The simplest daily hit.'},
  {id:'wheel',name:'Lucky Wheel',icon:'🎡',unlock:1000,desc:'Same economy, different suspense. Spin and reveal.'},
  {id:'box',name:'Mystery Box',icon:'🎁',unlock:5000,desc:'Pick a sealed box and reveal your Coin result.'},
  {id:'numbers',name:'Lucky Numbers',icon:'🔢',unlock:20000,desc:'Pick a number, then reveal the daily draw.'},
  {id:'gold',name:'Gold Scratch',icon:'✨',unlock:50000,desc:'A rarer-looking scratch with the same target EV.'},
  {id:'legend',name:'Legendary Reveal',icon:'👑',unlock:100000,desc:'The endgame reveal style for dedicated players.'},
];

const REWARDS = [
  {coins:25, weight:30},
  {coins:50, weight:28},
  {coins:100, weight:22},
  {coins:250, weight:12},
  {coins:500, weight:6},
  {coins:1000, weight:1.8},
  {coins:5000, weight:.2},
];

const state = JSON.parse(localStorage.getItem('lucklab-state') || 'null') || {
  coins:0,lifetimeCoins:0,plays:{},streak:1,lastVisit:null
};

function todayKey(){return new Date().toLocaleDateString('en-CA')}
function save(){localStorage.setItem('lucklab-state',JSON.stringify(state))}
function weightedReward(){const total=REWARDS.reduce((s,r)=>s+r.weight,0);let roll=Math.random()*total;for(const r of REWARDS){roll-=r.weight;if(roll<=0)return r.coins}return 25}
function isPlayed(id){return state.plays[`${todayKey()}:${id}`]===true}
function isUnlocked(game){return state.lifetimeCoins>=game.unlock}

function updateStreak(){
  const today=todayKey();
  if(!state.lastVisit){state.lastVisit=today;save();return}
  if(state.lastVisit===today)return;
  const yesterday=new Date(); yesterday.setDate(yesterday.getDate()-1);
  const y=yesterday.toLocaleDateString('en-CA');
  state.streak=state.lastVisit===y?state.streak+1:1;
  state.lastVisit=today; save();
}

function render(){
  document.querySelector('#coinBalance').textContent=state.coins.toLocaleString();
  document.querySelector('#streakCount').textContent=state.streak;
  const next=GAMES.find(g=>g.unlock>state.lifetimeCoins);
  const target=next?next.unlock:GAMES[GAMES.length-1].unlock;
  const prev=[...GAMES].reverse().find(g=>g.unlock<=state.lifetimeCoins)?.unlock||0;
  const pct=next?Math.max(0,Math.min(100,(state.lifetimeCoins-prev)/(target-prev)*100)):100;
  document.querySelector('#unlockProgress').style.width=`${pct}%`;
  document.querySelector('#unlockText').textContent=next?`${state.lifetimeCoins.toLocaleString()} / ${target.toLocaleString()} Coins`:'All games unlocked';
  const grid=document.querySelector('#gameGrid');grid.innerHTML='';
  GAMES.forEach(game=>{
    const unlocked=isUnlocked(game), played=isPlayed(game);
    const card=document.createElement('article');card.className=`game-card ${unlocked?'':'locked'}`;
    card.innerHTML=`<div>${!unlocked?`<div class="lock-overlay">🔒 ${game.unlock.toLocaleString()} Coins</div>`:''}<div class="icon">${game.icon}</div><h3>${game.name}</h3><p>${game.desc}</p></div><footer><span>${unlocked?'Unlocked':'Locked'}</span><span class="status">${played?'Played today':unlocked?'PLAY →':'KEEP EARNING'}</span></footer>`;
    if(unlocked&&!played){card.style.cursor='pointer';card.addEventListener('click',()=>openGame(game))}
    grid.appendChild(card);
  });
  renderLeaderboard();
}

function renderLeaderboard(){
  const names=['Maya R.','Jordan K.','Chris P.','Alex T.','You'];
  const values=[7420,6180,4935,3680,state.lifetimeCoins];
  const rows=names.map((n,i)=>({n,v:values[i]})).sort((a,b)=>b.v-a.v).slice(0,5);
  document.querySelector('#leaderboard').innerHTML=rows.map((r,i)=>`<div class="leader-row"><span>${i+1}</span><div>${r.n}<small>Lifetime Coins</small></div><strong>${r.v.toLocaleString()}</strong></div>`).join('');
}

const modal=document.querySelector('#gameModal');let activeGame=null;
function openGame(game){
  activeGame=game;
  document.querySelector('#modalIcon').textContent=game.icon;
  document.querySelector('#modalTitle').textContent=game.name;
  document.querySelector('#modalDesc').textContent=game.desc;
  document.querySelector('#playArea').textContent=playAreaCopy(game.id);
  document.querySelector('#playArea').classList.add('ready');
  document.querySelector('#resultBox').classList.add('hidden');
  const btn=document.querySelector('#revealButton');btn.disabled=false;btn.textContent=buttonCopy(game.id);
  modal.showModal();
}
function playAreaCopy(id){return ({scratch:'SCRATCH',wheel:'SPIN',box:'PICK',numbers:'PICK 7',gold:'GOLD',legend:'REVEAL'})[id]||'REVEAL'}
function buttonCopy(id){return ({scratch:'Scratch now',wheel:'Spin the wheel',box:'Open a box',numbers:'Reveal draw',gold:'Scratch gold card',legend:'Reveal legendary'})[id]||'Reveal'}

function play(){
  if(!activeGame||isPlayed(activeGame.id))return;
  const reward=weightedReward();
  state.coins+=reward;state.lifetimeCoins+=reward;state.plays[`${todayKey()}:${activeGame.id}`]=true;save();
  const area=document.querySelector('#playArea'); area.classList.remove('ready'); area.textContent=`+${reward.toLocaleString()} 🪙`;
  const result=document.querySelector('#resultBox');result.classList.remove('hidden');result.innerHTML=`YOU REVEALED <big>+${reward.toLocaleString()} COINS</big>`;
  const btn=document.querySelector('#revealButton');btn.disabled=true;btn.textContent='Come back tomorrow';
  render();
}

document.querySelector('#revealButton').addEventListener('click',play);
document.querySelector('#playArea').addEventListener('click',play);
document.querySelector('#closeModal').addEventListener('click',()=>modal.close());
document.querySelector('#playFeatured').addEventListener('click',()=>{
  const g=GAMES.find(x=>isUnlocked(x)&&!isPlayed(x.id));
  if(g)openGame(g);else document.querySelector('#gamesSection').scrollIntoView({behavior:'smooth'});
});
document.querySelector('#viewGames').addEventListener('click',()=>document.querySelector('#gamesSection').scrollIntoView({behavior:'smooth'}));

function resetCountdown(){const now=new Date();const end=new Date(now);end.setHours(24,0,0,0);const d=end-now;const h=String(Math.floor(d/3600000)).padStart(2,'0');const m=String(Math.floor(d%3600000/60000)).padStart(2,'0');const s=String(Math.floor(d%60000/1000)).padStart(2,'0');document.querySelector('#resetTimer').textContent=`${h}:${m}:${s}`}
updateStreak();render();resetCountdown();setInterval(resetCountdown,1000);
