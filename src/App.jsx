import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

/* ─── CONFIG (easy to extend) ─── */
const DOCK_PREFIXES = ["D", "V"];
const DOCK_NUMBERS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const MAX_FRAMES = 10;

const KEYWORDS = ["UNKNOWN", "CONSOLIDATION"];

const PALLET_DATA = [
  {
    name: "CHEP",
    color: "#2979FF",
    colorName: "Blue",
    desc: "The most widely used pooled pallet system. Blue painted, managed by CHEP (Brambles). Returned and reused through the CHEP pool network.",
    variants: [
      { size: "Euro", dims: "1200×800mm", material: "Wood", img: "/pallets/chep-euro-wood.jpg" },
      { size: "Euro", dims: "1200×800mm", material: "Plastic", img: "/pallets/chep-euro-plastic.jpg" },
      { size: "Block", dims: "1200×1000mm", material: "Wood", img: "/pallets/chep-block-wood.jpg" },
      { size: "Block", dims: "1200×1000mm", material: "Plastic", img: "/pallets/chep-block-plastic.jpg" },
    ],
    markers: ["Blue painted", "CHEP logo on blocks", "4-way entry", "Most common pooled pallet"],
  },
  {
    name: "LPR",
    color: "#FF1744",
    colorName: "Bright Red",
    desc: "La Palette Rouge — bright red pooled pallet. Wooden only. Used across European supply chains.",
    variants: [
      { size: "Euro", dims: "1200×800mm", material: "Wood", img: "/pallets/lpr-euro-wood.jpg" },
      { size: "Block", dims: "1200×1000mm", material: "Wood", img: "/pallets/lpr-block-wood.jpg" },
    ],
    markers: ["Bright red paint", "LPR logo", "Wood only", "European pool system"],
  },
  {
    name: "IPP",
    color: "#8B0000",
    colorName: "Dark Red",
    desc: "IPP Logipal — dark red / maroon pooled pallet. Wooden only. Darker than LPR, easy to confuse at a glance.",
    variants: [
      { size: "Euro", dims: "1200×800mm", material: "Wood", img: "/pallets/ipp-euro-wood.jpg" },
      { size: "Block", dims: "1200×1000mm", material: "Wood", img: "/pallets/ipp-block-wood.jpg" },
    ],
    markers: ["Dark red / maroon paint", "IPP Logipal branding", "Wood only", "Darker than LPR"],
  },
  {
    name: "EPS",
    color: "#8D6E3F",
    colorName: "Beige Wood",
    desc: "European Pallet System. Natural beige / light brown wood. Unpainted. Identified by EPS stamp on the blocks.",
    variants: [
      { size: "Euro", dims: "1200×800mm", material: "Wood", img: "/pallets/eps-euro-wood.jpg" },
      { size: "Block", dims: "1200×1000mm", material: "Wood", img: "/pallets/eps-block-wood.jpg" },
    ],
    markers: ["Natural beige wood", "EPS stamp on blocks", "Unpainted", "Block style"],
  },
  {
    name: "DPB",
    color: "#1a1a1a",
    colorName: "Black Plastic",
    desc: "Düsseldorfer Paletten Block. Black plastic pallet. Only comes in block size. Lightweight, durable, and washable.",
    variants: [
      { size: "Block", dims: "1200×1000mm", material: "Plastic", img: "/pallets/dpb-block-plastic.jpg" },
    ],
    markers: ["Black plastic", "Block size only", "Lightweight", "Durable / washable"],
  },
];

/* ─── FRAME CODES GENERATOR ─── */
function getFrameCodes(dept) {
  const codes = [];
  const start = dept === "CH" ? 1 : 2;
  for (let i = 0; i < MAX_FRAMES; i++) {
    const num = start + i * 2;
    codes.push(String(num).padStart(2, "0"));
  }
  return codes;
}

