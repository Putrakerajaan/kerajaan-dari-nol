// Kerajaan dari Nol – peta isometrik Canvas 2D (kode orisinal)
const N=64,ABC=[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"],COLS=Array.from({length:N},(_,i)=>i<26?ABC[i]:ABC[Math.floor(i/26)-1]+ABC[i%26]),TW=128,TH=64;let D,cv,cx,cam={x:0,y:0,z:Math.min(1,innerWidth/(N*TW+40))},sel=null;
const $=id=>document.getElementById(id);
const ICON={kayu:"🪵",batu:"🪨",ikan:"🐟",gandum:"🌾",emas:"🪙"};
function parseTile(t){const m=t.match(/^([A-Z]+)(\d+)$/);return{c:COLS.indexOf(m[1]),r:parseInt(m[2])-1}}
function iso(c,r){return{x:(c-r)*TW/2,y:(c+r)*TH/2}}
function terrain(c,r){if(c==7||c==8)return"air";const h=(c*7+r*13)%11;return h<3?"pohon":h==5?"batu":"rumput"}
function balance(){const p={kayu:0,batu:0,ikan:0,gandum:0,emas:0};for(const[j,n]of Object.entries(D.pekerjaan))for(const[k,v]of Object.entries(D.produksi[j]||{}))p[k]+=v*n;
 const makan=D.warga*D.makanPerWarga,food=p.ikan+p.gandum,stok=D.sumberdaya.ikan+D.sumberdaya.gandum,net=food-makan;
 return{p,makan,food,net,hari:net>=0?"∞ (surplus)":(stok/-net).toFixed(1)+" hari"}}
function draw(){const W=cv.width=cv.clientWidth*devicePixelRatio,H=cv.height=cv.clientHeight*devicePixelRatio;
 cx.setTransform(1,0,0,1,0,0);cx.fillStyle="#87b6d6";cx.fillRect(0,0,W,H);
 cx.setTransform(cam.z*devicePixelRatio,0,0,cam.z*devicePixelRatio,W/2+cam.x,H*0.12+cam.y);
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){const{x,y}=iso(c,r),t=terrain(c,r);
  cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+TW/2,y+TH/2);cx.lineTo(x,y+TH);cx.lineTo(x-TW/2,y+TH/2);cx.closePath();
  cx.fillStyle=t=="air"?((c+r)%2?"#3f8fd0":"#4a9ad8"):((c+r)%2?"#6fae4f":"#79b858");cx.fill();cx.strokeStyle="#0002";cx.stroke();
  if(t!="air"){cx.fillStyle="#4b7a33";cx.beginPath();cx.moveTo(x-TW/2,y+TH/2);cx.lineTo(x,y+TH);cx.lineTo(x,y+TH+6);cx.lineTo(x-TW/2,y+TH/2+6);cx.fill();cx.fillStyle="#3d6629";cx.beginPath();cx.moveTo(x+TW/2,y+TH/2);cx.lineTo(x,y+TH);cx.lineTo(x,y+TH+6);cx.lineTo(x+TW/2,y+TH/2+6);cx.fill()}
  if(sel&&sel.c==c&&sel.r==r){cx.strokeStyle="#ffd86b";cx.lineWidth=3;cx.stroke();cx.lineWidth=1}
  const b=D.bangunan.find(b=>{const p=parseTile(b.tile);return p.c==c&&p.r==r});
  if(b)drawB(b,x,y+TH/2);else if(t=="pohon")tree(x,y+TH/2);else if(t=="batu")rock(x,y+TH/2)}
 cx.fillStyle="#fff";cx.font="bold 11px sans-serif";for(let c=0;c<N;c++){const p=iso(c,-1);cx.fillText(COLS[c],p.x-4,p.y+TH)}for(let r=0;r<N;r++){const p=iso(-1,r);cx.fillText(r+1,p.x-6,p.y+TH)}}
