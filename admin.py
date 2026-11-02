#!/usr/bin/env python3
"""Admin harian Kerajaan dari Nol. Contoh:
  python3 admin.py hari-baru --follower 3          # Day+1, tambah 3 warga acak, hitung produksi & makan
  python3 admin.py warga --nama Budi --ras Elf --pekerjaan Nelayan
  python3 admin.py bangun --id rumah1 --nama "Rumah Kayu" --tile F7 --jenis rumah --progres 30 --usulan "@user (120 like)"
  python3 admin.py progres --id rumah1 --progres 100
  python3 admin.py vote --opsi "Rumah Kayu=120" "Dermaga Ikan=80"
  python3 admin.py berita "DAY 2: warga kedua datang!"
"""
import json,random,argparse,datetime
F="data.json";RAS=["Manusia","Elf","Kurcaci","Goblin","Beastfolk"];JOB=["Petani","Nelayan","Penebang","Tukang","Prajurit","Pedagang","Penyihir"]
NAMA=["Arga","Sari","Bima","Lintang","Raka","Dewi","Galih","Wulan","Tirta","Kirana","Bayu","Ayu","Jaka","Melati","Surya","Rara"]
def load():return json.load(open(F))
def save(d):d["diperbarui"]=datetime.datetime.now().strftime("%Y-%m-%d %H:%M");json.dump(d,open(F,"w"),ensure_ascii=False,indent=1)
def add(d,nama=None,ras=None,job=None):
 n=d["warga"]+1;ras=ras or random.choice(RAS);job=job or random.choice(JOB)
 d["warga_list"].append({"kode":f"KDN-{n:04d}","nama":nama or random.choice(NAMA)+" "+random.choice(NAMA),"ras":ras,"pekerjaan":job,"day":d["day"]})
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
w=sp.add_parser("warga");w.add_argument("--nama");w.add_argument("--ras");w.add_argument("--pekerjaan")
b=sp.add_parser("bangun");[b.add_argument("--"+k,required=k in("id","nama","tile")) for k in("id","nama","tile","jenis","usulan")];b.add_argument("--progres",type=int,default=0)
g=sp.add_parser("progres");g.add_argument("--id",required=True);g.add_argument("--progres",type=int,required=True)
v=sp.add_parser("vote");v.add_argument("--opsi",nargs="+",required=True)
n=sp.add_parser("berita");n.add_argument("teks")
a=p.parse_args();d=load()
if a.cmd=="hari-baru":
 d["day"]+=1;[add(d) for _ in range(a.follower)];tick(d);d["riwayat"].append({"day":d["day"],"teks":f"{a.follower} warga baru bergabung"})
elif a.cmd=="warga":add(d,a.nama,a.ras,a.pekerjaan)
elif a.cmd=="bangun":
 d["bangunan"]=[x for x in d["bangunan"] if x["id"]!=a.id]+[{"id":a.id,"nama":a.nama,"tile":a.tile.upper(),"jenis":a.jenis or "rumah","status":"selesai" if a.progres>=100 else "dibangun","progres":a.progres,"day":d["day"],"usulan":a.usulan or ""}]
 d["riwayat"].append({"day":d["day"],"teks":f"{a.nama} mulai dibangun di {a.tile.upper()}"})
elif a.cmd=="progres":
 for x in d["bangunan"]:
  if x["id"]==a.id:x["progres"]=a.progres;x["status"]="selesai" if a.progres>=100 else "dibangun"
elif a.cmd=="vote":d["vote"]["opsi"]=[{"nama":o.split("=")[0],"like":int(o.split("=")[1])} for o in a.opsi]
elif a.cmd=="berita":d["berita"].insert(0,a.teks)
save(d);print(f"OK: Day {d['day']}, {d['warga']} warga, sumber daya {d['sumberdaya']}")
