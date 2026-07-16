import { useEffect, useMemo, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import fraudLensLogo from "./assets/fraudlens-logo.png";
import "./App.css";

const USERS_KEY = "fraudlens_users_v3";
const SESSION_KEY = "fraudlens_session_v3";
const HISTORY_PREFIX = "fraudlens_history_v3";

const VISUALS = {
  analyst:
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1100&q=80",
  report:
    "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1100&q=80",
  homeHeader:
    "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&w=1200&q=80",
  textHeader:
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
  linkHeader:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  fileHeader:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  helpHeader:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  historyHeader:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
};

const NAV = [
  { id: "home", label: "Home" },
  { id: "text", label: "Scam Text Checker" },
  { id: "link", label: "Link Checker" },
  { id: "file", label: "File Checker" },
  { id: "help", label: "Protection Help" },
  { id: "history", label: "History" },
];

const SAMPLE_SCAMS = [
  {
    title: "Bank Blocked Scam",
    text: "URGENT! Your bank account has been blocked due to KYC verification. Click this link and enter your CNIC, ATM PIN and OTP to reactivate: http://bit.ly/secure-bank-update",
  },
  {
    title: "Prize Claim Scam",
    text: "Congratulations winner! You have won PKR 100,000. Send your CNIC and Easypaisa PIN now. Limited time offer. Click here to claim your prize.",
  },
  {
    title: "Parcel Fee Scam",
    text: "Delivery failed. Pay Rs 120 redelivery fee today or your parcel will be returned. Verify your address here: www.fast-parcel-help.com",
  },
];

const SHORTENERS = [
  "bit.ly",
  "tinyurl",
  "t.co",
  "cutt.ly",
  "is.gd",
  "ow.ly",
  "rebrand.ly",
  "shorturl",
  "lnkd.in",
];

const SUSPICIOUS_TLDS = [".xyz", ".top", ".click", ".work", ".live", ".buzz", ".monster"];

const TRUSTED_BRANDS = {
  jazzcash: ["jazzcash.com.pk"],
  easypaisa: ["easypaisa.com.pk"],
  hbl: ["hbl.com"],
  ubl: ["ubldigital.com", "ubl.com.pk"],
  meezan: ["meezanbank.com"],
  paypal: ["paypal.com"],
  google: ["google.com"],
  instagram: ["instagram.com"],
  facebook: ["facebook.com"],
  amazon: ["amazon.com"],
  netflix: ["netflix.com"],
};

const RISK_RULES = [
  {
    id: "otp",
    label: "OTP or verification code request",
    category: "Credential theft",
    weight: 22,
    pattern: /\b(otp|one time password|verification code|login code|security code)\b/i,
    advice: "Never share OTP, login codes, recovery codes, PINs, passwords, or CVV with anyone.",
  },
  {
    id: "pin",
    label: "PIN / ATM / CVV request",
    category: "Banking fraud",
    weight: 24,
    pattern: /\b(pin|atm pin|cvv|card number|debit card|credit card)\b/i,
    advice: "Banks and wallets do not ask for PIN, CVV, or full card details through SMS or chat.",
  },
  {
    id: "cnic",
    label: "CNIC or identity information request",
    category: "Identity theft",
    weight: 18,
    pattern: /\b(cnic|national id|id card|passport|selfie verification)\b/i,
    advice: "Do not send CNIC photos or identity documents through unknown links or numbers.",
  },
  {
    id: "urgency",
    label: "Urgency pressure",
    category: "Manipulation",
    weight: 15,
    pattern: /\b(urgent|immediately|act now|limited time|final notice|last chance|within 24 hours|today only)\b/i,
    advice: "Scammers create panic. Pause and verify from the official app or website.",
  },
  {
    id: "blocked",
    label: "Blocked or suspended account claim",
    category: "Account phishing",
    weight: 22,
    pattern: /\b(account blocked|bank blocked|account suspended|card blocked|wallet blocked|locked account|reactivate)\b/i,
    advice: "Open the official bank, wallet, or platform app yourself instead of using the message link.",
  },
  {
    id: "link",
    label: "Click-link instruction",
    category: "Phishing link",
    weight: 18,
    pattern: /\b(click here|click link|open this link|verify here|login here|claim here|tap here)\b/i,
    advice: "Avoid links inside suspicious messages. Search the official website manually.",
  },
  {
    id: "reward",
    label: "Prize, reward, or lottery bait",
    category: "Reward scam",
    weight: 16,
    pattern: /\b(prize|winner|lottery|reward|bonus|gift|free money|cashback|claim amount)\b/i,
    advice: "Do not pay fees or share details to claim unexpected prizes.",
  },
  {
    id: "payment",
    label: "Payment or fee pressure",
    category: "Payment fraud",
    weight: 14,
    pattern: /\b(pay fee|processing fee|delivery fee|registration fee|deposit|advance payment|refund)\b/i,
    advice: "Small urgent fees are commonly used in parcel, job, and prize scams.",
  },
  {
    id: "job",
    label: "Suspicious job or internship offer",
    category: "Job scam",
    weight: 13,
    pattern: /\b(remote job|easy earning|daily income|registration fee|selected for job|work from home|salary guaranteed)\b/i,
    advice: "Verify jobs through official company emails, websites, or LinkedIn pages.",
  },
  {
    id: "investment",
    label: "Investment or crypto promise",
    category: "Investment scam",
    weight: 16,
    pattern: /\b(investment|crypto|trading group|guaranteed profit|double your money|forex|signals group)\b/i,
    advice: "Avoid guaranteed returns and pressure-based investment groups.",
  },
  {
    id: "parcel",
    label: "Parcel / delivery scam pattern",
    category: "Delivery scam",
    weight: 13,
    pattern: /\b(parcel|delivery failed|redelivery|courier|shipping fee|address verification)\b/i,
    advice: "Track parcels from the courier’s official website or app only.",
  },
  {
    id: "impersonation",
    label: "Bank, wallet, or support impersonation",
    category: "Impersonation",
    weight: 15,
    pattern: /\b(bank|support team|security department|easypaisa|jazzcash|paypal|meta support|instagram support)\b/i,
    advice: "Contact support only through the official app, website, or verified phone number.",
  },
];

function getInitialRoute() {
  const hash = window.location.hash.replace("#/", "");
  return NAV.some((item) => item.id === hash) ? hash : "home";
}

function getHistoryKey(user) {
  return `${HISTORY_PREFIX}_${user.email.toLowerCase()}`;
}

function getSavedSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[char];
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractUrls(text) {
  return unique(text.match(/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi) || []);
}

function extractEmails(text) {
  return unique(text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || []);
}

function extractPhones(text) {
  return unique(
    text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g) || []
  );
}

