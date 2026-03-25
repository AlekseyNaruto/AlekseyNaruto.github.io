// ====== НАСТРОЙКИ ======
const ADMIN_LOGIN = "Aleksey_Ross";
const ADMIN_PASS = "Aleksey11";

// ====== TOAST ======
function toast(msg, type="info"){
 const el=document.createElement('div');
 el.className='toast '+type;
 el.innerText=msg;
 document.getElementById('toast-container')?.appendChild(el);
 setTimeout(()=>el.remove(),3000);
}

// ====== LOGIN ======
function login(){
 let nick=document.getElementById('loginNick').value;
 let pass=document.getElementById('loginPass').value;

 if(!nick || !pass) return toast('Заполни поля');

 if(nick===ADMIN_LOGIN && pass===ADMIN_PASS){
   localStorage.setItem('currentUser', nick);
   toast('Админ вход выполнен');
   setTimeout(()=>location='index.html',800);
 } else {
   localStorage.setItem('currentUser', nick);
   toast('Вы вошли как игрок');
   setTimeout(()=>location='index.html',800);
 }
}

// ====== USER ======
function getUser(){
 return localStorage.getItem('currentUser');
}

function isAdmin(){
 return getUser() === ADMIN_LOGIN;
}

// ====== ADMIN ACCESS ======
if(location.pathname.includes('admin')){
 if(!isAdmin()){
  alert('Нет доступа');
  location='login.html';
 }
}

// ====== CABINET ======
const form=document.getElementById('appForm');

if(form){
 form.onsubmit=e=>{
  e.preventDefault();

  let apps=JSON.parse(localStorage.getItem('apps')||'[]');
  let members=JSON.parse(localStorage.getItem('members')||'[]');

  let nick=getUser();
  if(!nick) return location='login.html';

  if(apps.find(a=>a.nick===nick)) return toast('Уже подано');
  if(members.find(m=>m.nick===nick)) return toast('Ты уже в составе');

  apps.push({nick});
  localStorage.setItem('apps',JSON.stringify(apps));

  toast('Заявка отправлена','success');
 };
}

// ====== ADMIN ======
function render(){
 let apps=JSON.parse(localStorage.getItem('apps')||'[]');
 let members=JSON.parse(localStorage.getItem('members')||'[]');
 let events=JSON.parse(localStorage.getItem('events')||'[]');

 let appsEl=document.getElementById('apps');
 let membersEl=document.getElementById('members');
 let eventsEl=document.getElementById('events');

 if(appsEl){
  appsEl.innerHTML=apps.map((a,i)=>`
   <div>${a.nick}
    <button onclick="accept(${i})">✔</button>
    <button onclick="decline(${i})">✖</button>
   </div>
  `).join('');
 }

 if(membersEl){
  membersEl.innerHTML=members.map((m,i)=>`
   <div>${m.nick}
    <button onclick="removeM(${i})">Удалить</button>
   </div>
  `).join('');
 }

 if(eventsEl){
  eventsEl.innerHTML=events.map((e,i)=>`
   <div>${e.name}
    <button onclick="removeEvent(${i})">✖</button>
   </div>
  `).join('');
 }
}

// ====== ACTIONS ======
function accept(i){
 let apps=JSON.parse(localStorage.getItem('apps'));
 let members=JSON.parse(localStorage.getItem('members')||[]);

 members.push(apps[i]);
 apps.splice(i,1);

 localStorage.setItem('apps',JSON.stringify(apps));
 localStorage.setItem('members',JSON.stringify(members));

 toast('Принят');
 render();
}

function decline(i){
 let apps=JSON.parse(localStorage.getItem('apps'));
 apps.splice(i,1);

 localStorage.setItem('apps',JSON.stringify(apps));

 toast('Отклонен');
 render();
}

function removeM(i){
 let members=JSON.parse(localStorage.getItem('members'));
 members.splice(i,1);

 localStorage.setItem('members',JSON.stringify(members));

 toast('Удален');
 render();
}

// ====== EVENTS ======
function createEvent(){
 let events=JSON.parse(localStorage.getItem('events')||[]);

 let name=eventName.value;
 let date=eventDate.value;
 let desc=eventDesc.value;

 if(!name) return toast('Введите название');

 events.push({name,date,desc});
 localStorage.setItem('events',JSON.stringify(events));

 toast('Создано');
 render();
}

function removeEvent(i){
 let events=JSON.parse(localStorage.getItem('events'));
 events.splice(i,1);
 localStorage.setItem('events',JSON.stringify(events));

 render();
}

// ====== GARAGE ======
function addCar(){
 if(!isAdmin()) return toast('Нет доступа');

 const file=carImage.files[0];
 const name=carName.value;

 if(!file||!name) return toast('Заполни всё');

 const reader=new FileReader();

 reader.onload=function(){
  let garage=JSON.parse(localStorage.getItem('garage')||[]);

  garage.push({name,img:reader.result});
  localStorage.setItem('garage',JSON.stringify(garage));

  renderGarage();
 };

 reader.readAsDataURL(file);
}

function renderGarage(){
 let garage=JSON.parse(localStorage.getItem('garage')||[]);

 let el=document.getElementById('garage');
 if(!el) return;

 el.innerHTML=garage.map((car,i)=>`
  <div class="card">
   <b>${car.name}</b>
   <img src="${car.img}" class="preview-img">
   <button onclick="removeCar(${i})">Удалить</button>
  </div>
 `).join('');
}

function removeCar(i){
 let garage=JSON.parse(localStorage.getItem('garage'));
 garage.splice(i,1);
 localStorage.setItem('garage',JSON.stringify(garage));
 renderGarage();
}

// ====== GAME ======
function clickMoney(){
 let user=getUser();
 if(!user) return location='login.html';

 let lb=JSON.parse(localStorage.getItem('leaderboard')||{});
 lb[user]=(lb[user]||0)+1;

 localStorage.setItem('leaderboard',JSON.stringify(lb));
 renderLeaderboard();
}

function renderLeaderboard(){
 let lb=JSON.parse(localStorage.getItem('leaderboard')||{});
 let sorted=Object.entries(lb).sort((a,b)=>b[1]-a[1]);

 let el=document.getElementById('leaderboard');
 if(!el) return;

 el.innerHTML=sorted.map(([n,s])=>`<div>${n}: ${s}</div>`).join('');
}

function resetLeaderboard(){
 if(!isAdmin()) return toast('Нет доступа');

 localStorage.removeItem('leaderboard');
 renderLeaderboard();
}

// ====== RESET MONTH ======
(function(){
 let last=localStorage.getItem('lb_reset');
 let now=new Date().getMonth();

 if(last!=now){
  localStorage.removeItem('leaderboard');
  localStorage.setItem('lb_reset',now);
 }
})();

// ====== INIT ======
render();
renderGarage();
renderLeaderboard();