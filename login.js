// Masuk / Keluar / Lupa PIN / buat PIN (warga lama). Token perangkat disimpan di localStorage, server hanya simpan hash.
function perangkat(){const u=navigator.userAgent;return(/Android/.test(u)?"Android":/iPhone|iPad/.test(u)?"iOS":/Windows/.test(u)?"Windows":/Mac/.test(u)?"Mac":"Lainnya")+" · "+new Date().toLocaleDateString("id")}
function pinCek(p){if(!/^\d{6}$/.test(p))return"PIN harus 6 angka.";if(/^(\d)\1{5}$/.test(p))return"PIN terlalu mudah (angka sama semua).";const d=[...p].map(Number);
 if(d.every((x,i)=>!i||x==(d[i-1]+1)%10)||d.every((x,i)=>!i||x==(d[i-1]+9)%10))return"PIN terlalu mudah (angka berurutan).";if(/^(\d\d)\1\1$/.test(p)||/^(\d{3})\1$/.test(p))return"PIN terlalu mudah ditebak.";return null}
async function akCall(body){const x=await awFn.createExecution({functionId:"daftar",body:JSON.stringify(body),async:false,method:Appwrite.ExecutionMethod.POST,headers:{"content-type":"application/json"}});
 let o={};try{o=JSON.parse(x.responseBody)}catch(_){o={ok:false,pesan:"Server sibuk, coba lagi."}}if(o.keluar){localStorage.removeItem("kdn_token")}return o}
const pinInput=(id,ph)=>`<input id="${id}" type="password" inputmode="numeric" maxlength="6" placeholder="${ph}" autocomplete="off">`;
function akunLoginHTML(){return`<div class="card akun"><h3>🔑 Masuk</h3><p class="mut">Sudah jadi warga? Masuk dengan username TikTok dan PIN-mu, bisa dari HP mana saja.</p>
 <input id="aku" placeholder="Username TikTok" autocapitalize="off" autocomplete="username">${pinInput("akp","PIN 6 angka")}
 <button class="btn" id="akbtn">Masuk</button><div class="err" id="akerr"></div><a href="#" id="aklupa" class="lnk">Lupa PIN?</a>
 <div id="aklupabox" style="display:none"><h3 style="margin-top:12px">🗝️ Lupa PIN</h3><p class="mut">DM Putra di TikTok minta <b>kode reset</b>. Lalu isi di sini untuk membuat PIN baru (semua perangkat lama akan keluar).</p>
 <input id="aru" placeholder="Username TikTok" autocapitalize="off"><input id="ark" placeholder="Kode reset (6 karakter)" maxlength="6" style="text-transform:uppercase;letter-spacing:3px">
 <div class="pinrow">${pinInput("arp1","PIN baru")}${pinInput("arp2","Ulangi PIN")}</div><button class="btn" id="arbtn">Simpan PIN baru</button><div class="err" id="arerr"></div></div></div>`}
function akunInHTML(o){const w=o.warga;return`<div class="card akun in"><div class="akrow"><div>👤 Masuk sebagai <b>${esc(w.nama)}</b><br><span class="mut">@${esc(w.username)} · ${esc(w.pekerjaan||"")}${w.ras?" · "+esc(w.ras):""}</span></div><button class="btn ghost sm" id="akout">Keluar</button></div>
 ${o.punya_pin?"":`<div class="setpin"><h3>🔐 Buat PIN dulu</h3><p class="mut">Akunmu belum punya PIN. Buat sekarang supaya bisa masuk dari HP lain.</p><div class="pinrow">${pinInput("spp1","PIN baru")}${pinInput("spp2","Ulangi PIN")}</div><button class="btn" id="spbtn">Simpan PIN</button><div class="err" id="sperr"></div></div>`}</div>`}
function akunMasuk(u,token,w){localStorage.setItem("kdn_user",u);localStorage.setItem("kdn_token",token);if(w){if(!D.warga_list.some(x=>x.username==u))D.warga_list.push({...w,tiktok:u,online:true});
 if(w.ras)$("dfktp").innerHTML=ktpCard(w)}AGENTS.length=0;akunInit();loadApel();if(window.gdLoad)gdLoad()}
async function akunInit(){const box=$("akunbox");if(!box)return;const u=localStorage.getItem("kdn_user"),tk=localStorage.getItem("kdn_token");
 if(!u||!tk){box.innerHTML=akunLoginHTML();$("dfcard")&&($("dfcard").style.display="");
  $("aklupa").onclick=e=>{e.preventDefault();const b=$("aklupabox");b.style.display=b.style.display=="none"?"":"none"};
  $("akbtn").onclick=async()=>{const uu=$("aku").value.trim().replace(/^@/,"").toLowerCase(),p=$("akp").value;$("akerr").textContent="";if(!uu||!/^\d{6}$/.test(p))return $("akerr").textContent="Isi username dan PIN 6 angka.";
   $("akbtn").disabled=true;const o=await akCall({aksi:"login",username:uu,pin:p,perangkat:perangkat()});$("akbtn").disabled=false;if(!o.ok)return $("akerr").textContent=o.pesan;akunMasuk(uu,o.token,o.warga)};
  $("arbtn").onclick=async()=>{const uu=$("aru").value.trim().replace(/^@/,"").toLowerCase(),k=$("ark").value.trim().toUpperCase(),p1=$("arp1").value,p2=$("arp2").value;$("arerr").textContent="";
   const pe=pinCek(p1);if(pe)return $("arerr").textContent=pe;if(p1!==p2)return $("arerr").textContent="Konfirmasi PIN tidak sama.";
   const o=await akCall({aksi:"reset_pin",username:uu,kode:k,pin:p1,perangkat:perangkat()});if(!o.ok)return $("arerr").textContent=o.pesan;akunMasuk(uu,o.token,o.warga)};return}
 const o=await akCall({aksi:"akun",username:u,token:tk});if(!o.ok){if(o.keluar){localStorage.removeItem("kdn_token");return akunInit()}return}
 box.innerHTML=akunInHTML(o);$("dfcard")&&($("dfcard").style.display=o.warga.ras?"none":"");if(o.warga.ras&&!$("dfktp").innerHTML)$("dfktp").innerHTML=ktpCard(o.warga);
 $("akout").onclick=async()=>{await akCall({aksi:"keluar",username:u,token:tk});localStorage.removeItem("kdn_token");localStorage.removeItem("kdn_user");$("dfktp").innerHTML="";$("apelbox").innerHTML="";AGENTS.length=0;akunInit();if(window.gdLoad)gdLoad()};
 if($("spbtn"))$("spbtn").onclick=async()=>{const p1=$("spp1").value,p2=$("spp2").value,pe=pinCek(p1);if(pe)return $("sperr").textContent=pe;if(p1!==p2)return $("sperr").textContent="Konfirmasi PIN tidak sama.";
  const r=await akCall({aksi:"set_pin",username:u,token:tk,pin:p1});if(!r.ok)return $("sperr").textContent=r.pesan;akunInit()}}
if(typeof initDaftar=="function"&&initDaftar.done)akunInit();