function buildHighlightedText(text, keywords) {
  const safeText = escapeHtml(text);
  const cleanKeywords = unique(keywords)
    .map((item) => String(item).trim())
    .filter((item) => item.length > 1)
    .sort((a, b) => b.length - a.length);

  if (!cleanKeywords.length) return safeText;

  const pattern = new RegExp(`(${cleanKeywords.map(escapeRegExp).join("|")})`, "gi");
  return safeText.replace(pattern, "<mark>$1</mark>");
}

function getRiskLevel(score) {
  if (score >= 80) return { key: "danger", label: "Warning! Potential Scam Detected" };
  if (score >= 60) return { key: "high", label: "High Risk Message" };
  if (score >= 35) return { key: "medium", label: "Suspicious Message" };
  if (score > 0) return { key: "low", label: "Low Risk Signal" };
  return { key: "safe", label: "Ready to Analyze" };
}

function analyzeText(text) {
  const input = text.trim();

  if (!input) {
    return {
      score: 0,
      level: getRiskLevel(0),
      summary:
        "Paste a suspicious message or upload a screenshot. The scanner will check scam language, links, urgency, payment pressure, and sensitive information requests.",
      matches: [],
      signals: [],
      extracted: { urls: [], emails: [], phones: [] },
      advice: [
        "Do not paste real OTPs, passwords, PINs, or full card details.",
        "Use this tool before clicking unknown links or replying to urgent messages.",
      ],
      highlighted: "Your analyzed message will appear here.",
    };
  }

  const urls = extractUrls(input);
  const emails = extractEmails(input);
  const phones = extractPhones(input);
  const matchedRules = RISK_RULES.filter((rule) => rule.pattern.test(input));

  const moneyMentions = input.match(/(?:rs\.?|pkr|\$|usd|cash|reward|bonus|fee)\s?\d+/gi) || [];
  const digitCodes = input.match(/\b\d{4,8}\b/g) || [];
  const allCaps = input.match(/\b[A-Z]{4,}\b/g) || [];
  const exclamations = (input.match(/!/g) || []).length;
  const shortLinks = urls.filter((url) =>
    SHORTENERS.some((domain) => url.toLowerCase().includes(domain))
  );

  let score = matchedRules.reduce((total, rule) => total + rule.weight, 0);

  score += urls.length * 12;
  score += shortLinks.length * 15;
  score += emails.length * 5;
  score += phones.length * 5;
  score += moneyMentions.length * 8;
  score += digitCodes.length && /(otp|pin|code|verify|login)/i.test(input) ? 10 : 0;
  score += exclamations >= 2 ? 5 : 0;
  score += allCaps.length >= 2 ? 5 : 0;
  score += input.length < 70 && urls.length ? 8 : 0;

  score = Math.min(100, Math.round(score));

  const level = getRiskLevel(score);
  const categories = unique(matchedRules.map((rule) => rule.category));
  const keywordLabels = matchedRules.map((rule) => rule.label);

  let summary =
    "This content does not contain strong scam patterns, but you should still verify the sender before taking action.";

  if (score >= 80) {
    summary = `This content contains strong scam indicators. It appears to use ${categories
      .slice(0, 3)
      .join(", ")} tactics and may be designed to steal personal, financial, or login information. Do not click links, reply, send money, or share sensitive details.`;
  } else if (score >= 60) {
    summary = `This message looks risky because it contains ${keywordLabels
      .slice(0, 3)
      .join(", ")}. Verify it through an official app, website, or support channel before taking any action.`;
  } else if (score >= 35) {
    summary = `Some suspicious signals were detected, including ${keywordLabels
      .slice(0, 2)
      .join(", ")}. Treat this message carefully and avoid unknown links.`;
  }

  const signals = [
    ...matchedRules.map((rule) => ({
      title: rule.label,
      category: rule.category,
      detail: rule.advice,
      weight: rule.weight,
    })),
  ];

  if (urls.length) {
    signals.push({
      title: "External link detected",
      category: "Link inspection",
      detail: `${urls.length} link${urls.length > 1 ? "s" : ""} found in the message.`,
      weight: 12,
    });
  }

  if (shortLinks.length) {
    signals.push({
      title: "Shortened link detected",
      category: "Hidden destination",
      detail: "Short links hide the real destination and are common in phishing.",
      weight: 15,
    });
  }

  if (moneyMentions.length) {
    signals.push({
      title: "Money amount mentioned",
      category: "Payment pressure",
      detail: `Detected money-related phrase: ${moneyMentions[0]}`,
      weight: 8,
    });
  }

  if (exclamations >= 2 || allCaps.length >= 2) {
    signals.push({
      title: "High-pressure tone",
      category: "Manipulation",
      detail: "The message uses intense formatting or repeated urgency.",
      weight: 5,
    });
  }

  const advice = unique([
    ...matchedRules.map((rule) => rule.advice),
    urls.length ? "Do not click the message link. Type the official website manually." : "",
    shortLinks.length ? "Avoid shortened links when the message is about banking, jobs, prizes, or parcels." : "",
    emails.length ? "Check the email domain spelling carefully before replying." : "",
    phones.length ? "Do not call unknown numbers without checking the official contact source." : "",
    score >= 60 ? "Take a screenshot, block the sender, and report it if money or identity details were requested." : "",
    "Ask a trusted person to review suspicious messages before acting.",
  ]);

  const highlightTerms = [
    ...matchedRules.flatMap((rule) => {
      const source = String(rule.pattern);
      return source
        .replace(/[\\/()|?+*^$[\].]/g, " ")
        .split(" ")
        .filter((word) => word.length > 3);
    }),
    ...urls,
    ...emails,
    ...phones,
    ...moneyMentions,
  ];

  return {
    score,
    level,
    summary,
    matches: matchedRules,
    signals,
    extracted: { urls, emails, phones },
    advice,
    highlighted: buildHighlightedText(input, highlightTerms),
  };
}

