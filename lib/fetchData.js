// lib/fetchData.js
// All API calls happen SERVER-SIDE — keys never exposed to browser

const AC_URL = process.env.AC_API_URL;
const AC_KEY = process.env.AC_API_KEY;
const APOLLO_KEY = process.env.APOLLO_API_KEY;
const SHEET_ID = process.env.SHEET_ID;

async function fetchAC(path) {
  const res = await fetch(`${AC_URL}/api/3${path}`, {
    headers: { "Api-Token": AC_KEY },
    next: { revalidate: 0 }
  });
  if (!res.ok) throw new Error(`AC API error: ${res.status}`);
  return res.json();
}

async function fetchApollo(path, body = {}) {
  const res = await fetch(`https://api.apollo.io/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify({ api_key: APOLLO_KEY, ...body }),
    next: { revalidate: 0 }
  });
  if (!res.ok) throw new Error(`Apollo API error: ${res.status}`);
  return res.json();
}

export async function getActiveCampaignData() {
  try {
    const data = await fetchAC("/campaigns?limit=20&orders[sdate]=DESC&filters[status]=5");
    const campaigns = data.campaigns || [];

    let totalSent = 0, totalOpens = 0, totalClicks = 0, totalBounces = 0, totalUnsub = 0;
    campaigns.forEach(c => {
      totalSent    += parseInt(c.send_amt      || 0);
      totalOpens   += parseInt(c.uniqueopens   || 0);
      totalClicks  += parseInt(c.uniqueclicks  || 0);
      totalBounces += parseInt(c.hardbounces   || 0) + parseInt(c.softbounces || 0);
      totalUnsub   += parseInt(c.unsubscribes  || 0);
    });

    return {
      summary: {
        sent: totalSent,
        opens: totalOpens,
        clicks: totalClicks,
        bounces: totalBounces,
        unsub: totalUnsub,
        openRate: totalSent ? ((totalOpens / totalSent) * 100).toFixed(1) : "0",
        clickRate: totalSent ? ((totalClicks / totalSent) * 100).toFixed(2) : "0",
      },
      campaigns: campaigns.slice(0, 15).map(c => {
        const sent  = parseInt(c.send_amt     || 0);
        const opens = parseInt(c.uniqueopens  || 0);
        const clicks= parseInt(c.uniqueclicks || 0);
        return {
          id: c.id,
          name: c.name || "Untitled",
          date: c.sdate ? c.sdate.split(" ")[0] : "--",
          sent,
          opens,
          clicks,
          openRate:  sent ? ((opens  / sent) * 100).toFixed(1) : "0",
          clickRate: sent ? ((clicks / sent) * 100).toFixed(2) : "0",
          ctor: opens ? ((clicks / opens) * 100).toFixed(2) : "0",
        };
      }),
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { error: e.message, campaigns: [], summary: {} };
  }
}

export async function getApolloData() {
  try {
    const data = await fetchApollo("/emailer_campaigns/search", { per_page: 25, page: 1 });
    const sequences = data.emailer_campaigns || [];

    let totalContacts = 0, totalSent = 0, totalOpened = 0, totalReplied = 0, totalBounced = 0, totalUnsub = 0;
    sequences.forEach(s => {
      totalContacts += s.num_contacts             || 0;
      totalSent     += s.num_sent_emails          || 0;
      totalOpened   += s.num_opened_emails        || 0;
      totalReplied  += s.num_reply_emails         || 0;
      totalBounced  += s.num_bounced_emails       || 0;
      totalUnsub    += s.num_unsubscribed_contacts|| 0;
    });

    return {
      summary: {
        sequences: sequences.length,
        contacts: totalContacts,
        sent: totalSent,
        opened: totalOpened,
        replied: totalReplied,
        bounced: totalBounced,
        unsub: totalUnsub,
        replyRate:  totalSent ? ((totalReplied / totalSent) * 100).toFixed(1) : "0",
        openRate:   totalSent ? ((totalOpened  / totalSent) * 100).toFixed(1) : "0",
      },
      sequences: sequences.map(s => ({
        id: s.id,
        name: s.name,
        active: s.active,
        contacts:  s.num_contacts              || 0,
        sent:      s.num_sent_emails           || 0,
        opened:    s.num_opened_emails         || 0,
        replied:   s.num_reply_emails          || 0,
        bounced:   s.num_bounced_emails        || 0,
        unsub:     s.num_unsubscribed_contacts || 0,
        replyRate: s.num_sent_emails ? ((s.num_reply_emails / s.num_sent_emails) * 100).toFixed(1) : "0",
        openRate:  s.num_sent_emails ? ((s.num_opened_emails / s.num_sent_emails) * 100).toFixed(1) : "0",
      })),
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { error: e.message, sequences: [], summary: {} };
  }
}

export async function getSheetData() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    const text = await res.text();
    const rows = text.split("\n").map(r => r.split(",").map(c => c.replace(/^"|"$/g, "").trim()));
    const data = rows.slice(1).filter(r => r[0]?.trim());

    const companies = new Set(data.map(r => r[3]).filter(Boolean));

    return {
      total: data.length,
      companies: companies.size,
      companyList: [...companies].sort(),
      withMeeting: data.filter(r => r[73]?.trim()).length,
      linkedinInvited: data.filter(r => r[69]?.trim()).length,
      contacts: data.slice(0, 100).map(r => ({
        firstName:  r[0] || "",
        lastName:   r[1] || "",
        title:      r[2] || "",
        company:    r[3] || "",
        email:      r[5] || "",
        meetingDate:r[73]|| "",
        linkedin:   r[69]|| "",
      })),
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    return { error: e.message, contacts: [], total: 0 };
  }
}

export async function getAllData() {
  const [ac, apollo, sheet] = await Promise.all([
    getActiveCampaignData(),
    getApolloData(),
    getSheetData(),
  ]);
  return { ac, apollo, sheet, refreshedAt: new Date().toISOString() };
}
