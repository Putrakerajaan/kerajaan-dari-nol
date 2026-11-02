// Daftar Warga via Appwrite (hanya endpoint + project ID; tidak ada kunci rahasia di sini)
const AW={ep:"https://sgp.cloud.appwrite.io/v1",pid:"6ae8a7c6003d90acacbe",db:"kdn"};
let awDB,awFn,KUOTA={},dfJob=null,dfGender="Laki-laki",dfBusy=false;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function gelarNama(ids){const L=(D.gelar_kejutan||{}).daftar||[];return String(ids||'').split(',').filter(Boolean).map(i=>i.startsWith('m:')?i.slice(2):(L.find(x=>x.id==i)||{}).nama).filter(Boolean)}
function gelarChips(ids){const g=gelarNama(ids);return g.length?`<div class="chips">${g.map(x=>`<span class="chip">🏅 ${esc(x)}</span>`).join('')}</div>`:''}
function ktpCard(w){const tier=D10.TIER[D10.count(w.ras)]||"";return`<div class="card ktpbig"><h3>🪪 KTP Desa Viralis · ${esc(w.kode)}</h3>
 <div class="ktprow"><img class="ktpimg" src="icons/ras_${w.ras.toLowerCase()}.png" alt=""><div>Nama: <b>${esc(w.nama)}</b> 🔒<br>TikTok: @${esc(w.username)}<br>Ras: <b>${w.ras}</b> (${tier}) · terkunci<br>Gender: ${esc(w.gender)}<br>Pekerjaan: <b>${esc(w.pekerjaan)}</b><br>Warga sejak Day ${w.day||D.day}${w.petualang?`<br>Petualang rank <b>${esc(w.rank||'F')}</b>`:''}</div></div>${w.petualang||w.emas?`<div class="pouch">👝 Kantong gold: <b>${(w.emas||0).toLocaleString('id')}</b> 🪙</div>`:''}${gelarChips(w.gelar_rahasia)}
 <p class="mut">Karaktermu sekarang berjalan di peta. Ras adalah kehendak dewa, tidak bisa diulang.</p></div>`}
function dfHTML(){return`<div id="akunbox"></div><div id="apelbox"></div><div class="card df" id="dfcard"><h3>📝 Daftar Warga</h3><p class="mut">Sudah follow TikTok dan dapat DM kode rahasia? Isi di sini. Satu akun TikTok = satu warga.</p>
 <label>Username TikTok</label><input id="dfu" placeholder="cth budi.ok" autocapitalize="off" autocomplete="off">
 <label>Kode rahasia dari DM</label><input id="dfk" placeholder="6 karakter" maxlength="6" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase;letter-spacing:3px">
 <label>Pilih pekerjaan <span class="mut">(sisa kuota)</span></label><div id="dfjobs" class="jobs">Memuat kuota…</div>
 <label>Buat PIN 6 angka <span class="mut">(untuk masuk dari HP lain)</span></label><div class="pinrow"><input id="dfp1" type="password" inputmode="numeric" maxlength="6" placeholder="PIN" autocomplete="new-password"><input id="dfp2" type="password" inputmode="numeric" maxlength="6" placeholder="Ulangi PIN" autocomplete="new-password"></div>
 <label>Gender</label><div class="gsel"><button data-g="Laki-laki" class="on">♂ Laki-laki</button><button data-g="Perempuan">♀ Perempuan</button></div>
 <canvas id="d10b" class="d10"></canvas><div id="dfres" class="dres">&nbsp;</div>
 <button id="dfroll" class="btn">🎲 Putar dadu untuk mendapatkan ras</button><div id="dferr" class="err"></div></div><div id="dfktp"></div>`}
function renderJobs(){const J=Object.values(KUOTA).filter(q=>q.pekerjaan!='Petualang').sort((a,b)=>b.maks-a.maks);$("dfjobs").innerHTML=J.map(q=>{const sisa=q.maks-q.terisi;
 const kunci=q.buka===false,np=q.produktif===false;
 return`<button data-j="${q.pekerjaan}" class="${dfJob==q.pekerjaan?"on":""}${kunci?" kunci":""}" ${sisa<=0||kunci?"disabled":""}><b>${kunci?"🔒 ":""}${q.pekerjaan}</b><span>${kunci?`Butuh ${esc(q.nama_bangunan)}`:sisa<=0?"Penuh":`sisa ${sisa}/${q.maks}`}</span>${np?`<em>tidak produksi · tetap makan${q.penalti_aktif?` · wajib ${esc(q.nama_checkin)} ${q.penalti_min}x/minggu`:""}</em>`:""}<i style="width:${Math.min(100,q.terisi/q.maks*100)}%"></i></button>`}).join("");
 $("dfjobs").querySelectorAll("button").forEach(b=>b.onclick=()=>{dfJob=b.dataset.j;renderJobs()})}