function analyzeLink(rawLink) {
  const input = rawLink.trim();

  if (!input) {
    return {
      score: 0,
      level: getRiskLevel(0),
      summary: "Paste a link to inspect its domain, protocol, shortener usage, and phishing patterns.",
      checks: [],
      domain: "",
      finalUrl: "",
      advice: ["Do not open shortened or unknown links from urgent messages."],
    };
  }

  let url;
  let normalized = input;

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    url = new URL(normalized);
  } catch {
    return {
      score: 75,
      level: getRiskLevel(75),
      summary:
        "This link is not formatted like a normal safe URL. It may be broken, hidden, or intentionally confusing.",
      checks: [
        {
          title: "Invalid URL format",
          status: "Risk",
          detail: "Scammers sometimes use broken or misleading links to hide the actual destination.",
        },
      ],
      domain: "",
      finalUrl: input,
      advice: ["Do not open this link. Ask the sender for an official website instead."],
    };
  }

  const domain = url.hostname.toLowerCase().replace(/^www\./, "");
  const checks = [];
  let score = 0;

  if (url.protocol !== "https:") {
    score += 18;
    checks.push({
      title: "Not using HTTPS",
      status: "Risk",
      detail: "Safe sites usually use HTTPS encryption.",
    });
  } else {
    checks.push({
      title: "HTTPS present",
      status: "Good",
      detail: "The link uses HTTPS, but HTTPS alone does not prove the site is safe.",
    });
  }

  if (SHORTENERS.some((short) => domain.includes(short))) {
    score += 25;
    checks.push({
      title: "Shortened link",
      status: "Risk",
      detail: "Short links hide the real destination and are commonly used in phishing.",
    });
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
    score += 25;
    checks.push({
      title: "IP address domain",
      status: "Risk",
      detail: "Legitimate brands rarely send raw IP-address links.",
    });
  }

  if ((domain.match(/-/g) || []).length >= 2) {
    score += 10;
    checks.push({
      title: "Too many hyphens",
      status: "Warning",
      detail: "Fake domains often use extra hyphens to look official.",
    });
  }

  if (domain.length > 35) {
    score += 12;
    checks.push({
      title: "Long domain",
      status: "Warning",
      detail: "Very long domains can be used to confuse users.",
    });
  }

  if (SUSPICIOUS_TLDS.some((tld) => domain.endsWith(tld))) {
    score += 16;
    checks.push({
      title: "Suspicious top-level domain",
      status: "Warning",
      detail: "This domain ending is often seen in low-trust promotional or scam links.",
    });
  }

  Object.entries(TRUSTED_BRANDS).forEach(([brand, officialDomains]) => {
    if (domain.includes(brand)) {
      const isOfficial = officialDomains.some(
        (official) => domain === official || domain.endsWith(`.${official}`)
      );

      if (!isOfficial) {
        score += 28;
        checks.push({
          title: `Possible ${brand} impersonation`,
          status: "Risk",
          detail: `The domain mentions "${brand}" but does not match the official known domain pattern.`,
        });
      }
    }
  });

  if (url.pathname.length > 70) {
    score += 8;
    checks.push({
      title: "Long tracking path",
      status: "Warning",
      detail: "Long paths can hide redirects, tracking, or fake login pages.",
    });
  }

  if (!checks.some((check) => check.status === "Risk" || check.status === "Warning")) {
    checks.push({
      title: "No major URL pattern risk",
      status: "Good",
      detail: "No obvious technical risk pattern found. Still verify the sender and page content.",
    });
  }

  score = Math.min(100, score);
  const level = getRiskLevel(score);

  let summary = "No major technical red flag was found, but only open links from trusted and expected senders.";
  if (score >= 80) {
    summary = "This link has multiple phishing indicators. Do not open it or enter personal information.";
  } else if (score >= 60) {
    summary = "This link looks risky. Verify it from the official website or app before opening.";
  } else if (score >= 35) {
    summary = "This link has some suspicious patterns. Open only if you fully trust the sender.";
  }

  const advice = unique([
    "Do not enter passwords, OTPs, CNIC, card numbers, or wallet PINs on unknown links.",
    score >= 35 ? "Search the brand manually or open the official app instead." : "",
    SHORTENERS.some((short) => domain.includes(short))
      ? "Ask the sender for the full original link instead of a short link."
      : "",
    "Check spelling carefully. Fake domains often add extra words, hyphens, or strange endings.",
  ]);

  return {
    score,
    level,
    summary,
    checks,
    domain,
    finalUrl: url.href,
    advice,
  };
}

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File could not be read."));
    reader.readAsText(file);
  });
}

