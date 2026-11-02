// Render v2 – gaya pastel halus (kode orisinal). Menimpa terrain()/draw() dari app.js.
const R=(c,r,s=0)=>{let h=Math.sin(c*127.1+r*311.7+s*74.7)*43758.5453;return h-Math.floor(h)};
const RIV=c=>c==7||c==8;
function regionOf(c,r){return(D&&D.regions||[]).find(x=>c>=x.c[0]&&c<=x.c[1]&&r>=x.r[0]&&r<=x.r[1])}
function locked(c,r){const g=regionOf(c,r);return !g||g.status!="unlocked"}
function terrain(c,r){if(RIV(c))return"air";const edge=Math.min(c,r,N-1-c,N-1-r),seam=Math.min(Math.abs(c-15.5),Math.abs(r-15.5))<1&&!(Math.abs(c-15.5)<1&&r>15)&&R(c,r,8)<.55;
 if(D&&D.bangunan.some(b=>{const p=parseTile(b.tile);return Math.abs(p.c-c)<=1&&Math.abs(p.r-r)<=1}))return"rumput";
 if(edge==0&&R(c,r)<.85||edge==1&&R(c,r)<.45||seam||(c>15||r>15)&&R(c,r,6)<.16)return"pohon";if(R(c,r,2)<.07)return"batu";if(R(c,r,3)<.12)return"bibit";return"rumput"}