/* ─── STYLES ─── */
const C = {
  bg: "#0a0a12",
  surface: "#13131f",
  border: "#1e1e30",
  amber: "#FFAB00",
  chilled: "#42A5F5",
  chilledDim: "rgba(66,165,245,0.12)",
  chilledBorder: "rgba(66,165,245,0.25)",
  ambient: "#FF7043",
  ambientDim: "rgba(255,112,67,0.12)",
  ambientBorder: "rgba(255,112,67,0.25)",
  text: "#e0e0e0",
  textDim: "#666",
};

const font = "'IBM Plex Mono', 'Courier New', monospace";

/* ─── PALLET SVG ILLUSTRATION ─── */
function PalletIllustration({ color, material, size = 90 }) {
  const isPlastic = material === "Plastic";
  const boardColor = color === "#1a1a1a" ? "#222" : color;
  const highlight = color === "#1a1a1a" ? "#333" : `${color}cc`;
  const shadow = color === "#1a1a1a" ? "#111" : `${color}88`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="5" y="15" width="90" height="8" rx="1.5" fill={boardColor} />
      <rect x="5" y="15" width="90" height="3" rx="1" fill={highlight} opacity="0.3" />
      <rect x="5" y="26" width="90" height="8" rx="1.5" fill={boardColor} />
      <rect x="5" y="37" width="90" height="8" rx="1.5" fill={boardColor} />
      <rect x="5" y="37" width="90" height="3" rx="1" fill={highlight} opacity="0.2" />
      <rect x="5" y="48" width="90" height="8" rx="1.5" fill={boardColor} />
      <rect x="5" y="59" width="90" height="8" rx="1.5" fill={boardColor} />
      <rect x="5" y="59" width="90" height="3" rx="1" fill={highlight} opacity="0.3" />
      <rect x="8" y="72" width="18" height="18" rx="2" fill={shadow} />
      <rect x="41" y="72" width="18" height="18" rx="2" fill={shadow} />
      <rect x="74" y="72" width="18" height="18" rx="2" fill={shadow} />
      <rect x="8" y="72" width="18" height="6" rx="1.5" fill={highlight} opacity="0.25" />
      <rect x="41" y="72" width="18" height="6" rx="1.5" fill={highlight} opacity="0.25" />
      <rect x="74" y="72" width="18" height="6" rx="1.5" fill={highlight} opacity="0.25" />
      {!isPlastic && (
        <>
          <line x1="20" y1="17" x2="20" y2="22" stroke={shadow} strokeWidth="0.5" opacity="0.4" />
          <line x1="50" y1="28" x2="50" y2="33" stroke={shadow} strokeWidth="0.5" opacity="0.4" />
          <line x1="70" y1="39" x2="70" y2="44" stroke={shadow} strokeWidth="0.5" opacity="0.4" />
          <line x1="35" y1="50" x2="35" y2="55" stroke={shadow} strokeWidth="0.5" opacity="0.4" />
          <line x1="60" y1="61" x2="60" y2="66" stroke={shadow} strokeWidth="0.5" opacity="0.4" />
        </>
      )}
      {isPlastic && (
        <>
          <circle cx="25" cy="30" r="2" fill="#0a0a12" opacity="0.5" />
          <circle cx="50" cy="30" r="2" fill="#0a0a12" opacity="0.5" />
          <circle cx="75" cy="30" r="2" fill="#0a0a12" opacity="0.5" />
          <circle cx="25" cy="52" r="2" fill="#0a0a12" opacity="0.5" />
          <circle cx="50" cy="52" r="2" fill="#0a0a12" opacity="0.5" />
          <circle cx="75" cy="52" r="2" fill="#0a0a12" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

/* ─── SHARED COMPONENTS ─── */

function BigButton({ label, sub, color, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "28px 20px",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `2px solid ${color}40`,
        borderRadius: 16, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 18,
        transition: "all 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `${color}25`, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 26, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ textAlign: "left" }}>
        <div style={{
          fontFamily: font, fontWeight: 700, fontSize: 18,
          color: C.text, letterSpacing: 0.5,
        }}>{label}</div>
        <div style={{
          fontFamily: font, fontSize: 12, color: C.textDim,
          marginTop: 3,
        }}>{sub}</div>
      </div>
    </button>
  );
}

function BackBar({ onBack, title, accent = C.amber }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
    }}>
      <button
        onClick={onBack}
        style={{
          width: 52, height: 52, borderRadius: 14,
          background: C.surface, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 22, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: font, flexShrink: 0,
        }}
      >←</button>
      <div style={{
        fontFamily: font, fontWeight: 700, fontSize: 16,
        color: accent, letterSpacing: 1,
      }}>{title}</div>
    </div>
  );
}

