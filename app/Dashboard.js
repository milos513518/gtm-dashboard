"use client";
import { useState } from "react";

const fmt = n => (n ?? 0).toLocaleString();
const S = {
  body: { minHeight:"100vh", background:"#080810", color:"#c8c8d0", fontFamily:"'DM Mono',monospace" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 40px", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.015)" },
  title: { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#f0f0ff", letterSpacing:-0.5 },
  sub: { fontSize:10, color:"#555566", letterSpacing:3, marginTop:3 },
  dot: (c) => ({ padding:"4px 10px", borderRadius:6, fontSize:10, letterSpacing:1, border:`1px solid ${c}44`, background:`${c}11`, color:c }),
  tabs: { display:"flex", padding:"0 40px", borderBottom:"1px solid rgba(255,255,255,0.07)" },
  tab: (active) => ({ background:"none", border:"none", cursor:"pointer", padding:"14px 22px", fontSize:10, letterSpacing:2, textTransform:"uppercase", color: active ? "#f0f0ff" : "#555566", borderBottom: active ? "2px solid #7c6ff7" : "2px solid transparent", fontFamily:"'DM Mono',monospace", transition:"all 0.2s" }),
  content: { padding:"32px 40px" },
  grid: (n) => ({ display:"grid", gridTemplateColumns:`repeat(${n},1fr)`, gap:16, marginBottom:24 }),
  stat: (accent) => ({ background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"20px 22px", borderTop:`2px solid ${accent||"rgba(255,255,255,0.07)"}` }),
  slabel: { fontSize:9, letterSpacing:2.5, color:"#555566", textTransform:"uppercase", marginBottom:8 },
  sval: { fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:700, color:"#f0f0ff", letterSpacing:-1 },
  ssub: { fontSize:11, color:"#555566", marginTop:4 },
  panel: { background:"#0f0f1a", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:24, marginBottom:20 },
  ptitle: (c) => ({ fontSize:9, letterSpacing:3, textTransform:"uppercase", color: c||"#555566", marginBottom:18, display:"flex", alignItems:"center", gap:10 }),
  thead: (cols) => ({ display:"grid", gridTemplateColumns:cols, gap:8, fontSize:9, letterSpacing:2, color:"#555566", textTransform:"uppercase", paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:4 }),
  trow: (cols) => ({ display:"grid", gridTemplateColumns:cols, gap:8, padding:"13px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:12, alignItems:"center" }),
  badge: (c) => ({ display:"inline-block", padding:"3px 10px", borderRadius:6, fontSize:10, letterSpacing:1, background:`${c}11`, color:c, border:`1px solid ${c}33` }),
  bar: (pct, c) => ({ height:3, background:`${c||"#7c6ff7"}`, borderRadius:2, width:`${Math.min(pct,100)}%`, marginTop:5 }),
  barWrap: { height:3, background:"rgba(255,255,255,0.06)", borderRadius:2 },
  note: { background:"rgba(245,166,35,0.05)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:8, padding:"14px 18px", fontSize:11, color:"#999", lineHeight:1.8, marginBottom:20 },
  refreshBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 },
  refreshBtn: { background:"rgba(124,111,247,0.1)", border:"1px solid rgba(124,111,247,0.25)", color:"#7c6ff7", padding:"7px 16px", borderRadius:7, fontSize:10, letterSpacing:1.5, cursor:"pointer", fontFamily:"'DM Mono',monospace" },
  exportBtn: { background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#555566", padding:"5px 12px", borderRadius:6, fontSize:10, cursor:"pointer", fontFamily:"'DM Mono',monospace", letterSpacing:1, marginBottom:16 },
};

function Stat({ label, value, sub, accent }) {
  return (
    <div style={S.stat(accent)}>
      <div style={S.slabel}>{label}</div>
      <div style={S.sval}>{value}</div>
      {sub && <div style={S.ssub}>{sub}</div>}
    </div>
  );
}

function PanelTitle({ children, color }) {
  return (
    <div style={S.ptitle(color)}>
      <div style={{ width:3, height:16, background:color||"#7c6ff7", borderRadius:2 }} />
      {children}
    </div>
  );
}

function exportCSV(data, filename) {
  const a = document.createElement("a");
  a.href = "data:text/csv," + encodeURIComponent(data);
  a.download = filename;
  a.click();
}

export default function Dashboard({ initialData }) {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const { ac, apollo, sheet } = data;
  const tabs = ["overview","activecampaign","apollo","openers","contacts"];
  const tabLabels = ["Overview","ActiveCampaign","Apollo","Weekly Openers","Contacts"];

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/data");
      const fresh = await res.json();
      setData(fresh);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const refreshedAt = data.refreshedAt ? new Date(data.refreshedAt).toLocaleString("en-US", { timeZone:"America/Los_Angeles", month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }) : "--";

  return (
    <div style={S.body}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.title}>GTM Intelligence</div>
          <div style={S.sub}>PLUSPLUS · MILOS · {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}).toUpperCase()}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={S.dot("#7c6ff7")}>● AC</div>
          <div style={S.dot("#f5a623")}>● APOLLO</div>
          <div style={S.dot("#3ecf8e")}>● SHEETS</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {tabs.map((t,i) => (
          <button key={t} style={S.tab(tab===t)} onClick={() => setTab(t)}>{tabLabels[i]}</button>
        ))}
      </div>

      <div style={S.content}>
        <div style={S.refreshBar}>
          <div style={{ fontSize:10, color:"#555566" }}>
            Auto-refreshes daily 7am PT · Last: {refreshedAt} {data.fromCache ? "· (cached)" : "· (live)"}
          </div>
          <button style={S.refreshBtn} onClick={refresh} disabled={loading}>
            {loading ? "↻ LOADING..." : "↻ REFRESH NOW"}
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div style={S.grid(4)}>
              <Stat label="AC Emails Sent" value={fmt(ac?.summary?.sent)} sub={`${ac?.summary?.openRate}% open rate`} accent="#7c6ff7" />
              <Stat label="AC Unique Opens" value={fmt(ac?.summary?.opens)} sub={`${ac?.summary?.clickRate}% click rate`} accent="#7c6ff7" />
              <Stat label="Apollo Reply Rate" value={`${apollo?.summary?.replyRate}%`} sub={`${fmt(apollo?.summary?.replied)} replies from ${fmt(apollo?.summary?.sent)} sent`} accent="#f5a623" />
              <Stat label="Contacts Tracked" value={fmt(sheet?.total)} sub={`${sheet?.companies} companies`} accent="#3ecf8e" />
            </div>
            <div style={S.grid(2)}>
              {/* Recent campaigns */}
              <div style={S.panel}>
                <PanelTitle color="#7c6ff7">Recent AC Campaigns</PanelTitle>
                {(ac?.campaigns||[]).slice(0,5).map(c => (
                  <div key={c.id} style={{ ...S.trow("2fr 1fr 1fr"), borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ color:"#e0e0f0", fontWeight:500, fontSize:12 }}>{c.name}</div>
                    <div style={{ color:"#7c6ff7", fontSize:12 }}>{c.openRate}%</div>
                    <div style={{ color:"#555566", fontSize:11 }}>{c.date}</div>
                  </div>
                ))}
              </div>
              {/* Apollo sequences with replies */}
              <div style={{ ...S.panel, background:"rgba(62,207,142,0.04)", border:"1px solid rgba(62,207,142,0.15)" }}>
                <PanelTitle color="#3ecf8e">★ Apollo Sequences w/ Replies</PanelTitle>
                {(apollo?.sequences||[]).filter(s => s.replied > 0).map(s => (
                  <div key={s.id} style={{ ...S.trow("2fr 1fr 1fr"), borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ color:"#e0e0f0", fontSize:12 }}>{s.name}</div>
                    <div style={S.badge("#3ecf8e")}>{s.replied} replies</div>
                    <div style={{ color:"#3ecf8e", fontSize:12 }}>{s.replyRate}%</div>
                  </div>
                ))}
                {!(apollo?.sequences||[]).some(s => s.replied > 0) && (
                  <div style={{ color:"#555566", fontSize:12 }}>No replies yet — keep sending 🚀</div>
                )}
              </div>
            </div>
            {/* Sheet summary */}
            <div style={S.grid(4)}>
              <Stat label="Meetings Booked" value={fmt(sheet?.withMeeting)} accent="#3ecf8e" />
              <Stat label="LinkedIn Invited" value={fmt(sheet?.linkedinInvited)} accent="#7c6ff7" />
              <Stat label="Apollo Sequences" value={fmt(apollo?.summary?.sequences)} accent="#f5a623" />
              <Stat label="Total Delivered" value={fmt(apollo?.summary?.sent)} sub={`${apollo?.summary?.openRate}% open rate`} accent="#f5a623" />
            </div>
          </div>
        )}

        {/* ── ACTIVE CAMPAIGN ── */}
        {tab === "activecampaign" && (
          <div>
            <div style={S.grid(5)}>
              <Stat label="Total Sent" value={fmt(ac?.summary?.sent)} accent="#7c6ff7" />
              <Stat label="Open Rate" value={`${ac?.summary?.openRate}%`} accent="#7c6ff7" />
              <Stat label="Unique Opens" value={fmt(ac?.summary?.opens)} accent="#7c6ff7" />
              <Stat label="Click Rate" value={`${ac?.summary?.clickRate}%`} accent="#3ecf8e" />
              <Stat label="Bounces" value={fmt(ac?.summary?.bounces)} accent="#f87171" />
            </div>
            <div style={S.panel}>
              <PanelTitle color="#7c6ff7">All Campaigns — {ac?.campaigns?.length} total</PanelTitle>
              <button style={S.exportBtn} onClick={() => {
                const csv = ["Campaign,Date,Sent,Open Rate,Opens,Clicks,CTOR",
                  ...(ac?.campaigns||[]).map(c => `${c.name},${c.date},${c.sent},${c.openRate}%,${c.opens},${c.clicks},${c.ctor}%`)
                ].join("\n");
                exportCSV(csv, "ac-campaigns.csv");
              }}>↓ EXPORT CSV</button>
              <div style={S.thead("2fr 1fr 1fr 1fr 1fr 1fr")}>
                <div>Campaign</div><div>Sent</div><div>Open %</div><div>Opens</div><div>Clicks</div><div>CTOR</div>
              </div>
              {(ac?.campaigns||[]).map(c => (
                <div key={c.id} style={S.trow("2fr 1fr 1fr 1fr 1fr 1fr")}>
                  <div>
                    <div style={{ color:"#e0e0f0", fontWeight:500 }}>{c.name}</div>
                    <div style={{ color:"#555566", fontSize:10 }}>{c.date}</div>
                  </div>
                  <div style={{ color:"#aaa" }}>{fmt(c.sent)}</div>
                  <div>
                    <div style={{ color:"#7c6ff7", fontWeight:600 }}>{c.openRate}%</div>
                    <div style={S.barWrap}><div style={S.bar(c.openRate, "#7c6ff7")} /></div>
                  </div>
                  <div style={{ color:"#aaa" }}>{fmt(c.opens)}</div>
                  <div style={{ color:"#aaa" }}>{fmt(c.clicks)}</div>
                  <div style={{ color: parseFloat(c.ctor) > 3 ? "#3ecf8e" : "#aaa" }}>{c.ctor}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── APOLLO ── */}
        {tab === "apollo" && (
          <div>
            <div style={S.grid(6)}>
              <Stat label="Sequences" value={fmt(apollo?.summary?.sequences)} accent="#f5a623" />
              <Stat label="Total Sent" value={fmt(apollo?.summary?.sent)} accent="#f5a623" />
              <Stat label="Opened" value={fmt(apollo?.summary?.opened)} sub={`${apollo?.summary?.openRate}%`} accent="#f5a623" />
              <Stat label="Replied" value={fmt(apollo?.summary?.replied)} accent="#3ecf8e" />
              <Stat label="Reply Rate" value={`${apollo?.summary?.replyRate}%`} sub="of sent" accent="#3ecf8e" />
              <Stat label="Unsubscribed" value={fmt(apollo?.summary?.unsub)} accent="#f87171" />
            </div>

            {/* Sequences with replies highlighted */}
            {(apollo?.sequences||[]).some(s => s.replied > 0) && (
              <div style={{ ...S.panel, background:"rgba(62,207,142,0.04)", border:"1px solid rgba(62,207,142,0.15)", marginBottom:20 }}>
                <PanelTitle color="#3ecf8e">★ Sequences With Replies — HOTTEST LEADS</PanelTitle>
                {(apollo?.sequences||[]).filter(s => s.replied > 0).map(s => (
                  <div key={s.id} style={{ background:"rgba(62,207,142,0.05)", borderRadius:10, padding:"14px 18px", marginBottom:10, display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:12, alignItems:"center" }}>
                    <div>
                      <div style={{ color:"#e0e0f0", fontWeight:600 }}>{s.name}</div>
                      <div style={{ color:"#555566", fontSize:11, marginTop:3 }}>{fmt(s.contacts)} contacts · {fmt(s.sent)} sent</div>
                    </div>
                    <div style={S.badge("#3ecf8e")}>{s.replied} REPLIES</div>
                    <div style={{ color:"#aaa", fontSize:12 }}>{s.opened} opened</div>
                    <div style={{ color:"#3ecf8e", fontWeight:700 }}>{s.replyRate}% reply rate</div>
                  </div>
                ))}
              </div>
            )}

            {/* All sequences */}
            <div style={S.panel}>
              <PanelTitle color="#f5a623">All Sequences</PanelTitle>
              <div style={S.thead("2fr 1fr 1fr 1fr 1fr 1fr 1fr")}>
                <div>Sequence</div><div>Contacts</div><div>Sent</div><div>Open%</div><div>Replied</div><div>Reply%</div><div>Status</div>
              </div>
              {(apollo?.sequences||[]).map(s => (
                <div key={s.id} style={S.trow("2fr 1fr 1fr 1fr 1fr 1fr 1fr")}>
                  <div style={{ color:"#e0e0f0", fontWeight:500, fontSize:12 }}>{s.name}</div>
                  <div style={{ color:"#aaa" }}>{fmt(s.contacts)}</div>
                  <div style={{ color:"#aaa" }}>{fmt(s.sent)}</div>
                  <div style={{ color:"#7c6ff7" }}>{s.openRate}%</div>
                  <div style={{ color:"#3ecf8e" }}>{fmt(s.replied)}</div>
                  <div style={{ color: parseFloat(s.replyRate) > 2 ? "#3ecf8e" : "#aaa", fontWeight: parseFloat(s.replyRate) > 2 ? 700 : 400 }}>{s.replyRate}%</div>
                  <div><span style={S.badge(s.active ? "#3ecf8e" : "#555566")}>{s.active ? "ACTIVE" : "PAUSED"}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WEEKLY OPENERS ── */}
        {tab === "openers" && (
          <div>
            <div style={S.note}>
              <span style={{ color:"#f5a623" }}>Weekly Openers</span> — These contacts opened a PlusPlus newsletter. 
              They consumed your content and are warm. Export this list and reach out directly or add them to an Apollo sequence.
            </div>
            <div style={{ ...S.panel }}>
              <PanelTitle color="#7c6ff7">
                AC Campaign Opens · Export to reach out
              </PanelTitle>
              <div style={S.note}>
                To see individual openers per campaign: In ActiveCampaign → Campaigns → click any campaign → 
                <strong style={{ color:"#f5a623" }}> View Report → Campaign Recipients → Export</strong>. 
                Upload that CSV here and I'll add it to the dashboard automatically.
                <br/><br/>
                Alternatively, upgrade to AC Plus plan to enable the Activities API and this list will populate automatically.
              </div>
              {/* Show top campaigns to drill into */}
              <PanelTitle color="#7c6ff7">Your Campaigns — Click to view recipients in AC</PanelTitle>
              {(ac?.campaigns||[]).map(c => (
                <div key={c.id} style={{ ...S.trow("2fr 1fr 1fr 1fr"), borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ color:"#e0e0f0" }}>{c.name}</div>
                  <div style={{ color:"#7c6ff7" }}>{fmt(c.opens)} opens</div>
                  <div style={{ color:"#aaa" }}>{c.openRate}%</div>
                  <div style={{ color:"#555566", fontSize:11 }}>{c.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONTACTS ── */}
        {tab === "contacts" && (
          <div>
            <div style={S.grid(4)}>
              <Stat label="Total Contacts" value={fmt(sheet?.total)} accent="#3ecf8e" />
              <Stat label="Companies" value={fmt(sheet?.companies)} accent="#3ecf8e" />
              <Stat label="Meetings Booked" value={fmt(sheet?.withMeeting)} accent="#3ecf8e" />
              <Stat label="LinkedIn Invited" value={fmt(sheet?.linkedinInvited)} accent="#7c6ff7" />
            </div>
            <div style={S.panel}>
              <PanelTitle color="#3ecf8e">Contact Tracker · Google Sheet (live)</PanelTitle>
              <button style={S.exportBtn} onClick={() => {
                const csv = ["First Name,Last Name,Title,Company,Email,Meeting,LinkedIn",
                  ...(sheet?.contacts||[]).map(c => `${c.firstName},${c.lastName},"${c.title}",${c.company},${c.email},${c.meetingDate},${c.linkedin}`)
                ].join("\n");
                exportCSV(csv, "contacts.csv");
              }}>↓ EXPORT CSV</button>
              <div style={S.thead("1fr 1fr 2fr 2fr 1fr")}>
                <div>Name</div><div>Company</div><div>Email</div><div>Title</div><div>Status</div>
              </div>
              {(sheet?.contacts||[]).map((c,i) => (
                <div key={i} style={S.trow("1fr 1fr 2fr 2fr 1fr")}>
                  <div style={{ color:"#e0e0f0", fontWeight:500 }}>{c.firstName} {c.lastName}</div>
                  <div style={{ color:"#aaa", fontSize:12 }}>{c.company}</div>
                  <div style={{ color:"#7c6ff7", fontSize:11 }}>{c.email}</div>
                  <div style={{ color:"#555566", fontSize:10 }}>{c.title?.slice(0,35)}</div>
                  <div>
                    <span style={S.badge(c.meetingDate ? "#3ecf8e" : c.linkedin ? "#7c6ff7" : "#555566")}>
                      {c.meetingDate ? "MEETING" : c.linkedin ? "LI SENT" : "ACTIVE"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