const wob=(r,s)=>Math.sin(r*1.3+s)*.18+Math.sin(r*2.7+s*2)*.08;
let T0=performance.now();
function P(c,r){const p=iso(c,r);return[p.x,p.y]}
function poly(pts){cx.beginPath();pts.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.closePath()}
function draw(){if(!cv)return;const d=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;
 if(cv.width!=W*d||cv.height!=H*d){cv.width=W*d;cv.height=H*d}
 if(!cam.init){cam.init=1;const o=(D.regions||[]).filter(x=>x.status=="unlocked");let c0=0,c1=16,r0=0,r1=16;if(o.length){c0=Math.min(...o.map(x=>x.c[0]));c1=Math.max(...o.map(x=>x.c[1]))+1;r0=Math.min(...o.map(x=>x.r[0]));r1=Math.max(...o.map(x=>x.r[1]))+1}
  const xs=[P(c0,r1)[0],P(c1,r0)[0]],ys=[P(c0,r0)[1],P(c1,r1)[1]];cam.z=Math.min(W/(xs[1]-xs[0]),(H-90)/(ys[1]-ys[0]))*1.08;let mx=(xs[0]+xs[1])/2,my=(ys[0]+ys[1])/2;
  if(W<700||H>W){cam.z=W<420?1.05:1.2;const g=parseTile("G8");[mx,my]=P(g.c,g.r+.5)}cam.x=-mx*cam.z*d;cam.y=(H*.4-H*.1-my*cam.z)*d}
 const t=(performance.now()-T0)/1000;cx.setTransform(d,0,0,d,0,0);cx.imageSmoothingEnabled=true;
 const sky=cx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#e9e3c4");sky.addColorStop(1,"#d6e2b0");cx.fillStyle=sky;cx.fillRect(0,0,W,H);
 cx.setTransform(d*cam.z,0,0,d*cam.z,d*(W/2+cam.x/d),d*(H*.1+cam.y/d));
 // slab bawah peta
 const C=[P(0,0),P(N,0),P(N,N),P(0,N)];cx.fillStyle="#8a7a55";poly([C[1],C[2],C[3],[C[3][0],C[3][1]+10],[C[2][0],C[2][1]+10],[C[1][0],C[1][1]+10]]);cx.fill();
 cx.fillStyle="#a8925f";poly([C[2],C[3],[C[3][0],C[3][1]+10],[C[2][0],C[2][1]+10]]);cx.fill();
 // ubin rumput kotak-kotak
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){if(RIV(c))continue;const k=(c+r)%2,v=(R(c,r,5)-.5)*10;
  cx.fillStyle=`hsl(${84+v*.6},${k?42:48}%,${(k?70:66)+v*.4}%)`;poly([P(c,r),P(c+1,r),P(c+1,r+1),P(c,r+1)]);cx.fill();
  cx.strokeStyle="rgba(255,255,240,.12)";cx.lineWidth=.6;cx.stroke();
  for(let i=0;i<3;i++){const[x,y]=P(c+R(c,r,i+7),r+R(c,r,i+9));cx.fillStyle="rgba(90,130,60,.25)";cx.fillRect(x,y,1.5,1.5)}}
 // sungai berkelok: pasir, dangkal, dalam
 const band=(a,b)=>{const L=[],Rr=[];for(let r=0;r<=N;r+=.25){L.push(P(7+a+wob(r,0)*b,r));Rr.unshift(P(9-a+wob(r,3)*b,r))}poly(L.concat(Rr))};
 cx.fillStyle="#e8d9a6";band(-.12,1);cx.fill();cx.fillStyle="#9fd3ec";band(.06,1);cx.fill();
 const g=cx.createLinearGradient(...P(7,8),...P(9,8));g.addColorStop(0,"#6fb6e2");g.addColorStop(.5,"#4f9ad6");g.addColorStop(1,"#6fb6e2");cx.fillStyle=g;band(.3,1);cx.fill();
 cx.strokeStyle="rgba(255,255,255,.55)";cx.lineWidth=1.2;cx.lineCap="round";
 for(let i=0;i<52;i++){const rr=((i*.63+t*.35)%N),cc=7.5+R(i,1)*1.1,[x,y]=P(cc,rr),a=.5+.5*Math.sin(t*2+i);cx.globalAlpha=a*.8;cx.beginPath();cx.moveTo(x-5,y);cx.quadraticCurveTo(x,y-2,x+5,y);cx.stroke()}cx.globalAlpha=1;
 // sorot ubin terpilih
 if(sel){cx.strokeStyle="#fff6c8";cx.lineWidth=2;poly([P(sel.c,sel.r),P(sel.c+1,sel.r),P(sel.c+1,sel.r+1),P(sel.c,sel.r+1)]);cx.stroke()}
 // objek diurutkan menurut kedalaman
 const obj=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){const tt=terrain(c,r);if(tt=="pohon"){const n=2+Math.floor(R(c,r,4)*2);for(let i=0;i<n;i++)obj.push({c:c+.25+R(c,r,i)*.5,r:r+.25+R(c,r,i+3)*.5,f:"pohon",s:.8+R(c,r,i+5)*.5})}
  else if(tt=="batu")obj.push({c:c+.5,r:r+.5,f:"batu"});else if(tt=="bibit")obj.push({c:c+.3+R(c,r)*.4,r:r+.5,f:"bibit"})}
 D.bangunan.forEach(b=>{const p=parseTile(b.tile);obj.push({c:p.c+.5,r:p.r+.5,f:b.jenis,b})});
 if(!AGENTS.length&&typeof spawnAgents=="function")spawnAgents();updateAgents();AGENTS.forEach(a=>obj.push({c:a.x+.5,r:a.y+.5,f:"agen",a}));
 obj.sort((a,b)=>(a.c+a.r)-(b.c+b.r));
 for(const o of obj){const[x,y]=P(o.c,o.r);if(o.f!="agen")shadow(x,y,o.f=="pohon"?9*o.s:o.f=="batu"?7:o.f=="bibit"?4:14);
  ({pohon:()=>pine(x,y,o.s),batu:()=>stone(x,y),bibit:()=>sapling(x,y),tenda:()=>tent(x,y),api:()=>fire(x,y,t),panji:()=>banner(x,y,t),putra:()=>putra(x,y,t),agen:()=>drawAgent(o.a,x,y)}[o.f]||(()=>house(x,y)))();
  if(o.b&&o.b.status!="selesai"){cx.fillStyle="rgba(0,0,0,.35)";rr(x-14,y+6,28,4,2);cx.fill();cx.fillStyle="#f2c14e";rr(x-14,y+6,28*o.b.progres/100,4,2);cx.fill()}}
 // label pil
 AGENTS.forEach(a=>{if(!a.star&&cam.z<1.9)return;const[px,py]=P(a.x+.5,a.y+.5);pill(px,py-60,(a.star?"★ ":"")+a.nama,!!a.star)});
 // kabut wilayah terkunci
 fog(t);
 // pencahayaan sore + vinyet (ruang layar)
 cx.setTransform(d,0,0,d,0,0);const vg=cx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,"rgba(255,240,200,0)");vg.addColorStop(1,"rgba(80,60,30,.22)");cx.fillStyle=vg;cx.fillRect(0,0,W,H);
 cx.fillStyle="rgba(255,200,120,.05)";cx.fillRect(0,0,W,H);fogLabels(W,H,d)}
