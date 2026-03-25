const ADMIN_LOGIN = "Aleksey_Ross";
const ADMIN_PASS = "Aleksey11";

// ===== STORAGE SAFE =====
function getLS(key, def){
 try{
  let d = localStorage.getItem(key);
  return d ? JSON.parse(d) : def;
 }catch{
  return def;
 }
}
function setLS(key,val){
 localStorage.setItem(key, JSON.stringify(val));
}

// ===== TOAST =====
function toast(msg){
 let el=document.createElement('div');
 el.className='toast';
 el.innerText=msg;
 document.getElementById('toast-container')?.appendChild(el);
 setTimeout(()=>el.remove(),3000);
}

// ===== USERS =====
function register(){
 let nick=loginNick.value;
 let pass=loginPass.value;

 if(!nick || !pass) return toast("Заполни поля");

 let users=getLS('users',[]);

 if(users.find(u=>u.nick===nick)){
  return toast("Ник уже занят");
 }

 users.push({nick,pass});
 setLS('users',users);

 toast("Аккаунт создан");
}

function login(){
 let nick=loginNick.value;
 let pass=loginPass.value;

 let users=getLS('users',[]);

 // админ
 if(nick===ADMIN_LOGIN && pass===ADMIN_PASS){
  localStorage.setItem('currentUser',nick);
  location='index.html';
  return;
 }

 let user=users.find(u=>u.nick===nick && u.pass===pass);

 if(!user) return toast("Неверные данные");

 localStorage.setItem('currentUser',nick);
 location='index.html';
}

function getUser(){
 return localStorage.getItem('currentUser');
}

function isAdmin(){
 return getUser()===ADMIN_LOGIN;
}

// ===== ADMIN ACCESS =====
if(location.pathname.includes('admin') && !isAdmin()){
 location='login.html';
}

// ===== CABINET =====
let form=document.getElementById('appForm');
if(form){
 form.onsubmit=e=>{
  e.preventDefault();

  let apps=getLS('apps',[]);
  let members=getLS('members',[]);

  let nick=getUser();
  if(!nick) return location='login.html';

  if(apps.find(a=>a.nick===nick)) return toast("Уже подано");
  if(members.find(m=>m.nick===nick)) return toast("Ты уже в составе");

  apps.push({
   nick,
   level:level.value,
   msg:msg.value
  });

  setLS('apps',apps);
  toast("Заявка отправлена");
 };
}

// ===== ADMIN =====
function render(){
 let apps=getLS('apps',[]);
 let members=getLS('members',[]);

 let appsEl=document.getElementById('apps');
 if(appsEl){
  appsEl.innerHTML=apps.map((a,i)=>`
   <div class="card">
    <b>${a.nick}</b><br>
    lvl:${a.level}<br>
    ${a.msg}<br>
    <button onclick="accept(${i})">✔</button>
    <button onclick="decline(${i})">✖</button>
   </div>
  `).join('');
 }

 let membersEl=document.getElementById('members');
 if(membersEl){
  membersEl.innerHTML=members.map((m,i)=>`
   <div>${m.nick}
    <button onclick="removeM(${i})">❌</button>
   </div>
  `).join('');
 }
}

function accept(i){
 let apps=getLS('apps',[]);
 let members=getLS('members',[]);

 members.push(apps[i]);
 apps.splice(i,1);

 setLS('apps',apps);
 setLS('members',members);
 render();
}

function decline(i){
 let apps=getLS('apps',[]);
 apps.splice(i,1);
 setLS('apps',apps);
 render();
}

function removeM(i){
 let members=getLS('members',[]);
 members.splice(i,1);
 setLS('members',members);
 render();
}

// ===== GARAGE =====
function addCar(){
 if(!isAdmin()) return toast("Нет доступа");

 let file=carImage.files[0];
 let name=carName.value;

 if(!file || !name) return toast("Заполни всё");

 let reader=new FileReader();

 reader.onload=()=>{
  let g=getLS('garage',[]);

  g.push({name,img:reader.result});
  setLS('garage',g);

  renderGarage();
 };

 reader.readAsDataURL(file);
}

// 🔥 УДАЛЕНИЕ МАШИНЫ
function removeCar(i){
 let g=getLS('garage',[]);

 g.splice(i,1);
 setLS('garage',g);

 toast("Удалено");
 renderGarage();
}

// отображение
function renderGarage(){
 let g=getLS('garage',[]);
 let el=document.getElementById('garage');
 if(!el) return;

 el.innerHTML=g.map((c,i)=>`
  <div class="card">
   ${c.name}
   <img src="${c.img}" class="preview-img">
   <button onclick="removeCar(${i})">Удалить</button>
  </div>
 `).join('');
}

// публичный автопарк
function renderPublicGarage(){
 let g=getLS('garage',[]);
 let el=document.getElementById('publicGarage');
 if(!el) return;

 el.innerHTML=g.map(c=>`
  <div class="card">
   ${c.name}
   <img src="${c.img}" class="preview-img">
  </div>
 `).join('');
}

// ===== GAME =====
let lastClick=0;
function clickMoney(){
 let now=Date.now();
 if(now-lastClick<1000) return;
 lastClick=now;

 let user=getUser();
 if(!user) return location='login.html';

 let lb=getLS('lb',{});
 lb[user]=(lb[user]||0)+1;

 setLS('lb',lb);

 document.getElementById('score').innerText=lb[user];
 renderLeaderboard();
}

function renderLeaderboard(){
 let lb=getLS('lb',{});
 let el=document.getElementById('leaderboard');
 if(!el) return;

 el.innerHTML=Object.entries(lb)
  .sort((a,b)=>b[1]-a[1])
  .map(([n,s])=>`${n}: ${s}`).join('<br>');
}

function resetLeaderboard(){
 if(!isAdmin()) return toast("Нет доступа");

 localStorage.removeItem('lb');
 renderLeaderboard();
}

// ===== INIT =====
render();
renderGarage();
renderPublicGarage();
renderLeaderboard();