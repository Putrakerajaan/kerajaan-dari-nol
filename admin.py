#!/usr/bin/env python3
"""Admin harian Kerajaan dari Nol. Contoh:
  python3 admin.py hari-baru --follower 3          # Day+1, tambah 3 warga acak, hitung produksi & makan
  python3 admin.py warga --nama Budi --gender Perempuan --pekerjaan Nelayan   # ras diundi (gacha), --seed opsional
  python3 admin.py bangun --id rumah1 --nama "Rumah Kayu" --tile F7 --jenis rumah --progres 30 --usulan "@user (120 like)"
  python3 admin.py progres --id rumah1 --progres 100
  python3 admin.py vote --opsi "Rumah Kayu=120" "Dermaga Ikan=80"
  python3 admin.py berita "DAY 2: warga kedua datang!"
"""
import json,random,argparse,datetime
F="data.json";RAS=["Manusia","Orc","Goblin","Beastfolk","Kurcaci","Elf"];JOB=["Petani","Nelayan","Penebang","Tukang","Prajurit","Pedagang","Penyihir"]
NAMA=["Arga","Sari","Bima","Lintang","Raka","Dewi","Galih","Wulan","Tirta","Kirana","Bayu","Ayu","Jaka","Melati","Surya","Rara"]
def load():return json.load(open(F))
def save(d):d["diperbarui"]=datetime.datetime.now().strftime("%Y-%m-%d %H:%M");json.dump(d,open(F,"w"),ensure_ascii=False,indent=1)
TIER={3:"umum",2:"sedang",1:"langka"}
def gacha(d,rng):
 sisi=d.get("dadu_d10",{}).get("sisi") or ["Manusia"]*3+["Orc"]*2+["Goblin"]*2+["Beastfolk","Kurcaci","Elf"]
 n=rng.randint(1,len(sisi));ras=sisi[n-1];return ras,TIER.get(sisi.count(ras),"?"),n
def unik(d,rng):
 while True:
  n=rng.choice(NAMA)+" "+rng.choice(NAMA)
  if all(norm(w["nama"])!=norm(n) for w in d["warga_list"]):return n
def norm(x):return " ".join((x or "").split()).lower()
def add(d,nama=None,ras=None,job=None,gender=None,rng=random,tiktok=None):
 if nama:
  nama=" ".join(nama.split());ada=next((w for w in d["warga_list"] if norm(w["nama"])==norm(nama)),None)
  if ada:raise SystemExit(f"Nama {ada['nama']} sudah terdaftar ({ada['ras']}). Daftar dengan nama lain.")
 if tiktok:
  tiktok=tiktok.strip().lstrip("@");ada=next((w for w in d["warga_list"] if norm(w.get("tiktok","")).lstrip("@")==norm(tiktok)),None)
  if ada:raise SystemExit(f"Akun TikTok @{tiktok} sudah dipakai warga {ada['nama']} ({ada['kode']}). Satu akun TikTok = satu warga.")
 n=d["warga"]+1;Q=d.get("kuota",{});isi=lambda j:d["pekerjaan"].get(j,0);buka=[j for j in JOB if isi(j)<Q.get(j,10**9)]
 if job and job not in JOB:raise SystemExit(f"Pekerjaan '{job}' tidak ada. Pilihan: {', '.join(JOB)}")
 if job and job not in buka:raise SystemExit(f"Kuota {job} penuh ({isi(job)}/{Q[job]}). Pekerjaan yang masih buka: "+", ".join(f"{j} {isi(j)}/{Q.get(j,'-')}" for j in buka))
 if not buka:raise SystemExit("Semua kuota pekerjaan penuh, naikkan 'kuota' di data.json")
 gender=gender or rng.choice(d.get("gender_pilihan",["Laki-laki","Perempuan"]))
 ras,tier,sisi=gacha(d,rng);print(f"Dadu d10: sisi {sisi} -> {ras} ({tier})");job=job or rng.choice(buka)
 d["warga_list"].append({"kode":f"KDN-{n:04d}","nama":nama or unik(d,rng),**({"tiktok":tiktok} if tiktok else {}),"ras":ras,"dadu_sisi":sisi,"gender":gender,"pekerjaan":job,"day":d["day"]})
 d["warga"]=n;d["ras"][ras]=d["ras"].get(ras,0)+1;d["pekerjaan"][job]=d["pekerjaan"].get(job,0)+1
