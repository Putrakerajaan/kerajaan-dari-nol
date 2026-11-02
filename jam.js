// Jam WIB riil + "Hari ke-N" sejak warga asli pertama daftar (aktif_at paling awal di Appwrite; Putra & demo tidak dihitung)
const WIB_MS=7*3600e3;let HARI0=null;
const wibStr=()=>new Intl.DateTimeFormat("id-ID",{timeZone:"Asia/Jakarta",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date()).replace(/\./g,":");
const hariWIB=t=>Math.floor((t+WIB_MS)/864e5);// nomor hari kalender WIB, ganti 00:00 WIB
function tickJam(){const j=document.getElementById("jam"),d=document.getElementById("day");if(j)j.textContent=wibStr()+" WIB";
 if(d)d.textContent=HARI0==null?"Menunggu warga pertama…":"Hari ke-"+(hariWIB(Date.now())-hariWIB(HARI0)+1)}
async function loadHari0(){try{if(typeof awDB=="undefined")return;const Q=Appwrite.Query,r=await awDB.listRows({databaseId:AW.db,tableId:"warga",queries:[Q.equal("status","aktif"),Q.notEqual("nama","Putra"),Q.isNotNull("aktif_at"),Q.orderAsc("aktif_at"),Q.limit(1)]});
 const w=r.rows&&r.rows[0];HARI0=w?Date.parse(w.aktif_at):null}catch(e){console.warn("hari0",e)}tickJam()}
setInterval(tickJam,1000);setInterval(loadHari0,60000);window.addEventListener("load",()=>{tickJam();setTimeout(loadHari0,500)});