function QRDisplay({ code, large = false }) {
  const qrSize = large ? 260 : 200;
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 16,
    }}>
      <div style={{
        background: "#111118", borderRadius: 16,
        padding: 16, border: `1px solid ${C.border}`,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <QRCodeSVG
          value={code}
          size={qrSize}
          bgColor="#111118"
          fgColor="#e0e0e0"
          level="M"
        />
      </div>
      <div style={{
        fontFamily: font, fontWeight: 800,
        fontSize: large ? 28 : 22,
        color: C.amber, letterSpacing: 2,
        textAlign: "center",
      }}>{code}</div>
    </div>
  );
}

/* ─── SCREENS ─── */

function HomeScreen({ onNavigate }) {
  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <div style={{
          fontSize: 10, color: C.amber, letterSpacing: 5,
          fontFamily: font, fontWeight: 700, marginBottom: 8,
        }}>⬡ WAREHOUSE</div>
        <div style={{
          fontSize: 30, fontWeight: 800, fontFamily: font,
          color: C.text, letterSpacing: -0.5,
        }}>FLOOR HELPER</div>
      </div>
      <BigButton label="DOCK QR CODES" sub="Swipe through dock frame codes" color={C.amber} icon="▦" onClick={() => onNavigate("dock-dept")} />
      <BigButton label="QUICK KEYWORDS" sub="UNKNOWN · CONSOLIDATION" color="#AB47BC" icon="⚡" onClick={() => onNavigate("keywords")} />
      <BigButton label="CUSTOM QR" sub="Scan location label → QR code" color="#26A69A" icon="◎" onClick={() => onNavigate("custom")} />
      <BigButton label="PALLET GUIDE" sub="CHEP · IPP · LPR · EPS · DPB" color="#5C6BC0" icon="▤" onClick={() => onNavigate("pallets")} />
    </div>
  );
}

function DockDeptScreen({ onBack, onSelect }) {
  return (
    <div>
      <BackBar onBack={onBack} title="SELECT DEPARTMENT" />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={() => onSelect("CH")} style={{
          width: "100%", padding: "36px 20px",
          background: C.chilledDim, border: `2px solid ${C.chilledBorder}`,
          borderRadius: 16, cursor: "pointer",
          fontFamily: font, fontWeight: 800, fontSize: 24, color: C.chilled, letterSpacing: 2,
        }}>
          ❄ CHILLED
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, opacity: 0.6 }}>Odd frames: -01, -03, -05...</div>
        </button>
        <button onClick={() => onSelect("AM")} style={{
          width: "100%", padding: "36px 20px",
          background: C.ambientDim, border: `2px solid ${C.ambientBorder}`,
          borderRadius: 16, cursor: "pointer",
          fontFamily: font, fontWeight: 800, fontSize: 24, color: C.ambient, letterSpacing: 2,
        }}>
          ☀ AMBIENT
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, opacity: 0.6 }}>Even frames: -02, -04, -06...</div>
        </button>
      </div>
    </div>
  );
}

function DockSelectScreen({ onBack, dept, onSelect }) {
  const accent = dept === "CH" ? C.chilled : C.ambient;
  return (
    <div>
      <BackBar onBack={onBack} title={`${dept === "CH" ? "❄ CHILLED" : "☀ AMBIENT"} — SELECT DOCK`} accent={accent} />
      <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {DOCK_PREFIXES.flatMap(prefix =>
          DOCK_NUMBERS.map(num => {
            const dock = `${prefix}-${num}`;
            return (
              <button key={dock} onClick={() => onSelect(dock)} style={{
                padding: "24px 10px", background: C.surface,
                border: `2px solid ${C.border}`, borderRadius: 14, cursor: "pointer",
                fontFamily: font, fontWeight: 800, fontSize: 20, color: C.text, letterSpacing: 1,
              }}>{dock}</button>
            );
          })
        )}
      </div>
    </div>
  );
}

