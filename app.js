const ADMIN_LOGIN = "Aleksey_Ross";
const ADMIN_PASS = "Aleksey11";

// STORAGE
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

// TOAST
function toast(msg){
 let el=document.createElement('div');
 el.className='toast';
 el.innerText=msg;
 document.getElementById('toast-container')?.appendChild(el);
 setTimeout(()=>el.remove(),3000);
}

// USER
function getUser(){return localStorage.getItem('currentUser');}
function isAdmin(){return getUser()===ADMIN_LOGIN;}

// LOGIN
function login(){
 let n=loginNick.value;
 let p=loginPass.value;

 if(n===ADMIN_LOGIN && p===ADMIN_PASS){
  localStorage.setItem('currentUser',n);
 }else{
  localStorage.setItem('currentUser',n);
 }
 location='index.html';
}

// защита
if(location.pathname.includes('admin') && !isAdmin()){
 location='login.html';
}

// ===== ЗАЯВКИ =====
let form=document.getElementById('appForm');
if(form){
 form.onsubmit=e=>{
  e.preventDefault();

  let apps=getLS('apps',[]);
  let nick=getUser();

  apps.push({
   nick,
   level:level.value,
   msg:msg.value
  });

  setLS('apps',apps);
  toast("Заявка отправлена");
 };
}

function renderApps(){
 let apps=getLS('apps',[]);
 let el=document.getElementById('apps');
 if(!el) return;

 el.innerHTML=apps.map((a,i)=>`
  <div class="panel">
   <b>${a.nick}</b><br>
   lvl:${a.level}<br>
   ${a.msg}
  </div>
 `).join('');
}

// ===== ЧАТ =====
function sendMessage(){
 let input=document.getElementById('chatInput');
 if(!input) return;

 let text=input.value;
 let user=getUser();

 if(!text) return;

 let chats=getLS('chats',{});
 if(!chats[user]) chats[user]=[];

 chats[user].push({from:user,text});

 setLS('chats',chats);

 input.value="";
 renderChat();
}

function sendAdminReply(user){
 let input=document.getElementById(`reply_${user}`);
 let text=input.value;

 if(!text) return;

 let chats=getLS('chats',{});

 chats[user].push({from:"admin",text});

 setLS('chats',chats);

 input.value="";
 renderAdminChats();
}

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

function renderAdminChats(){
 let chats=getLS('chats',{});
 let el=document.getElementById('complaints');
 if(!el) return;

 el.innerHTML=Object.keys(chats).map(user=>`
  <div class="panel">

   <b>${user}</b><br>

   <div style="max-height:120px;overflow:auto;">
    ${chats[user].map(m=>`
     <div style="text-align:${m.from==='admin'?'right':'left'}">
      ${m.text}
     </div>
    `).join('')}
   </div>

   <input id="reply_${user}">
   <button onclick="sendAdminReply('${user}')">Ответ</button>
   <button onclick="clearChat('${user}')">🧹</button>

  </div>
 `).join('');
}

// очистка одного
function clearChat(user){
 let chats=getLS('chats',{});
 delete chats[user];
 setLS('chats',chats);
 renderAdminChats();
}

// очистка всех
function clearAllChats(){
 localStorage.removeItem('chats');
 renderAdminChats();
}

// INIT
document.addEventListener("DOMContentLoaded", ()=>{
 renderApps();
 renderChat();
 renderAdminChats();
});