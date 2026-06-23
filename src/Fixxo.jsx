import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://agxfjhicsdgzlhokzbht.supabase.co",
  "sb_publishable_l7WmyDCti0DDz52tXyxxqQ_Zl-YsCRQ"
);

const CATEGORIES = ["All","Electrician","Carpenter","Plumber","Painter","AC Repair"];
const SKILL_COLORS = {
  Electrician: { bg:"#FFF3CD", text:"#B8860B", dot:"#F4C430" },
  Carpenter:   { bg:"#E8D5B7", text:"#8B4513", dot:"#CD853F" },
  Plumber:     { bg:"#CCE5FF", text:"#004085", dot:"#0066CC" },
  Painter:     { bg:"#D4EDDA", text:"#155724", dot:"#28A745" },
  "AC Repair": { bg:"#D1ECF1", text:"#0C5460", dot:"#17A2B8" },
};

export default function Fixxo() {
  const [workers, setWorkers]   = useState([]);
  const [ad, setAd]             = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [calledWorker, setCalledWorker] = useState(null);
  const [showPopup, setShowPopup]       = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [custPhone, setCustPhone] = useState("");
  const [toast, setToast]         = useState("");
  const [visible, setVisible]     = useState(false);

  useEffect(() => {
    fetchData();
    setTimeout(() => setVisible(true), 100);
  }, []);

  async function fetchData() {
    setLoading(true);
    const [w, a] = await Promise.all([
      supabase.from("workers").select("*").eq("active", true).order("created_at", { ascending: false }),
      supabase.from("ads").select("*").eq("active", true).order("created_at", { ascending: false }).limit(1).single(),
    ]);
    if (w.data) setWorkers(w.data);
    if (a.data) setAd(a.data);
    setLoading(false);
  }

  const filtered = workers.filter(w => {
    const matchCat = category === "All" || w.skill === category;
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.skill.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleCall(worker) {
    setCalledWorker(worker);
    window.location.href = `tel:${worker.phone}`;
    setTimeout(() => setShowPopup(true), 3000);
  }

  async function handleJobConfirm() {
    if (custPhone.length !== 10) return;
    const { error } = await supabase.from("jobs").insert([{
      worker_id: calledWorker.id,
      worker_name: calledWorker.name,
      customer_phone: custPhone,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    }]);
    setShowPhoneModal(false);
    setCustPhone("");
    setCalledWorker(null);
    if (!error) {
      setToast("✅ Job entry created! We'll call you to confirm the details.");
      setTimeout(() => setToast(""), 4000);
    }
  }

  return (
    <div style={{minHeight:"100vh",background:"#FAFAF8",fontFamily:"'Sora',sans-serif",overflowX:"hidden"}}>
      <style>{CSS}</style>

      {/* Header */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(26,26,46,0.97)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 20px"}}>
        <div style={{maxWidth:480,margin:"0 auto",height:58,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <img src="/fixxo-logo.png" alt="Fixxo" style={{height:36,objectFit:"contain"}}/>
          <div style={{fontSize:12,fontWeight:600,color:"#FF8C5A",background:"rgba(255,107,53,0.15)",padding:"4px 10px",borderRadius:20,border:"1px solid rgba(255,107,53,0.3)"}}>📍 Jwalapur</div>
        </div>
      </header>

      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#1A1A2E 0%,#2D2D44 50%,#1A1A2E 100%)",padding:"36px 20px 28px"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{display:"inline-block",background:"rgba(255,107,53,0.15)",border:"1px solid rgba(255,107,53,0.3)",color:"#FF8C5A",fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:20,marginBottom:16,letterSpacing:"0.5px"}}>⚡ Verified Local Experts</div>
          <h1 style={{fontSize:34,fontWeight:800,color:"#FFFFFF",lineHeight:1.15,marginBottom:12,letterSpacing:"-1px"}}>
            Apna Kaam<br/><span style={{color:"#FF6B35"}}>Sahi Haath Mein</span>
          </h1>
          <p style={{fontSize:14,color:"#A0A0B8",lineHeight:1.6,marginBottom:24}}>Electricians, Carpenters, Plumbers & more — all verified, all local.</p>
          <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"12px 16px",gap:10}}>
            <span style={{fontSize:16,opacity:0.7}}>🔍</span>
            <input style={{flex:1,background:"transparent",border:"none",outline:"none",color:"#FFFFFF",fontSize:14,fontFamily:"'Sora',sans-serif"}} placeholder="Search by skill or name..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      {ad && (
        <section style={{maxWidth:480,margin:"0 auto",padding:"16px 20px 0"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#AAA",letterSpacing:"1px",textTransform:"uppercase",marginBottom:6}}>📢 Sponsored</div>
          <div style={{position:"relative",background:"linear-gradient(135deg,#1A1A2E 0%,#2D1A0E 100%)",borderRadius:20,padding:"18px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,overflow:"hidden",border:"1px solid rgba(255,107,53,0.25)",boxShadow:"0 8px 32px rgba(255,107,53,0.15)"}}>
            <div style={{position:"absolute",top:-30,left:-30,width:120,height:120,background:"radial-gradient(circle,rgba(255,107,53,0.25) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,flex:1,zIndex:1}}>
              <div style={{width:48,height:48,flexShrink:0,background:"rgba(255,107,53,0.15)",border:"1px solid rgba(255,107,53,0.3)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔩</div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:"#FFFFFF",marginBottom:3}}>{ad.shop_name}</div>
                <div style={{fontSize:11,color:"#A0A0B8",lineHeight:1.5,marginBottom:5}}>{ad.tagline}</div>
                <div style={{fontSize:11,color:"#FF8C5A",fontWeight:600}}>📍 {ad.area}</div>
              </div>
            </div>
            <a href={`tel:${ad.phone}`} style={{flexShrink:0,background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"white",border:"none",borderRadius:12,padding:"10px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 14px #FF6B3540",textDecoration:"none",display:"inline-flex",alignItems:"center",zIndex:1,whiteSpace:"nowrap"}}>📞 Call</a>
          </div>
        </section>
      )}

      {/* Categories */}
      <section style={{padding:"20px 0 4px"}}>
        <div style={{display:"flex",gap:8,paddingLeft:20,paddingRight:20,overflowX:"auto",maxWidth:480,margin:"0 auto"}}>
          {CATEGORIES.map(cat=>(
            <button key={cat} style={{whiteSpace:"nowrap",padding:"8px 16px",borderRadius:24,border:category===cat?"1.5px solid #FF6B35":"1.5px solid #E8E4DF",background:category===cat?"linear-gradient(135deg,#FF6B35,#FF8C5A)":"#FFFFFF",color:category===cat?"#FFFFFF":"#666",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",flexShrink:0,boxShadow:category===cat?"0 4px 12px #FF6B3530":"none"}} onClick={()=>setCategory(cat)}>
              {cat==="All"?"🔧 ":cat==="Electrician"?"⚡ ":cat==="Carpenter"?"🪚 ":cat==="Plumber"?"🔧 ":cat==="Painter"?"🎨 ":"❄️ "}{cat}
            </button>
          ))}
        </div>
      </section>

      {/* Workers */}
      <section style={{padding:"16px 20px 40px",maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:700,color:"#1A1A1A",letterSpacing:"-0.3px"}}>{category==="All"?"All Workers":category+"s"}</h2>
          <span style={{fontSize:12,color:"#999",fontWeight:500,background:"#F5F5F5",padding:"3px 10px",borderRadius:12}}>{filtered.length} listed</span>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#999",fontSize:14}}>Loading workers...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#999",fontSize:14}}>No workers found</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {filtered.map((w,i)=>{
              const colors = SKILL_COLORS[w.skill] || SKILL_COLORS["Electrician"];
              return (
                <div key={w.id} style={{background:"#FFFFFF",borderRadius:20,padding:"18px",boxShadow:"0 2px 16px rgba(0,0,0,0.06)",border:"1px solid #F0EDE8",display:"flex",alignItems:"center",gap:14,cursor:"pointer",opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(20px)",transition:`all 0.4s ease ${i*0.07}s`}} onClick={()=>setSelected(w)}>
                  <div style={{position:"relative",flexShrink:0}}>
                    {w.photo_url
                      ? <img src={w.photo_url} alt={w.name} style={{width:68,height:68,borderRadius:18,objectFit:"cover",border:"2px solid #F0EDE8"}}/>
                      : <div style={{width:68,height:68,borderRadius:18,background:"linear-gradient(135deg,#FF6B3520,#FF6B3510)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:"2px solid #F0EDE8"}}>👷</div>
                    }
                    <div style={{position:"absolute",bottom:-4,right:-4,width:20,height:20,background:"linear-gradient(135deg,#28A745,#20C997)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",fontWeight:700,border:"2px solid white"}}>✓</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <h3 style={{fontSize:15,fontWeight:700,color:"#1A1A1A",marginBottom:5,letterSpacing:"-0.2px"}}>{w.name}</h3>
                    <span style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:8,marginBottom:7,background:colors.bg,color:colors.text}}>
                      <span style={{color:colors.dot,marginRight:4}}>●</span>{w.skill}
                    </span>
                    <div style={{fontSize:11,color:"#888"}}>📍 {w.area}</div>
                  </div>
                  <button style={{flexShrink:0,background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"white",border:"none",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 12px #FF6B3530",whiteSpace:"nowrap"}} onClick={e=>{e.stopPropagation();handleCall(w);}}>📞 Call</button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Worker Detail Modal */}
      {selected && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={()=>setSelected(null)}>
          <div style={{background:"#FFFFFF",borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",width:"100%",maxWidth:480,textAlign:"center",animation:"slideUp 0.3s ease"}} onClick={e=>e.stopPropagation()}>
            <button style={{position:"absolute",top:16,right:16,background:"#F5F5F5",border:"none",borderRadius:"50%",width:32,height:32,fontSize:14,cursor:"pointer",color:"#666"}} onClick={()=>setSelected(null)}>✕</button>
            <div style={{position:"relative",display:"inline-block",marginBottom:14}}>
              {selected.photo_url
                ? <img src={selected.photo_url} alt={selected.name} style={{width:90,height:90,borderRadius:22,objectFit:"cover",border:"3px solid #F0EDE8"}}/>
                : <div style={{width:90,height:90,borderRadius:22,background:"linear-gradient(135deg,#FF6B3520,#FF6B3510)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,border:"3px solid #F0EDE8"}}>👷</div>
              }
              <div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#28A745,#20C997)",color:"white",fontSize:10,fontWeight:700,padding:"2px 10px",borderRadius:10,whiteSpace:"nowrap",border:"2px solid white"}}>✓ Verified</div>
            </div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#1A1A1A",letterSpacing:"-0.5px",marginBottom:4}}>{selected.name}</h2>
            <div style={{display:"inline-flex",alignItems:"center",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:8,margin:"8px auto 16px",background:SKILL_COLORS[selected.skill]?.bg,color:SKILL_COLORS[selected.skill]?.text}}>{selected.skill}</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F8F4F0",border:"1px solid #E8E4DF",borderRadius:14,padding:"14px 16px",marginBottom:20}}>
              <span style={{fontSize:13,color:"#888",fontWeight:500}}>📍 Area</span>
              <span style={{fontSize:15,fontWeight:700,color:"#1A1A1A"}}>{selected.area}</span>
            </div>
            <button style={{width:"100%",background:"linear-gradient(135deg,#FF6B35,#FF8C5A)",color:"white",border:"none",borderRadius:16,padding:"16px",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",boxShadow:"0 6px 20px #FF6B3540"}} onClick={()=>{handleCall(selected);setSelected(null);}}>
              📞 Call {selected.name.split(" ")[0]}
            </button>
          </div>
        </div>
      )}

      {/* Post-Call Popup */}
      {showPopup && calledWorker && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <div style={{background:"#FFFFFF",borderRadius:"24px 24px 0 0",padding:"32px 24px 40px",width:"100%",maxWidth:480,textAlign:"center",animation:"slideUp 0.3s ease"}}>
            <div style={{fontSize:48,marginBottom:16}}>📞</div>
            <h3 style={{fontSize:22,fontWeight:800,color:"#1A1A1A",marginBottom:10,letterSpacing:"-0.5px"}}>Call Complete?</h3>
            <p style={{fontSize:14,color:"#666",lineHeight:1.6,marginBottom:24}}>Did <strong>{calledWorker.name}</strong> agree to come and do the work?</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button style={{background:"linear-gradient(135deg,#28A745,#20C997)",color:"white",border:"none",borderRadius:14,padding:"16px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif"}} onClick={()=>{setShowPopup(false);setShowPhoneModal(true);}}>✅ Yes, He Agreed</button>
              <button style={{background:"#F8F4F0",color:"#666",border:"1px solid #E8E4DF",borderRadius:14,padding:"14px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"}} onClick={()=>{setShowPopup(false);setCalledWorker(null);}}>❌ No, He Didn't</button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
          <div style={{background:"#FFFFFF",borderRadius:"24px 24px 0 0",padding:"32px 24px 40px",width:"100%",maxWidth:480,textAlign:"center",animation:"slideUp 0.3s ease"}}>
            <div style={{fontSize:48,marginBottom:16}}>📱</div>
            <h3 style={{fontSize:22,fontWeight:800,color:"#1A1A1A",marginBottom:10,letterSpacing:"-0.5px"}}>Your Phone Number</h3>
            <p style={{fontSize:14,color:"#666",lineHeight:1.6,marginBottom:20}}>Enter your number so we can confirm the job amount with you after the work is done.</p>
            <input style={{width:"100%",padding:"14px 16px",borderRadius:14,border:"1.5px solid #E8E4DF",fontSize:18,fontWeight:600,fontFamily:"'Sora',sans-serif",textAlign:"center",letterSpacing:"3px",outline:"none",marginBottom:16,color:"#1A1A1A",background:"#FAFAF8"}} placeholder="10-digit number" maxLength={10} value={custPhone} onChange={e=>setCustPhone(e.target.value.replace(/\D/,""))} type="tel"/>
            <button style={{width:"100%",background:"linear-gradient(135deg,#28A745,#20C997)",color:"white",border:"none",borderRadius:14,padding:"16px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Sora',sans-serif",opacity:custPhone.length===10?1:0.5,marginBottom:10}} onClick={handleJobConfirm}>Confirm Job ✅</button>
            <button style={{width:"100%",background:"#F8F4F0",color:"#666",border:"1px solid #E8E4DF",borderRadius:14,padding:"14px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"}} onClick={()=>setShowPhoneModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{position:"fixed",bottom:30,left:"50%",transform:"translateX(-50%)",background:"#1A1A2E",color:"white",padding:"14px 24px",borderRadius:16,fontSize:13,fontWeight:600,zIndex:2000,boxShadow:"0 8px 30px rgba(0,0,0,0.3)",whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center"}}>{toast}</div>}

      {/* Footer */}
      <footer style={{background:"#1A1A2E",padding:"28px 20px",textAlign:"center"}}>
        <img src="/fixxo-logo.png" alt="Fixxo" style={{height:40,objectFit:"contain",marginBottom:8}}/>
        <p style={{fontSize:13,color:"#6060A0",marginBottom:12}}>Connecting Jwalapur with trusted local workers</p>
        <div style={{display:"inline-block",background:"rgba(40,167,69,0.1)",border:"1px solid rgba(40,167,69,0.2)",color:"#5CB85C",fontSize:12,fontWeight:600,padding:"5px 14px",borderRadius:20,marginBottom:20}}>🛡️ All workers personally verified</div>
        <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"0 auto 16px",maxWidth:200}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <a href="/worker" style={{fontSize:12,color:"#6060A0",fontWeight:600,textDecoration:"none",padding:"5px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.03)"}}>👷 Worker Login</a>
          <span style={{color:"#3A3A5A",fontSize:14}}>·</span>
          <a href="/admin" style={{fontSize:12,color:"#6060A0",fontWeight:600,textDecoration:"none",padding:"5px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.03)"}}>🔐 Admin Login</a>
        </div>
      </footer>
    </div>
  );
}

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}input::placeholder{color:rgba(255,255,255,0.4)}::-webkit-scrollbar{height:4px}::-webkit-scrollbar-thumb{background:#FF6B35;border-radius:4px}`;