function rr(x,y,w,h,r){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):cx.rect(x,y,w,h)}
function shadow(x,y,w){cx.fillStyle="rgba(40,60,20,.22)";cx.beginPath();cx.ellipse(x+2,y+1,w,w*.45,0,0,7);cx.fill()}
function pine(x,y,s){cx.fillStyle="#7a5534";cx.fillRect(x-1.2*s,y-6*s,2.4*s,6*s);
 const L=[["#2f6b3a",0],["#3d7f44",1],["#4f9450",2]];L.forEach(([col,i])=>{const w=(9-i*2)*s,top=y-(12+i*7)*s,bot=y-(4+i*6)*s;
  const gr=cx.createLinearGradient(x-w,0,x+w,0);gr.addColorStop(0,col);gr.addColorStop(1,"#245a2f");cx.fillStyle=gr;
  cx.beginPath();cx.moveTo(x,top-6*s);cx.quadraticCurveTo(x+w*.4,top,x+w,bot);cx.quadraticCurveTo(x,bot+3*s,x-w,bot);cx.quadraticCurveTo(x-w*.4,top,x,top-6*s);cx.fill()});
 cx.fillStyle="rgba(255,255,220,.18)";cx.beginPath();cx.ellipse(x-2*s,y-24*s,2*s,4*s,-.4,0,7);cx.fill()}
function sapling(x,y){cx.strokeStyle="#8a6a3a";cx.lineWidth=1.2;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x,y-8);cx.stroke();cx.fillStyle="#5f9a48";[-1,1].forEach(k=>{cx.beginPath();cx.ellipse(x+k*3,y-9,3.5,1.6,k*.5,0,7);cx.fill()});cx.beginPath();cx.ellipse(x,y-11,1.6,3,0,0,7);cx.fill()}
function stone(x,y){const g=cx.createLinearGradient(x-8,y-8,x+8,y);g.addColorStop(0,"#d4d2c8");g.addColorStop(1,"#8f8c82");cx.fillStyle=g;cx.beginPath();cx.moveTo(x-8,y);cx.quadraticCurveTo(x-7,y-8,x-1,y-8);cx.quadraticCurveTo(x+7,y-7,x+8,y);cx.quadraticCurveTo(x,y+3,x-8,y);cx.fill();cx.fillStyle="#bdbab0";cx.beginPath();cx.ellipse(x+6,y,3,2,0,0,7);cx.fill()}
function tent(x,y){const A=[x,y-30],L=[x-20,y+2],F=[x+4,y+9],Rt=[x+22,y-2];
 cx.fillStyle="#c9a96a";poly([A,Rt,F]);cx.fill();const g=cx.createLinearGradient(L[0],0,F[0],0);g.addColorStop(0,"#f1dfae");g.addColorStop(1,"#dcc08a");cx.fillStyle=g;poly([A,L,F]);cx.fill();
 cx.fillStyle="#5b4128";poly([A,[x-6,y+5],[x+1,y+7]]);cx.fill();cx.strokeStyle="#8a6a3a";cx.lineWidth=1.4;cx.beginPath();cx.moveTo(...A);cx.lineTo(x,y-35);cx.stroke();
 cx.strokeStyle="rgba(120,90,50,.6)";cx.lineWidth=.8;cx.beginPath();cx.moveTo(...Rt);cx.lineTo(x+28,y+4);cx.moveTo(...L);cx.lineTo(x-26,y+6);cx.stroke()}
