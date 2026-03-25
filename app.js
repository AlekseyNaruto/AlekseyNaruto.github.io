const ADMIN_LOGIN = "Aleksey_Ross";
const ADMIN_PASS = "Aleksey11";

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

function getUser(){
 return localStorage.getItem('currentUser');
}

function isAdmin(){
 return getUser()===ADMIN_LOGIN;
}

// защита админки
if(location.pathname.includes('admin') && !isAdmin()){
 location='login.html';
}

// ===== ЧАТ =====

// отправка игрока
function sendMessage(){
 let input=document.getElementById('chatInput');
 let text=input.value;
 let user=getUser();

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

// ===== РЕНДЕР ИГРОКА =====
function renderChat(){
 let user=getUser();
 let chats=getLS('chats',{});
 let el=document.getElementById('chatBox');

 if(!el || !chats[user]) return;

 el.innerHTML=chats[user].map(m=>`
  <div style="text-align:${m.from==='admin'?'right':'left'}">
   <b>${m.from}:</b> ${m.text}
  </div>
 `).join('');
}

// ===== РЕНДЕР АДМИНА =====
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

// ===== INIT =====
document.addEventListener("DOMContentLoaded", ()=>{
 renderChat();
 renderAdminChats();
});