async function loadKuota(){try{const r=await awDB.listRows({databaseId:AW.db,tableId:"kuota",queries:[Appwrite.Query.limit(50)]});r.rows.forEach(q=>KUOTA[q.pekerjaan]=q);renderJobs()}catch(e){$("dfjobs").textContent="Gagal memuat kuota."}}
async function loadWarga(){try{const r=await awDB.listRows({databaseId:AW.db,tableId:"warga",queries:[Appwrite.Query.equal("status","aktif"),Appwrite.Query.limit(1000)]});
 const ada=new Set(D.warga_list.map(w=>w.kode));r.rows.forEach(w=>{const k=w.kode_ktp||w.$id;if(ada.has(k))return;D.warga_list.push({kode:k,nama:w.nama,username:w.username,tiktok:w.username,ras:w.ras,dadu_sisi:w.dadu_sisi,gender:w.gender,pekerjaan:w.pekerjaan,day:w.day||D.day,online:true,gelar_rahasia:w.gelar_rahasia,petualang:w.petualang,rank:w.rank,calon:w.calon,emas:w.emas||0})});
 window.JML_WARGA=D.warga+r.rows.length;window.JML_ONLINE=r.rows.length;$("warga").textContent=window.JML_WARGA.toLocaleString("id");AGENTS.length=0}catch(e){console.warn("warga Appwrite",e)}}
async function dfRoll(){if(dfBusy)return;const u=$("dfu").value.trim().replace(/^@/,"").toLowerCase(),k=$("dfk").value.trim().toUpperCase(),er=$("dferr");er.textContent="";
 if(!u||k.length!=6)return er.textContent="Isi username dan kode 6 karakter dari DM.";if(!dfJob)return er.textContent="Pilih pekerjaan dulu.";const p1=$("dfp1").value,p2=$("dfp2").value,pe=pinCek(p1);if(pe)return er.textContent=pe;if(p1!==p2)return er.textContent="Konfirmasi PIN tidak sama.";
 dfBusy=true;$("dfroll").disabled=true;$("dfres").className="dres show";$("dfres").textContent="Memohon kehendak dewa…";
 try{const x=await awFn.createExecution({functionId:"daftar",body:JSON.stringify({username:u,kode:k,pekerjaan:dfJob,gender:dfGender,pin:$("dfp1").value,perangkat:perangkat()}),async:false,method:Appwrite.ExecutionMethod.POST,headers:{"content-type":"application/json"}});
  let o={};try{o=JSON.parse(x.responseBody)}catch(_){}
  if(!o.ok){er.textContent=o.pesan||"Gagal mendaftar, coba lagi.";$("dfres").textContent=" ";dfBusy=false;$("dfroll").disabled=false;loadKuota();return}
  const n=o.sisi,ras=o.ras,tier=D10.TIER[D10.count(ras)];dState={face:n-1,seed:Math.random()*10,start:performance.now(),glow:null,t:0};$("dfres").textContent="Dadu berputar…";
  setTimeout(()=>{dState.glow=D10.GLOW[tier];$("dfres").className="dres show t-"+tier;$("dfres").innerHTML=`<img class="ico" src="icons/ras_${ras.toLowerCase()}.png" alt=""> <b>${ras}</b> · ${tier} (${D10.count(ras)*10}%) · sisi ${n}<br><span class='mut'>Hasil tetap, tercatat di KTP</span>`;
   localStorage.setItem("kdn_user",u);if(o.token)localStorage.setItem("kdn_token",o.token);loadApel();if(window.akunInit)akunInit();D.warga_list.push({...o.warga,tiktok:u,online:true});AGENTS.length=0;$("dfktp").innerHTML=ktpCard(o.warga);$("dfroll").textContent="✅ Terdaftar";loadKuota();
   setTimeout(()=>$("dfktp").scrollIntoView({behavior:"smooth"}),600)},2550)}
 catch(e){er.textContent="Server sibuk, coba lagi sebentar.";dfBusy=false;$("dfroll").disabled=false}}