function tree(x,y){cx.fillStyle="#6b4423";cx.fillRect(x-2,y-14,4,14);cx.fillStyle="#2f7d32";cx.beginPath();cx.moveTo(x,y-38);cx.lineTo(x+12,y-12);cx.lineTo(x-12,y-12);cx.fill()}
function rock(x,y){cx.fillStyle="#9a9a9a";cx.beginPath();cx.ellipse(x,y-4,10,6,0,0,7);cx.fill()}
function drawB(b,x,y){const a=b.status=="selesai"?1:.55;cx.globalAlpha=a;
 if(b.jenis=="tenda"){cx.fillStyle="#d8c08a";cx.beginPath();cx.moveTo(x,y-30);cx.lineTo(x+20,y+4);cx.lineTo(x-20,y+4);cx.fill();cx.fillStyle="#7a5a2a";cx.beginPath();cx.moveTo(x,y-30);cx.lineTo(x+5,y+4);cx.lineTo(x-5,y+4);cx.fill()}
 else if(b.jenis=="api"){cx.fillStyle="#6b4423";cx.fillRect(x-9,y-2,18,4);cx.fillStyle="#ff9a1f";cx.beginPath();cx.moveTo(x,y-16);cx.lineTo(x+6,y-2);cx.lineTo(x-6,y-2);cx.fill()}
 else if(b.jenis=="panji"){cx.fillStyle="#555";cx.fillRect(x-1,y-44,3,44);cx.fillStyle="#b3261e";cx.fillRect(x+2,y-44,22,14);cx.fillStyle="#ffd86b";cx.fillText("♛",x+8,y-33)}
 else{cx.fillStyle="#a0522d";cx.fillRect(x-16,y-20,32,20);cx.fillStyle="#7b2d12";cx.beginPath();cx.moveTo(x-20,y-20);cx.lineTo(x,y-36);cx.lineTo(x+20,y-20);cx.fill()}
 cx.globalAlpha=1;if(b.status!="selesai"){cx.fillStyle="#000a";cx.fillRect(x-16,y+6,32,5);cx.fillStyle="#ffd86b";cx.fillRect(x-16,y+6,32*b.progres/100,5)}}
function pick(px,py){const W=cv.width,H=cv.height,d=devicePixelRatio;const x=(px*d-W/2-cam.x)/(cam.z*d),y=(py*d-H*0.12-cam.y)/(cam.z*d)-TH/2;
 const c=Math.round((x/(TW/2)+y/(TH/2))/2),r=Math.round((y/(TH/2)-x/(TW/2))/2);return c>=0&&r>=0&&c<N&&r<N?{c,r}:null}
function tap(e){const p=pick(e.offsetX,e.offsetY);if(!p)return;sel=p;const t=COLS[p.c]+(p.r+1),b=D.bangunan.find(b=>b.tile==t);
 const ter={air:"Sungai (banyak ikan)",pohon:"Hutan (kayu)",batu:"Batu",rumput:"Lahan kosong",rumpun:"Padang rumput",bunga:"Bunga liar",bibit:"Semak",jembatan:"Jembatan kayu"}[terrain(p.c,p.r)]||"Lahan",sisi=locked(p.c,p.r)?"Wilayah terkunci":p.c<7?"Tepi barat sungai":p.c>8?"Seberang sungai":"Sungai";
 $("tip").innerHTML=b&&b.jenis=="papan"?papanInfo(t):b?`<b>${t} · ${b.nama}</b><br>${{pos:"Pos jaga & kantor Kepala Desa Putra (½ petak).",api:"Api unggun tempat warga berkumpul (½ petak)."}[b.jenis]||""}${b.jenis=="pos"||b.jenis=="api"?"<br>":""}Status: ${b.status} (${b.progres}%) · Day ${b.day}<br>Usulan: ${b.usulan}`:`<b>Petak ${t}</b><br>${ter} · ${sisi}`;draw()}