async function extractImageText(file, setProgress) {
  const worker = await createWorker("eng", 1, {
    logger: (message) => {
      if (message.status === "recognizing text") {
        setProgress(Math.round((message.progress || 0) * 100));
      }
    },
  });

  const result = await worker.recognize(file);
  await worker.terminate();

  return result?.data?.text || "";
}

function analyzeFileMeta(file, extractedText) {
  const name = file.name.toLowerCase();
  const sizeMb = file.size / (1024 * 1024);

  const dangerousExt = [".exe", ".scr", ".bat", ".cmd", ".vbs", ".js", ".apk", ".msi"];
  const warningExt = [".zip", ".rar", ".7z", ".docm", ".xlsm"];

  const checks = [];
  let score = 0;

  if (dangerousExt.some((ext) => name.endsWith(ext))) {
    score += 45;
    checks.push({
      title: "Dangerous file extension",
      status: "Risk",
      detail: "Executable or script files can install malware or steal data.",
    });
  }

  if (warningExt.some((ext) => name.endsWith(ext))) {
    score += 25;
    checks.push({
      title: "Risky attachment type",
      status: "Warning",
      detail: "Compressed or macro-enabled files are commonly used in scams.",
    });
  }

  if (sizeMb > 20) {
    score += 8;
    checks.push({
      title: "Large file size",
      status: "Warning",
      detail: "Large unknown attachments should be handled carefully.",
    });
  }

  if (/invoice|payment|prize|urgent|bank|kyc|verification|password|otp/i.test(name)) {
    score += 14;
    checks.push({
      title: "Suspicious filename wording",
      status: "Warning",
      detail: "Scammers often name files with urgent financial or verification words.",
    });
  }

  const textResult = analyzeText(extractedText);

  score = Math.min(100, score + Math.round(textResult.score * 0.7));
  const level = getRiskLevel(score);

  let summary = "The file scan is complete. No major attachment danger pattern was found.";
  if (score >= 80) {
    summary = "This file or its extracted text contains strong scam indicators. Do not open, forward, or trust it.";
  } else if (score >= 60) {
    summary = "This file looks risky. Check the sender and avoid opening attachments from unknown sources.";
  } else if (score >= 35) {
    summary = "Some suspicious file or text patterns were detected. Handle it carefully.";
  }

  return {
    score,
    level,
    summary,
    checks,
    textResult,
    extractedText,
    advice: textResult.advice,
  };
}

