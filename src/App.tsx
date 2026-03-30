// @ts-nocheck
import { useState, useEffect } from "react";

const STORAGE_KEY = "betting_games_db";
const ADMIN_PASS = "admin123";
const PREMIUM_KEY = "betiq_premium_access";
const PREMIUM_PRICE_KEY = "betiq_premium_price";

const defaultGames = [
  { id: "1", date: new Date().toISOString().split("T")[0], league: "Premier League", homeTeam: "Arsenal", awayTeam: "Chelsea", time: "15:00", prediction: "Arsenal Win", confidence: 78, odds: "1.85", tip: "Arsenal have been dominant at home. Chelsea missing key midfielders.", result: "", status: "upcoming", sport: "⚽ Football", isPremium: false },
  { id: "2", date: new Date().toISOString().split("T")[0], league: "NBA", homeTeam: "Lakers", awayTeam: "Warriors", time: "20:30", prediction: "Over 225.5", confidence: 65, odds: "1.91", tip: "Both teams averaging high scores. Expect a high-tempo game.", result: "", status: "upcoming", sport: "🏀 Basketball", isPremium: false },
  { id: "3", date: new Date().toISOString().split("T")[0], league: "La Liga", homeTeam: "Barcelona", awayTeam: "Real Madrid", time: "21:00", prediction: "Both Teams Score", confidence: 82, odds: "1.72", tip: "El Clásico always delivers goals. Both defenses leaky this season.", result: "Won", status: "finished", sport: "⚽ Football", isPremium: false },
  { id: "4", date: new Date().toISOString().split("T")[0], league: "Premier League", homeTeam: "Man City", awayTeam: "Liverpool", time: "17:30", prediction: "Man City -1 AH", confidence: 91, odds: "2.40", tip: "City's home record is exceptional. Liverpool's away form has been inconsistent. Our model gives City 87% win probability.", result: "", status: "upcoming", sport: "⚽ Football", isPremium: true },
  { id: "5", date: new Date().toISOString().split("T")[0], league: "Champions League", homeTeam: "PSG", awayTeam: "Bayern Munich", time: "21:00", prediction: "Bayern Win & Over 2.5", confidence: 88, odds: "3.10", tip: "Bayern's pressing game shreds PSG's midfield. Expect 3+ goals and a Bayern victory.", result: "", status: "upcoming", sport: "⚽ Football", isPremium: true },
];

function loadGames() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultGames; }
  catch { return defaultGames; }
}
function saveGames(games) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(games)); } catch (e) { console.error(e); }
}
function loadPremiumPrice() { return localStorage.getItem(PREMIUM_PRICE_KEY) || "199"; }
function savePremiumPrice(price) { localStorage.setItem(PREMIUM_PRICE_KEY, price); }

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().split("T")[0];
const SPORTS = ["⚽ Football", "🏀 Basketball", "🎾 Tennis", "🏈 American Football", "⚾ Baseball", "🏒 Ice Hockey", "🥊 Boxing / MMA"];
const STATUSES = ["upcoming", "live", "finished"];
const CONFIDENCE_COLOR = (n) => n >= 75 ? "#00e676" : n >= 55 ? "#ffeb3b" : "#ff5252";