function initDaftar(){if(initDaftar.done)return;initDaftar.done=1;$("daftar").innerHTML=dfHTML();
 if(!window.Appwrite){$("dfjobs").textContent="Layanan pendaftaran tidak bisa dimuat.";return}
 const c=new Appwrite.Client().setEndpoint(AW.ep).setProject(AW.pid);awDB=new Appwrite.TablesDB(c);awFn=new Appwrite.Functions(c);
 document.querySelectorAll(".gsel button").forEach(b=>b.onclick=()=>{dfGender=b.dataset.g;document.querySelectorAll(".gsel button").forEach(x=>x.classList.toggle("on",x==b))});
 $("dfroll").onclick=dfRoll;loadKuota();loadWarga();loadApel();if(window.akunInit)akunInit();
 const me=localStorage.getItem("kdn_user");if(me)awDB.getRow({databaseId:AW.db,tableId:"warga",rowId:"u-"+me.replace(/\./g,"_")}).then(w=>{if(w.status=="aktif"){$("dfktp").innerHTML=ktpCard({...w,kode:w.kode_ktp});$("dfroll").textContent="✅ Kamu sudah terdaftar";$("dfroll").disabled=true}}).catch(()=>{})}
if(window.KDN_READY)initDaftar();

// Check-in harian (apel) untuk pekerjaan non-produksi. Identitas = token sesi acak dari server, hanya ada di perangkat ini.
async function callApel(cek){const u=localStorage.getItem("kdn_user"),tk=localStorage.getItem("kdn_token");if(!u||!tk||!awFn)return null;
 const x=await awFn.createExecution({functionId:"apel",body:JSON.stringify({username:u,token:tk,cek}),async:false,method:Appwrite.ExecutionMethod.POST,headers:{"content-type":"application/json"}});try{return JSON.parse(x.responseBody)}catch(_){return null}}
function apelHTML(o,msg){const min=o.min||3,n=o.jumlah_7hari,ok=n>=min;if(o.calon)return`<div class="card apel"><h3>🪖 Calon ${esc(o.calon)}</h3><p class="mut">Kamu sekarang ${esc(o.pekerjaan)}. Apel lagi di Barak untuk kembali.</p><div class="dots">${Array.from({length:min},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</div><p><b>${n}/${min}</b> apel untuk kembali jadi ${esc(o.calon)} (7 hari terakhir)</p><button id="apelbtn" class="btn" ${o.sudah_hari_ini?'disabled':''}>${o.sudah_hari_ini?'✅ Sudah check-in hari ini':'Check-in di Barak'}</button>${msg?`<p class="mut">${msg}</p>`:''}</div>`;return`<div class="card apel"><h3>🪖 ${esc(o.nama_checkin)}</h3>
 <p class="mut">Halo @${esc(localStorage.getItem("kdn_user"))} (${esc(o.pekerjaan)}). Check-in sekali sehari (WIB). Minimal ${min}x per minggu, kalau kurang kamu jadi ${esc(o.penalti_ke||"Petani")} tiap Senin 00:00 WIB.</p>
 <div class="dots">${Array.from({length:7},(_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</div><p>7 hari terakhir: <b>${n}x</b> ${ok?"✅ aman":`· kurang ${min-n}x lagi`}</p>
 <button id="apelbtn" class="btn" ${o.sudah_hari_ini?"disabled":""}>${o.sudah_hari_ini?"✅ Sudah check-in hari ini":"Check-in di Barak"}</button>${msg?`<p class="mut">${msg}</p>`:""}</div>`}
async function loadApel(){const box=$("apelbox");if(!box)return;try{const o=await callApel(true);if(o&&o.dalam_gate){box.innerHTML=`<div class="card apel"><h3>🪖 Apel di Barak</h3><p>🔒 ${esc(o.pesan)}</p><p class="mut">Apel bisa dilakukan lagi setelah party keluar dari gate (lihat hitung mundur di tab Guild).</p><button class="btn" disabled>Check-in di Barak</button></div>`;return}if(!o||!o.ok){box.innerHTML="";return}box.innerHTML=apelHTML(o);
 $("apelbtn").onclick=async()=>{$("apelbtn").disabled=true;const r=await callApel(false);if(r&&r.ok){box.innerHTML=apelHTML(r,r.kembali?"🎉 Selamat! Kamu kembali jadi "+r.kembali+".":r.kembali===false?"Sudah cukup apel, tapi kuota penuh. Coba lagi besok.":r.baru?"Hadir! Tercatat "+r.tanggal+".":"Hari ini sudah tercatat.");if(window.gdLoad)gdLoad();loadApel.last=r}else $("apelbtn").disabled=false}}catch(e){box.innerHTML=""}}
