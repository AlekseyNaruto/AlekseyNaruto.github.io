// ===== НАСТРОЙКИ =====
const ADMIN_LOGIN = "Aleksey_Ross";
const ADMIN_PASS = "12345";

// ===== STORAGE =====
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

// ===== USER =====
function getUser(){
 return localStorage.getItem('currentUser');
}
function isAdmin(){
 return getUser()===ADMIN_LOGIN;
}

// ===== LOGIN =====
function login(){
 let n=loginNick.value;
 let p=loginPass.value;

 if(!n || !p) return toast("Заполни поля");

 if(n===ADMIN_LOGIN && p===ADMIN_PASS){
  localStorage.setItem('currentUser',n);
  location='index.html';
  return;
 }

 localStorage.setItem('currentUser',n);
 location='index.html';
}

// защита админки
if(location.pathname.includes('admin') && !isAdmin()){
 location='login.html';
}

// ================= ЗАЯВКИ =================
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

// ===== АДМИН ЗАЯВКИ =====
function render(){
 let apps=getLS('apps',[]);
 let members=getLS('members',[]);

 let appsEl=document.getElementById('apps');
 if(appsEl){
  appsEl.innerHTML=apps.map((a,i)=>`
   <div class="panel">
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

// ================= ЧАТ =================

// отправка игрока
function sendMessage(){
 let input=document.getElementById('chatInput');
 if(!input) return;

 let text=input.value;
 let user=getUser();

 if(!user) return location='login.html';
 if(!text) return;

 let chats=getLS('chats',{});

 if(!chats[user]) chats[user]=[];

 chats[user].push({
  from:user,
  text
 });

 setLS('chats',chats);

 input.value="";
 renderChat();
}

// ответ админа
function sendAdminReply(user){
 let input=document.getElementById(`reply_${user}`);
 if(!input) return;

 let text=input.value;
 if(!text) return;

 let chats=getLS('chats',{});

 chats[user].push({
  from:"admin",
  text
 });

 setLS('chats',chats);

 input.value="";
 renderAdminChats();
}

// чат игрока
function renderChat(){
 let user=getUser();
 let chats=getLS('chats',{});
 let el=document.getElementById('chatBox');

 if(!el) return;

 if(!chats[user]){
  el.innerHTML="Нет сообщений";
  return;
 }

 el.innerHTML=chats[user].map(m=>`
  <div style="text-align:${m.from==='admin'?'right':'left'}">
   <b>${m.from}:</b> ${m.text}
  </div>
 `).join('');
}

// чат админа
function renderAdminChats(){
 let chats=getLS('chats',{});
 let el=document.getElementById('complaints');
 if(!el) return;

 el.innerHTML=Object.keys(chats).map(user=>`
  <div class="panel">

   <b>${user}</b><br><br>

   <div style="max-height:150px; overflow:auto; text-align:left;">
    ${chats[user].map(m=>`
     <div style="text-align:${m.from==='admin'?'right':'left'}">
      <b>${m.from}:</b> ${m.text}
     </div>
    `).join('')}
   </div>

   <input id="reply_${user}" placeholder="Ответ...">
   <button onclick="sendAdminReply('${user}')">Ответить</button>

  </div>
 `).join('');
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", ()=>{
 render();
 renderChat();
 renderAdminChats();
});