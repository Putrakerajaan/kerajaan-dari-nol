// Dadu ras d10 (orisinal). Hasil asli SELALU dari data.json (diundi admin.py); animasi hanya menampilkan.
function diceHTML(){return`<div class="card dadu"><h3>🎲 Ras adalah kehendak dewa</h3>
 <p class="mut">Ras tiap warga ditetapkan dadu 10 sisi saat bergabung dan tidak bisa diulang. Cari kode atau namamu di atas, lalu putar dadu untuk melihatnya.</p>
 <canvas id="d10" class="d10"></canvas><div id="dres" class="dres">&nbsp;</div>
 <button id="droll" class="btn">Putar dadu untuk mendapatkan ras</button>
 <button id="dsim" class="btn ghost">🎲 Coba putar (simulasi, bukan hasil asli)</button></div>`}
let diceBusy=false,diceWarga=null,dState={face:0,t:1,seed:1,glow:null,start:0};
function dDraw(){document.querySelectorAll("canvas.d10").forEach(dDraw1);requestAnimationFrame(dDraw)}
function dDraw1(c){if(!c.clientWidth)return;const d=devicePixelRatio||1,W=c.clientWidth,H=c.clientHeight;if(c.width!=W*d){c.width=W*d;c.height=H*d}
 const x=c.getContext("2d");x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,H);
 const t=dState.start?(performance.now()-dState.start)/2500:1;dState.t=Math.min(1,t);
 let R=D10.rotAt(dState.face,dState.t,dState.seed);if(dState.t>=1){const b=Math.sin(performance.now()/900)*.05;R=D10.mm(D10.axisAngle([0,1,0],b),R)}
 const hop=dState.t<1?Math.abs(Math.sin(dState.t*Math.PI*3))*(1-dState.t)*26:0;
 D10.draw(x,W/2,H/2-6-hop,Math.min(W,H)*.36,R,{glow:dState.t>=1?dState.glow:null,base:[d,0,0,d,0,0]})}
function rollFace(n,sim){if(diceBusy)return;diceBusy=true;const r=$("dres");r.className="dres";r.innerHTML="Dadu berputar…";
 const ras=D10.FACES[n-1],tier=D10.TIER[D10.count(ras)];dState={face:n-1,seed:Math.random()*10,start:performance.now(),glow:null,t:0};
 setTimeout(()=>{dState.glow=D10.GLOW[tier];r.className="dres show t-"+tier;
  r.innerHTML=`${sim?"<i>Simulasi:</i> ":""}<img class="ico" src="icons/ras_${ras.toLowerCase()}.png" alt=""> <b>${ras}</b> · ${tier} (${D10.count(ras)*10}%) · sisi ${n}${sim?"":"<br><span class='mut'>Hasil tetap, tercatat di KTP</span>"}`;diceBusy=false},2550)}
function initDice(){$("ktp").insertAdjacentHTML("beforeend",diceHTML());dState.face=4;requestAnimationFrame(dDraw);
 $("droll").onclick=()=>{if(!diceWarga){$("dres").className="dres show";$("dres").textContent="Cari kode KTP atau namamu dulu (cth KDN-0001).";return}
  rollFace(diceWarga.dadu_sisi||D10.FACES.indexOf(diceWarga.ras)+1,false)};
 $("dsim").onclick=()=>rollFace(1+Math.floor(Math.random()*10),true);
 $("q").addEventListener("input",e=>{const nq=e.target.value.trim().toLowerCase().split(/\s+/).join(" ");diceWarga=D.warga_list.find(w=>w.kode.toLowerCase()==nq||w.nama.toLowerCase().split(/\s+/).join(" ")==nq)||null;
  $("droll").textContent=diceWarga?`Putar dadu untuk mendapatkan ras · ${diceWarga.nama}`:"Putar dadu untuk mendapatkan ras"})}
