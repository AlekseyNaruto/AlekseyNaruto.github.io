function toast(msg){
 const el=document.createElement('div');
 el.className='toast';
 el.innerText=msg;
 document.getElementById('toast-container').appendChild(el);
 setTimeout(()=>el.remove(),3000);
}

// CABINET
const form=document.getElementById('appForm');

if(form){
 form.onsubmit=e=>{
  e.preventDefault();

  let apps=JSON.parse(localStorage.getItem('apps')||'[]');
  let members=JSON.parse(localStorage.getItem('members')||'[]');

  let nick=document.getElementById('nick').value;
  let level=document.getElementById('level').value;
  let msg=document.getElementById('msg').value;

  if(apps.find(a=>a.nick===nick)) return toast('Уже подано');
  if(members.find(m=>m.nick===nick)) return toast('Уже в составе');

  apps.push({nick,level,msg});
  localStorage.setItem('apps',JSON.stringify(apps));

  toast('Заявка отправлена');
 }
}

// ADMIN AUTH
if(location.pathname.includes('admin')){
 if(!localStorage.getItem('isAdmin')){
  let pass=prompt('Пароль');
  if(pass==='admin123'){
    localStorage.setItem('isAdmin',true);
  } else {
    location='index.html';
  }
 }
}

// ADMIN LOGIC
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

// ACTIONS
function accept(i){
 let apps=JSON.parse(localStorage.getItem('apps'));
 let members=JSON.parse(localStorage.getItem('members')||'[]');

 members.push(apps[i]);
 apps.splice(i,1);

 localStorage.setItem('apps',JSON.stringify(apps));
 localStorage.setItem('members',JSON.stringify(members));

 toast('Принято');
 render();
}

function decline(i){
 let apps=JSON.parse(localStorage.getItem('apps'));
 apps.splice(i,1);

 localStorage.setItem('apps',JSON.stringify(apps));

 toast('Отклонено');
 render();
}

function removeM(i){
 let members=JSON.parse(localStorage.getItem('members'));
 members.splice(i,1);

 localStorage.setItem('members',JSON.stringify(members));

 toast('Удален');
 render();
}

function createEvent(){
 let events=JSON.parse(localStorage.getItem('events')||'[]');

 let name=document.getElementById('eventName').value;
 let date=document.getElementById('eventDate').value;
 let desc=document.getElementById('eventDesc').value;

 events.push({name,date,desc});

 localStorage.setItem('events',JSON.stringify(events));

 toast('Ивент создан');
 render();
}

function removeEvent(i){
 let events=JSON.parse(localStorage.getItem('events'));

 events.splice(i,1);
 localStorage.setItem('events',JSON.stringify(events));

 toast('Удалено');
 render();
}

render();