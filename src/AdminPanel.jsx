import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://agxfjhicsdgzlhokzbht.supabase.co",
  "sb_publishable_l7WmyDCti0DDz52tXyxxqQ_Zl-YsCRQ"
);

const SKILLS = ["Electrician","Carpenter","Plumber","Painter","AC Repair","Welder","Mason"];
const genPIN = () => String(Math.floor(1000 + Math.random() * 9000));

export default function AdminPanel() {
  const [page, setPage]       = useState("login");
  const [pin, setPin]         = useState("");
  const [pinErr, setPinErr]   = useState(false);
  const [tab, setTab]         = useState("dashboard");
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs]       = useState([]);
  const [ads, setAds]         = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState(null);
  const [selWorker, setSelWorker] = useState(null);
  const [selJob, setSelJob]       = useState(null);
  const [amt, setAmt]             = useState("");
  const [qrUrl, setQrUrl]         = useState("");
  const [nw, setNw] = useState({ name:"", skill:"Electrician", phone:"", area:"Jwalapur" });
  const [na, setNa] = useState({ shop_name:"", tagline:"", phone:"", area:"", start_date:"", end_date:"" });

  useEffect(() => {
    if (page === "main") fetchAll();
  }, [page]);

  async function fetchAll() {
    setLoading(true);
    const [w, j, a, s] = await Promise.all([
      supabase.from("workers").select("*").order("created_at", { ascending: false }),
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("ads").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").eq("key", "qr_url").single(),
    ]);
    if (w.data) setWorkers(w.data);
    if (j.data) setJobs(j.data);
    if (a.data) setAds(a.data);
    if (s.data) setQrUrl(s.data.value);
    setLoading(false);
  }

  const commDue       = jobs.filter(j=>j.status==="done"&&!j.comm_paid).reduce((s,j)=>s+(j.commission||0),0);
  const commCollected = jobs.filter(j=>j.comm_paid).reduce((s,j)=>s+(j.commission||0),0);
  const needAmt       = jobs.filter(j=>j.status==="pending").length;
  const activeWorkers = workers.filter(w=>w.active).length;

  // ── LOGIN ──
  if (page === "login") return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:320,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:24,padding:"32px 22px 36px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <img src="/fixxo-logo.png" alt="Fixxo" style={{height:44,objectFit:"contain",marginBottom:14}}/>
        <div style={{fontSize:12,fontWeight:700,color:"#FF6B35",background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.25)",padding:"4px 12px",borderRadius:10,marginBottom:6}}>🔐 Admin Panel</div>
        <p style={{fontSize:12,color:"#8090B0",marginBottom:20}}>Enter your admin PIN</p>
        <div style={{display:"flex",gap:12,marginBottom:8}}>
          {[0,1,2,3].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:pin.length>i?"#FF6B35":"rgba(255,255,255,0.12)",transition:"all 0.2s"}}/>)}
        </div>
        {pinErr && <p style={{fontSize:11,color:"#F87171",marginBottom:8}}>Wrong PIN</p>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,width:"100%",maxWidth:220,marginTop:6}}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
            <button key={i} style={{height:50,borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",color:"#E8EAF0",fontSize:18,fontWeight:600,cursor:k?"pointer":"default",opacity:k?1:0,fontFamily:"'Sora',sans-serif"}}
              onClick={()=>{
                if(!k)return;
                if(k==="⌫"){setPin(p=>p.slice(0,-1));setPinErr(false);return;}
                if(pin.length<4){
                  const np=pin+k; setPin(np);
                  if(np.length===4){
                    setTimeout(()=>{
                      if(np==="9999"){setPage("main");setPin("");}
                      else{setPinErr(true);setPin("");}
                    },200);
                  }
                }
              }}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  );

  const Tab = (id,label) => (
    <button onClick={()=>setTab(id)} style={{whiteSpace:"nowrap",padding:"8px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:tab===id?"linear-gradient(135deg,#FF6B35,#FF8C5A)":"rgba(255,255,255,0.04)",color:tab===id?"#fff":"#8090B0",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",flexShrink:0}}>
      {label}
    </button>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Sora',sans-serif",paddingBottom:48}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <img src="/fixxo-logo.png" alt="Fixxo" style={{height:32,objectFit:"contain"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {loading && <span style={{fontSize:11,color:"#8090B0"}}>syncing...</span>}
          <span style={{fontSize:11,fontWeight:700,color:"#FF6B35",background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.2)",padding:"3px 10px",borderRadius:10}}>🔐 Admin</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,padding:"12px 16px",overflowX:"auto",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        {Tab("dashboard","📊 Dashboard")}
        {Tab("workers","👷 Workers")}
        {Tab("jobs","🔨 Jobs")}
        {Tab("ads","📢 Ads")}
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {icon:"👷",val:activeWorkers,       label:"Active Workers", color:"#60D4A0"},
              {icon:"🔨",val:jobs.length,          label:"Total Jobs",     color:"#60B4FF"},
              {icon:"⏳",val:`₹${commDue}`,        label:"Comm. Due",      color:"#FF6B35"},
              {icon:"✅",val:`₹${commCollected}`,  label:"Collected",      color:"#FBBF24"},
            ].map((c,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"15px 13px"}}>
                <div style={{fontSize:20,marginBottom:6}}>{c.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:c.color,letterSpacing:"-0.5px"}}>{c.val}</div>
                <div style={{fontSize:11,color:"#8090B0",marginTop:3}}>{c.label}</div>
              </div>
            ))}
          </div>

          {needAmt>0 && (
            <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.18)",borderRadius:16,padding:"13px 15px",display:"flex",alignItems:"center",gap:11}}>
              <span style={{fontSize:20}}>🔔</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#E8EAF0",marginBottom:2}}>{needAmt} job{needAmt>1?"s":""} need amount entry</div>
                <div style={{fontSize:11,color:"#8090B0"}}>Call customer & update the amount</div>
              </div>
              <button onClick={()=>setTab("jobs")} style={{background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.25)",color:"#FBBF24",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>View →</button>
            </div>
          )}

          {/* QR Upload */}
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"15px",display:"flex",alignItems:"center",gap:13}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:"#E8EAF0",marginBottom:3}}>Your Payment QR</div>
              <div style={{fontSize:11,color:"#8090B0",marginBottom:5}}>Workers see this when paying commission</div>
              {qrUrl
                ? <div style={{fontSize:12,color:"#60D4A0",fontWeight:600}}>✅ QR uploaded & live</div>
                : <div style={{fontSize:12,color:"#FBBF24",fontWeight:600}}>⚠️ Not uploaded yet</div>
              }
            </div>
            {qrUrl
              ? <img src={qrUrl} style={{width:60,height:60,borderRadius:10,border:"1px solid rgba(255,255,255,0.1)"}}/>
              : <label style={{background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"#fff",border:"none",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",whiteSpace:"nowrap"}}>
                  📤 Upload QR
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={async(e)=>{
                    const file = e.target.files[0];
                    if(!file) return;
                    const ext = file.name.split('.').pop();
                    const path = `qr/payment-qr.${ext}`;
                    const { data, error } = await supabase.storage.from('fixxo').upload(path, file, { upsert: true });
                    if(!error){
                      const { data: urlData } = supabase.storage.from('fixxo').getPublicUrl(path);
                      const url = urlData.publicUrl;
                      await supabase.from('settings').upsert({ key: 'qr_url', value: url });
                      setQrUrl(url);
                    }
                  }}/>
                </label>
            }
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:2}}>
            <span style={{fontSize:14,fontWeight:700,color:"#E8EAF0"}}>Recent Jobs</span>
            <button onClick={()=>setTab("jobs")} style={{fontSize:12,color:"#FF6B35",background:"none",border:"none",cursor:"pointer",fontFamily:"'Sora',sans-serif",fontWeight:600}}>See all →</button>
          </div>
          {jobs.slice(0,3).map(j=>(
            <div key={j.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"11px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#E8EAF0",marginBottom:2}}>{j.worker_name}</div>
                <div style={{fontSize:11,color:"#8090B0"}}>{j.date} · {j.customer_phone}</div>
              </div>
              {j.amount
                ? <span style={{fontSize:14,fontWeight:800,color:"#60D4A0"}}>₹{j.amount}</span>
                : <button onClick={()=>{setSelJob(j);setAmt("");setModal("enterAmt");}} style={{background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.25)",color:"#FF8C5A",borderRadius:10,padding:"6px 11px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Enter ₹</button>
              }
            </div>
          ))}
          <button onClick={fetchAll} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#8090B0",borderRadius:12,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>🔄 Refresh Data</button>
        </>}

        {/* ── WORKERS ── */}
        {tab==="workers" && <>
          <button onClick={()=>{setNw({name:"",skill:"Electrician",phone:"",area:"Jwalapur"});setModal("addWorker");}} style={{background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"#fff",border:"none",borderRadius:14,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>+ Add New Worker</button>
          {workers.map(w=>(
            <div key={w.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"13px 15px",display:"flex",alignItems:"center",gap:11}}>
              {w.photo_url
                ? <img src={w.photo_url} alt={w.name} style={{width:44,height:44,borderRadius:12,objectFit:"cover",border:"2px solid rgba(255,255,255,0.08)"}}/>
                : <div style={{width:44,height:44,borderRadius:12,background:"rgba(255,107,53,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👷</div>
              }
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"#E8EAF0",marginBottom:2}}>{w.name}</div>
                <div style={{fontSize:11,color:"#8090B0"}}>{w.skill} · {w.phone}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:w.active?"#4ADE80":"#F87171"}}/>
                <button onClick={()=>{setSelWorker(w);setModal("showPin");}} style={{background:"rgba(96,180,255,0.1)",border:"1px solid rgba(96,180,255,0.22)",color:"#60B4FF",borderRadius:9,padding:"5px 9px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>PIN</button>
                <button onClick={async()=>{
                  const newVal = !w.active;
                  await supabase.from("workers").update({active:newVal}).eq("id",w.id);
                  setWorkers(ws=>ws.map(x=>x.id===w.id?{...x,active:newVal}:x));
                }} style={{background:w.active?"rgba(248,113,113,0.1)":"rgba(74,222,128,0.1)",border:"1px solid rgba(255,255,255,0.1)",color:w.active?"#F87171":"#4ADE80",borderRadius:9,padding:"5px 9px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
                  {w.active?"Remove":"Restore"}
                </button>
              </div>
            </div>
          ))}
        </>}

        {/* ── JOBS ── */}
        {tab==="jobs" && jobs.map(j=>(
          <div key={j.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"13px 15px",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:14,fontWeight:700,color:"#E8EAF0"}}>{j.worker_name}</span>
              <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,
                background:j.comm_paid?"rgba(74,222,128,0.15)":j.status==="pending"?"rgba(251,191,36,0.15)":"rgba(255,107,53,0.15)",
                color:j.comm_paid?"#4ADE80":j.status==="pending"?"#FBBF24":"#FF8C5A"}}>
                {j.comm_paid?"✅ Paid":j.status==="pending"?"⏳ Need Amount":"💰 Due"}
              </span>
            </div>
            <div style={{fontSize:11,color:"#8090B0"}}>{j.date} · Customer: {j.customer_phone}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
              {j.amount
                ? <span style={{fontSize:13,color:"#C0C8E0"}}>₹{j.amount} charged · <span style={{color:"#FF8C5A"}}>₹{j.commission} comm.</span></span>
                : <button onClick={()=>{setSelJob(j);setAmt("");setModal("enterAmt");}} style={{background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"#fff",border:"none",borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>📞 Enter Amount</button>
              }
              {j.amount&&!j.comm_paid&&(
                <button onClick={async()=>{
                  await supabase.from("jobs").update({comm_paid:true}).eq("id",j.id);
                  setJobs(js=>js.map(x=>x.id===j.id?{...x,comm_paid:true}:x));
                }} style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.22)",color:"#4ADE80",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Mark Paid</button>
              )}
            </div>
          </div>
        ))}

        {/* ── ADS ── */}
        {tab==="ads" && <>
          <button onClick={()=>{setNa({shop_name:"",tagline:"",phone:"",area:"",start_date:"",end_date:""});setModal("addAd");}} style={{background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"#fff",border:"none",borderRadius:14,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>+ Add New Ad</button>
          {ads.map(ad=>(
            <div key={ad.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"15px",display:"flex",flexDirection:"column",gap:7}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:15,fontWeight:700,color:"#E8EAF0"}}>{ad.shop_name}</span>
                <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:10,background:ad.active?"rgba(74,222,128,0.15)":"rgba(248,113,113,0.15)",color:ad.active?"#4ADE80":"#F87171"}}>{ad.active?"🟢 Live":"🔴 Off"}</span>
              </div>
              <div style={{fontSize:12,color:"#C0C8E0",lineHeight:1.5}}>{ad.tagline}</div>
              <div style={{fontSize:11,color:"#8090B0"}}>📞 {ad.phone} · 📍 {ad.area}</div>
              <div style={{fontSize:11,color:"#FF8C5A",fontWeight:600}}>📅 {ad.start_date} → {ad.end_date}</div>
              <button onClick={async()=>{
                const newVal = !ad.active;
                await supabase.from("ads").update({active:newVal}).eq("id",ad.id);
                setAds(a=>a.map(x=>x.id===ad.id?{...x,active:newVal}:x));
              }} style={{background:ad.active?"rgba(248,113,113,0.1)":"rgba(74,222,128,0.1)",border:"1px solid rgba(255,255,255,0.08)",color:ad.active?"#F87171":"#4ADE80",borderRadius:10,padding:"7px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",alignSelf:"flex-start"}}>
                {ad.active?"Deactivate":"Reactivate"}
              </button>
            </div>
          ))}
        </>}
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#13131C",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"22px 22px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:12,maxHeight:"85vh",overflowY:"auto"}}>

            {/* Add Worker */}
            {modal==="addWorker" && <>
              <h3 style={{fontSize:19,fontWeight:800,color:"#E8EAF0",textAlign:"center"}}>Add New Worker</h3>
              {[{l:"Full Name",k:"name",p:"e.g. Ramesh Kumar"},{l:"Phone",k:"phone",p:"10-digit number"},{l:"Area",k:"area",p:"e.g. Jwalapur"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,color:"#8090B0",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.l}</div>
                  <input style={inStyle} placeholder={f.p} value={nw[f.k]} onChange={e=>setNw(n=>({...n,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <div>
                <div style={{fontSize:11,color:"#8090B0",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>Skill</div>
                <select style={inStyle} value={nw.skill} onChange={e=>setNw(n=>({...n,skill:e.target.value}))}>
                  {SKILLS.map(sk=><option key={sk}>{sk}</option>)}
                </select>
              </div>
              <button onClick={async()=>{
                if(!nw.name||!nw.phone) return;
                const pin = genPIN();
                const { data, error } = await supabase.from("workers").insert([{...nw, pin, active:true}]).select().single();
                if(!error && data){
                  setWorkers(ws=>[data,...ws]);
                  setModal("showPin");
                  setSelWorker({...data, pin});
                }
              }} style={saveBtn}>Add Worker & Get PIN</button>
              <button onClick={()=>setModal(null)} style={cancelBtn}>Cancel</button>
            </>}

            {/* Show PIN */}
            {modal==="showPin" && selWorker && <>
              <div style={{fontSize:38,textAlign:"center"}}>🔑</div>
              <h3 style={{fontSize:19,fontWeight:800,color:"#E8EAF0",textAlign:"center"}}>{selWorker.name}'s PIN</h3>
              <p style={{fontSize:13,color:"#8090B0",textAlign:"center"}}>Share via WhatsApp with the worker</p>
              <div style={{fontSize:42,fontWeight:800,color:"#FF6B35",letterSpacing:"14px",textAlign:"center",background:"rgba(255,107,53,0.08)",border:"1px solid rgba(255,107,53,0.2)",borderRadius:16,padding:"16px"}}>{selWorker.pin}</div>
              <p style={{fontSize:12,color:"#FBBF24",textAlign:"center",fontWeight:500}}>⚠️ Screenshot this — save it safely</p>
              <button onClick={async()=>{
                const newPin = genPIN();
                await supabase.from("workers").update({pin:newPin}).eq("id",selWorker.id);
                setWorkers(ws=>ws.map(x=>x.id===selWorker.id?{...x,pin:newPin}:x));
                setSelWorker(s=>({...s,pin:newPin}));
              }} style={saveBtn}>🔄 Generate New PIN</button>
              <button onClick={()=>setModal(null)} style={cancelBtn}>Done</button>
            </>}

            {/* Enter Amount */}
            {modal==="enterAmt" && selJob && <>
              <div style={{fontSize:38,textAlign:"center"}}>📞</div>
              <h3 style={{fontSize:19,fontWeight:800,color:"#E8EAF0",textAlign:"center"}}>Enter Job Amount</h3>
              <p style={{fontSize:13,color:"#8090B0",textAlign:"center"}}>{selJob.worker_name} · {selJob.date}</p>
              <p style={{fontSize:12,color:"#8090B0",textAlign:"center"}}>Customer: {selJob.customer_phone}</p>
              <div>
                <div style={{fontSize:11,color:"#8090B0",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>Amount customer paid (₹)</div>
                <input type="number" style={inStyle} placeholder="e.g. 500" value={amt} onChange={e=>setAmt(e.target.value)}/>
              </div>
              {amt&&<div style={{fontSize:13,color:"#C0C8E0",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 13px",textAlign:"center"}}>
                Commission (12%): <strong style={{color:"#FF6B35"}}>₹{Math.round(Number(amt)*0.12)}</strong>
              </div>}
              <button onClick={async()=>{
                if(!amt) return;
                const a = Number(amt);
                const comm = Math.round(a*0.12);
                await supabase.from("jobs").update({amount:a, commission:comm, status:"done"}).eq("id",selJob.id);
                setJobs(js=>js.map(x=>x.id===selJob.id?{...x,amount:a,commission:comm,status:"done"}:x));
                setModal(null); setAmt("");
              }} style={saveBtn}>Save Amount</button>
              <button onClick={()=>setModal(null)} style={cancelBtn}>Cancel</button>
            </>}

            {/* Add Ad */}
            {modal==="addAd" && <>
              <h3 style={{fontSize:19,fontWeight:800,color:"#E8EAF0",textAlign:"center"}}>Add New Ad</h3>
              {[{l:"Shop Name",k:"shop_name",p:"e.g. Sharma Hardware"},{l:"Tagline",k:"tagline",p:"Short description"},{l:"Phone",k:"phone",p:"Shop number"},{l:"Area",k:"area",p:"e.g. Main Market"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,color:"#8090B0",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.l}</div>
                  <input style={inStyle} placeholder={f.p} value={na[f.k]} onChange={e=>setNa(n=>({...n,[f.k]:e.target.value}))}/>
                </div>
              ))}
              {[{l:"Start Date",k:"start_date"},{l:"End Date",k:"end_date"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:11,color:"#8090B0",fontWeight:600,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.5px"}}>{f.l}</div>
                  <input type="date" style={inStyle} value={na[f.k]} onChange={e=>setNa(n=>({...n,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <button onClick={async()=>{
                if(!na.shop_name||!na.phone) return;
                const { data, error } = await supabase.from("ads").insert([{...na,active:true}]).select().single();
                if(!error && data){ setAds(a=>[data,...a]); setModal(null); }
              }} style={saveBtn}>Publish Ad</button>
              <button onClick={()=>setModal(null)} style={cancelBtn}>Cancel</button>
            </>}

          </div>
        </div>
      )}
    </div>
  );
}

const inStyle = {width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 13px",fontSize:14,color:"#E8EAF0",fontFamily:"'Sora',sans-serif",outline:"none"};
const saveBtn = {background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"#fff",border:"none",borderRadius:13,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"};
const cancelBtn = {background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"#8090B0",borderRadius:13,padding:"12px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"};
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}select option{background:#13131C;color:#E8EAF0}input[type=date]{color-scheme:dark}`;