function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    try {
      const data = localStorage.getItem(PREMIUM_KEY);
      if (data) {
        const { expiry } = JSON.parse(data);
        if (Date.now() < expiry) setIsPremium(true);
        else localStorage.removeItem(PREMIUM_KEY);
      }
    } catch {}
  }, []);
  const unlock = (days = 30) => {
    localStorage.setItem(PREMIUM_KEY, JSON.stringify({ expiry: Date.now() + days * 86400000 }));
    setIsPremium(true);
  };
  return { isPremium, unlock };
}

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-dismissed")) return;
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS && !window.navigator.standalone) setShow(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const install = async () => {
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) { setIosGuide(true); return; }
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; setShow(false); }
  };
  const dismiss = () => { setShow(false); localStorage.setItem("pwa-dismissed", "1"); };
  if (!show) return null;
  return (
    <>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999, background: "linear-gradient(135deg,#0d1220,#1a2340)", borderTop: "1px solid #64b5f633", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 -8px 32px #000000aa" }}>
        <div style={{ fontSize: 32 }}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>Install BetIQ Pro</div>
          <div style={{ color: "#888", fontSize: 12 }}>Add to home screen — works like a real app</div>
        </div>
        <button onClick={install} style={{ background: "linear-gradient(135deg,#1976d2,#64b5f6)", border: "none", color: "#fff", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>Install App</button>
        <button onClick={dismiss} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: 20, padding: 4 }}>✕</button>
      </div>
      {iosGuide && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000000cc", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setIosGuide(false)}>
          <div style={{ background: "#1a1f2e", borderRadius: "20px 20px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 480, border: "1px solid #ffffff15" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#fff", marginBottom: 20, textAlign: "center" }}>Install on iPhone / iPad</div>
            {[["1️⃣", "Tap the Share button", "Box with arrow at bottom of Safari"], ["2️⃣", 'Scroll & tap "Add to Home Screen"', ""], ["3️⃣", "Tap Add", "BetIQ Pro icon appears on your home screen"]].map(([n, t, s]) => (
              <div key={n} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                <span style={{ fontSize: 22 }}>{n}</span>
                <div><div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{t}</div>{s && <div style={{ color: "#888", fontSize: 13 }}>{s}</div>}</div>
              </div>
            ))}
            <button onClick={() => setIosGuide(false)} style={{ width: "100%", background: "#64b5f6", border: "none", color: "#000", borderRadius: 12, padding: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 8 }}>Got it!</button>
          </div>
        </div>
      )}
    </>
  );
}

function Badge({ children, color }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{children}</span>;
}
function ConfidenceBar({ value }) {
  const color = CONFIDENCE_COLOR(value);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: "#ffffff18", borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, background: color, height: "100%", borderRadius: 99, transition: "width .6s ease" }} />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: 13, minWidth: 36 }}>{value}%</span>
    </div>
  );
}
function StatusBadge({ status }) {
  const map = { upcoming: ["#64b5f6", "UPCOMING"], live: ["#ff5252", "🔴 LIVE"], finished: ["#9e9e9e", "FINISHED"] };
  const [color, label] = map[status] || map.upcoming;
  return <Badge color={color}>{label}</Badge>;
}
function ResultBadge({ result }) {
  if (!result) return null;
  const color = result === "Won" ? "#00e676" : result === "Lost" ? "#ff5252" : "#ffeb3b";
  return <Badge color={color}>{result}</Badge>;
}