function ui(){$("gelar").textContent=gelarPutra();$("warga").textContent=D.warga.toLocaleString("id");$("upd").textContent=D.diperbarui;const B=balance();
 $("res").innerHTML=`<h3>Sumber Daya & Kas Desa Viralis</h3><div class="grid">${Object.entries(D.sumberdaya).map(([k,v])=>`<div class="it">${ICON[k]} ${k}<b>${v}</b><span class="plus">+${B.p[k]}/hari</span></div>`).join("")}<div class="it">💰 Kas<b>${D.kas}</b>emas</div></div>
 <h3 style="margin-top:12px">Makanan Warga</h3><div class="grid"><div class="it">Kebutuhan<b>${B.makan}/hari</b>${D.makanPerWarga} per warga</div><div class="it">Produksi pangan<b>${B.food}/hari</b>ikan+gandum</div><div class="it">Neraca<b class="${B.net>=0?"plus":"min"}">${B.net>=0?"+":""}${B.net}</b>${B.net>=0?"Surplus":"Defisit"}</div><div class="it">Stok cukup<b>${B.hari}</b></div></div>`;
 const tot=D.vote.opsi.reduce((a,o)=>a+o.like,0)||1;$("vote").innerHTML=`<h3>🗳️ Voting Bangunan Berikutnya</h3><p class="mut">${D.vote.judul}</p>`+D.vote.opsi.map(o=>`<div>${o.nama} — ${o.like} like<div class="bar"><i style="width:${o.like/tot*100}%"></i></div></div>`).join("");
 $("pop").innerHTML=gelarHTML()+regionHTML()+gachaHTML()+`<h3>Penduduk</h3><div class="grid">${Object.entries(D.ras).map(([k,v])=>`<div class="it">${k}<b>${v}</b></div>`).join("")}</div><h3 style="margin-top:10px">Pekerjaan</h3><div class="grid">${Object.entries(D.pekerjaan).map(([k,v])=>{const q=(D.kuota||{})[k];return`<div class="it">${k}<b class="${q&&v>=q?"min":""}">${v}${q?"/"+q:""}</b>${q&&v>=q?"Penuh":""}</div>`}).join("")}</div>`;
 $("berita").innerHTML="<h3>📜 Berita Desa Viralis</h3><ul>"+D.berita.map(b=>`<li>${b}</li>`).join("")+"</ul>";
 $("bang").innerHTML="<h3>🏗️ Bangunan</h3>"+D.bangunan.map(b=>`<div>${b.tile} · ${b.nama} — ${b.status} ${b.progres}%<div class="bar"><i style="width:${b.progres}%"></i></div></div>`).join("");
 $("riw").innerHTML=D.riwayat.map(r=>`<li><b>Day ${r.day}</b> — ${r.teks}</li>`).join("");
 $("q").oninput=e=>{const q=e.target.value.trim().toLowerCase();const f=q?D.warga_list.filter(w=>w.kode.toLowerCase()==q||w.nama.toLowerCase().includes(q)).slice(0,20):[];
  $("ktpout").innerHTML=f.map(w=>`<div class="card"><h3>KTP Desa Viralis · ${w.kode}</h3>Nama: <b>${w.nama}</b> 🔒<br>${w.tiktok?"TikTok: @"+w.tiktok+"<br>":""}Ras: <img class="ico" src="icons/ras_${w.ras.toLowerCase()}.png" alt=""> <b>${w.ras}</b>${rasTier(w.ras)} · terkunci<br>Gender: ${w.gender||"-"}<br>Pekerjaan: ${w.pekerjaan}<br>Warga sejak Day ${w.day}${w.catatan?"<br>"+w.catatan:""}${w.petualang?"<br>Petualang rank <b>"+(w.rank||"F")+"</b>":""}${w.petualang||w.emas?`<div class="pouch">👝 Kantong gold: <b>${(w.emas||0).toLocaleString("id")}</b> 🪙</div>`:""}${typeof gelarChips=="function"?gelarChips(w.gelar_rahasia):""}</div>`).join("")||(q?"Tidak ditemukan":"")}}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".on").forEach(x=>x.classList.remove("on"));b.classList.add("on");$(b.dataset.t).classList.add("on");if(b.dataset.t=="peta")draw()});
