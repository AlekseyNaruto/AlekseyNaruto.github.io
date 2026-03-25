// ===== НАСТРОЙКИ =====
const ADMIN_LOGIN = "Aleksey_Ross";
const ADMIN_PASS = "12345";

// ===== SAFE STORAGE =====
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
 return getUser() === ADMIN_LOGIN;
}

// ===== LOGIN =====
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

// ===== ADMIN ACCESS =====
if(location.pathname.includes('admin') && !isAdmin()){
 location='login.html';
}

// ================= CHAT SYSTEM =================

// создать сообщение
function sendMessage(){
 let input = document.getElementById('chatInput');
 let text = input.value;
 let user = getUser();

 if(!text) return;

 let chats = getLS('chats', {});

 if(!chats[user]) chats[user] = [];

 chats[user].push({
  from: user,
  text,
  time: new Date().toLocaleTimeString()
 });

 setLS('chats', chats);

 input.value="";
 renderChat();
}

// ответ админа
function adminReply(user){
 let text = prompt("Ответ:");
 if(!text) return;

 let chats = getLS('chats', {});

 chats[user].push({
  from: "admin",
  text,
  time: new Date().toLocaleTimeString()
 });

 setLS('chats', chats);

 renderAdminChats();
}

// ===== РЕНДЕР ЧАТА ИГРОКА =====
function renderChat(){
 let user = getUser();
 let chats = getLS('chats', {});

 let el = document.getElementById('chatBox');
 if(!el || !chats[user]) return;

 el.innerHTML = chats[user].map(m=>`
  <div style="text-align:${m.from==='admin'?'right':'left'}">
   <b>${m.from}</b>: ${m.text}
  </div>
 `).join('');
}

// ===== РЕНДЕР АДМИНА =====
function renderAdminChats(){
 let chats = getLS('chats', {});
 let el = document.getElementById('complaints');

 if(!el) return;

 el.innerHTML = Object.keys(chats).map(user=>`
  <div class="card">
   <b>${user}</b><br>
   ${chats[user].slice(-3).map(m=>m.text).join('<br>')}<br><br>

   <button onclick="adminReply('${user}')">Ответить</button>
   <button onclick="clearChat('${user}')">Очистить</button>
  </div>
 `).join('');
}

// очистка
function clearChat(user){
 let chats = getLS('chats', {});
 delete chats[user];
 setLS('chats', chats);

 renderAdminChats();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", ()=>{
 renderChat();
 renderAdminChats();
});