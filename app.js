const ADMIN_LOGIN = "Aleksey_Ross";
const ADMIN_PASS = "12345";

function toast(msg){
 let el=document.createElement('div');
 el.className='toast';
 el.innerText=msg;
 document.getElementById('toast-container')?.appendChild(el);
 setTimeout(()=>el.remove(),3000);
}

// LOGIN
function login(){
 let n=loginNick.value;
 let p=loginPass.value;

 if(n===ADMIN_LOGIN && p===ADMIN_PASS){
  localStorage.setItem('currentUser',n);
  location='index.html';
 }else{
  localStorage.setItem('currentUser',n);
  location='index.html';
 }
}

function getUser(){return localStorage.getItem('currentUser');}
function isAdmin(){return getUser()===ADMIN_LOGIN;}

if(location.pathname.includes('admin')&&!isAdmin()){
 location='login.html';
}

// APPLICATION
let form=document.getElementById('appForm');
if(form){
 form.onsubmit=e=>{
  e.preventDefault();

  let apps=JSON.parse(localStorage.apps||"[]");
  let members=JSON.parse(localStorage.members||"[]");

  let nick=getUser();

  let level=level.value;
  let msg=msg.value;

  apps.push({nick,level,msg});
  localStorage.apps=JSON.stringify(apps);

  toast("Отправлено");
 };
}

// ADMIN
function render(){
 let apps=JSON.parse(localStorage.apps||"[]");
 let members=JSON.parse(localStorage.members||"[]");

 if(appsEl=document.getElementById('apps')){
  appsEl.innerHTML=apps.map((a,i)=>`
   <div class="card">
    ${a.nick}<br>
    lvl:${a.level}<br>
    ${a.msg}<br>
    <button onclick="accept(${i})">✔</button>
    <button onclick="decline(${i})">✖</button>
   </div>`).join('');
 }

 if(membersEl=document.getElementById('members')){
  membersEl.innerHTML=members.map((m,i)=>`
   <div>${m.nick}
    <button onclick="removeM(${i})">X</button>
   </div>`).join('');
 }
}

function accept(i){
 let apps=JSON.parse(localStorage.apps);
 let members=JSON.parse(localStorage.members||"[]");

 members.push(apps[i]);
 apps.splice(i,1);

 localStorage.apps=JSON.stringify(apps);
 localStorage.members=JSON.stringify(members);
 render();
}

function decline(i){
 let apps=JSON.parse(localStorage.apps);
 apps.splice(i,1);
 localStorage.apps=JSON.stringify(apps);
 render();
}

function removeM(i){
 let members=JSON.parse(localStorage.members);
 members.splice(i,1);
 localStorage.members=JSON.stringify(members);
 render();
}

// GARAGE
function addCar(){
 let file=carImage.files[0];
 let name=carName.value;

 let reader=new FileReader();
 reader.onload=()=>{
  let g=JSON.parse(localStorage.garage||"[]");
  g.push({name,img:reader.result});
  localStorage.garage=JSON.stringify(g);
  renderGarage();
 };
 reader.readAsDataURL(file);
}

function renderGarage(){
 let g=JSON.parse(localStorage.garage||"[]");
 let el=document.getElementById('garage');
 if(!el)return;

 el.innerHTML=g.map(c=>`
  <div class="card">
   ${c.name}
   <img src="${c.img}">
  </div>`).join('');
}

// PUBLIC GARAGE
function renderPublicGarage(){
 let g=JSON.parse(localStorage.garage||"[]");
 let el=document.getElementById('publicGarage');
 if(!el)return;

 el.innerHTML=g.map(c=>`
  <div class="card">
   ${c.name}
   <img src="${c.img}">
  </div>`).join('');
}

// GAME
let lastClick=0;
function clickMoney(){
 let now=Date.now();
 if(now-lastClick<1000) return;
 lastClick=now;

 let user=getUser();
 let lb=JSON.parse(localStorage.lb||"{}");

 lb[user]=(lb[user]||0)+1;
 localStorage.lb=JSON.stringify(lb);

 document.getElementById('score').innerText=lb[user];
 renderLeaderboard();
}

function renderLeaderboard(){
 let lb=JSON.parse(localStorage.lb||"{}");
 let el=document.getElementById('leaderboard');
 if(!el)return;

 el.innerHTML=Object.entries(lb)
  .sort((a,b)=>b[1]-a[1])
  .map(([n,s])=>`${n}: ${s}`).join('<br>');
}

function resetLeaderboard(){
 if(!isAdmin()) return;
 localStorage.removeItem('lb');
 renderLeaderboard();
}

// INIT
render();
renderGarage();
renderPublicGarage();
renderLeaderboard();