fetch("data.json?"+Date.now()).then(r=>r.json()).then(d=>{D=d;cv=$("map");cx=cv.getContext("2d");ui();draw();const h=location.hash.slice(1);if(h)document.querySelector(`[data-t=${h}]`)?.click();
 initControls();initDice();window.KDN_READY=1;if(typeof initDaftar=="function")initDaftar()});

function guildAda(){return D.bangunan.some(b=>b.jenis=="guild"&&b.status=="selesai")}
function regionHTML(){const L=D.level_kerajaan||1,g=guildAda();return`<h3>🗺️ Wilayah</h3><p class="mut">Level Desa: <b>${L}</b> · Adventurer Guild: <b>${g?"ada":"belum ada"}</b></p>`+
 (D.regions||[]).map(x=>{const s=x.syarat;return`<div class="it" style="margin:4px 0">${x.status=="unlocked"?"🔓":"🔒"} <b>${x.nama}</b> — ${x.status=="unlocked"?"Terbuka":`Syarat: Level ≥ ${s.level_min} ${L>=s.level_min?"✅":"❌"}${s.butuh_guild?` · Adventurer Guild ${g?"✅":"❌"}`:""}`}</div>`}).join("")}

function gachaList(){const G=Object.entries(D.gacha_ras||{}).filter(([k])=>k[0]!="_"),T=G.reduce((s,[,v])=>s+v.bobot,0)||1;return G.map(([k,v])=>({k,tier:v.tier,p:v.bobot/T*100}))}
function rasTier(r){const g=gachaList().find(x=>x.k==r);return g?` (${g.tier})`:""}
function gachaHTML(){const L=gachaList(),gc={};(D.warga_list||[]).forEach(w=>gc[w.gender]=(gc[w.gender]||0)+1);
 return`<h3>🎲 Gacha Ras</h3><p class="mut">Ras diundi dadu 10 sisi (tiap sisi 10%); gender dipilih warga.</p><div class="grid">${L.map(x=>`<div class="it"><img class="ico" src="icons/ras_${x.k.toLowerCase()}.png" alt=""> ${x.k}<b>${x.p.toFixed(0)}%</b>${x.tier}</div>`).join("")}</div>
 <h3 style="margin-top:10px">Gender</h3><div class="grid">${(D.gender_pilihan||["Laki-laki","Perempuan"]).map(g=>`<div class="it">${g}<b>${gc[g]||0}</b></div>`).join("")}</div>`}

function gelarPutra(){const L=D&&D.level_kerajaan||1,G=(D&&D.gelar)||[];let g="Kepala Desa";G.forEach(x=>{if(L>=x.level_min)g=x.gelar});return g}
function gelarHTML(){const L=D.level_kerajaan||1,g=gelarPutra();return`<h3>🎖️ Gelar Putra</h3><p class="mut">Putra bukan raja, ia memimpin desa. Gelarnya naik bersama level kerajaan.</p><p>Sekarang: <b>${g}</b> (Level ${L})</p><div class="grid">${(D.gelar||[]).map(x=>`<div class="it" style="${x.gelar==g?"outline:2px solid #d4a72c":""}">Lv ${x.level_min}<b style="font-size:14px">${x.gelar}</b></div>`).join("")}</div>`}

function papanInfo(t){const n=jumlahWarga(),L=(D.warga_list||[]).filter(w=>w.ras),cnt=k=>{const o={};L.forEach(w=>o[w[k]]=(o[w[k]]||0)+1);return Object.entries(o).map(([a,b])=>a+" "+b).join(" · ")};
 return`<b>${t} · Papan Jumlah Warga</b><br>Total <b>${n}</b> warga (Putra + ${n-1} terdaftar)<br><span class="mut">Ras: ${cnt("ras")}<br>Pekerjaan: ${cnt("pekerjaan")}</span>`}