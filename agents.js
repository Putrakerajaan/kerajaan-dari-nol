// AI jalan-jalan warga v2 (orisinal): jalur menerus, percepatan/perlambatan halus, napas saat diam.
// Sprite manusia dasar + varian rambut/kulit + overlay pekerjaan (berlapis)
const SPR={meta:null,R:{}};const ldImg=src=>{const i=new Image();i.src="sprites/"+src;return i};
fetch("sprites/ras_sprites.json").then(r=>r.json()).then(m=>{for(const[ras,G]of Object.entries(m.races))for(const[g,o]of Object.entries(G)){const e=SPR.R[ras+"_"+g]={img:{},ov:{}};
 for(const[k,v]of Object.entries(o.variants))e.img[k]=ldImg(v);for(const[k,v]of Object.entries(o.overlays))e.ov[k]=ldImg(v)}SPR.meta=m});
// UJI pixel-art: buka dengan ?pixel=1 → Manusia memakai sprite pixel (nearest-neighbor)
const PIX={on:new URLSearchParams(location.search).has("pixel"),meta:null,img:{}};
if(PIX.on)fetch("sprites/pixel/manusia.json").then(r=>r.json()).then(m=>{for(const[g,f]of Object.entries(m.images))PIX.img[g]=ldImg(f);PIX.meta=m});
// warga demo sementara (hanya kode, tidak dihitung sebagai warga) untuk uji sprite tiap ras
const DEMO=[{nama:"Pak Tani (demo)",ras:"Manusia",gender:"Laki-laki",job:"Petani",varian:"v2"},{nama:"Sari (demo)",ras:"Manusia",gender:"Perempuan"},
 {nama:"Brakka (demo)",ras:"Orc",gender:"Laki-laki",job:"Petani"},{nama:"Urga (demo)",ras:"Orc",gender:"Perempuan"},{nama:"Nix (demo)",ras:"Goblin",gender:"Perempuan"},
 {nama:"Rhea (demo)",ras:"Beastfolk",gender:"Perempuan",job:"Petani"},{nama:"Durn (demo)",ras:"Kurcaci",gender:"Laki-laki"},{nama:"Hilde (demo)",ras:"Kurcaci",gender:"Perempuan",job:"Petani"},
 {nama:"Lysa (demo)",ras:"Elf",gender:"Perempuan",job:"Petani"},{nama:"Aerin (demo)",ras:"Elf",gender:"Laki-laki"}];