function fire(x,y,t){cx.fillStyle="#9a9488";for(let i=0;i<7;i++){const a=i/7*6.28;cx.beginPath();cx.ellipse(x+Math.cos(a)*7,y+Math.sin(a)*3.5,2.2,1.5,0,0,7);cx.fill()}
 cx.strokeStyle="#6b4423";cx.lineWidth=2.5;cx.beginPath();cx.moveTo(x-5,y+1);cx.lineTo(x+5,y-2);cx.moveTo(x-5,y-2);cx.lineTo(x+5,y+1);cx.stroke();
 const f=1+Math.sin(t*13)*.12+Math.sin(t*7.3)*.08,gl=cx.createRadialGradient(x,y-4,1,x,y-4,22);gl.addColorStop(0,"rgba(255,190,90,.45)");gl.addColorStop(1,"rgba(255,190,90,0)");cx.fillStyle=gl;cx.beginPath();cx.arc(x,y-4,22,0,7);cx.fill();
 [["#ff8a1f",6,15],["#ffd34d",3.5,9]].forEach(([c,w,h])=>{h*=f;cx.fillStyle=c;cx.beginPath();cx.moveTo(x,y-h-2);cx.quadraticCurveTo(x+w,y-h*.4,x+w*.6,y);cx.lineTo(x-w*.6,y);cx.quadraticCurveTo(x-w,y-h*.4,x,y-h-2);cx.fill()})}
function banner(x,y,t){cx.fillStyle="#6b5a45";cx.fillRect(x-1.2,y-46,2.4,46);cx.fillStyle="#e6c25a";cx.beginPath();cx.arc(x,y-47,2.2,0,7);cx.fill();
 cx.beginPath();cx.moveTo(x+1,y-44);for(let i=0;i<=10;i++){const u=i/10;cx.lineTo(x+1+u*24,y-44+Math.sin(t*3+u*5)*2*u)}for(let i=10;i>=0;i--){const u=i/10;cx.lineTo(x+1+u*24,y-30+Math.sin(t*3+u*5)*2*u)}cx.closePath();
 const g=cx.createLinearGradient(x,0,x+25,0);g.addColorStop(0,"#b8322a");g.addColorStop(1,"#e0574a");cx.fillStyle=g;cx.fill();cx.fillStyle="#ffd86b";cx.font="9px sans-serif";cx.fillText("♛",x+8,y-34+Math.sin(t*3+2)*.8)}
function house(x,y){cx.fillStyle="#efe0c0";poly([[x-14,y-4],[x,y+3],[x,y-11],[x-14,y-18]]);cx.fill();cx.fillStyle="#d8c49c";poly([[x,y+3],[x+14,y-4],[x+14,y-18],[x,y-11]]);cx.fill();
 cx.fillStyle="#d9733f";poly([[x-16,y-17],[x,y-9],[x,y-30]]);cx.fill();cx.fillStyle="#b85a2e";poly([[x,y-9],[x+16,y-17],[x,y-30]]);cx.fill()}
function putra(x,y,t){const b=Math.sin(t*3)*.8;cx.fillStyle="#3f5f9a";cx.fillRect(x-2.5,y-6,2,6);cx.fillRect(x+.5,y-6,2,6);
 cx.fillStyle="#e2a33b";rr(x-3.5,y-14+b,7,9,2.5);cx.fill();cx.fillStyle="#a8714a";cx.beginPath();cx.arc(x,y-17+b,3.4,0,7);cx.fill();cx.fillStyle="#1f1a17";cx.beginPath();cx.arc(x,y-18.2+b,3.5,Math.PI,0);cx.fill()}
function pill(x,y,txt,star){cx.font="600 10px system-ui,sans-serif";const w=cx.measureText(txt).width+12;cx.fillStyle="rgba(0,0,0,.18)";rr(x-w/2+1,y-8,w,16,8);cx.fill();
 cx.fillStyle=star?"#f6d27a":"#fbf4e2";rr(x-w/2,y-9,w,16,8);cx.fill();cx.strokeStyle="rgba(90,70,30,.35)";cx.lineWidth=.8;cx.stroke();cx.fillStyle="#3a2e1a";cx.textAlign="center";cx.fillText(txt,x,y+2.5);cx.textAlign="start"}
// pick() di app.js memakai cv.width (piksel). Sesuaikan ke koordinat CSS baru:
function pick(px,py){const W=cv.clientWidth,H=cv.clientHeight,x=(px-W/2-cam.x/devicePixelRatio)/cam.z,y=(py-H*.1-cam.y/devicePixelRatio)/cam.z;
 const c=Math.floor(x/TW+y/TH),r=Math.floor(y/TH-x/TW);return c>=0&&r>=0&&c<N&&r<N?{c,r}:null}