function DockSwiperScreen({ onBack, dept, dock }) {
  const frames = getFrameCodes(dept);
  const [idx, setIdx] = useState(0);
  const accent = dept === "CH" ? C.chilled : C.ambient;
  const code = `${dock}-${frames[idx]}`;
  const touchStartX = useRef(null);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(frames.length - 1, i + 1));

  return (
    <div>
      <BackBar onBack={onBack} title={`${dept === "CH" ? "❄" : "☀"} ${dock}`} accent={accent} />
      <div
        style={{
          padding: "30px 20px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 24, minHeight: "60vh", justifyContent: "center",
          userSelect: "none", touchAction: "pan-y",
        }}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return;
          const diff = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(diff) > 50) { if (diff < 0) next(); else prev(); }
          touchStartX.current = null;
        }}
      >
        <div style={{ fontFamily: font, fontSize: 13, color: C.textDim, letterSpacing: 2 }}>
          FRAME {idx + 1} / {frames.length}
        </div>
        <QRDisplay code={code} large />
        <div style={{ display: "flex", gap: 6 }}>
          {frames.map((_, i) => (
            <div key={i} style={{
              width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
              background: i === idx ? accent : `${accent}30`, transition: "all 0.2s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, width: "100%", maxWidth: 360 }}>
          <button onClick={prev} disabled={idx === 0} style={{
            flex: 1, padding: "22px 0",
            background: idx === 0 ? C.surface : `${accent}18`,
            border: `2px solid ${idx === 0 ? C.border : `${accent}40`}`,
            borderRadius: 14, cursor: idx === 0 ? "default" : "pointer",
            fontFamily: font, fontWeight: 800, fontSize: 20,
            color: idx === 0 ? C.textDim : accent, opacity: idx === 0 ? 0.4 : 1,
          }}>← PREV</button>
          <button onClick={next} disabled={idx === frames.length - 1} style={{
            flex: 1, padding: "22px 0",
            background: idx === frames.length - 1 ? C.surface : `${accent}18`,
            border: `2px solid ${idx === frames.length - 1 ? C.border : `${accent}40`}`,
            borderRadius: 14, cursor: idx === frames.length - 1 ? "default" : "pointer",
            fontFamily: font, fontWeight: 800, fontSize: 20,
            color: idx === frames.length - 1 ? C.textDim : accent, opacity: idx === frames.length - 1 ? 0.4 : 1,
          }}>NEXT →</button>
        </div>
      </div>
    </div>
  );
}

function KeywordsScreen({ onBack }) {
  const [active, setActive] = useState(null);
  const [customs, setCustoms] = useState([]);
  const [input, setInput] = useState("");
  const allKeywords = [...KEYWORDS, ...customs];

  const addCustom = () => {
    const val = input.trim().toUpperCase();
    if (val && !allKeywords.includes(val)) {
      setCustoms(prev => [...prev, val]);
      setInput("");
    }
  };

  return (
    <div>
      <BackBar onBack={onBack} title="QUICK KEYWORDS" accent="#AB47BC" />
      <div style={{ padding: 20 }}>
        {active !== null ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "20px 0" }}>
            <QRDisplay code={active} large />
            <button onClick={() => setActive(null)} style={{
              padding: "18px 40px", background: C.surface,
              border: `2px solid ${C.border}`, borderRadius: 14,
              fontFamily: font, fontWeight: 700, fontSize: 16,
              color: C.text, cursor: "pointer", width: "100%",
            }}>← BACK TO LIST</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {allKeywords.map((kw) => (
                <button key={kw} onClick={() => setActive(kw)} style={{
                  width: "100%", padding: "24px 20px", background: C.surface,
                  border: `2px solid #AB47BC40`, borderRadius: 14, cursor: "pointer",
                  fontFamily: font, fontWeight: 800, fontSize: 20,
                  color: "#CE93D8", letterSpacing: 2, textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  {kw}
                  <span style={{ fontSize: 14, opacity: 0.4 }}>→</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, fontFamily: font, fontWeight: 700, marginBottom: 10 }}>ADD CUSTOM KEYWORD</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustom()}
                placeholder="Type keyword..." style={{
                  flex: 1, padding: "16px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, color: C.text, fontSize: 16, fontFamily: font, outline: "none",
                }} />
              <button onClick={addCustom} style={{
                width: 60, background: "#AB47BC30", border: `2px solid #AB47BC50`,
                borderRadius: 12, color: "#CE93D8", fontWeight: 800, fontSize: 22, cursor: "pointer", fontFamily: font,
              }}>+</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CustomQRScreen({ onBack }) {
  const [code, setCode] = useState(null);
  const [input, setInput] = useState("");
  const [cameraMode, setCameraMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraMode(false);
    setScanning(false);
    setScanStatus("");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setCameraMode(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (err) {
      alert("Camera access denied. Use manual input instead.");
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const v = videoRef.current;
    // Make sure video is actually playing and has dimensions
    if (v.videoWidth === 0 || v.videoHeight === 0 || v.readyState < 2) {
      setScanStatus("Camera not ready. Wait a moment and try again.");
      return;
    }

    setScanning(true);
    setScanStatus("Capturing...");

    const c = canvasRef.current;
    const ctx = c.getContext("2d");

    // Crop to the center region (matching the dashed scan target)
    // Target is 90% width, ~30% height, centered
    const cropX = Math.floor(v.videoWidth * 0.05);
    const cropY = Math.floor(v.videoHeight * 0.30);
    const cropW = Math.floor(v.videoWidth * 0.90);
    const cropH = Math.floor(v.videoHeight * 0.40);

    c.width = cropW;
    c.height = cropH;
    ctx.drawImage(v, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Increase contrast for better OCR
    const imageData = ctx.getImageData(0, 0, cropW, cropH);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const avg = (d[i] + d[i+1] + d[i+2]) / 3;
      const val = avg > 127 ? 255 : 0;
      d[i] = val; d[i+1] = val; d[i+2] = val;
    }
    ctx.putImageData(imageData, 0, 0);

    setScanStatus("Reading text...");

    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.default.recognize(c, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setScanStatus(`Reading... ${Math.round((m.progress || 0) * 100)}%`);
          }
        },
      });

      const raw = data.text.trim().toUpperCase();
      console.log("RAW OCR:", raw);

      // Try to extract a valid location code from noisy OCR output
      const result = extractLocationCode(raw);

      if (result) {
        setInput(result);
        setScanStatus("Code found — edit if needed, then tap →");
      } else {
        // Fallback: show best cleaned text
        const cleaned = raw.replace(/[^A-Za-z0-9\-\s]/g, "").trim();
        if (cleaned.length > 0) {
          const segments = cleaned.split(/\s+/);
          const codeLike = segments.find(s => s.includes("-") && s.length >= 3) || segments[0] || cleaned;
          setInput(codeLike);
          setScanStatus("Raw: " + raw.substring(0, 60));
        } else {
          setScanStatus("No text found. Try again or type manually.");
        }
      }
    } catch (err) {
      setScanStatus("Scan failed. Try again or type manually.");
    }
    setScanning(false);
  };

  // Smart location code extractor
  const extractLocationCode = (raw) => {
    // Common OCR character corrections
    const fixDigits = (s) => s.replace(/O/g, "0").replace(/I/g, "1").replace(/l/g, "1").replace(/S/g, "5").replace(/B/g, "8").replace(/Z/g, "2").replace(/G/g, "6");
    const fixLetters = (s) => s.replace(/0/g, "O").replace(/1/g, "I").replace(/5/g, "S").replace(/8/g, "B");

    // Valid values for each section
    const validPrefixes = ["AM", "CH", "FR"];
    const validAisles = ["A", "B", "C", "D", "E", "F"];

    // Method 1: Try to match the full pattern directly (with flexible separators)
    // Pattern: (AM|CH|FR) - (A-F) - (3 digits) - (2 digits) - (1-2 digits)
    const fullPattern = /(?:^|[\s,;])?(AM|CH|FR)[\s\-_.]*([A-F])[\s\-_.]*(\d{2,3})[\s\-_.]*(\d{1,2})[\s\-_.]*(\d{1,2})(?:[\s,;]|$)/;
    const directMatch = raw.match(fullPattern);
    if (directMatch) {
      const [, prefix, aisle, rack, shelf, pos] = directMatch;
      const rackPad = rack.padStart(3, "0");
      const shelfPad = shelf.padStart(2, "0");
      return `${prefix}-${aisle}-${rackPad}-${shelfPad}-${pos}`;
    }

    // Method 2: Clean the string and try to find fragments
    const cleaned = raw.replace(/[^A-Z0-9\-\s]/g, " ").replace(/\s+/g, " ").trim();
    const tokens = cleaned.split(/[\s\-]+/);

    let prefix = null, aisle = null, rack = null, shelf = null, pos = null;

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      // Find prefix
      if (!prefix) {
        if (validPrefixes.includes(t)) { prefix = t; continue; }
        // OCR might read "CH" as "C H" or "0H" etc
        const fixedT = t.replace(/0/g, "O");
        if (validPrefixes.includes(fixedT)) { prefix = fixedT; continue; }
      }

      // Find aisle (single letter A-F)
      if (prefix && !aisle) {
        if (t.length === 1 && validAisles.includes(t)) { aisle = t; continue; }
      }

      // Find rack (3-digit number)
      if (aisle && !rack) {
        const digits = fixDigits(t);
        if (/^\d{1,3}$/.test(digits)) { rack = digits.padStart(3, "0"); continue; }
      }

      // Find shelf (2-digit number)
      if (rack && !shelf) {
        const digits = fixDigits(t);
        if (/^\d{1,2}$/.test(digits)) { shelf = digits.padStart(2, "0"); continue; }
      }

      // Find position (1-2 digit number, 1-14)
      if (shelf && !pos) {
        const digits = fixDigits(t);
        if (/^\d{1,2}$/.test(digits)) {
          const num = parseInt(digits, 10);
          if (num >= 1 && num <= 14) { pos = String(num); continue; }
        }
      }
    }

    if (prefix && aisle && rack && shelf && pos) {
      return `${prefix}-${aisle}-${rack}-${shelf}-${pos}`;
    }

    // Method 3: Try extracting all digits and letters from the whole string
    // and see if we can reconstruct the code
    const allChars = cleaned.replace(/[\s\-]/g, "");
    for (const pfx of validPrefixes) {
      const pfxIdx = allChars.indexOf(pfx);
      if (pfxIdx === -1) continue;

      const after = allChars.slice(pfxIdx + pfx.length);
      // Expect: 1 letter + 3 digits + 2 digits + 1-2 digits
      const reassemble = after.match(/^([A-F])(\d{3})(\d{2})(\d{1,2})/);
      if (reassemble) {
        const [, a, r, s, p] = reassemble;
        const pNum = parseInt(p, 10);
        if (pNum >= 1 && pNum <= 14) {
          return `${pfx}-${a}-${r}-${s}-${p}`;
        }
      }
    }

    return null;
  };

  const generateCode = () => {
    const val = input.trim().toUpperCase();
    if (val) { setCode(val); setInput(""); stopCamera(); }
  };

  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <div>
      <BackBar onBack={() => { stopCamera(); onBack(); }} title="CUSTOM QR" accent="#26A69A" />
      <div style={{ padding: 20 }}>
        {code && !cameraMode && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 30, padding: "20px 0" }}>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3, fontFamily: font, fontWeight: 700 }}>CURRENT QR CODE</div>
            <QRDisplay code={code} large />
          </div>
        )}
        {cameraMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Compact video preview */}
            <div style={{ position: "relative", width: "100%", height: 280, borderRadius: 14, overflow: "hidden", border: `2px solid #26A69A40` }}>
              <video ref={videoRef} autoPlay playsInline style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }} />
              {/* Scan target overlay */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%", height: 80, border: "2px dashed #26A69Acc",
                borderRadius: 6, pointerEvents: "none",
              }} />
              {/* Close button overlaid on video */}
              <button onClick={stopCamera} style={{
                position: "absolute", top: 8, right: 8,
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(0,0,0,0.6)", border: "none",
                color: "#fff", fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font,
              }}>✕</button>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Scan button */}
            <button onClick={captureAndScan} disabled={scanning} style={{
              width: "100%", padding: "18px", background: scanning ? C.surface : "#26A69A20",
              border: `2px solid ${scanning ? C.border : "#26A69A50"}`,
              borderRadius: 14, fontFamily: font, fontWeight: 800, fontSize: 16,
              color: scanning ? C.textDim : "#26A69A", cursor: scanning ? "default" : "pointer",
              letterSpacing: 1,
            }}>{scanning ? "SCANNING..." : "◎ SCAN TEXT"}</button>

            {/* Status */}
            {scanStatus && (
              <div style={{
                fontFamily: font, fontSize: 12, color: scanning ? "#FFA726" : "#26A69A",
                textAlign: "center", fontWeight: 600,
              }}>{scanStatus}</div>
            )}

            {/* Input + confirm */}
            <div style={{ display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateCode()}
                placeholder="Scanned text appears here..."
                style={{
                  flex: 1, padding: "16px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, color: C.text, fontSize: 16, fontFamily: font, outline: "none", letterSpacing: 1,
                }} />
              <button onClick={generateCode} disabled={!input.trim()} style={{
                width: 60, background: input.trim() ? "#26A69A25" : C.surface,
                border: `2px solid ${input.trim() ? "#26A69A50" : C.border}`,
                borderRadius: 12, color: input.trim() ? "#26A69A" : C.textDim,
                fontWeight: 800, fontSize: 22, cursor: input.trim() ? "pointer" : "default", fontFamily: font,
              }}>→</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={startCamera} style={{
              width: "100%", padding: "24px", background: "#26A69A15",
              border: `2px solid #26A69A40`, borderRadius: 14, cursor: "pointer",
              fontFamily: font, fontWeight: 800, fontSize: 17, color: "#26A69A", letterSpacing: 1,
            }}>◎ OPEN CAMERA & SCAN</button>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, fontFamily: font, fontWeight: 700, marginTop: 8 }}>OR TYPE LOCATION CODE</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && generateCode()}
                placeholder="e.g. CH-C-100-01-1" style={{
                  flex: 1, padding: "18px 16px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, color: C.text, fontSize: 18, fontFamily: font, outline: "none", letterSpacing: 1,
                }} />
              <button onClick={generateCode} style={{
                width: 70, background: "#26A69A25", border: `2px solid #26A69A50`,
                borderRadius: 12, color: "#26A69A", fontWeight: 800, fontSize: 22, cursor: "pointer", fontFamily: font,
              }}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PalletScreen({ onBack }) {
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    const p = PALLET_DATA[selected];
    const clr = p.color === "#1a1a1a" ? "#666" : p.color;
    return (
      <div>
        <BackBar onBack={() => setSelected(null)} title={p.name} accent={clr} />
        <div style={{ padding: 20 }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 16,
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: `${clr}25`, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: font, fontWeight: 900, fontSize: 20, color: clr,
            }}>{p.name.slice(0, 3)}</div>
            <div>
              <div style={{ fontFamily: font, fontWeight: 800, fontSize: 22, color: C.text }}>{p.name}</div>
              <div style={{ fontFamily: font, fontSize: 13, color: clr, marginTop: 2 }}>{p.colorName}</div>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: font, fontSize: 13, color: "#aaa",
            lineHeight: 1.6, marginBottom: 20,
          }}>{p.desc}</p>

          {/* Markers */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {p.markers.map((m, j) => (
              <span key={j} style={{
                background: `${clr}15`, border: `1px solid ${clr}35`,
                color: clr, borderRadius: 8, padding: "6px 14px",
                fontSize: 12, fontFamily: font, fontWeight: 600,
              }}>{m}</span>
            ))}
          </div>

          {/* Variants */}
          <div style={{
            fontSize: 10, color: C.textDim, letterSpacing: 2,
            fontFamily: font, fontWeight: 700, marginBottom: 12,
          }}>VARIANTS ({p.variants.length})</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {p.variants.map((v, vi) => (
              <div key={vi} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, overflow: "hidden",
              }}>
                {/* Image area */}
                <div style={{
                  width: "100%", height: 180,
                  background: `${clr}08`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <img
                    src={v.img}
                    alt={`${p.name} ${v.size} ${v.material}`}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div style={{
                    display: "none", position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: 8,
                  }}>
                    <PalletIllustration
                      color={p.color}
                      material={v.material}
                      size={100}
                    />
                    <div style={{
                      fontFamily: font, fontSize: 10, color: C.textDim,
                    }}>Add image: {v.img}</div>
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "14px 16px" }}>
                  <div style={{
                    fontFamily: font, fontWeight: 700, fontSize: 16, color: C.text,
                  }}>{v.size} — {v.material}</div>
                  <div style={{
                    fontFamily: font, fontSize: 12, color: C.textDim, marginTop: 4,
                  }}>{v.dims}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackBar onBack={onBack} title="PALLET GUIDE" accent="#5C6BC0" />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {PALLET_DATA.map((p, i) => {
          const clr = p.color === "#1a1a1a" ? "#666" : p.color;
          return (
            <button key={p.name} onClick={() => setSelected(i)} style={{
              width: "100%", padding: "20px 16px", background: C.surface,
              border: `1px solid ${C.border}`, borderLeft: `5px solid ${clr}`,
              borderRadius: 14, cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `${clr}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, overflow: "hidden",
                }}>
                  <PalletIllustration color={p.color} material={p.variants[0].material} size={52} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: font, fontWeight: 700, fontSize: 17, color: C.text }}>{p.name}</div>
                  <div style={{ fontFamily: font, fontSize: 12, color: C.textDim, marginTop: 2 }}>
                    {p.colorName} · {p.variants.map(v => v.size).filter((v, i, a) => a.indexOf(v) === i).join(" + ")}
                  </div>
                  <div style={{ fontFamily: font, fontSize: 11, color: `${clr}88`, marginTop: 3 }}>
                    {p.variants.length} variant{p.variants.length > 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ color: C.textDim, fontSize: 18 }}>→</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── APP ─── */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [dept, setDept] = useState(null);
  const [dock, setDock] = useState(null);

  const navigate = (s) => setScreen(s);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      maxWidth: 480, margin: "0 auto", paddingBottom: 40, overflowX: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      {screen === "home" && <HomeScreen onNavigate={navigate} />}
      {screen === "dock-dept" && <DockDeptScreen onBack={() => navigate("home")} onSelect={(d) => { setDept(d); navigate("dock-select"); }} />}
      {screen === "dock-select" && <DockSelectScreen onBack={() => navigate("dock-dept")} dept={dept} onSelect={(d) => { setDock(d); navigate("dock-swiper"); }} />}
      {screen === "dock-swiper" && <DockSwiperScreen onBack={() => navigate("dock-select")} dept={dept} dock={dock} />}
      {screen === "keywords" && <KeywordsScreen onBack={() => navigate("home")} />}
      {screen === "custom" && <CustomQRScreen onBack={() => navigate("home")} />}
      {screen === "pallets" && <PalletScreen onBack={() => navigate("home")} />}
    </div>
  );
}
