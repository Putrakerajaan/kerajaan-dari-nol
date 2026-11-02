// Kontrol peta: geser 1 jari/mouse, cubit 2 jari, roda mouse, ketuk 2x, tombol +/-.
const ZMIN=.05,ZMAX=2.2;
function clampCam(){if(!cv)return;const d=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;cam.z=Math.min(ZMAX,Math.max(ZMIN,cam.z));
 let wx=-cam.x/(d*cam.z),wy=(H/2-H*.1-cam.y/d)/cam.z;const X=N*TW/2,Y=N*TH;
 wx=Math.max(-X,Math.min(X,wx));wy=Math.max(0,Math.min(Y,wy));cam.x=-wx*d*cam.z;cam.y=(H/2-H*.1-wy*cam.z)*d}
function zoomAt(px,py,f){const d=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight,nz=Math.min(ZMAX,Math.max(ZMIN,cam.z*f));f=nz/cam.z;
 const ox=W/2+cam.x/d,oy=H*.1+cam.y/d;cam.x=(px-(px-ox)*f-W/2)*d;cam.y=(py-(py-oy)*f-H*.1)*d;cam.z=nz;clampCam()}
function initControls(){const pts=new Map();let moved=0,pinch=null,lastTap=0;
 const pos=e=>{const b=cv.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top}};
 cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,pos(e));if(pts.size==1)moved=0;
  if(pts.size==2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),m:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};moved=99}});
 cv.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;const p=pos(e),o=pts.get(e.pointerId),d=devicePixelRatio||1;pts.set(e.pointerId,p);
  if(pts.size>=2&&pinch){const[a,b]=[...pts.values()],nd=Math.hypot(a.x-b.x,a.y-b.y),m={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
   cam.x+=(m.x-pinch.m.x)*d;cam.y+=(m.y-pinch.m.y)*d;if(pinch.d>10)zoomAt(m.x,m.y,nd/pinch.d);pinch={d:nd,m};clampCam();return}
  cam.x+=(p.x-o.x)*d;cam.y+=(p.y-o.y)*d;moved+=Math.abs(p.x-o.x)+Math.abs(p.y-o.y);clampCam()});
 const up=e=>{if(!pts.has(e.pointerId))return;const p=pos(e);pts.delete(e.pointerId);if(pts.size<2)pinch=null;
  if(pts.size==0&&moved<6){const now=performance.now();if(now-lastTap<300){zoomAt(p.x,p.y,1.6);lastTap=0}else{lastTap=now;tap({offsetX:p.x,offsetY:p.y})}}};
 cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",e=>{pts.delete(e.pointerId);pinch=null});
 cv.addEventListener("wheel",e=>{e.preventDefault();const p=pos(e);zoomAt(p.x,p.y,Math.exp(-e.deltaY*.0015))},{passive:false});
 ["gesturestart","gesturechange","touchmove"].forEach(t=>cv.addEventListener(t,e=>e.preventDefault(),{passive:false}));
 const z=document.createElement("div");z.id="zoombtn";z.innerHTML='<button aria-label="Perbesar">+</button><button aria-label="Perkecil">−</button>';$("peta").appendChild(z);
 const[bi,bo]=z.querySelectorAll("button");bi.onclick=()=>zoomAt(cv.clientWidth/2,cv.clientHeight/2,1.3);bo.onclick=()=>zoomAt(cv.clientWidth/2,cv.clientHeight/2,1/1.3);
 onresize=()=>clampCam()}
