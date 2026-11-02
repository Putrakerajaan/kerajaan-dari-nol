// Dadu ras 10 sisi (trapezohedron pentagonal) – desain orisinal, digambar Canvas 2D.
const D10=(()=>{
 const FACES=["Manusia","Orc","Manusia","Goblin","Elf","Orc","Manusia","Goblin","Beastfolk","Kurcaci"];// sisi 1..10
 const C36=Math.cos(Math.PI/5),c=.1,a=c*(1+C36)/(1-C36),SY=1.32;// SY: dadu dibuat lebih tinggi (tetap planar)
 const U=k=>[Math.cos(k*2*Math.PI/5),c*SY,Math.sin(k*2*Math.PI/5)],L=k=>[Math.cos((k+.5)*2*Math.PI/5),-c*SY,Math.sin((k+.5)*2*Math.PI/5)];
 const T=[0,a*SY,0],B=[0,-a*SY,0],F=[];
 for(let k=0;k<5;k++)F.push({v:[T,U(k),L(k),U(k+1)],apex:T});
 for(let k=0;k<5;k++)F.push({v:[B,L(k),U(k+1),L(k+1)],apex:B});
 const sub=(p,q)=>p.map((x,i)=>x-q[i]),add=(p,q)=>p.map((x,i)=>x+q[i]),mul=(p,s)=>p.map(x=>x*s),dot=(p,q)=>p[0]*q[0]+p[1]*q[1]+p[2]*q[2];
 const cross=(p,q)=>[p[1]*q[2]-p[2]*q[1],p[2]*q[0]-p[0]*q[2],p[0]*q[1]-p[1]*q[0]],nrm=p=>mul(p,1/Math.hypot(...p));
 F.forEach(f=>{f.c=mul(f.v.reduce(add),.25);f.n=nrm(cross(sub(f.v[1],f.v[0]),sub(f.v[3],f.v[0])));if(dot(f.n,f.c)<0)f.n=mul(f.n,-1);
  f.up=nrm(sub(f.apex,add(f.c,mul(f.n,dot(sub(f.apex,f.c),f.n)))));f.right=cross(f.up,f.n);
  f.ctr=add(mul(f.c,.92),mul(f.apex,.08));f.ctr=add(f.ctr,mul(f.n,-dot(sub(f.ctr,f.c),f.n)));});// pusat gambar dekat ujung lebar
 // matriks 3x3 (baris)
 const mm=(A,B)=>A.map(r=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j])),mv=(M,p)=>M.map(r=>dot(r,p));
 const axisAngle=(u,t)=>{u=nrm(u);const[x,y,z]=u,C=Math.cos(t),S=Math.sin(t),V=1-C;return[[C+x*x*V,x*y*V-z*S,x*z*V+y*S],[y*x*V+z*S,C+y*y*V,y*z*V-x*S],[z*x*V-y*S,z*y*V+x*S,C+z*z*V]]};
 // rotasi yang membuat sisi i menghadap kamera (+z), "up" sisi ke atas layar (-y layar = +y dunia), sedikit miring agar terlihat 3D
 function faceRot(i){const f=F[i];const R=[f.right,f.up,f.n];// baris: memetakan right->x, up->y, n->z
  return mm(mm(axisAngle([1,0,0],-.32),axisAngle([0,1,0],.18)),R)}
 // --- ikon ras: siluet hitam dari icons/ras_paths.js (Path2D, viewBox 100) ---
 const P2={};function portrait(x,r){if(!P2[r])P2[r]=rasPaths(r).map(d=>new Path2D(d));x.save();x.translate(-1,-1);x.scale(.02,.02);x.fillStyle="#120a0a";P2[r].forEach(p=>x.fill(p));x.restore()}
 const TIER={3:"umum",2:"sedang",1:"langka"},count=r=>FACES.filter(x=>x==r).length;
 const GLOW={umum:"#9fe08a",sedang:"#79b8ff",langka:"#ff9be8"};
 // gambar dadu: R = matriks rotasi, S = skala px, (ox,oy) pusat
 function draw(x,ox,oy,S,R,o={}){const P=p=>{const q=mv(R,p);return[ox+q[0]*S,oy-q[1]*S,q[2]]};
  const L=nrm([-.4,.6,.7]);
  if(o.glow){const G=x.createRadialGradient(ox,oy,S*.2,ox,oy,S*1.3);G.addColorStop(0,o.glow+"aa");G.addColorStop(1,o.glow+"00");x.fillStyle=G;x.beginPath();x.arc(ox,oy,S*1.3,0,7);x.fill()}
  x.fillStyle="rgba(0,0,0,.28)";x.beginPath();x.ellipse(ox,oy+S*1.08,S*.75,S*.14,0,0,7);x.fill();
  const vis=F.map((f,i)=>({f,i,n:mv(R,f.n),z:mv(R,f.c)[2]})).filter(e=>e.n[2]>0.001).sort((p,q)=>p.z-q.z);
  for(const{f,i,n}of vis){const pts=f.v.map(P),lit=Math.max(0,dot(n,L)),spec=Math.pow(Math.max(0,dot(nrm(add(L,[0,0,1])),n)),24);
   x.beginPath();pts.forEach((p,k)=>k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();
   const G=x.createLinearGradient(pts[0][0],pts[0][1],pts[2][0],pts[2][1]);const b=.35+.65*lit;
   const k=Math.pow(b,1.4);G.addColorStop(0,`rgb(${Math.round(90+160*k)},${Math.round(60+150*k)},${Math.round(30+100*k)})`);G.addColorStop(1,`rgb(${Math.round(60+130*k)},${Math.round(38+110*k)},${Math.round(20+60*k)})`);x.fillStyle=G;x.fill();
   x.save();x.clip();x.fillStyle=`rgba(255,240,220,${spec*.55})`;x.fill();x.restore();
   x.strokeStyle="#2a0f22";x.lineWidth=Math.max(2,S*.07);x.lineJoin="round";x.stroke();x.strokeStyle="#e8c26a";x.lineWidth=Math.max(1,S*.022);x.stroke();
   // garis ornamen dalam
   const cc=P(f.c);x.beginPath();pts.forEach((p,k)=>{const q=[cc[0]+(p[0]-cc[0])*.84,cc[1]+(p[1]-cc[1])*.84];k?x.lineTo(...q):x.moveTo(...q)});x.closePath();
   x.strokeStyle=`rgba(90,40,30,${.35+.3*lit})`;x.lineWidth=Math.max(.6,S*.01);x.stroke();
   // potret + nama: affine dari basis sisi
   const ct=P(f.ctr),rx=mv(R,f.right),uy=mv(R,f.up),s=S*.17;
   x.save();x.setTransform(...(o.base||[1,0,0,1,0,0]));x.transform(rx[0]*s,-rx[1]*s,-uy[0]*s,uy[1]*s,ct[0],ct[1]);
   x.globalAlpha=.6+.4*n[2];x.strokeStyle="rgba(90,40,30,.6)";x.lineWidth=.06;x.beginPath();x.arc(0,0,1.12,0,7);x.stroke();
   portrait(x,FACES[i]);x.fillStyle="#2a120c";x.font="700 .5px Georgia,serif";x.textAlign="center";x.fillText(FACES[i].toUpperCase(),0,1.75);
   x.font="700 .4px Georgia,serif";x.fillStyle="rgba(60,25,15,.75)";x.fillText(String(i+1),0,-1.45);x.restore()}}
 // animasi: tumble memudar menuju sisi target
 function rotAt(i,t,seed){const e=1-Math.pow(1-Math.min(1,t),3),R0=faceRot(i),ax=[Math.sin(seed*3.1),Math.cos(seed*1.7),.4+Math.sin(seed)];
  return mm(axisAngle(ax,(1-e)*Math.PI*7),R0)}
 return{FACES,TIER,GLOW,count,draw,faceRot,rotAt,portrait,axisAngle,mm}})();