(function loop(){draw();requestAnimationFrame(loop)})();

function fog(t){for(const g of D.regions||[]){if(g.status=="unlocked")continue;const[c0,c1]=g.c,[r0,r1]=g.r;
 poly([P(c0,r0),P(c1+1,r0),P(c1+1,r1+1),P(c0,r1+1)]);const[mx,my]=P((c0+c1+1)/2,(r0+r1+1)/2);
 const gr=cx.createRadialGradient(mx,my,10,mx,my,600);gr.addColorStop(0,"rgba(28,32,52,.80)");gr.addColorStop(1,"rgba(18,20,34,.90)");cx.fillStyle=gr;cx.fill();
 for(let i=0;i<5;i++){const qc=c0+2+R(i,c0+r0,1)*(c1-c0-3),qr=r0+2+R(i,c0+r0,2)*(r1-r0-3),[x,y]=P(qc,qr),b=Math.sin(t*1.5+i)*2;
  cx.globalAlpha=.35+.15*Math.sin(t+i);cx.fillStyle="#cfd6ff";cx.font="bold 22px system-ui,sans-serif";cx.textAlign="center";cx.fillText("?",x,y+b);cx.globalAlpha=1}
 }}
function fogLabels(W,H,d){const placed=[];const S=(x,y)=>[W/2+cam.x/d+x*cam.z,H*.1+cam.y/d+y*cam.z];
 for(const g of D.regions||[]){if(g.status=="unlocked")continue;const[c0,c1]=g.c,[r0,r1]=g.r,cs=[P(c0,r0),P(c1+1,r0),P(c1+1,r1+1),P(c0,r1+1)].map(p=>S(...p));
  const x0=Math.min(...cs.map(p=>p[0])),x1=Math.max(...cs.map(p=>p[0])),y0=Math.min(...cs.map(p=>p[1])),y1=Math.max(...cs.map(p=>p[1]));
  const m=8,vx0=Math.max(x0,m),vx1=Math.min(x1,W-68),vy0=Math.max(y0,m),vy1=Math.min(y1,H-64);if(vx1-vx0<60||vy1-vy0<40)continue;
  const[mx0,my0]=S(...P((c0+c1+1)/2,(r0+r1+1)/2));const t1=`🔒 ${g.nama}`,t2=`Level ${g.syarat.level_min}${g.syarat.butuh_guild?" + Adventurer Guild":""}`;
  cx.font="600 12px system-ui,sans-serif";const bw=Math.max(cx.measureText(t2).width,110)+24,bh=62;
  // titik di dalam diamond wilayah yang terlihat: mulai dari pusat, geser ke dalam layar
  let x=Math.max(vx0+bw/2,Math.min(vx1-bw/2,mx0)),y=Math.max(vy0+bh/2,Math.min(vy1-bh/2,my0));
  x=Math.max(8+bw/2,Math.min(W-68-bw/2,x));y=Math.max(8+bh/2,Math.min(H-64-bh/2,y));
  const hit=()=>placed.some(q=>Math.abs(q[0]-x)<(bw+q[2])/2+6&&Math.abs(q[1]-y)<bh+6);for(let k=0;k<3&&hit();k++)y-=bh+8;if(hit()||y<Math.max(8,vy0)+bh/2)continue;placed.push([x,y,bw]);
  cx.fillStyle="rgba(20,22,40,.72)";rr(x-bw/2,y-bh/2,bw,bh,14);cx.fill();cx.strokeStyle="rgba(200,210,255,.35)";cx.lineWidth=1;cx.stroke();
  cx.textAlign="center";cx.fillStyle="#e8ecff";cx.font="bold 22px system-ui,sans-serif";cx.fillText("?",x,y-8);
  cx.font="700 13px system-ui,sans-serif";cx.fillText(t1,x,y+10);cx.font="500 11px system-ui,sans-serif";cx.fillStyle="#c9cfee";cx.fillText(t2,x,y+24);cx.textAlign="start"}}