const hashStr=s=>[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
window.AGENTS=[];
const DIRV={SE:[1,0],SW:[0,1],NW:[-1,0],NE:[0,-1]};
const VMAX=0.42,ACC=0.3;// petak 2x lebih besar: kecepatan di layar tetap pelan// ubin/detik, jarak (ubin) untuk mulai/berhenti halus
function walkable(c,r){if(c<0||r<0||c>=N||r>=N||locked(c,r))return false;const t=terrain(c,r);if(t=="air"||t=="pohon"||t=="batu")return false;
 return !D.bangunan.some(b=>{const p=parseTile(b.tile);return p.c==c&&p.r==r})}
function path(a,b){const key=(c,r)=>c+","+r,prev={},q=[[a.c,a.r]];prev[key(a.c,a.r)]=null;
 while(q.length){const[c,r]=q.shift();if(c==b.c&&r==b.r)break;
  for(const[dc,dr]of Object.values(DIRV)){const n=[c+dc,r+dr],k=key(...n);if(k in prev||!walkable(...n))continue;prev[k]=[c,r];q.push(n)}}
 if(!(key(b.c,b.r)in prev))return null;const out=[];let cur=[b.c,b.r];while(cur){out.unshift(cur);cur=prev[key(...cur)]}return out}
// Peta per pengunjung: Putra (Kepala Desa) + karakter sendiri (localStorage kdn_user) + maks 10 warga lain acak, diacak ulang tiap kunjungan
const MAX_LAIN=9;// Putra selalu tampil + 9 warga acak (tidak termasuk Putra & diri sendiri)
function spawnAgents(){const me=(localStorage.getItem("kdn_user")||"").toLowerCase(),toA=w=>({w,gelarLabel:labelGelar(w),nama:w.nama,star:w.nama=="Putra",me:!!(me&&w.username==me),emas:w.emas||0,ras:w.ras,gender:w.gender,job:w.pekerjaan,varian:w.varian||(w.nama=="Putra"?"base":null)});
 const all=(D.warga_list||[]).filter(w=>w.ras).map(toA).concat(DEMO.map(x=>({...x,demo:true})));
 const keep=all.filter(a=>a.star||a.me),lain=all.filter(a=>!a.star&&!a.me);if(!keep.some(a=>a.star))keep.unshift({nama:"Putra",star:true,ras:"Manusia",gender:"Laki-laki",job:"Tukang",varian:"base",w:(D.warga_list||[]).find(x=>x.nama=="Putra")||{kode:"KDN-0001",nama:"Putra",ras:"Manusia",pekerjaan:"Tukang"}});for(let i=lain.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[lain[i],lain[j]]=[lain[j],lain[i]]}
 const list=keep.concat(lain.slice(0,MAX_LAIN));const s=parseTile("F8");
 list.forEach(w=>{let c=s.c,r=s.r;outer:for(let rad=1;rad<8;rad++)for(let dc=-rad;dc<=rad;dc++)for(let dr=-rad;dr<=rad;dr++){const cc=s.c+dc,r2=s.r+dr;if(walkable(cc,r2)&&!AGENTS.some(o=>o.c==cc&&o.r==r2)){c=cc;r=r2;break outer}}
  AGENTS.push({...w,c,r,x:c,y:r,dir:"SE",pts:null,s:0,v:0,dist:0,wait:.5+Math.random()*2,breath:Math.random()*4})})}
function pickTarget(a){for(let k=0;k<30;k++){const c=a.c+Math.round((Math.random()-.5)*8),r=a.r+Math.round((Math.random()-.5)*8);
 if(walkable(c,r)&&(c!=a.c||r!=a.r)&&!occupied([c,r],a)){const p=path(a,{c,r});if(p&&p.length>1)return p}}return null}
function tileOf(b){if(b.pts){const i=Math.min(b.pts.length-1,Math.floor(b.s));return b.pts[i]}return[b.c,b.r]}
function nextOf(b){if(!b.pts)return null;const i=Math.min(b.pts.length-1,Math.floor(b.s)+1);return b.pts[i]}
function occupied(t,self){return AGENTS.some(b=>{if(b===self)return false;const p=tileOf(b),n=nextOf(b),g=b.pts&&b.pts[b.pts.length-1];return p[0]==t[0]&&p[1]==t[1]||n&&n[0]==t[0]&&n[1]==t[1]||g&&g[0]==t[0]&&g[1]==t[1]})}
const sstep=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
let lastT=performance.now();
function updateAgents(){const now=performance.now(),dt=Math.min(.05,(now-lastT)/1000);lastT=now;
 for(const a of AGENTS){
  if(!a.pts){a.breath+=dt;if((a.wait-=dt)>0)continue;a.pts=pickTarget(a);a.s=0;if(!a.pts){a.wait=1+Math.random()*2;continue}}
  const L=a.pts.length-1,remain=L-a.s;
  // hindari tabrakan: sebelum masuk segmen baru, cek petak tujuan tidak ditempati/direservasi warga lain
  const seg=Math.floor(a.s),nxt=a.pts[Math.min(L,seg+1)];
  if(a.s-seg<.02&&occupied(nxt,a)){a.v=0;a.s=seg;a.block=(a.block||0)+dt;if(a.block>1.2){a.block=0;const p=a.pts[seg];a.c=p[0];a.r=p[1];a.x=a.c;a.y=a.r;a.pts=null;a.wait=.4+Math.random()*1.2}continue}
  a.block=0;
  // kecepatan halus: naik di awal, turun menjelang tujuan (minimum kecil agar tetap sampai)
  const target=VMAX*Math.max(.18,Math.min(sstep(a.s/ACC+.15),sstep(remain/ACC)));a.v+=(target-a.v)*Math.min(1,dt*6);
  {const ns=Math.min(L,a.s+a.v*dt);if(Math.floor(ns)>seg&&Math.floor(ns)<L&&occupied(a.pts[Math.floor(ns)+1],a)){a.s=Math.floor(ns);a.v=0;continue}a.s=ns}a.dist+=a.v*dt;
  const i=Math.min(L-1,Math.floor(a.s)),f=a.s-i,p0=a.pts[i],p1=a.pts[i+1];
  // tikungan dibulatkan: campur sedikit dengan segmen berikutnya di ujung segmen
  let x=p0[0]+(p1[0]-p0[0])*f,y=p0[1]+(p1[1]-p0[1])*f;const p2=a.pts[i+2];
  if(p2&&f>.7){const u=(f-.7)/.3*.5;const nx=p1[0]+(p2[0]-p1[0])*(f-.7),ny=p1[1]+(p2[1]-p1[1])*(f-.7);x+=(nx-x)*u*.6;y+=(ny-y)*u*.6}
  a.x=x;a.y=y;const dc=p1[0]-p0[0],dr=p1[1]-p0[1];const nd=dc>0?"SE":dc<0?"NW":dr>0?"SW":"NE";
  if(nd!=a.dir&&f>.35||a.s<.05)a.dir=nd;a.c=Math.round(x);a.r=Math.round(y);
  if(a.s>=L){a.c=p1[0];a.r=p1[1];a.x=a.c;a.y=a.r;a.pts=null;a.v=0;a.wait=1.2+Math.random()*3.5}}}
function drawAgent(a,x,y){if(PIX.on&&PIX.meta&&a.ras=="Manusia"){const m=PIX.meta,im=PIX.img[a.gender=="Perempuan"?"p":"l"];if(!im||!im.complete)return;
  const moving=a.pts&&a.v>.12,col=moving?m.walk[Math.floor(a.dist*m.framesPerTile)%m.walk.length]:m.idle[Math.floor(a.breath*m.idleFps)%m.idle.length],s=m.draw/m.scale;
  cx.fillStyle="rgba(40,60,20,.16)";cx.beginPath();cx.ellipse(x,y,11,5,0,0,7);cx.fill();cx.imageSmoothingEnabled=false;
  cx.drawImage(im,col*m.frameW,m.rows[a.dir]*m.frameH,m.frameW,m.frameH,Math.round((x-m.anchor[0]*s)*cam.z)/cam.z,Math.round((y-m.anchor[1]*s)*cam.z)/cam.z,m.frameW*s,m.frameH*s);cx.imageSmoothingEnabled=true;return}
 const m=SPR.meta;if(!m)return;const g=a.gender=="Perempuan"?"p":"l",e=SPR.R[a.ras+"_"+g]||SPR.R["Manusia_"+g];if(!a.varian||!e.img[a.varian]){const ks=Object.keys(e.img);a.varian=ks[hashStr(a.nama)%ks.length]}
 const im=e.img[a.varian],ov=e.ov[a.job];if(!im||!im.complete)return;
 const moving=a.pts&&a.v>.12,col=moving?m.walk[Math.floor(a.dist*m.framesPerTile*TW/64)%m.walk.length]:m.idle[Math.floor(a.breath*m.idleFps)%m.idle.length];
 const s=m.draw*.88/m.scale,row=m.rows[a.dir];
 cx.fillStyle="rgba(40,60,20,.16)";cx.beginPath();cx.ellipse(x,y,8*m.draw,3.6*m.draw,0,0,7);cx.fill();
 cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality="high";
 const args=[col*m.frameW,row*m.frameH,m.frameW,m.frameH,x-m.anchor[0]*s,y-m.anchor[1]*s,m.frameW*s,m.frameH*s];cx.drawImage(im,...args);if(ov&&ov.complete)cx.drawImage(ov,...args)}

// Label peta: "Nama [Gelar]". Gelar = tangga bangsawan (Putra), gelar penalti, atau pekerjaan.
function labelGelar(w){if(!w)return"Warga";if(w.nama=="Putra")return gelarPutra();if(String(w.gelar_rahasia||"").split(",").includes("desertir"))return"Pensiunan Dini Barak";return w.pekerjaan||w.job||"Warga"}
function labelPeta(a){let n=a.nama,g=a.star?gelarPutra():(a.gelarLabel||a.job||"Warga");if(n.length>14)n=n.slice(0,13)+"…";const room=Math.max(4,24-n.length);if(g.length>room)g=g.slice(0,room-1)+"…";return n+" ["+g+"]"}
// ketuk karakter → KTP read-only (rank, kantong gold, gelar)
function agentAt(px,py){const W=cv.clientWidth,H=cv.clientHeight,d=devicePixelRatio,ox=W/2+cam.x/d,oy=H*.1+cam.y/d;let best=null,bd=1e9;
 for(const a of AGENTS){const[x,y]=P(a.x+.5,a.y+.5),sx=ox+x*cam.z,sy=oy+y*cam.z;const k=Math.max(.6,1/cam.z)*.9;
  const dd=Math.hypot(px-sx,py-(sy-15*cam.z)),dl=Math.abs(px-sx)<70*k&&Math.abs(py-(sy-58*cam.z))<12*k;const s=dl?0:dd;if((dl||dd<Math.max(22,30*cam.z))&&s<bd){bd=s;best=a}}return best}
function intipKTP(a){const w=a.w||{nama:a.nama,ras:a.ras,pekerjaan:a.job,gender:a.gender};const card=typeof ktpCard=="function"&&w.ras?ktpCard({kode:w.kode||"-",username:w.username||w.tiktok||"",gender:"-",...w}):`<b>${a.nama}</b>`;
 const o=document.createElement("div");o.className="ovl";o.innerHTML=`<div class="box ktpintip"><p class="mut">${a.me?"🪪 KTP kamu":"👀 Mengintip KTP warga"}</p>${card}<button class="btn">Tutup</button></div>`;
 document.body.appendChild(o);o.querySelector(".btn").onclick=()=>o.remove();o.onclick=e=>{if(e.target==o)o.remove()}}
const _tap0=tap;tap=function(e){const a=agentAt(e.offsetX,e.offsetY);if(a)return intipKTP(a);return _tap0(e)};
