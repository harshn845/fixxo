import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://agxfjhicsdgzlhokzbht.supabase.co",
  "sb_publishable_l7WmyDCti0DDz52tXyxxqQ_Zl-YsCRQ"
);

export default function WorkerPanel() {
  const [page, setPage]       = useState("login");
  const [phone, setPhone]     = useState("");
  const [pin, setPin]         = useState("");
  const [step, setStep]       = useState("phone"); // phone | pin
  const [pinErr, setPinErr]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [worker, setWorker]   = useState(null);
  const [jobs, setJobs]       = useState([]);
  const [qrUrl, setQrUrl]     = useState("");
  const [tab, setTab]         = useState("jobs");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (page === "main") {
      fetchWorkerData();
      setTimeout(() => setVisible(true), 80);
    }
  }, [page]);

  async function fetchWorkerData() {
    if (!worker) return;
    const [j, s] = await Promise.all([
      supabase.from("jobs").select("*").eq("worker_id", worker.id).order("created_at", { ascending: false }),
      supabase.from("settings").select("*").eq("key", "qr_url").single(),
    ]);
    if (j.data) setJobs(j.data);
    if (s.data) setQrUrl(s.data.value);
  }

  async function handleLogin() {
    if (phone.length !== 10) return;
    setLoading(true);
    const { data, error } = await supabase.from("workers").select("*").eq("phone", phone).eq("active", true).single();
    setLoading(false);
    if (error || !data) { setPinErr(true); return; }
    setWorker(data);
    setStep("pin");
    setPinErr(false);
  }

  async function handlePinSubmit(enteredPin) {
    if (!worker) return;
    if (enteredPin === worker.pin) {
      setPage("main");
    } else {
      setPinErr(true);
      setPin("");
    }
  }

  const totalComm    = jobs.filter(j=>j.status==="done").reduce((s,j)=>s+(j.commission||0),0);
  const paidComm     = jobs.filter(j=>j.comm_paid).reduce((s,j)=>s+(j.commission||0),0);
  const pendingComm  = totalComm - paidComm;

  // ── LOGIN ──
  if (page === "login") return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",padding:20}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:320,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:24,padding:"32px 22px 36px",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <img src="/fixxo-logo.png" alt="Fixxo" style={{height:44,objectFit:"contain",marginBottom:14}}/>
        <div style={{fontSize:12,fontWeight:700,color:"#60B4FF",background:"rgba(96,180,255,0.12)",border:"1px solid rgba(96,180,255,0.25)",padding:"4px 12px",borderRadius:10,marginBottom:20}}>👷 Worker Login</div>

        {/* Step 1 — Phone */}
        {step === "phone" && <>
          <p style={{fontSize:13,color:"#8090B0",marginBottom:16,textAlign:"center"}}>Enter your registered phone number</p>
          <input
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"13px",fontSize:16,color:"#E8EAF0",fontFamily:"'Sora',sans-serif",outline:"none",textAlign:"center",letterSpacing:"2px",marginBottom:10}}
            placeholder="10-digit number" type="tel" maxLength={10} value={phone}
            onChange={e=>{ setPhone(e.target.value.replace(/\D/,"")); setPinErr(false); }}
          />
          {pinErr && <p style={{fontSize:12,color:"#F87171",marginBottom:10}}>Number not found. Contact admin.</p>}
          <button onClick={handleLogin} style={{width:"100%",background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",opacity:phone.length===10?1:0.5}}>
            {loading ? "Checking..." : "Continue →"}
          </button>
        </>}

        {/* Step 2 — PIN */}
        {step === "pin" && <>
          <p style={{fontSize:13,color:"#8090B0",marginBottom:4,textAlign:"center"}}>Welcome, {worker?.name?.split(" ")[0]}!</p>
          <p style={{fontSize:12,color:"#6060A0",marginBottom:20,textAlign:"center"}}>Enter your 4-digit PIN</p>
          <div style={{display:"flex",gap:12,marginBottom:8}}>
            {[0,1,2,3].map(i=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:pin.length>i?"#FF6B35":"rgba(255,255,255,0.12)",transition:"all 0.2s"}}/>)}
          </div>
          {pinErr && <p style={{fontSize:12,color:"#F87171",marginBottom:8}}>Wrong PIN. Try again.</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,width:"100%",maxWidth:220,marginTop:6}}>
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
              <button key={i} style={{height:50,borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",color:"#E8EAF0",fontSize:18,fontWeight:600,cursor:k?"pointer":"default",opacity:k?1:0,fontFamily:"'Sora',sans-serif"}}
                onClick={()=>{
                  if(!k)return;
                  if(k==="⌫"){setPin(p=>p.slice(0,-1));setPinErr(false);return;}
                  if(pin.length<4){
                    const np=pin+k; setPin(np);
                    if(np.length===4) setTimeout(()=>handlePinSubmit(np),200);
                  }
                }}>{k}</button>
            ))}
          </div>
          <button onClick={()=>{setStep("phone");setPin("");setPinErr(false);}} style={{marginTop:16,fontSize:12,color:"#6060A0",background:"none",border:"none",cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>← Change number</button>
        </>}
      </div>
    </div>
  );

  // ── MAIN ──
  return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Sora',sans-serif",paddingBottom:48}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {worker?.photo_url
            ? <img src={worker.photo_url} style={{width:38,height:38,borderRadius:11,objectFit:"cover",border:"2px solid rgba(255,107,53,0.3)"}}/>
            : <div style={{width:38,height:38,borderRadius:11,background:"rgba(255,107,53,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👷</div>
          }
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#E8EAF0"}}>{worker?.name}</div>
            <div style={{fontSize:11,color:"#6060A0"}}>⚡ {worker?.skill} · {worker?.area}</div>
          </div>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"#4ADE80",background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",padding:"3px 10px",borderRadius:10}}>✓ Verified</div>
      </div>

      {/* Summary Cards */}
      <div style={{maxWidth:480,margin:"0 auto",padding:"16px 16px 0"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div style={{background:"linear-gradient(135deg,#1A1A2E,#2D2D44)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,padding:"16px 14px",opacity:visible?1:0,transition:"all 0.4s ease"}}>
            <div style={{fontSize:11,color:"#6060A0",fontWeight:500,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>Total Jobs</div>
            <div style={{fontSize:22,fontWeight:800,color:"#FF6B35",letterSpacing:"-0.5px"}}>{jobs.length}</div>
          </div>
          <div style={{background:"linear-gradient(135deg,#0A2818,#1A4020)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,padding:"16px 14px",opacity:visible?1:0,transition:"all 0.4s ease 0.07s"}}>
            <div style={{fontSize:11,color:"#6060A0",fontWeight:500,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>Total Earned</div>
            <div style={{fontSize:22,fontWeight:800,color:"#4ADE80",letterSpacing:"-0.5px"}}>₹{jobs.filter(j=>j.amount).reduce((s,j)=>s+(j.amount||0),0)}</div>
          </div>
        </div>
        <div style={{background:"linear-gradient(135deg,#2D1A0E,#3D2A1A)",border:"1px solid rgba(255,107,53,0.2)",borderRadius:18,padding:"16px",opacity:visible?1:0,transition:"all 0.4s ease 0.14s"}}>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,color:"#6060A0",fontWeight:500,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.5px"}}>Commission Due</div>
              <div style={{fontSize:28,fontWeight:800,color:"#FF6B35",letterSpacing:"-1px"}}>₹{pendingComm}</div>
              <div style={{fontSize:11,color:"#6060A0",marginTop:2}}>of ₹{totalComm} total</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"#6060A0",marginBottom:3}}>Paid</div>
              <div style={{fontSize:18,fontWeight:700,color:"#4ADE80"}}>₹{paidComm}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,padding:"16px 16px 0",maxWidth:480,margin:"0 auto"}}>
        {["jobs","pay"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"11px",borderRadius:14,border:"1px solid rgba(255,255,255,0.08)",background:tab===t?"linear-gradient(135deg,#FF6B35,#FF8C5A)":"rgba(255,255,255,0.04)",color:tab===t?"#FFFFFF":"#6060A0",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
            {t==="jobs"?"🔨 My Jobs":"💳 Pay Commission"}
          </button>
        ))}
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>

        {/* Jobs Tab */}
        {tab==="jobs" && (jobs.length===0
          ? <div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:40,marginBottom:12}}>🔨</div><p style={{color:"#6060A0",fontSize:14}}>No jobs yet. They'll appear here once confirmed.</p></div>
          : jobs.map((j,i)=>(
            <div key={j.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,opacity:visible?1:0,transition:`all 0.4s ease ${i*0.06}s`}}>
              <div style={{width:44,height:44,background:"rgba(255,107,53,0.12)",border:"1px solid rgba(255,107,53,0.2)",borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:13,fontWeight:800,color:"#FF6B35",lineHeight:1}}>{new Date(j.date).getDate()}</span>
                <span style={{fontSize:9,color:"#FF8C5A",fontWeight:500,textTransform:"uppercase"}}>{new Date(j.date).toLocaleString("en",{month:"short"})}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:"#6060A0",marginBottom:4}}>Customer: {j.customer_phone}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16,fontWeight:800,color:"#E8EAF0",letterSpacing:"-0.3px"}}>{j.amount?`₹${j.amount}`:"Pending"}</span>
                  {j.commission&&<span style={{fontSize:11,color:"#FF6B35",fontWeight:600,background:"rgba(255,107,53,0.1)",padding:"2px 8px",borderRadius:6}}>Comm: ₹{j.commission}</span>}
                </div>
              </div>
              <div style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:10,background:j.comm_paid?"rgba(74,222,128,0.15)":"rgba(251,191,36,0.15)",color:j.comm_paid?"#4ADE80":"#FBBF24",whiteSpace:"nowrap"}}>
                {j.comm_paid?"✅ Paid":"⏳ Due"}
              </div>
            </div>
          ))
        )}

        {/* Pay Tab */}
        {tab==="pay" && (pendingComm===0
          ? <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:52,marginBottom:16}}>🎉</div><h3 style={{fontSize:24,fontWeight:800,color:"#E8EAF0",marginBottom:8}}>All Clear!</h3><p style={{fontSize:14,color:"#6060A0"}}>No pending commission. You're all up to date!</p></div>
          : <>
            <div style={{background:"linear-gradient(135deg,#2D1A0E,#3D2A1A)",border:"1px solid rgba(255,107,53,0.25)",borderRadius:18,padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:11,color:"#A0A0B8",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>Pending Commission</div>
                <div style={{fontSize:32,fontWeight:800,color:"#FF6B35",letterSpacing:"-1px"}}>₹{pendingComm}</div>
                <div style={{fontSize:12,color:"#6060A0"}}>{jobs.filter(j=>j.status==="done"&&!j.comm_paid).length} job(s) unpaid</div>
              </div>
              <div style={{fontSize:36}}>💰</div>
            </div>
            <p style={{fontSize:14,color:"#A0A0B8",lineHeight:1.6,textAlign:"center"}}>Scan the QR below with any UPI app and pay <strong style={{color:"#FF6B35"}}>₹{pendingComm}</strong></p>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"28px 20px 16px",display:"flex",flexDirection:"column",alignItems:"center"}}>
              {qrUrl
                ? <img src={qrUrl} alt="Payment QR" style={{width:200,height:200,borderRadius:16,marginBottom:12}}/>
                : <div style={{width:200,height:200,background:"rgba(255,255,255,0.04)",border:"2px dashed rgba(255,107,53,0.3)",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:12,gap:8}}>
                    <span style={{fontSize:36}}>📲</span>
                    <span style={{fontSize:14,fontWeight:700,color:"#E8EAF0"}}>QR Code</span>
                    <span style={{fontSize:11,color:"#6060A0",textAlign:"center",padding:"0 16px"}}>Admin will add payment QR soon</span>
                  </div>
              }
              <div style={{fontSize:12,color:"#6060A0",fontWeight:500}}>Fixxo · Jwalapur</div>
            </div>
            <div style={{display:"flex",gap:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"12px 14px"}}>
              <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
              <span style={{fontSize:12,color:"#6060A0",lineHeight:1.6}}>After payment, inform your manager via WhatsApp. Your status will be updated within 24 hours.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`;
