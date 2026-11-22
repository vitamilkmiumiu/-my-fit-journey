const KEY="myFitJourney_v1";
const today=()=>new Date().toLocaleDateString("en-CA");
const dateLabel=()=>new Intl.DateTimeFormat("th-TH",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
const defaults={tasks:{},food:[],sweets:[],workouts:[],progress:[],sleep:[]};
let data=load();
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...defaults}}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const t=document.querySelector("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2100)}
const taskNames=["กินอาหารให้เพียงพอ ไม่อดมื้อ","มีโปรตีนในมื้ออาหาร","ดื่มน้ำเปล่าให้เพียงพอ","ลดน้ำหวานลงจากเดิม","กินขนมในปริมาณที่ตั้งใจไว้","ขยับร่างกายหรือเดินระหว่างวัน","พักผ่อนให้เพียงพอ"];
function render(){
 const day=today(),done=data.tasks[day]||[];
 document.querySelector("#todayLabel").textContent=dateLabel();
 document.querySelector("#taskCount").textContent=`${done.length}/${taskNames.length}`;
 document.querySelector("#completion").textContent=Math.round(done.length/taskNames.length*100)+"%";
 document.querySelector("#taskList").innerHTML=taskNames.map((n,i)=>`<label class="task ${done.includes(i)?"done":""}"><input type="checkbox" data-task="${i}" ${done.includes(i)?"checked":""}><span>${n}</span></label>`).join("");
 document.querySelectorAll("[data-task]").forEach(el=>el.addEventListener("change",e=>{let a=data.tasks[day]||[];let i=+e.target.dataset.task;data.tasks[day]=e.target.checked?[...a,i]:a.filter(x=>x!==i);save()}));
 const foods=data.food.filter(x=>x.date===day),spent=foods.reduce((s,x)=>s+(+x.price||0),0);
 document.querySelector("#spent").textContent=spent;document.querySelector("#budgetBar").style.width=Math.min(100,spent/150*100)+"%";
 document.querySelector("#foodCount").textContent=foods.length+" รายการ";
 document.querySelector("#foodEntries").innerHTML=list(foods,x=>`<div><b>${esc(x.name)}</b><br><small>${esc(x.meal)}</small></div><b>${x.price?x.price+" บาท":"—"}</b>`);
 const sweets=data.sweets.filter(x=>x.date===day);
 document.querySelector("#sweetEntries").innerHTML=list(sweets,x=>`<div><b>${esc(x.name)}</b><br><small>${esc(x.amount)}</small></div><small>${esc(x.time)}</small>`);
 document.querySelector("#workoutEntries").innerHTML=list(data.workouts.filter(x=>x.date===day),x=>`<div><b>${esc(x.name)}</b><br><small>${x.minutes} นาที</small></div><small>${esc(x.time)}</small>`);
 const p=[...data.progress].sort((a,b)=>b.date.localeCompare(a.date));
 document.querySelector("#latestWeight").textContent=p.find(x=>x.weight)?.weight??"—";
 document.querySelector("#latestWaist").textContent=p.find(x=>x.waist)?.waist??"—";
 document.querySelector("#progressEntries").innerHTML=list(p.slice(0,12),x=>`<div><b>${esc(x.date)}</b><br><small>น้ำหนัก ${x.weight||"—"} กก. · รอบเอว ${x.waist||"—"} ซม.</small></div>`);
 document.querySelector("#sleepEntries").innerHTML=list(data.sleep.filter(x=>x.date===day),x=>`<div><b>${esc(x.start)} – ${esc(x.end)}</b><br><small>เวลาพักของวันนี้</small></div>`);
}
function list(arr,fn){return arr.length?arr.map(x=>`<div class="entry">${fn(x)}</div>`).join(""):'<div class="empty">ยังไม่มีบันทึก ลองเพิ่มรายการแรกกัน 💗</div>'}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab,.panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelector("#"+b.dataset.tab).classList.add("active");window.scrollTo({top:0,behavior:"smooth"})}));
document.querySelector("#foodForm").addEventListener("submit",e=>{e.preventDefault();data.food.push({name:foodName.value.trim(),price:foodPrice.value,meal:foodMeal.value,date:today()});e.target.reset();save();toast("เพิ่มบันทึกอาหารแล้ว 💗")});
document.querySelector("#sweetForm").addEventListener("submit",e=>{e.preventDefault();data.sweets.push({name:sweetName.value.trim(),amount:sweetAmount.value,date:today(),time:new Date().toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})});e.target.reset();save();toast("บันทึกแล้ว ไม่ต้องรู้สึกผิดนะ 🌷")});
document.querySelector("#saveWorkout").addEventListener("click",()=>{let n=workoutName.value.trim(),m=workoutMinutes.value;if(!n||!m){toast("ใส่กิจกรรมและระยะเวลาก่อนนะ");return}data.workouts.push({name:n,minutes:m,date:today(),time:new Date().toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})});workoutName.value="";workoutMinutes.value="";save();toast("บันทึกการออกกำลังแล้ว!")});
document.querySelector("#progressDate").value=today();
document.querySelector("#progressForm").addEventListener("submit",e=>{e.preventDefault();let w=weightInput.value,z=waistInput.value;if(!w&&!z){toast("กรอกน้ำหนักหรือรอบเอวอย่างน้อยหนึ่งค่า");return}data.progress.push({date:progressDate.value,weight:w,waist:z});e.target.reset();progressDate.value=today();save();toast("บันทึกความคืบหน้าแล้ว ✨")});
document.querySelector("#sleepForm").addEventListener("submit",e=>{e.preventDefault();data.sleep.push({date:today(),start:sleepStart.value,end:sleepEnd.value});save();toast("บันทึกเวลานอนแล้ว 🌙")});
document.querySelectorAll("[data-quick]").forEach(b=>b.addEventListener("click",()=>{const map={water:"ดื่มน้ำ",sweet:"ของหวาน",sleep:"การนอน",weight:"ความคืบหน้า"};const target=b.dataset.quick;document.querySelector(`[data-tab="${target==="weight"?"progress":target==="water"?"home":target==="sleep"?"progress":"food"}"]`).click();if(target==="sweet")document.querySelector("#sweetName").focus();else if(target==="weight")document.querySelector("#weightInput").focus();else if(target==="sleep")document.querySelector("#sleepStart").focus();else toast("เยี่ยมเลย อย่าลืมดื่มน้ำระหว่างวัน 💧")}));
document.querySelector("#exportData").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="my-fit-journey-backup.json";a.click();URL.revokeObjectURL(url);toast("ดาวน์โหลดข้อมูลสำรองแล้ว")});
document.querySelector("#clearData").addEventListener("click",()=>{if(confirm("ต้องการลบข้อมูลทั้งหมดใน My Fit Journey บนอุปกรณ์นี้ใช่ไหม? แนะนำดาวน์โหลดข้อมูลสำรองก่อน")){data={...defaults};save();toast("ล้างข้อมูลแล้ว")}});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();