export default function App() {
  const [route, setRoute] = useState(getInitialRoute);
  const [menuOpen, setMenuOpen] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [uploadName, setUploadName] = useState("");
  const [fileReport, setFileReport] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(getSavedSession);
  const [authModal, setAuthModal] = useState({ open: false, mode: "login" });

  const textRef = useRef(null);
  const linkRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const topRef = useRef(null);

  const textAnalysis = useMemo(() => analyzeText(textMessage), [textMessage]);
  const linkAnalysis = useMemo(() => analyzeLink(linkValue), [linkValue]);

  useEffect(() => {
    if (!currentUser) {
      setHistory([]);
      return;
    }

    const saved = localStorage.getItem(getHistoryKey(currentUser));

    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(getHistoryKey(currentUser), JSON.stringify(history));
    }
  }, [history, currentUser]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#/", "");
      if (NAV.some((item) => item.id === hash)) setRoute(hash);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const current = NAV.find((item) => item.id === route);
    document.title = `${current?.label || "FraudLens"} | Scam Security Checker`;

    topRef.current?.scrollIntoView({ behavior: "smooth" });

    if (route === "text") setTimeout(() => textRef.current?.focus(), 250);
    if (route === "link") setTimeout(() => linkRef.current?.focus(), 250);
  }, [route]);

  function go(id) {
    setRoute(id);
    setMenuOpen(false);
    window.location.hash = `/${id}`;
  }

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function openAuth(mode = "login") {
    setAuthModal({ open: true, mode });
  }

  function closeAuth() {
    setAuthModal({ open: false, mode: "login" });
  }

  function handleAuthSuccess(user, message) {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    closeAuth();
    notify(message);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setHistory([]);
    notify("Logged out successfully");
  }

  function saveHistory(type, input, result) {
    if (!currentUser) {
      notify("Please login to save scan history");
      openAuth("login");
      return;
    }

    if (!input.trim()) {
      notify("Nothing to save yet");
      return;
    }

    const item = {
      id: Date.now(),
      type,
      date: new Date().toLocaleString(),
      preview: input.trim().slice(0, 150),
      score: result.score,
      level: result.level.label,
      levelKey: result.level.key,
    };

    setHistory((prev) => [item, ...prev].slice(0, 15));
    notify("Scan saved in your history");
  }

  async function handleImageForText(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please upload an image screenshot");
      return;
    }

    try {
      setUploadName(file.name);
      setOcrLoading(true);
      setOcrProgress(0);
      const extracted = await extractImageText(file, setOcrProgress);

      if (!extracted.trim()) {
        notify("No readable text found in image");
      }

      setTextMessage(extracted.trim());
      go("text");
    } catch {
      notify("Image text extraction failed");
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
      event.target.value = "";
    }
  }

  async function handleFileCheck(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setFileLoading(true);
      setFileReport(null);
      setOcrProgress(0);

      let extractedText = "";
      const isTextFile =
        file.type.startsWith("text/") ||
        /\.(txt|md|csv|json|html|eml|log)$/i.test(file.name);

      if (file.type.startsWith("image/")) {
        extractedText = await extractImageText(file, setOcrProgress);
      } else if (isTextFile) {
        extractedText = await readTextFile(file);
      } else if (/\.(pdf|doc|docx)$/i.test(file.name)) {
        extractedText =
          "This document type was uploaded. For full content scanning in this React-only version, copy the file text or upload a screenshot/text file. The filename and attachment risk are still checked.";
      } else {
        extractedText =
          "Unsupported file content. The scanner checked filename, extension, and attachment risk patterns only.";
      }

      const report = analyzeFileMeta(file, extractedText);

      setFileReport({
        name: file.name,
        type: file.type || "Unknown type",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        ...report,
      });
    } catch {
      notify("File scan failed");
    } finally {
      setFileLoading(false);
      setOcrProgress(0);
      event.target.value = "";
    }
  }

  async function copyReport(type, result, input) {
    const lines = [
      "FraudLens Security Report",
      `Type: ${type}`,
      `Risk Level: ${result.level.label}`,
      `Risk Score: ${result.score}/100`,
      "",
      "Summary:",
      result.summary || "File scan completed.",
      "",
      "Input Preview:",
      input.trim().slice(0, 500),
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      notify("Report copied");
    } catch {
      notify("Copy failed");
    }
  }

  return (
    <div className="app-shell" ref={topRef}>
      {toast && <div className="toast">{toast}</div>}

      <Header
        route={route}
        go={go}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        currentUser={currentUser}
        openAuth={openAuth}
        logout={logout}
      />

      <main>
        {route === "home" && <Home go={go} />}

        {route === "text" && (
          <TextChecker
            textMessage={textMessage}
            setTextMessage={setTextMessage}
            textAnalysis={textAnalysis}
            textRef={textRef}
            saveHistory={saveHistory}
            copyReport={copyReport}
            imageInputRef={imageInputRef}
            handleImageForText={handleImageForText}
            ocrLoading={ocrLoading}
            ocrProgress={ocrProgress}
            uploadName={uploadName}
          />
        )}

        {route === "link" && (
          <LinkChecker
            linkValue={linkValue}
            setLinkValue={setLinkValue}
            linkAnalysis={linkAnalysis}
            linkRef={linkRef}
            saveHistory={saveHistory}
            copyReport={copyReport}
          />
        )}

        {route === "file" && (
          <FileChecker
            fileInputRef={fileInputRef}
            handleFileCheck={handleFileCheck}
            fileReport={fileReport}
            fileLoading={fileLoading}
            ocrProgress={ocrProgress}
            saveHistory={saveHistory}
          />
        )}

        {route === "help" && <ProtectionHelp go={go} notify={notify} />}

        {route === "history" && (
          <History
            history={history}
            setHistory={setHistory}
            go={go}
            notify={notify}
            currentUser={currentUser}
            openAuth={openAuth}
          />
        )}
      </main>

      <Footer go={go} />

      {authModal.open && (
        <AuthModal
          mode={authModal.mode}
          setMode={(mode) => setAuthModal({ open: true, mode })}
          closeAuth={closeAuth}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

function Header({
  route,
  go,
  menuOpen,
  setMenuOpen,
  currentUser,
  openAuth,
  logout,
}) {
  return (
    <header className="navbar">
      <button className="brand" onClick={() => go("home")}>
        <span className="logo-mark image-logo">
          <img src={fraudLensLogo} alt="FraudLens logo" />
        </span>
        <span>
          <strong>FraudLens</strong>
          <small>Message Security</small>
        </span>
      </button>

      <nav className={menuOpen ? "nav-links open" : "nav-links"}>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={route === item.id ? "active" : ""}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {currentUser ? (
        <div className="user-chip">
          <span>Hi, {currentUser.name.split(" ")[0]}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="auth-actions">
          <button onClick={() => openAuth("login")}>Login</button>
          <button onClick={() => openAuth("signup")}>Sign Up</button>
        </div>
      )}

      <button
        className="menu-btn"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

function Home({ go }) {
  return (
    <section className="home-page page">
      <div className="hero">
        <div className="hero-content hero-heading-bg" style={{ "--heading-image": `url(${VISUALS.homeHeader})` }}>
          <span className="eyebrow">Scam, phishing and fraud awareness scanner</span>
          <h1>Check suspicious messages before you trust them.</h1>
          <p>
            FraudLens analyzes scam texts, unknown links, uploaded screenshots, and risky files
            with a stronger security engine, OCR image reading, and practical protection steps.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => go("text")}>
              Scan Scam Text
            </button>
          </div>

          <div className="trust-row">
            <div>
              <strong>OCR</strong>
              <span>Image text scan</span>
            </div>
            <div>
              <strong>URL</strong>
              <span>Link risk check</span>
            </div>
            <div>
              <strong>User</strong>
              <span>Protected history</span>
            </div>
          </div>
        </div>

        <ScannerHero />
      </div>

      <section className="insight-section">
        <div>
          <img src={VISUALS.analyst} alt="Security analyst workspace" />
        </div>
        <div>
          <span className="eyebrow">Better logic</span>
          <h2>Not just keyword matching</h2>
          <p>
            The scanner combines urgency, sensitive data requests, money pressure,
            link patterns, short domains, impersonation clues, file names, and OCR text.
            That gives a clearer result instead of a weak basic message.
          </p>
        </div>
      </section>
    </section>
  );
}

function ScannerHero() {
  return (
    <div className="scanner-hero">
      <div className="scanner-glow" />
      <div className="scanner-device">
        <div className="device-top">
          <span />
          <small>Live Scan</small>
        </div>

        <div className="scan-screen">
          <div className="scan-line" />
          <div className="msg-bubble danger">URGENT: Your bank account is blocked</div>
          <div className="msg-bubble">Click link to verify KYC</div>
          <div className="msg-bubble danger">Enter OTP and ATM PIN</div>

          <div className="scan-result-card">
            <span>Potential Scam Detected</span>
            <strong>92%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextChecker({
  textMessage,
  setTextMessage,
  textAnalysis,
  textRef,
  saveHistory,
  copyReport,
  imageInputRef,
  handleImageForText,
  ocrLoading,
  ocrProgress,
  uploadName,
}) {
  return (
    <section className="page">
      <PageTitle
        label="Scam Text Checker"
        title="Analyze pasted text or uploaded message screenshots"
        text="Paste suspicious content or upload a screenshot. OCR extracts text from the image and scans it for fraud patterns."
        image={VISUALS.textHeader}
      />

      <div className="checker-layout">
        <div className="input-panel">
          <div className="panel-head">
            <div>
              <span className="mini-label">Message input</span>
              <h2>Paste suspicious content</h2>
            </div>
            <span className="counter">{textMessage.length}/1600</span>
          </div>

          <textarea
            ref={textRef}
            value={textMessage}
            maxLength={1600}
            onChange={(event) => setTextMessage(event.target.value)}
            placeholder="Example: URGENT! Your account is blocked. Click this link and enter OTP..."
          />

          <div className="upload-line">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageForText}
            />
            <button className="secondary-btn" onClick={() => imageInputRef.current?.click()}>
              Upload Screenshot
            </button>
            <span>
              {ocrLoading
                ? `Reading image text... ${ocrProgress}%`
                : uploadName
                  ? `Last image: ${uploadName}`
                  : "Supports message screenshots"}
            </span>
          </div>

          <div className="sample-buttons">
            {SAMPLE_SCAMS.map((sample) => (
              <button key={sample.title} onClick={() => setTextMessage(sample.text)}>
                {sample.title}
              </button>
            ))}
          </div>

          <div className="action-row">
            <button
              className="primary-btn"
              onClick={() => saveHistory("Text Scan", textMessage, textAnalysis)}
            >
              Save Scan
            </button>
            <button
              className="secondary-btn"
              onClick={() => copyReport("Text Scan", textAnalysis, textMessage)}
            >
              Copy Report
            </button>
            <button className="plain-btn" onClick={() => setTextMessage("")}>
              Clear
            </button>
          </div>
        </div>

        <ResultPanel result={textAnalysis} />
      </div>

      <div className="details-grid">
        <div className="detail-card large">
          <span className="mini-label">Analysis summary</span>
          <h2>{textAnalysis.level.label}</h2>
          <p>{textAnalysis.summary}</p>
        </div>

        <div className="detail-card">
          <span className="mini-label">Extracted data</span>
          <DataList label="Links" items={textAnalysis.extracted.urls} />
          <DataList label="Emails" items={textAnalysis.extracted.emails} />
          <DataList label="Numbers" items={textAnalysis.extracted.phones} />
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <span className="mini-label">Highlighted content</span>
          <div
            className="highlight-box"
            dangerouslySetInnerHTML={{ __html: textAnalysis.highlighted }}
          />
        </div>

        <SignalsCard signals={textAnalysis.signals} advice={textAnalysis.advice} />
      </div>
    </section>
  );
}

function LinkChecker({
  linkValue,
  setLinkValue,
  linkAnalysis,
  linkRef,
  saveHistory,
  copyReport,
}) {
  return (
    <section className="page">
      <PageTitle
        label="Link Checker"
        title="Check suspicious links before opening them"
        text="Inspect short links, fake brand domains, strange endings, IP-based URLs, non-HTTPS links, and misleading URL patterns."
        image={VISUALS.linkHeader}
      />

      <div className="link-layout">
        <div className="input-panel">
          <span className="mini-label">URL input</span>
          <h2>Paste unknown link</h2>

          <input
            ref={linkRef}
            className="url-input"
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://example.com/login-verification"
          />

          <div className="quick-links">
            <button onClick={() => setLinkValue("http://bit.ly/secure-bank-update")}>
              Short bank link
            </button>
            <button onClick={() => setLinkValue("https://jazzcash-security-login.xyz/verify")}>
              Fake wallet domain
            </button>
            <button onClick={() => setLinkValue("https://google.com")}>
              Normal example
            </button>
          </div>

          <div className="action-row">
            <button
              className="primary-btn"
              onClick={() => saveHistory("Link Scan", linkValue, linkAnalysis)}
            >
              Save Link Scan
            </button>
            <button
              className="secondary-btn"
              onClick={() => copyReport("Link Scan", linkAnalysis, linkValue)}
            >
              Copy Report
            </button>
          </div>
        </div>

        <ResultPanel result={linkAnalysis} />
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <span className="mini-label">Domain result</span>
          <h2>{linkAnalysis.domain || "No domain yet"}</h2>
          <p>{linkAnalysis.summary}</p>
          {linkAnalysis.finalUrl && <code className="url-code">{linkAnalysis.finalUrl}</code>}
        </div>

        <div className="detail-card">
          <span className="mini-label">URL checks</span>
          <div className="check-list">
            {linkAnalysis.checks.map((check, index) => (
              <div key={`${check.title}-${index}`} className={`check-row ${check.status.toLowerCase()}`}>
                <strong>{check.title}</strong>
                <span>{check.status}</span>
                <p>{check.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdviceCard advice={linkAnalysis.advice} />
    </section>
  );
}

function FileChecker({
  fileInputRef,
  handleFileCheck,
  fileReport,
  fileLoading,
  ocrProgress,
  saveHistory,
}) {
  const resultForPanel =
    fileReport || {
      score: 0,
      level: getRiskLevel(0),
      summary: "Upload a text file or message screenshot to start file security checking.",
      advice: ["Do not open unknown attachments from urgent or reward-based messages."],
    };

  return (
    <section className="page">
      <PageTitle
        label="File Checker"
        title="Scan screenshots and text-based suspicious files"
        text="Upload a scam screenshot, TXT, email text, CSV, JSON, HTML, or similar file. The checker reads text and combines it with attachment risk rules."
        image={VISUALS.fileHeader}
      />

      <div className="file-layout">
        <div className="input-panel file-drop">
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".txt,.md,.csv,.json,.html,.eml,.log,image/*,.pdf,.doc,.docx,.zip,.rar,.js,.apk,.exe"
            onChange={handleFileCheck}
          />

          <div className="drop-icon">⬆</div>
          <h2>Upload file or screenshot</h2>
          <p>
            For image screenshots, OCR extracts visible text first. For text files,
            content is scanned directly.
          </p>

          <button className="primary-btn" onClick={() => fileInputRef.current?.click()}>
            Choose File
          </button>

          {fileLoading && (
            <div className="progress-wrap">
              <span>Scanning file... {ocrProgress ? `${ocrProgress}%` : ""}</span>
              <div>
                <i style={{ width: `${ocrProgress || 45}%` }} />
              </div>
            </div>
          )}
        </div>

        <ResultPanel result={resultForPanel} />
      </div>

      {fileReport && (
        <>
          <div className="details-grid">
            <div className="detail-card">
              <span className="mini-label">File details</span>
              <h2>{fileReport.name}</h2>
              <p>Type: {fileReport.type}</p>
              <p>Size: {fileReport.size}</p>
              <button
                className="secondary-btn"
                onClick={() => saveHistory("File Scan", fileReport.name, fileReport)}
              >
                Save File Scan
              </button>
            </div>

            <div className="detail-card">
              <span className="mini-label">Attachment checks</span>
              {fileReport.checks.length ? (
                <div className="check-list">
                  {fileReport.checks.map((check, index) => (
                    <div key={`${check.title}-${index}`} className={`check-row ${check.status.toLowerCase()}`}>
                      <strong>{check.title}</strong>
                      <span>{check.status}</span>
                      <p>{check.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No dangerous file-extension pattern found. Still open unknown files carefully.</p>
              )}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <span className="mini-label">Extracted text preview</span>
              <div className="highlight-box">
                {fileReport.extractedText?.slice(0, 1200) || "No readable text extracted."}
              </div>
            </div>

            <SignalsCard
              signals={fileReport.textResult.signals}
              advice={fileReport.textResult.advice}
            />
          </div>
        </>
      )}
    </section>
  );
}

function ProtectionHelp({ go, notify }) {
  return (
    <section className="page">
      <PageTitle
        label="Protection Help"
        title="What to do after detecting a scam"
        text="A scanner is useful, but real protection starts after you know what the risk is."
        image={VISUALS.helpHeader}
      />

      <div className="help-hero">
        <img src={VISUALS.report} alt="Cyber report dashboard" />
        <div>
          <span className="mini-label">Emergency safety flow</span>
          <h2>Do not reply. Document it. Report it.</h2>
          <p>
            If the message asks for money, OTP, account login, identity documents, or card
            details, treat it seriously. Take screenshots, preserve sender details, and use
            official complaint channels.
          </p>
          <button className="primary-btn" onClick={() => go("text")}>
            Scan Another Message
          </button>
        </div>
      </div>

      <div className="solution-grid">
        <SolutionCard
          step="01"
          title="Stop interaction"
          text="Do not click, reply, call back, download attachments, or enter details."
        />
        <SolutionCard
          step="02"
          title="Secure accounts"
          text="Change passwords if you entered login details. Enable two-factor authentication."
        />
        <SolutionCard
          step="03"
          title="Contact bank or wallet"
          text="If money or card details are involved, call official bank/wallet support immediately."
        />
        <SolutionCard
          step="04"
          title="Report cybercrime"
          text="Use the official cyber complaint portal or nearest cybercrime reporting center."
        />
      </div>

      <div className="contact-grid">
        <ContactCard
          title="FIA Complaint Portal"
          text="Submit cybercrime-related complaints through the official FIA complaint portal."
          link="https://complaint.fia.gov.pk/"
          button="Open FIA Portal"
        />
        <ContactCard
          title="NCCIA Complaint Portal"
          text="Open the national cybercrime complaint portal for online reporting."
          link="https://complaint.nccia.gov.pk/"
          button="Open NCCIA"
        />
        <ContactCard
          title="Bank / Wallet Verification"
          text="For banking or wallet fraud, verify through the official complaint and support channel."
          link="https://sunwai.sbp.org.pk/"
          button="Verify Officially"
          notify={notify}
        />
      </div>
    </section>
  );
}

function History({ history, setHistory, go, notify, currentUser, openAuth }) {
  if (!currentUser) {
    return (
      <section className="page">
        <PageTitle
          label="Scan History"
          title="Your saved security checks"
          text="Login first to view and save your scan history."
          image={VISUALS.historyHeader}
        />

        <div className="empty-box auth-required-box">
          <h2>Login required</h2>
          <p>Your scan history appears here after you login and save a text, link, or file scan.</p>
          <div className="hero-buttons centered">
            <button className="primary-btn" onClick={() => openAuth("login")}>
              Login
            </button>
            <button className="secondary-btn" onClick={() => openAuth("signup")}>
              Create Account
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <PageTitle
        label="Scan History"
        title="Your saved security checks"
        text="Review your saved text, link, and file scans from your current account."
        image={VISUALS.historyHeader}
      />

      <div className="history-actions">
        <button className="primary-btn" onClick={() => go("text")}>
          New Text Scan
        </button>
        <button
          className="secondary-btn"
          onClick={() => {
            setHistory([]);
            notify("History cleared");
          }}
          disabled={!history.length}
        >
          Clear History
        </button>
      </div>

      {history.length ? (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className={`history-card ${item.levelKey}`}>
              <div>
                <span>{item.type}</span>
                <h3>{item.level}</h3>
                <p>{item.preview}</p>
                <small>{item.date}</small>
              </div>
              <strong>{item.score}/100</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-box">
          <h2>No saved scans yet</h2>
          <p>Run a text, link, or file scan and save it to see it here.</p>
        </div>
      )}
    </section>
  );
}

function AuthModal({ mode, setMode, closeAuth, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);

  useEffect(() => {
    setErrors({});
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [mode]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === "signup") {
      if (!form.name.trim()) nextErrors.name = "Full name is required.";
      else if (form.name.trim().length < 3) nextErrors.name = "Name must be at least 3 characters.";
    }

    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!emailRegex.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";

    if (!form.password) nextErrors.password = "Password is required.";
    else if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password)) nextErrors.password = "Add at least one uppercase letter.";
    else if (!/[0-9]/.test(form.password)) nextErrors.password = "Add at least one number.";

    if (mode === "signup") {
      if (!form.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
      else if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const users = getUsers();
    const cleanEmail = form.email.trim().toLowerCase();

    if (mode === "signup") {
      const exists = users.some((user) => user.email === cleanEmail);

      if (exists) {
        setErrors({ email: "This email is already registered. Please login." });
        return;
      }

      const newUser = {
        id: Date.now(),
        name: form.name.trim(),
        email: cleanEmail,
        password: form.password,
      };

      const publicUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };

      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      onSuccess(publicUser, "Account created successfully");
      return;
    }

    const matchedUser = users.find((user) => user.email === cleanEmail);

    if (!matchedUser) {
      setErrors({ email: "No account found with this email. Please sign up first." });
      return;
    }

    if (matchedUser.password !== form.password) {
      setErrors({ password: "Incorrect password." });
      return;
    }

    onSuccess(
      {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
      },
      "Logged in successfully"
    );
  }

  return (
    <div className="modal-backdrop" onMouseDown={closeAuth}>
      <div className="auth-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={closeAuth}>
          ×
        </button>

        <span className="mini-label">{mode === "login" ? "Welcome back" : "Create secure account"}</span>
        <h2>{mode === "login" ? "Login to FraudLens" : "Sign up for FraudLens"}</h2>
        <p>
          {mode === "login"
            ? "Login to save and view your scan history."
            : "Create an account to keep your saved security scans separate."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label>
              Full Name
              <input
                ref={firstInputRef}
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Malaika Tariq"
              />
              {errors.name && <small>{errors.name}</small>}
            </label>
          )}

          <label>
            Email Address
            <input
              ref={mode === "login" ? firstInputRef : null}
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
            />
            {errors.email && <small>{errors.email}</small>}
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Min 8 characters, uppercase and number"
            />
            {errors.password && <small>{errors.password}</small>}
          </label>

          {mode === "signup" && (
            <label>
              Confirm Password
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
            </label>
          )}

          <button className="primary-btn" type="submit">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              <span>New here?</span>
              <button onClick={() => setMode("signup")}>Create an account</button>
            </>
          ) : (
            <>
              <span>Already registered?</span>
              <button onClick={() => setMode("login")}>Login now</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PageTitle({ label, title, text, image }) {
  return (
    <div
      className="page-title title-image"
      style={{ "--title-image": `url(${image})` }}
    >
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function ResultPanel({ result }) {
  return (
    <div className={`result-panel ${result.level.key}`}>
      <div className="risk-icon">!</div>
      <h2>{result.level.label}</h2>
      <p>{result.summary}</p>

      <div className="score-circle" style={{ "--score": `${result.score * 3.6}deg` }}>
        <div>
          <strong>{result.score}</strong>
          <span>/100</span>
        </div>
      </div>

      <div className="score-line">
        <i style={{ width: `${result.score}%` }} />
      </div>
    </div>
  );
}

function DataList({ label, items }) {
  return (
    <div className="data-list">
      <strong>{label}</strong>
      {items.length ? (
        items.map((item) => <code key={item}>{item}</code>)
      ) : (
        <p>No {label.toLowerCase()} detected.</p>
      )}
    </div>
  );
}

function SignalsCard({ signals, advice }) {
  return (
    <div className="detail-card">
      <span className="mini-label">Security breakdown</span>

      <div className="signal-list">
        {signals.length ? (
          signals.map((signal, index) => (
            <div key={`${signal.title}-${index}`} className="signal-row">
              <strong>{signal.title}</strong>
              <span>{signal.category}</span>
              <p>{signal.detail}</p>
            </div>
          ))
        ) : (
          <p>No strong scam signal detected yet.</p>
        )}
      </div>

      <AdviceCard advice={advice} compact />
    </div>
  );
}

function AdviceCard({ advice, compact }) {
  return (
    <div className={compact ? "advice-card compact" : "advice-card"}>
      <span className="mini-label">Recommended action</span>
      {advice.map((tip, index) => (
        <div key={`${tip}-${index}`}>
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <p>{tip}</p>
        </div>
      ))}
    </div>
  );
}

function SolutionCard({ step, title, text }) {
  return (
    <div className="solution-card">
      <span>{step}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function ContactCard({ title, text, link, button, notify }) {
  function handleClick() {
    if (notify) notify("Opening official verification portal");
  }

  return (
    <div className="contact-card">
      <h3>{title}</h3>
      <p>{text}</p>
      <a href={link} target="_blank" rel="noreferrer" onClick={handleClick}>
        {button}
      </a>
    </div>
  );
}

function Footer({ go }) {
  return (
    <footer className="footer">
      <div>
        <strong>FraudLens</strong>
        <p>Scan first. Click later.</p>
      </div>
      <div>
        <button onClick={() => go("text")}>Text</button>
        <button onClick={() => go("link")}>Link</button>
        <button onClick={() => go("file")}>File</button>
        <button onClick={() => go("help")}>Help</button>
      </div>
    </footer>
  );
}