def tick(d):
 for j,n in d["pekerjaan"].items():
  for k,v in d["produksi"].get(j,{}).items():d["sumberdaya"][k]+=v*n
 need=d["warga"]*d["makanPerWarga"];s=d["sumberdaya"]
 a=min(need,s["ikan"]);s["ikan"]-=a;need-=a;b=min(need,s["gandum"]);s["gandum"]-=b;need-=b
 if need:d["berita"].insert(0,f"DAY {d['day']}: Kekurangan makanan {need} porsi!")
 d["kas"]=s["emas"]
p=argparse.ArgumentParser();sp=p.add_subparsers(dest="cmd",required=True)
h=sp.add_parser("hari-baru");h.add_argument("--follower",type=int,default=0)
w=sp.add_parser("warga");w.add_argument("--nama");w.add_argument("--gender",required=True,choices=["Laki-laki","Perempuan"]);w.add_argument("--seed",type=int);w.add_argument("--tiktok");w.add_argument("--pekerjaan")
b=sp.add_parser("bangun");[b.add_argument("--"+k,required=k in("id","nama","tile")) for k in("id","nama","tile","jenis","usulan")];b.add_argument("--progres",type=int,default=0)
g=sp.add_parser("progres");g.add_argument("--id",required=True);g.add_argument("--progres",type=int,required=True)
v=sp.add_parser("vote");v.add_argument("--opsi",nargs="+",required=True)
n=sp.add_parser("berita");n.add_argument("teks")
lv=sp.add_parser("level");lv.add_argument("n",type=int)
bk=sp.add_parser("buka");bk.add_argument("id")
sp.add_parser("wilayah")
a=p.parse_args();d=load()
if a.cmd=="hari-baru":
 d["day"]+=1;[add(d) for _ in range(a.follower)];tick(d);d["riwayat"].append({"day":d["day"],"teks":f"{a.follower} warga baru bergabung"})
elif a.cmd=="warga":add(d,a.nama,None,a.pekerjaan,a.gender,random.Random(a.seed) if a.seed is not None else random,a.tiktok)
elif a.cmd=="level":d["level_kerajaan"]=a.n;d["riwayat"].append({"day":d["day"],"teks":f"Kerajaan naik ke Level {a.n}"})
elif a.cmd in("buka","wilayah"):
 L=d.get("level_kerajaan",1);guild=any(x.get("jenis")=="guild" and x["status"]=="selesai" for x in d["bangunan"])
 if a.cmd=="wilayah":
  for g in d["regions"]:print(f"{g['id']:8} {g['nama']:15} {g['status']:8} syarat Lv>={g['syarat']['level_min']}{' + Guild' if g['syarat']['butuh_guild'] else ''}")
  print(f"Level sekarang {L}, Guild {'ada' if guild else 'belum ada'}");raise SystemExit
 g=next((x for x in d["regions"] if x["id"]==a.id),None)
 if not g:raise SystemExit("Wilayah tidak ada. Pilihan: "+", ".join(x["id"] for x in d["regions"]))
 if g["status"]=="unlocked":raise SystemExit(f"{g['nama']} sudah terbuka")
 kurang=[]
 if L<g["syarat"]["level_min"]:kurang.append(f"level {L} < {g['syarat']['level_min']}")
 if g["syarat"]["butuh_guild"] and not guild:kurang.append("belum ada Adventurer Guild selesai (bangun --jenis guild --progres 100)")
 if kurang:raise SystemExit(f"Belum bisa membuka {g['nama']}: "+"; ".join(kurang))
 g["status"]="unlocked";d["riwayat"].append({"day":d["day"],"teks":f"Wilayah {g['nama']} terbuka!"});d["berita"].insert(0,f"DAY {d['day']}: Wilayah {g['nama']} terbuka!")
elif a.cmd=="bangun":
 d["bangunan"]=[x for x in d["bangunan"] if x["id"]!=a.id]+[{"id":a.id,"nama":a.nama,"tile":a.tile.upper(),"jenis":a.jenis or "rumah","status":"selesai" if a.progres>=100 else "dibangun","progres":a.progres,"day":d["day"],"usulan":a.usulan or ""}]
 d["riwayat"].append({"day":d["day"],"teks":f"{a.nama} mulai dibangun di {a.tile.upper()}"})
elif a.cmd=="progres":
 for x in d["bangunan"]:
  if x["id"]==a.id:x["progres"]=a.progres;x["status"]="selesai" if a.progres>=100 else "dibangun"
elif a.cmd=="vote":d["vote"]["opsi"]=[{"nama":o.split("=")[0],"like":int(o.split("=")[1])} for o in a.opsi]
elif a.cmd=="berita":d["berita"].insert(0,a.teks)
save(d);print(f"OK: Day {d['day']}, {d['warga']} warga, sumber daya {d['sumberdaya']}")