function PaymentModal({ onClose, onSuccess, price }) {
  const [step, setStep] = useState("form");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const validate = () => {
    const clean = phone.replace(/\s+/g, "");
    if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(clean)) {
      setErr("Enter a valid Safaricom/Airtel number (e.g. 0712 345678)");
      return false;
    }
    setErr(""); return true;
  };

  const pay = () => {
    if (!validate()) return;
    setStep("processing");
    setTimeout(() => setStep("success"), 3000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "linear-gradient(135deg,#0f1420,#1a1f2e)", border: "1px solid #ffffff12", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        {step === "form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>👑</div>
              <div style={{ fontWeight: 900, fontSize: 22, color: "#fff" }}>Unlock Premium Odds</div>
              <div style={{ color: "#888", fontSize: 14, marginTop: 6 }}>Access our highest-confidence tips & exclusive analysis</div>
            </div>
            <div style={{ background: "#ffffff06", borderRadius: 14, padding: "16px 20px", marginBottom: 24, border: "1px solid #ffd70020" }}>
              {[["🎯", "Premium picks with 85%+ confidence"], ["📊", "Expert match analysis & reasoning"], ["⚡", "Early access before odds shift"], ["🔒", "Exclusive leagues & markets"]].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ color: "#ccc", fontSize: 14 }}>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#666", letterSpacing: 1.5, marginBottom: 4 }}>30-DAY ACCESS</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#ffd700" }}>KES {price}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#888", letterSpacing: 1.2, marginBottom: 8 }}>M-PESA PHONE NUMBER</div>
              <div style={{ display: "flex", alignItems: "center", background: "#0f1420", border: `1px solid ${err ? "#ff5252" : "#ffffff20"}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderRight: "1px solid #ffffff15", color: "#555", fontSize: 14 }}>🇰🇪 +254</div>
                <input type="tel" placeholder="0712 345 678" value={phone} onChange={e => { setPhone(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && pay()}
                  style={{ flex: 1, background: "transparent", border: "none", color: "#fff", padding: "12px 14px", fontSize: 15, outline: "none" }} />
              </div>
              {err && <div style={{ color: "#ff5252", fontSize: 12, marginTop: 6 }}>{err}</div>}
            </div>
            <div style={{ color: "#555", fontSize: 12, marginBottom: 20 }}>You'll receive an M-Pesa STK push on your phone to complete payment.</div>
            <button onClick={pay} style={{ width: "100%", background: "linear-gradient(135deg,#00875a,#00c47d)", border: "none", color: "#fff", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 900, cursor: "pointer" }}>Pay KES {price} via M-Pesa</button>
            <button onClick={onClose} style={{ width: "100%", background: "transparent", border: "none", color: "#444", cursor: "pointer", marginTop: 14, fontSize: 13 }}>Cancel</button>
          </>
        )}
        {step === "processing" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 20, display: "inline-block" }}>⏳</div>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#fff", marginBottom: 10 }}>STK Push Sent!</div>
            <div style={{ color: "#888", fontSize: 14, lineHeight: 1.7 }}>Check your phone for an M-Pesa prompt.<br />Enter your PIN to complete payment.</div>
            <div style={{ marginTop: 24, display: "flex", gap: 6, justifyContent: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#00c47d" }} />)}
            </div>
          </div>
        )}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 8 }}>Payment Confirmed!</div>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              Welcome to Premium! Your access is active for <span style={{ color: "#ffd700", fontWeight: 700 }}>30 days</span>.
            </div>
            <button onClick={() => { onSuccess(); onClose(); }} style={{ width: "100%", background: "linear-gradient(135deg,#ffd700,#ffb300)", border: "none", color: "#000", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 900, cursor: "pointer" }}>View Premium Odds 👑</button>
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ game, isPremium, onUnlock }) {
  const [expanded, setExpanded] = useState(false);
  const locked = game.isPremium && !isPremium;
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
      {game.isPremium && <div style={{ position: "absolute", inset: 0, borderRadius: 16, border: "1px solid #ffd70040", pointerEvents: "none", zIndex: 2 }} />}
      <div onClick={() => !locked && setExpanded(!expanded)}
        style={{ background: game.isPremium ? "linear-gradient(135deg,#1e1a10,#1a1f2e)" : "linear-gradient(135deg,#1a1f2e,#0f1420)", border: game.isPremium ? "1px solid #ffd70025" : "1px solid #ffffff0f", borderRadius: 16, padding: "20px 24px", cursor: locked ? "default" : "pointer", filter: locked ? "brightness(0.65)" : "none", transition: "transform .2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: "#888", letterSpacing: 1.5, marginBottom: 4 }}>{game.sport} · {game.league} · {game.time}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{game.homeTeam} <span style={{ color: "#555" }}>vs</span> {game.awayTeam}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {game.isPremium && <Badge color="#ffd700">👑 PREMIUM</Badge>}
            <StatusBadge status={game.status} />
            <ResultBadge result={game.result} />
          </div>
        </div>
        {locked ? (
          <div style={{ margin: "16px 0 0" }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", filter: "blur(6px)", userSelect: "none", pointerEvents: "none" }}>
              <div style={{ background: "#64b5f615", border: "1px solid #64b5f633", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>PREDICTION</div>
                <div style={{ fontWeight: 800, color: "#64b5f6", fontSize: 15 }}>████████</div>
              </div>
              <div style={{ background: "#ffffff08", borderRadius: 10, padding: "10px 16px", minWidth: 80, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>ODDS</div>
                <div style={{ fontWeight: 800, color: "#ffeb3b", fontSize: 17 }}>█.██</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, filter: "blur(4px)", pointerEvents: "none" }}>
              <div style={{ flex: 1, background: "#ffffff18", borderRadius: 99, height: 6 }}><div style={{ width: "88%", background: "#00e676", height: "100%", borderRadius: 99 }} /></div>
              <span style={{ color: "#00e676", fontWeight: 700, fontSize: 13 }}>88%</span>
            </div>
          </div>
        ) : (
          <>
            <div style={{ margin: "16px 0 8px", display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ background: "#64b5f615", border: "1px solid #64b5f633", borderRadius: 10, padding: "10px 16px", flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, marginBottom: 3 }}>PREDICTION</div>
                <div style={{ fontWeight: 800, color: "#64b5f6", fontSize: 15 }}>{game.prediction}</div>
              </div>
              <div style={{ background: "#ffffff08", border: "1px solid #ffffff10", borderRadius: 10, padding: "10px 16px", minWidth: 80, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, marginBottom: 3 }}>ODDS</div>
                <div style={{ fontWeight: 800, color: "#ffeb3b", fontSize: 17 }}>{game.odds}</div>
              </div>
            </div>
            <ConfidenceBar value={game.confidence} />
            {expanded && <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #ffffff0f", color: "#aaa", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>💡 {game.tip}</div>}
          </>
        )}
      </div>
      {locked && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
          <button onClick={onUnlock} style={{ background: "linear-gradient(135deg,#ffd700,#ffb300)", border: "none", color: "#000", borderRadius: 12, padding: "12px 28px", fontWeight: 900, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 20px #ffd70044" }}>
            🔒 Unlock Premium Access
          </button>
        </div>
      )}
    </div>
  );
}

function PremiumBanner({ onUnlock, price }) {
  return (
    <div style={{ background: "linear-gradient(135deg,#1e1a10,#2a2210)", border: "1px solid #ffd70030", borderRadius: 16, padding: "24px 28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ fontSize: 40 }}>👑</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 900, color: "#ffd700", fontSize: 17, marginBottom: 4 }}>Unlock Premium Odds</div>
        <div style={{ color: "#888", fontSize: 13, lineHeight: 1.6 }}>Highest-confidence picks, expert analysis & exclusive markets. Only KES {price}/month.</div>
      </div>
      <button onClick={onUnlock} style={{ background: "linear-gradient(135deg,#ffd700,#ffb300)", border: "none", color: "#000", borderRadius: 12, padding: "12px 24px", fontWeight: 900, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>Get Premium →</button>
    </div>
  );
}

function PremiumActiveBadge() {
  return (
    <div style={{ background: "linear-gradient(135deg,#1e1a10,#2a2210)", border: "1px solid #ffd70040", borderRadius: 12, padding: "10px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>👑</span>
      <span style={{ fontWeight: 800, color: "#ffd700", fontSize: 14 }}>Premium Active</span>
      <span style={{ color: "#666", fontSize: 12 }}>— All premium odds unlocked</span>
    </div>
  );
}

function PublicView({ games, onAdmin, isPremium, onUnlock }) {
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(today());
  const [showPayment, setShowPayment] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState("199");
  useEffect(() => { setPremiumPrice(loadPremiumPrice()); }, []);

  const sports = ["all", ...new Set(games.map(g => g.sport))];
  const filtered = games.filter(g => (filter === "all" || g.sport === filter) && (!dateFilter || g.date === dateFilter));
  const wins = games.filter(g => g.result === "Won").length;
  const finished = games.filter(g => g.status === "finished").length;

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'DM Sans',sans-serif", color: "#fff", paddingBottom: 100 }}>
      <div style={{ background: "linear-gradient(180deg,#0d1220,#080c14)", borderBottom: "1px solid #ffffff0a", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "linear-gradient(135deg,#64b5f6,#1976d2)", borderRadius: 10, padding: "6px 10px", fontSize: 18 }}>🎯</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>BetIQ <span style={{ color: "#64b5f6" }}>Pro</span></div>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>DAILY PREDICTIONS</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isPremium && <button onClick={() => setShowPayment(true)} style={{ background: "linear-gradient(135deg,#ffd700,#ffb300)", border: "none", color: "#000", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 800, fontSize: 12 }}>👑 Premium</button>}
            <button onClick={onAdmin} style={{ background: "transparent", border: "1px solid #ffffff18", color: "#888", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13 }}>Admin ⚙️</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 32 }}>
          {[["Today's Tips", games.filter(g => g.date === today()).length, "#64b5f6"], ["Win Rate", finished ? `${Math.round(wins/finished*100)}%` : "—", "#00e676"], ["Active Tips", games.filter(g => g.status !== "finished").length, "#ffeb3b"], ["Premium Picks", games.filter(g => g.isPremium).length, "#ffd700"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "#1a1f2e", borderRadius: 12, padding: "16px 20px", border: l === "Premium Picks" ? "1px solid #ffd70020" : "1px solid #ffffff08" }}>
              <div style={{ fontSize: 10, color: "#666", letterSpacing: 1.2, marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        {isPremium ? <PremiumActiveBadge /> : <PremiumBanner onUnlock={() => setShowPayment(true)} price={premiumPrice} />}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ background: "#1a1f2e", border: "1px solid #ffffff15", color: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 13, cursor: "pointer" }} />
          {sports.map(s => <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? "#64b5f6" : "#1a1f2e", color: filter === s ? "#000" : "#aaa", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{s === "all" ? "All Sports" : s}</button>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? <div style={{ textAlign: "center", color: "#444", padding: 60 }}>No predictions for this date / filter.</div>
            : filtered.map(g => <GameCard key={g.id} game={g} isPremium={isPremium} onUnlock={() => setShowPayment(true)} />)}
        </div>
      </div>
      <InstallBanner />
      {showPayment && <PaymentModal price={premiumPrice} onClose={() => setShowPayment(false)} onSuccess={onUnlock} />}
    </div>
  );
}

function AdminLogin({ onLogin, onBack }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "#080c14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: "#1a1f2e", border: "1px solid #ffffff0f", borderRadius: 20, padding: "40px 48px", width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 4 }}>Admin Panel</div>
        <div style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Enter password to continue</div>
        <input type="password" placeholder="Password" value={pw} onChange={e => { setPw(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && (pw === ADMIN_PASS ? onLogin() : setErr("Wrong password"))}
          style={{ width: "100%", background: "#0f1420", border: `1px solid ${err ? "#ff5252" : "#ffffff15"}`, color: "#fff", borderRadius: 10, padding: "11px 16px", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: 8 }} />
        {err && <div style={{ color: "#ff5252", fontSize: 12, marginBottom: 8 }}>{err}</div>}
        <button onClick={() => pw === ADMIN_PASS ? onLogin() : setErr("Wrong password")} style={{ width: "100%", background: "linear-gradient(135deg,#1976d2,#64b5f6)", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 4 }}>Login</button>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", marginTop: 14, fontSize: 13 }}>← Back to predictions</button>
      </div>
    </div>
  );
}

const emptyGame = () => ({ id: uid(), date: today(), league: "", homeTeam: "", awayTeam: "", time: "15:00", prediction: "", confidence: 70, odds: "1.90", tip: "", result: "", status: "upcoming", sport: "⚽ Football", isPremium: false });

function GameForm({ initial, onSave, onCancel }) {
  const [g, setG] = useState(initial || emptyGame());
  const set = (k, v) => setG(prev => ({ ...prev, [k]: v }));
  const inp = { background: "#0f1420", border: "1px solid #ffffff15", color: "#fff", borderRadius: 8, padding: "9px 13px", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none" };
  const lbl = { fontSize: 11, color: "#666", letterSpacing: 1, marginBottom: 5, display: "block" };
  const row = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  return (
    <div style={{ background: "#131828", border: "1px solid #ffffff10", borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ fontWeight: 800, color: "#64b5f6", marginBottom: 20, fontSize: 15 }}>{initial ? "✏️ Edit Game" : "➕ Add New Game"}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={row}>
          <div><label style={lbl}>DATE</label><input type="date" value={g.date} onChange={e => set("date", e.target.value)} style={inp} /></div>
          <div><label style={lbl}>TIME</label><input type="time" value={g.time} onChange={e => set("time", e.target.value)} style={inp} /></div>
        </div>
        <div style={row}>
          <div><label style={lbl}>SPORT</label><select value={g.sport} onChange={e => set("sport", e.target.value)} style={{ ...inp, cursor: "pointer" }}>{SPORTS.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={lbl}>LEAGUE</label><input value={g.league} onChange={e => set("league", e.target.value)} placeholder="e.g. Premier League" style={inp} /></div>
        </div>
        <div style={row}>
          <div><label style={lbl}>HOME TEAM</label><input value={g.homeTeam} onChange={e => set("homeTeam", e.target.value)} placeholder="Home" style={inp} /></div>
          <div><label style={lbl}>AWAY TEAM</label><input value={g.awayTeam} onChange={e => set("awayTeam", e.target.value)} placeholder="Away" style={inp} /></div>
        </div>
        <div style={row}>
          <div><label style={lbl}>PREDICTION</label><input value={g.prediction} onChange={e => set("prediction", e.target.value)} placeholder="e.g. Home Win, BTTS" style={inp} /></div>
          <div><label style={lbl}>ODDS</label><input value={g.odds} onChange={e => set("odds", e.target.value)} placeholder="e.g. 1.85" style={inp} /></div>
        </div>
        <div>
          <label style={lbl}>CONFIDENCE: {g.confidence}%</label>
          <input type="range" min={10} max={99} value={g.confidence} onChange={e => set("confidence", +e.target.value)} style={{ width: "100%", accentColor: CONFIDENCE_COLOR(g.confidence) }} />
        </div>
        <div>
          <label style={lbl}>ANALYST TIP / REASONING</label>
          <textarea value={g.tip} onChange={e => set("tip", e.target.value)} placeholder="Explain why this prediction..." rows={3} style={{ ...inp, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
        </div>
        <div style={row}>
          <div><label style={lbl}>STATUS</label><select value={g.status} onChange={e => set("status", e.target.value)} style={{ ...inp, cursor: "pointer" }}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={lbl}>RESULT</label><select value={g.result} onChange={e => set("result", e.target.value)} style={{ ...inp, cursor: "pointer" }}><option value="">— Pending —</option><option>Won</option><option>Lost</option><option>Void / Postponed</option></select></div>
        </div>
        <div style={{ background: g.isPremium ? "#1e1a1005" : "#ffffff05", border: `1px solid ${g.isPremium ? "#ffd70040" : "#ffffff10"}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => set("isPremium", !g.isPremium)}>
          <div>
            <div style={{ fontWeight: 700, color: g.isPremium ? "#ffd700" : "#aaa", fontSize: 14 }}>👑 Premium Pick</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Requires paid subscription to view</div>
          </div>
          <div style={{ width: 44, height: 24, borderRadius: 99, background: g.isPremium ? "#ffd700" : "#ffffff18", position: "relative", flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: g.isPremium ? 23 : 3, transition: "left .2s", boxShadow: "0 1px 4px #0008" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "#ffffff0d", border: "none", color: "#aaa", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
          <button onClick={() => onSave(g)} style={{ background: "linear-gradient(135deg,#1976d2,#64b5f6)", border: "none", color: "#fff", borderRadius: 8, padding: "10px 22px", cursor: "pointer", fontWeight: 800, fontSize: 14 }}>Save Game</button>
        </div>
      </div>
    </div>
  );
}

function AdminView({ games, setGames, onBack }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dateFilter, setDateFilter] = useState(today());
  const [search, setSearch] = useState("");
  const [premiumPrice, setPremiumPrice] = useState(loadPremiumPrice());
  const [priceEditing, setPriceEditing] = useState(false);
  const [priceInput, setPriceInput] = useState(loadPremiumPrice());

  const savePrice = () => { savePremiumPrice(priceInput); setPremiumPrice(priceInput); setPriceEditing(false); };
  const save = (updated) => {
    const next = games.some(g => g.id === updated.id) ? games.map(g => g.id === updated.id ? updated : g) : [updated, ...games];
    setGames(next); saveGames(next); setAdding(false); setEditing(null);
  };
  const del = (id) => {
    if (!confirm("Delete this game?")) return;
    const next = games.filter(g => g.id !== id); setGames(next); saveGames(next);
  };
  const filtered = games.filter(g => (!dateFilter || g.date === dateFilter) && (!search || [g.homeTeam, g.awayTeam, g.league, g.sport].join(" ").toLowerCase().includes(search.toLowerCase()))).sort((a, b) => a.date > b.date ? -1 : 1);
  const wins = games.filter(g => g.result === "Won").length;
  const total = games.filter(g => g.status === "finished").length;

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'DM Sans',sans-serif", color: "#fff" }}>
      <div style={{ background: "#0d1220", borderBottom: "1px solid #ffffff0a", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 20 }}>⚙️</span><span style={{ fontWeight: 900, fontSize: 17 }}>Admin <span style={{ color: "#64b5f6" }}>Dashboard</span></span></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setAdding(true); setEditing(null); }} style={{ background: "linear-gradient(135deg,#1976d2,#64b5f6)", border: "none", color: "#fff", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 800, fontSize: 13 }}>+ Add Game</button>
            <button onClick={onBack} style={{ background: "#ffffff0d", border: "none", color: "#aaa", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>← Public View</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 24 }}>
          {[["Total Games", games.length, "#64b5f6"], ["Today", games.filter(g => g.date === today()).length, "#ffeb3b"], ["Win Rate", total ? `${Math.round(wins/total*100)}%` : "—", "#00e676"], ["Premium Picks", games.filter(g => g.isPremium).length, "#ffd700"], ["Pending Result", games.filter(g => g.status === "finished" && !g.result).length, "#ff5252"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "#1a1f2e", borderRadius: 10, padding: "14px 18px", border: l === "Premium Picks" ? "1px solid #ffd70020" : "1px solid #ffffff08" }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 1.2 }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: c, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#1a1a10", border: "1px solid #ffd70030", borderRadius: 14, padding: "18px 22px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 24 }}>💰</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: "#ffd700", fontSize: 14 }}>Premium Subscription Price</div>
            <div style={{ color: "#666", fontSize: 12 }}>What users pay per month for premium access</div>
          </div>
          {priceEditing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#888", fontSize: 13 }}>KES</span>
              <input value={priceInput} onChange={e => setPriceInput(e.target.value)} type="number" min="1" style={{ background: "#0f1420", border: "1px solid #ffd70040", color: "#ffd700", borderRadius: 8, padding: "7px 12px", fontSize: 15, fontWeight: 800, width: 90, outline: "none" }} />
              <button onClick={savePrice} style={{ background: "#ffd700", border: "none", color: "#000", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 800, fontSize: 13 }}>Save</button>
              <button onClick={() => setPriceEditing(false)} style={{ background: "#ffffff0d", border: "none", color: "#aaa", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 900, color: "#ffd700", fontSize: 22 }}>KES {premiumPrice}</span>
              <button onClick={() => setPriceEditing(true)} style={{ background: "#ffd70018", border: "1px solid #ffd70030", color: "#ffd700", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Edit</button>
            </div>
          )}
        </div>
        {adding && <GameForm onSave={save} onCancel={() => setAdding(false)} />}
        {editing && <GameForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ background: "#1a1f2e", border: "1px solid #ffffff15", color: "#fff", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }} />
          <input placeholder="Search teams, leagues..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: "#1a1f2e", border: "1px solid #ffffff15", color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13, flex: 1, minWidth: 180, outline: "none" }} />
          {(dateFilter || search) && <button onClick={() => { setDateFilter(""); setSearch(""); }} style={{ background: "#ff525220", border: "none", color: "#ff5252", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12 }}>Clear</button>}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#1a1f2e" }}>{["Date","Sport/League","Match","Prediction","Odds","Conf.","Premium","Status","Result","Actions"].map(h => <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#555", fontWeight: 700, letterSpacing: 0.8, fontSize: 11, borderBottom: "1px solid #ffffff08", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} style={{ borderBottom: "1px solid #ffffff06" }}>
                  <td style={{ padding: "11px 12px", color: "#888" }}>{g.date}</td>
                  <td style={{ padding: "11px 12px" }}><div style={{ color: "#fff" }}>{g.sport}</div><div style={{ color: "#555", fontSize: 11 }}>{g.league}</div></td>
                  <td style={{ padding: "11px 12px", fontWeight: 700 }}>{g.homeTeam} <span style={{ color: "#444" }}>vs</span> {g.awayTeam}</td>
                  <td style={{ padding: "11px 12px", color: "#64b5f6", fontWeight: 700 }}>{g.prediction}</td>
                  <td style={{ padding: "11px 12px", color: "#ffeb3b", fontWeight: 800 }}>{g.odds}</td>
                  <td style={{ padding: "11px 12px" }}><span style={{ color: CONFIDENCE_COLOR(g.confidence), fontWeight: 800 }}>{g.confidence}%</span></td>
                  <td style={{ padding: "11px 12px" }}>{g.isPremium ? <Badge color="#ffd700">👑 Yes</Badge> : <span style={{ color: "#333" }}>Free</span>}</td>
                  <td style={{ padding: "11px 12px" }}><StatusBadge status={g.status} /></td>
                  <td style={{ padding: "11px 12px" }}>{g.result ? <ResultBadge result={g.result} /> : <span style={{ color: "#333" }}>—</span>}</td>
                  <td style={{ padding: "11px 12px", whiteSpace: "nowrap" }}>
                    <button onClick={() => { setEditing(g); setAdding(false); window.scrollTo(0,0); }} style={{ background: "#64b5f618", border: "none", color: "#64b5f6", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 700, marginRight: 6, fontSize: 12 }}>Edit</button>
                    <button onClick={() => del(g.id)} style={{ background: "#ff525218", border: "none", color: "#ff5252", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Del</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", color: "#333", padding: 40 }}>No games found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [games, setGames] = useState(loadGames());
  const [view, setView] = useState("public");
  const { isPremium, unlock } = usePremium();

  if (view === "public") return <PublicView games={games} onAdmin={() => setView("login")} isPremium={isPremium} onUnlock={unlock} />;
  if (view === "login") return <AdminLogin onLogin={() => setView("admin")} onBack={() => setView("public")} />;
  return <AdminView games={games} setGames={setGames} onBack={() => setView("public")} />;
}
