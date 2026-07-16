import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from "react";
import "./App.css";

const AppContext = createContext(null);

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const getTime = () =>
  new Date().toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });

const today = () => new Date().toISOString().slice(0, 10);

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    setValue(readStorage(key, initialValue));
  }, [key]);

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}

const images = {
  home: "https://images.squarespace-cdn.com/content/v1/67eee6bb5e41c62a2d8268cf/805efc32-531d-477c-a8a3-695e1be9a158/Product%2BRoadmap%2B%2B%2BGTM%2B%287%29.png",
  features: "https://images.squarespace-cdn.com/content/v1/67eee6bb5e41c62a2d8268cf/f403c8a4-a248-4789-807d-39c6153da1ec/quick-access%2BSOS%2Bpanic%2Bbutton%2Balarm",
  awareness: "https://images.squarespace-cdn.com/content/v1/67eee6bb5e41c62a2d8268cf/2f0e1821-1314-4841-b11c-b37a0d429d7e/Live-location%2Bsharing%2Bwith%2Bselected%2Bfriends",
  dashboard: "https://images.squarespace-cdn.com/content/v1/67eee6bb5e41c62a2d8268cf/50d7232e-e105-4674-86bd-09409d59f2fa/SOS%2Bpanic%2Bbutton%2Bpressed%2Bmode",
  sos: "https://images.squarespace-cdn.com/content/v1/67eee6bb5e41c62a2d8268cf/50d7232e-e105-4674-86bd-09409d59f2fa/SOS%2Bpanic%2Bbutton%2Bpressed%2Bmode",
  journey: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=85",
  circle: "https://images.squarespace-cdn.com/content/v1/67eee6bb5e41c62a2d8268cf/f403c8a4-a248-4789-807d-39c6153da1ec/quick-access%2BSOS%2Bpanic%2Bbutton%2Balarm",
  fake: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1400&q=85",
  vault: "https://images.squarespace-cdn.com/content/v1/67eee6bb5e41c62a2d8268cf/d55848f0-6b32-4638-a471-a517c30c71fc/Epowar%2BEvidence%2BPack",
  tips: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1400&q=85",
  profile: "https://static.wixstatic.com/media/facf59_e7d69943d4e14c9b8bfab54591920b06~mv2.jpg/v1/fill/w_301%2Ch_400%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/FEMME-SEULE-VILLE.jpg",
  settings: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1400&q=85",
  history: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=85",
  authSignup: "https://static.wixstatic.com/media/facf59_db1eba94274e4cff9fabf9ebc628c29c~mv2.jpg/v1/crop/x_76%2Cy_0%2Cw_697%2Ch_535/fill/w_434%2Ch_333%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/ENSEMBLE.jpg",
  authLogin: "https://static.wixstatic.com/media/facf59_eab5e379f7dd46fb8a9f5440d3bdb205~mv2.jpg/v1/fill/w_490%2Ch_327%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/facf59_eab5e379f7dd46fb8a9f5440d3bdb205~mv2.jpg"
};

const contactRoles = [
  "Primary Guardian",
  "Family Contact",
  "Friend",
  "Nearby Helper",
  "Medical Contact",
  "Legal Contact"
];

const transports = ["Walk", "Bus", "Rickshaw", "Car", "Ride"];
const risks = ["Low", "Medium", "High"];
const statuses = ["Draft", "Reported", "Resolved"];
const placeTypes = ["Home", "University", "Office", "Police Station", "Hospital", "Friend’s House"];

const sosModes = {
  "Silent SOS": {
    title: "Silent emergency alert",
    text: "Use when you cannot openly ask for help. It silently saves alert, contacts and location.",
    countdown: 10
  },
  "Loud SOS": {
    title: "Visible emergency alert",
    text: "Use when you want stronger emergency mode and quick attention.",
    countdown: 8
  },
  "Fake SOS": {
    title: "Disguised emergency alert",
    text: "Use when you want the alert to look less obvious while still saving emergency data.",
    countdown: 12
  },
  "Quick SOS": {
    title: "Fast default alert",
    text: "Use when there is no time to type. It sends a ready emergency message.",
    countdown: 6
  },
  "Custom SOS": {
    title: "Custom message alert",
    text: "Use when you want to send your own emergency note with location.",
    countdown: 10
  }
};

const initialContact = {
  name: "",
  relation: "",
  phone: "",
  email: "",
  role: "Family Contact",
  priority: "2",
  city: "",
  sosEnabled: true,
  primary: false
};

const initialIncident = {
  title: "",
  date: today(),
  time: "",
  location: "",
  description: "",
  person: "",
  risk: "Medium",
  status: "Draft",
  evidence: "",
  preview: ""
};

const safetyTips = [
  {
    id: "tip-1",
    category: "Night travel",
    title: "Share your route before leaving",
    text: "Send destination, transport, expected arrival and check-in plan to a trusted person.",
    risk: "High"
  },
  {
    id: "tip-2",
    category: "Night travel",
    title: "Prefer visible roads",
    text: "Choose active roads with shops, lights, traffic, guards or families nearby.",
    risk: "Medium"
  },
  {
    id: "tip-3",
    category: "Public transport",
    title: "Keep emergency actions ready",
    text: "Keep SOS, fake call and a trusted contact ready before entering crowded transport.",
    risk: "Medium"
  },
  {
    id: "tip-4",
    category: "Ride safety",
    title: "Verify every ride detail",
    text: "Match driver name, car model, number plate and route before entering the vehicle.",
    risk: "Medium"
  },
  {
    id: "tip-5",
    category: "Online harassment",
    title: "Save evidence first",
    text: "Capture usernames, messages, time, links and screenshots before blocking or reporting.",
    risk: "High"
  },
  {
    id: "tip-6",
    category: "Emergency response",
    title: "Send short clear alerts",
    text: "Use location, situation and required help in one short message.",
    risk: "High"
  },
  {
    id: "tip-7",
    category: "Campus safety",
    title: "Know safe points",
    text: "Mark security office, admin room, medical room, trusted faculty office and exits.",
    risk: "Low"
  },
  {
    id: "tip-8",
    category: "Self-confidence",
    title: "Trust discomfort",
    text: "Leaving early, changing route or calling someone is valid when something feels unsafe.",
    risk: "Medium"
  },
  {
    id: "tip-9",
    category: "Ride safety",
    title: "Use calm route tracking",
    text: "For low-risk travel, keep your route open and send one short update before departure.",
    risk: "Low"
  }
];

const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);
const isPhone = (value) => /^\+?\d[\d\s-]{8,}$/.test(value);
const isRequired = (value) => value && value.toString().trim().length > 0;

function getSafetyBreakdown({ profile, contacts, safePlaces, journeys, incidents, fakeCallConfigured }) {
  const profileFields = [
    profile?.name,
    isEmail(profile?.email || "") ? profile.email : "",
    isPhone(profile?.phone || "") ? profile.phone : "",
    profile?.city,
    profile?.blood,
    profile?.emergencyNote
  ];

  const profileValue = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 25);
  const pinValue = /^\d{4}$/.test(profile?.safetyPin || "") ? 15 : 0;
  const contactValue = Math.round(Math.min((contacts.length / 3) * 20, 20));
  const primaryValue = contacts.some((item) => item.primary) ? 10 : 0;
  const placeValue = Math.round(Math.min((safePlaces.length / 2) * 10, 10));
  const journeyValue = journeys.some((item) => item.status === "Completed") ? 8 : 0;
  const fakeValue = fakeCallConfigured ? 7 : 0;
  const vaultValue = incidents.length ? 5 : 0;

  const segments = [
    { label: "Profile", value: profileValue, color: "#0f5f50" },
    { label: "PIN", value: pinValue, color: "#317464" },
    { label: "Contacts", value: contactValue, color: "#22c55e" },
    { label: "Primary", value: primaryValue, color: "#14b8a6" },
    { label: "Places", value: placeValue, color: "#84cc16" },
    { label: "Journey", value: journeyValue, color: "#3b82f6" },
    { label: "Fake Call", value: fakeValue, color: "#a855f7" },
    { label: "Vault", value: vaultValue, color: "#f59e0b" }
  ];

  return {
    segments,
    score: Math.min(100, segments.reduce((total, item) => total + item.value, 0))
  };
}

async function findLocation(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=en&q=${encodeURIComponent(query)}`,
    {
      headers: {
        "Accept-Language": "en"
      }
    }
  );

  if (!response.ok) {
    throw new Error("The map service is not responding right now.");
  }

  const data = await response.json();

  if (!data.length) {
    throw new Error(`"${query}" was not found. Enter a clearer area, city or landmark name.`);
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    name: data[0].display_name
  };
}

function contactsReducer(state, action) {
  if (action.type === "load") return Array.isArray(action.payload) ? action.payload : [];

  if (action.type === "add") {
    const contact = { ...action.payload, id: makeId(), createdAt: getTime() };

    if (contact.primary) {
      return [contact, ...state.map((item) => ({ ...item, primary: false }))];
    }

    return [contact, ...state];
  }

  if (action.type === "restore") {
    return [action.payload, ...state.filter((item) => item.id !== action.payload.id)];
  }

  if (action.type === "edit") {
    return state.map((item) => {
      if (item.id === action.payload.id) return action.payload;
      if (action.payload.primary) return { ...item, primary: false };
      return item;
    });
  }

  if (action.type === "delete") return state.filter((item) => item.id !== action.payload);

  if (action.type === "primary") {
    return state.map((item) => ({
      ...item,
      primary: item.id === action.payload
    }));
  }

  if (action.type === "toggleSOS") {
    return state.map((item) =>
      item.id === action.payload ? { ...item, sosEnabled: !item.sosEnabled } : item
    );
  }

  return state;
}

function incidentsReducer(state, action) {
  if (action.type === "load") return Array.isArray(action.payload) ? action.payload : [];

  if (action.type === "add") {
    return [{ ...action.payload, id: makeId(), createdAt: getTime() }, ...state];
  }

  if (action.type === "restore") {
    return [action.payload, ...state.filter((item) => item.id !== action.payload.id)];
  }

  if (action.type === "delete") return state.filter((item) => item.id !== action.payload);

  if (action.type === "status") {
    return state.map((item) =>
      item.id === action.payload.id ? { ...item, status: action.payload.status } : item
    );
  }

  return state;
}

export default function App() {
  const [users, setUsers] = useLocalStorage("sheshield_users", []);
  const [activeUser, setActiveUser] = useLocalStorage("sheshield_active_user", null);
  const [theme, setTheme] = useLocalStorage("sheshield_theme", "dark");
  const [page, setPage] = useState(activeUser ? "dashboard" : "home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [moreMenu, setMoreMenu] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [pinRequest, setPinRequest] = useState(null);
  const [alertBox, setAlertBox] = useState(null);
  const [undoPopup, setUndoPopup] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const undoTimerRef = useRef(null);

  const accountKey = activeUser ? `sheshield_${activeUser.email}` : "sheshield_guest";

  const profileSeed = useMemo(
    () => ({
      name: activeUser?.name || "",
      email: activeUser?.email || "",
      phone: activeUser?.phone || "",
      city: activeUser?.city || "",
      blood: "",
      emergencyNote: "",
      safetyPin: ""
    }),
    [activeUser]
  );

  const emptyProfile = {
    name: "",
    email: "",
    phone: "",
    city: "",
    blood: "",
    emergencyNote: "",
    safetyPin: ""
  };

  const [profile, setProfile] = useLocalStorage(`${accountKey}_profile`, profileSeed);
  const [sosHistory, setSosHistory] = useLocalStorage(`${accountKey}_sos_history`, []);
  const [journeys, setJourneys] = useLocalStorage(`${accountKey}_journeys`, []);
  const [safePlaces, setSafePlaces] = useLocalStorage(`${accountKey}_safe_places`, []);
  const [favoriteTips, setFavoriteTips] = useLocalStorage(`${accountKey}_favorite_tips`, []);
  const [timeline, setTimeline] = useLocalStorage(`${accountKey}_timeline`, []);
  const [dangerWords, setDangerWords] = useLocalStorage(`${accountKey}_danger_words`, [
    "red bag",
    "blue file",
    "code 22"
  ]);
  const [fakeCallConfigured, setFakeCallConfigured] = useLocalStorage(
    `${accountKey}_fake_call_configured`,
    false
  );

  const [contacts, dispatchContacts] = useReducer(
    contactsReducer,
    [],
    () => readStorage(`${accountKey}_contacts`, [])
  );

  const [incidents, dispatchIncidents] = useReducer(
    incidentsReducer,
    [],
    () => readStorage(`${accountKey}_incidents`, [])
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    dispatchContacts({
      type: "load",
      payload: readStorage(`${accountKey}_contacts`, [])
    });

    dispatchIncidents({
      type: "load",
      payload: readStorage(`${accountKey}_incidents`, [])
    });
  }, [accountKey]);

  useEffect(() => {
    writeStorage(`${accountKey}_contacts`, contacts);
  }, [accountKey, contacts]);

  useEffect(() => {
    writeStorage(`${accountKey}_incidents`, incidents);
  }, [accountKey, incidents]);

  useEffect(() => {
    if (!activeUser && !["home", "features", "awareness", "login", "signup"].includes(page)) {
      setPage("home");
    }
  }, [activeUser, page]);

  const breakdown = useMemo(
    () =>
      getSafetyBreakdown({
        profile,
        contacts,
        safePlaces,
        journeys,
        incidents,
        fakeCallConfigured
      }),
    [profile, contacts, safePlaces, journeys, incidents, fakeCallConfigured]
  );

  const safetyScore = breakdown.score;

  const showToast = (message, type = "info") => {
    const toastId = makeId();

    setToasts((items) => [...items, { id: toastId, message, type }]);

    setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== toastId));
    }, 3200);
  };

  const showAlert = (title, message, type = "warning") => {
    setAlertBox({ title, message, type });
  };

  const showUndo = (message, onUndo) => {
    clearTimeout(undoTimerRef.current);

    setUndoPopup({
      id: makeId(),
      message,
      onUndo
    });

    undoTimerRef.current = setTimeout(() => {
      setUndoPopup(null);
    }, 6500);
  };

  const addTimeline = (title, detail, type = "info") => {
    setTimeline((items) => [
      { id: makeId(), title, detail, type, at: getTime() },
      ...items
    ].slice(0, 35));
  };

  const navigate = (target) => {
    const publicPages = ["home", "features", "awareness", "login", "signup"];

    if (!publicPages.includes(target) && !activeUser) {
      setPage("login");
      showAlert("Login required", "Please login first to open this protected page.");
      return;
    }

    setPage(target);
    setMobileMenu(false);
    setMoreMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const signup = (form) => {
    const errors = {};

    if (!isRequired(form.name)) errors.name = "Name is required";
    if (!isEmail(form.email)) errors.email = "Enter a valid email";
    if (users.some((item) => item.email === form.email.toLowerCase())) errors.email = "This email is already registered";
    if (form.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!isRequired(form.city)) errors.city = "City is required";
    if (!isPhone(form.phone)) errors.phone = "Enter a valid phone number";

    if (Object.keys(errors).length) {
      showAlert("Check signup details", Object.values(errors)[0]);
      return errors;
    }

    const newUser = {
      id: makeId(),
      name: form.name.trim(),
      email: form.email.toLowerCase(),
      password: form.password,
      city: form.city.trim(),
      phone: form.phone.trim()
    };

    setUsers((items) => [newUser, ...items]);

    writeStorage(`sheshield_${newUser.email}_profile`, {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      city: newUser.city,
      blood: "",
      emergencyNote: "",
      safetyPin: ""
    });

    setActiveUser(newUser);
    setPage("dashboard");
    showToast(`Welcome, ${newUser.name}`, "success");

    return null;
  };

  const login = (form) => {
    const foundUser = users.find((item) => item.email === form.email.toLowerCase());

    if (!foundUser) {
      showAlert("Account not found", "No account exists with this email. Please signup first.");
      return { email: "No account found with this email" };
    }

    if (foundUser.password !== form.password) {
      showAlert("Incorrect password", "Please enter the correct password for this account.");
      return { password: "Incorrect password" };
    }

    setActiveUser(foundUser);
    setPage("dashboard");
    showToast(`Logged in as ${foundUser.name}`, "success");

    return null;
  };

  const logout = () => {
    setActiveUser(null);
    setPage("home");
    showToast("Logged out successfully", "info");
  };

  const requestPin = (request) => {
    if (!/^\d{4}$/.test(profile.safetyPin || "")) {
      showAlert("Safety PIN required", "Set your 4-digit Safety PIN first from the Profile page.");
      setPage("profile");
      return;
    }

    setPinRequest(request);
  };

  const clearAccountData = () => {
    if (!activeUser) return;

    Object.keys(localStorage)
      .filter((key) => key.startsWith(`sheshield_${activeUser.email}_`))
      .forEach((key) => localStorage.removeItem(key));

    setProfile(emptyProfile);
    setSosHistory([]);
    setJourneys([]);
    setSafePlaces([]);
    setFavoriteTips([]);
    setTimeline([]);
    setDangerWords(["red bag", "blue file", "code 22"]);
    setFakeCallConfigured(false);
    dispatchContacts({ type: "load", payload: [] });
    dispatchIncidents({ type: "load", payload: [] });
    showToast("Your local safety data was cleared.", "success");
  };

  const value = {
    activeUser,
    profile,
    setProfile,
    theme,
    setTheme,
    page,
    navigate,
    mobileMenu,
    setMobileMenu,
    moreMenu,
    setMoreMenu,
    contacts,
    dispatchContacts,
    incidents,
    dispatchIncidents,
    sosHistory,
    setSosHistory,
    journeys,
    setJourneys,
    safePlaces,
    setSafePlaces,
    favoriteTips,
    setFavoriteTips,
    timeline,
    setTimeline,
    dangerWords,
    setDangerWords,
    fakeCallConfigured,
    setFakeCallConfigured,
    safetyScore,
    breakdown,
    showToast,
    showAlert,
    showUndo,
    setDetailModal,
    addTimeline,
    signup,
    login,
    logout,
    requestPin,
    clearAccountData
  };

  return (
    <AppContext.Provider value={value}>
      <CustomCursor />
      <Background />
      <Navbar />
      <main className="appShell">
        <Router />
      </main>
      <Footer />
      {pinRequest && <PinModal request={pinRequest} close={() => setPinRequest(null)} />}
      {alertBox && <AlertModal alert={alertBox} close={() => setAlertBox(null)} />}
      {undoPopup && <UndoPopup undoPopup={undoPopup} close={() => setUndoPopup(null)} />}
      {detailModal && <DetailModal modal={detailModal} close={() => setDetailModal(null)} />}
      <Toasts items={toasts} />
    </AppContext.Provider>
  );
}

function useApp() {
  return useContext(AppContext);
}

function CustomCursor() {
  const glowRef = useRef(null);

  useEffect(() => {
    const moveCursor = (event) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    };

    window.addEventListener("mousemove", moveCursor);

    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return <span ref={glowRef} className="cursorGlow" />;
}

function Background() {
  return (
    <div className="backgroundLayer">
      <span />
      <span />
      <span />
      <b />
      <b />
      {Array.from({ length: 22 }).map((_, index) => (
        <i
          key={index}
          style={{
            left: `${(index * 19) % 100}%`,
            top: `${(index * 29) % 100}%`,
            animationDelay: `${index * 0.32}s`
          }}
        />
      ))}
    </div>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span className="logoImageWrap">
        <img src="/sheshield-logo.png" alt="SheShield logo" className="logoImage" />
      </span>
      <strong>SheShield</strong>
    </div>
  );
}

function Navbar() {
  const {
    activeUser,
    page,
    navigate,
    mobileMenu,
    setMobileMenu,
    moreMenu,
    setMoreMenu,
    theme,
    setTheme,
    logout
  } = useApp();

  const publicLinks = [
    ["home", "Home"],
    ["features", "Features"],
    ["awareness", "Safety Guide"]
  ];

  const mainPrivateLinks = [
    ["dashboard", "Dashboard"],
    ["sos", "SOS"],
    ["journey", "Journey"],
    ["circle", "Circle"]
  ];

  const moreLinks = [
    ["fake", "Fake Call"],
    ["vault", "Vault"],
    ["tips", "Tips"],
    ["history", "History"],
    ["profile", "Profile"],
    ["settings", "Settings"]
  ];

  return (
    <header className="navbar">
      <button className="brandButton" onClick={() => navigate(activeUser ? "dashboard" : "home")}>
        <Logo />
      </button>

      <nav className={mobileMenu ? "navLinks show" : "navLinks"}>
        {(activeUser ? mainPrivateLinks : publicLinks).map(([key, label]) => (
          <button key={key} className={page === key ? "active" : ""} onClick={() => navigate(key)}>
            {label}
          </button>
        ))}

        {activeUser && (
          <div className="moreWrap">
            <button
              className={moreLinks.some(([key]) => key === page) ? "active" : ""}
              onClick={() => setMoreMenu(!moreMenu)}
            >
              More
            </button>

            {moreMenu && (
              <div className="moreMenu">
                {moreLinks.map(([key, label]) => (
                  <button key={key} className={page === key ? "active" : ""} onClick={() => navigate(key)}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="navActions">
        <button className="roundButton" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "☾" : "☀"}
        </button>

        {activeUser ? (
          <>
            <span className="userPill">Hi, {activeUser.name.split(" ")[0]}</span>
            <button className="smallButton" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button className="smallButton mutedButton" onClick={() => navigate("login")}>Login</button>
            <button className="smallButton accentButton" onClick={() => navigate("signup")}>Signup</button>
          </>
        )}

        <button className="menuButton" onClick={() => setMobileMenu(!mobileMenu)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function Router() {
  const { page } = useApp();

  const pages = {
    home: <Home />,
    features: <Features />,
    awareness: <Awareness />,
    login: <Login />,
    signup: <Signup />,
    dashboard: <Dashboard />,
    sos: <SmartSOS />,
    journey: <JourneyMode />,
    circle: <TrustedCircle />,
    fake: <FakeCall />,
    vault: <IncidentVault />,
    tips: <SafetyTips />,
    history: <HistoryPage />,
    profile: <Profile />,
    settings: <Settings />
  };

  return pages[page] || <Home />;
}

function PageHero({ label, title, text, image, children }) {
  return (
    <section className="pageHero">
      <div className="heroText">
        <span className="eyebrow">{label}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        {children && <div className="heroActions">{children}</div>}
      </div>

      <ImagePanel image={image} title={title} />
    </section>
  );
}

function ImagePanel({ image, title }) {
  return (
    <div
      className="imagePanel"
      style={{
        backgroundImage: `linear-gradient(145deg, rgba(4, 18, 15, 0.08), rgba(15, 95, 80, 0.12)), url(${images[image]})`
      }}
    >
      <div>
        <span>Safety Preview</span>
        <h3>{title}</h3>
        <p>Calm actions, trusted support and private safety planning.</p>
      </div>
    </div>
  );
}

function Card({ title, text, children, className = "" }) {
  return (
    <article className={`card ${className}`}>
      {title && <h3>{title}</h3>}
      {text && <p>{text}</p>}
      {children}
    </article>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="emptyState">
      <Logo />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  options,
  textarea = false,
  placeholder = "",
  hint = ""
}) {
  const normalizedOptions = options?.map((option) =>
    typeof option === "object" ? option : { label: option, value: option }
  );

  return (
    <label className="field">
      <span>{label}</span>

      {textarea ? (
        <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : options ? (
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}

      {hint && <em>{hint}</em>}
    </label>
  );
}

function RealSafetyMap({
  title = "Safety map",
  subtitle = "Google map location preview",
  risk = "Medium",
  from = "",
  to = ""
}) {
  const { showToast, showAlert } = useApp();
  const defaultQuery = "Gulshan-e-Iqbal Karachi Pakistan";
  const defaultFrame = `https://www.google.com/maps?q=${encodeURIComponent(defaultQuery)}&z=14&output=embed`;
  const defaultOpen = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(defaultQuery)}`;

  const [status, setStatus] = useState(subtitle);
  const [routeInfo, setRouteInfo] = useState("");
  const [frameUrl, setFrameUrl] = useState(defaultFrame);
  const [openLink, setOpenLink] = useState(defaultOpen);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert("Location unavailable", "Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const query = `${lat},${lon}`;

        setFrameUrl(`https://www.google.com/maps?q=${query}&z=16&output=embed`);
        setOpenLink(`https://www.google.com/maps/search/?api=1&query=${query}`);
        setStatus(`Current location: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        showToast("Current location loaded on Google map.", "success");
      },
      () => {
        showAlert("Location permission blocked", "Allow location permission in your browser to show your current area.");
      }
    );
  };

  const findRoute = async () => {
    if (!isRequired(from) || !isRequired(to)) {
      showAlert("Route details missing", "Enter both starting point and destination before finding the safest path.");
      return;
    }

    try {
      setStatus("Checking locations and opening safest route...");
      const start = await findLocation(from);
      const end = await findLocation(to);

      const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`
      );

      const routeData = await routeResponse.json();

      if (!routeData.routes?.length) {
        throw new Error("Route not found.");
      }

      const route = routeData.routes[0];
      const km = (route.distance / 1000).toFixed(1);
      const min = Math.round(route.duration / 60);
      const origin = `${start.lat},${start.lon}`;
      const destination = `${end.lat},${end.lon}`;

      setFrameUrl(
        `https://www.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&hl=en&output=embed`
      );
      setOpenLink(
        `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
      );
      setRouteInfo(`${km} km · ${min} min suggested route`);
      setStatus("Google map route loaded.");
      showToast("Google map route loaded successfully.", "success");
    } catch (error) {
      setStatus(error.message || "Route could not be loaded.");
      showAlert("Route could not be loaded", error.message || "Try clearer location names with city name included.");
    }
  };

  return (
    <div className="realMapCard">
      <div className="mapHeader">
        <div>
          <strong>{title}</strong>
          <p>{status}</p>
          {routeInfo && <small>{routeInfo}</small>}
        </div>

        <em className={`riskPill ${risk.toLowerCase()}`}>{risk} risk</em>
      </div>

      <iframe
        className="googleMapFrame leafletMap"
        src={frameUrl}
        title={title}
        loading="lazy"
        allowFullScreen
      />

      <div className="mapButtons">
        <button type="button" className="accentButton" onClick={useCurrentLocation}>
          Use My Location
        </button>
        <button type="button" className="mutedButton" onClick={findRoute}>
          Find Safest Path
        </button>
        <button type="button" className="mutedButton" onClick={() => window.open(openLink, "_blank")}>
          Open Map
        </button>
      </div>
    </div>
  );
}

function Home() {
  const { navigate } = useApp();

  return (
    <section className="homeHero">
      <div>
        <span className="eyebrow">Women Safety Companion</span>
        <h1>Safety tools designed for calm and confident action.</h1>
        <p>
          SheShield gives users a serious safety-tech experience with SOS simulation,
          journey check-ins, trusted contacts, fake call, incident records, trusted locations
          and privacy-focused local storage.
        </p>

        <div className="heroActions">
          <button className="accentButton largeButton" onClick={() => navigate("signup")}>
            Create Safety Account
          </button>
          <button className="mutedButton largeButton" onClick={() => navigate("features")}>
            Explore Features
          </button>
        </div>
      </div>

      <div className="heroVisual">
        <ImagePanel image="home" title="Personal safety companion" />
      </div>
    </section>
  );
}

function Features() {
  const { navigate } = useApp();

  const features = [
    ["Profile", "Set personal details, emergency note and Safety PIN.", "profile"],
    ["Trusted Circle", "Add guardians, family, friend, nearby helper, medical and legal contacts.", "circle"],
    ["Journey + Locations", "Use route timer, real map, check-ins and trusted places in one page.", "journey"],
    ["Smart SOS", "Use emergency modes with real map preview and trusted contacts.", "sos"],
    ["Fake Call", "Create a realistic call screen to safely exit uncomfortable moments.", "fake"],
    ["Incident Vault", "Save sensitive incident details and evidence notes.", "vault"],
    ["Safety Tips", "Read and save practical safety tips.", "tips"],
    ["History", "Review complete safety activity history.", "history"]
  ];

  return (
    <>
      <PageHero
        label="Features"
        title="Every safety module has a clear purpose"
        text="Explore the complete SheShield feature set and open the module you want to test."
        image="features"
      />

      <section className="featureDirectory">
        {features.map(([title, text, target]) => (
          <button key={title} className="directoryCard" onClick={() => navigate(target)}>
            <h3>{title}</h3>
            <p>{text}</p>
            <span>Open</span>
          </button>
        ))}
      </section>
    </>
  );
}

function Awareness() {
  return (
    <>
      <PageHero
        label="Safety Guide"
        title="Plan early, respond calmly"
        text="Awareness helps users notice risk, choose the right action and document important details."
        image="awareness"
      />

      <section className="featureDirectory">
        {[
          ["Before travel", "Share route, expected arrival and check-in time."],
          ["During discomfort", "Use fake call, move to a visible area and contact a trusted person."],
          ["During emergency", "Use SOS and avoid wasting time writing long messages."],
          ["After incident", "Save facts, location, time, person involved and evidence notes."]
        ].map(([title, text]) => (
          <Card key={title} title={title} text={text} />
        ))}
      </section>
    </>
  );
}

function AuthPage({ mode }) {
  const { signup, login, navigate } = useApp();
  const isSignup = mode === "signup";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();

    const result = isSignup ? signup(form) : login(form);

    if (result) setErrors(result);
  };

  return (
    <section className="authLayout">
      <form className="card formCard" onSubmit={submit}>
        <Logo />
        <span className="eyebrow">{isSignup ? "Create account" : "Welcome back"}</span>
        <h1>{isSignup ? "Start your safety setup" : "Login to SheShield"}</h1>

        {isSignup && (
          <>
            <Field label="Full name" value={form.name} onChange={(value) => setField("name", value)} />
            {errors.name && <small>{errors.name}</small>}
          </>
        )}

        <Field label="Email" type="email" value={form.email} onChange={(value) => setField("email", value)} />
        {errors.email && <small>{errors.email}</small>}

        {isSignup && (
          <>
            <Field label="Phone" value={form.phone} placeholder="+92 300 0000000" onChange={(value) => setField("phone", value)} />
            {errors.phone && <small>{errors.phone}</small>}

            <Field label="City" value={form.city} onChange={(value) => setField("city", value)} />
            {errors.city && <small>{errors.city}</small>}
          </>
        )}

        <Field label="Password" type="password" value={form.password} onChange={(value) => setField("password", value)} />
        {errors.password && <small>{errors.password}</small>}

        {isSignup && (
          <>
            <Field
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(value) => setField("confirmPassword", value)}
            />
            {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
          </>
        )}

        <button className="accentButton fullButton">{isSignup ? "Create Account" : "Login"}</button>

        <p className="authSwitch">
          {isSignup ? "Already have an account?" : "New to SheShield?"}
          <button type="button" onClick={() => navigate(isSignup ? "login" : "signup")}>
            {isSignup ? "Login" : "Signup"}
          </button>
        </p>
      </form>

      <ImagePanel image={isSignup ? "authSignup" : "authLogin"} title={isSignup ? "Build trusted support" : "Open safety dashboard"} />
    </section>
  );
}

function Login() {
  return <AuthPage mode="login" />;
}

function Signup() {
  return <AuthPage mode="signup" />;
}

function Dashboard() {
  const {
    activeUser,
    safetyScore,
    breakdown,
    contacts,
    sosHistory,
    journeys,
    incidents,
    timeline,
    navigate,
    dangerWords,
    setSosHistory,
    addTimeline,
    showToast
  } = useApp();

  const completedJourneys = journeys.filter((item) => item.status === "Completed").length;

  const triggerSecretAlert = (message) => {
    const enabledContacts = contacts.filter((item) => item.sosEnabled);

    const alert = {
      id: makeId(),
      mode: "Secret danger word",
      time: getTime(),
      note: message,
      contacts: enabledContacts.map((item) => item.name),
      location: "Location alert created from secret phrase"
    };

    setSosHistory((items) => [alert, ...items]);
    addTimeline("Secret safety alert activated", "Danger word found in message.", "danger");
    showToast("Secret safety alert activated.", "danger");
  };

  return (
    <>
      <PageHero
        label="Dashboard"
        title={`Welcome back, ${activeUser?.name || "User"}`}
        text="Monitor your safety score, recent activity, emergency history and important safety data."
        image="dashboard"
      >
        <button className="accentButton largeButton" onClick={() => navigate("sos")}>Open SOS</button>
        <button className="mutedButton largeButton" onClick={() => navigate("journey")}>Start Journey</button>
      </PageHero>

      <section className="dashboardTop">
        <Card className="scoreCard">
          <ScoreCircle score={safetyScore} />
          <div>
            <span className="eyebrow">Smart Safety Score</span>
            <h2>{safetyScore >= 80 ? "Strong setup" : safetyScore >= 55 ? "Almost ready" : "Setup needed"}</h2>
            <p>
              This score improves when your profile, trusted contacts, safety PIN,
              trusted places and safety actions are properly prepared.
            </p>
          </div>
        </Card>

        <div className="metricGrid">
          <Metric title="Contacts" value={contacts.length} />
          <Metric title="SOS alerts" value={sosHistory.length} />
          <Metric title="Completed journeys" value={completedJourneys} />
          <Metric title="Incidents" value={incidents.length} />
        </div>
      </section>

      <DashboardCharts
        contactsCount={contacts.length}
        sosCount={sosHistory.length}
        journeyCount={completedJourneys}
        incidentCount={incidents.length}
        safetyScore={safetyScore}
        segments={breakdown.segments}
      />

      <section className="twoColumn balanceGrid dashboardActionGrid">
        <DangerWordTester words={dangerWords} onTrigger={triggerSecretAlert} />
        <Timeline items={timeline} />
      </section>
    </>
  );
}

function ScoreCircle({ score }) {
  return (
    <div className="scoreCircle" style={{ "--score": `${score * 3.6}deg` }}>
      <div>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <article className="metricCard">
      <strong>{value}</strong>
      <span>{title}</span>
    </article>
  );
}

function DashboardCharts({ contactsCount, sosCount, journeyCount, incidentCount, safetyScore, segments }) {
  const activityData = [
    ["Contacts", contactsCount, "#0f5f50"],
    ["SOS", sosCount, "#ef4444"],
    ["Journeys", journeyCount, "#3b82f6"],
    ["Incidents", incidentCount, "#f59e0b"]
  ];

  const maxValue = Math.max(...activityData.map((item) => item[1]), 1);

  const pieGradient = useMemo(() => {
    let angle = 0;
    const parts = segments
      .filter((item) => item.value > 0)
      .map((item) => {
        const start = angle;
        angle += item.value * 3.6;
        return `${item.color} ${start}deg ${angle}deg`;
      });

    if (angle < 360) {
      parts.push(`var(--line2) ${angle}deg 360deg`);
    }

    return `conic-gradient(${parts.join(", ")})`;
  }, [segments]);

  return (
    <section className="dashboardCharts">
      <Card className="largeCard chartCard">
        <span className="eyebrow">Bar chart</span>
        <h2>Safety activity overview</h2>

        <div className="barChart">
          {activityData.map(([label, value, color]) => (
            <div key={label} className="barItem" style={{ "--barColor": color }}>
              <strong>{value}</strong>
              <span style={{ height: `${Math.max(18, (value / maxValue) * 100)}%` }} />
              <p>{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="largeCard pieCard">
        <span className="eyebrow">Pie chart</span>
        <h2>Readiness breakdown</h2>

        <div className="pieChart" style={{ background: pieGradient }}>
          <strong>{safetyScore}%</strong>
        </div>

        <div className="preparedLine">
          <span><b style={{ background: "#0f5f50" }} /> Prepared: {safetyScore}%</span>
          <span><b style={{ background: "var(--line2)" }} /> Remaining setup: {100 - safetyScore}%</span>
        </div>

        <div className="setupLegend">
          {segments.map((item) => (
            <span key={item.label}>
              <i style={{ background: item.color }} />
              {item.label}: {item.value}%
            </span>
          ))}
        </div>
      </Card>
    </section>
  );
}

function Timeline({ items }) {
  const { navigate } = useApp();

  return (
    <Card className="largeCard timelineCard">
      <span className="eyebrow">Recent timeline</span>
      <h2>Safety activity</h2>

      {!items.length ? (
        <EmptyState title="No activity yet" text="After using SOS, Journey, Fake Call or Vault, activity will appear here." />
      ) : (
        <>
          <div className="timelineList compact">
            {items.slice(0, 3).map((item) => (
              <article key={item.id} className={item.type}>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <small>{item.at}</small>
              </article>
            ))}
          </div>

          <button className="accentButton historyButton" onClick={() => navigate("history")}>
            View Complete History
          </button>
        </>
      )}
    </Card>
  );
}

function HistoryPage() {
  const {
    timeline,
    setTimeline,
    sosHistory,
    setSosHistory,
    journeys,
    setJourneys,
    incidents,
    dispatchIncidents,
    showUndo
  } = useApp();

  const [selected, setSelected] = useState([]);

  const historyItems = useMemo(() => {
    const items = [
      ...timeline.map((item) => ({
        key: `timeline-${item.id}`,
        rawId: item.id,
        raw: item,
        sourceKey: "timeline",
        title: item.title,
        detail: item.detail,
        type: item.type,
        time: item.at,
        source: "Timeline"
      })),
      ...sosHistory.map((item) => ({
        key: `sos-${item.id}`,
        rawId: item.id,
        raw: item,
        sourceKey: "sos",
        title: item.mode,
        detail: item.note,
        type: "danger",
        time: item.time,
        source: "SOS"
      })),
      ...journeys.map((item) => ({
        key: `journey-${item.id}`,
        rawId: item.id,
        raw: item,
        sourceKey: "journey",
        title: `Journey ${item.status}`,
        detail: `${item.from} to ${item.to}`,
        type: item.status === "Completed" ? "success" : "warning",
        time: item.completedAt || item.startedAt,
        source: "Journey"
      })),
      ...incidents.map((item) => ({
        key: `incident-${item.id}`,
        rawId: item.id,
        raw: item,
        sourceKey: "incident",
        title: item.title,
        detail: `${item.location} · ${item.risk} risk · ${item.status}`,
        type: item.risk === "High" ? "danger" : "info",
        time: item.createdAt,
        source: "Vault"
      }))
    ];

    const seen = new Set();

    return items.filter((item) => {
      const key = `${item.source}-${item.title}-${item.detail}-${item.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [timeline, sosHistory, journeys, incidents]);

  const allSelected = historyItems.length > 0 && selected.length === historyItems.length;

  const toggleSelect = (key) => {
    setSelected((items) =>
      items.includes(key) ? items.filter((item) => item !== key) : [...items, key]
    );
  };

  const deleteHistoryItems = (itemsToDelete) => {
    if (!itemsToDelete.length) return;

    const keys = new Set(itemsToDelete.map((item) => item.key));

    setTimeline((items) => items.filter((item) => !keys.has(`timeline-${item.id}`)));
    setSosHistory((items) => items.filter((item) => !keys.has(`sos-${item.id}`)));
    setJourneys((items) => items.filter((item) => !keys.has(`journey-${item.id}`)));

    itemsToDelete
      .filter((item) => item.sourceKey === "incident")
      .forEach((item) => dispatchIncidents({ type: "delete", payload: item.rawId }));

    showUndo("History item deleted.", () => {
      const timelineItems = itemsToDelete.filter((item) => item.sourceKey === "timeline").map((item) => item.raw);
      const sosItems = itemsToDelete.filter((item) => item.sourceKey === "sos").map((item) => item.raw);
      const journeyItems = itemsToDelete.filter((item) => item.sourceKey === "journey").map((item) => item.raw);
      const incidentItems = itemsToDelete.filter((item) => item.sourceKey === "incident").map((item) => item.raw);

      if (timelineItems.length) setTimeline((items) => [...timelineItems, ...items]);
      if (sosItems.length) setSosHistory((items) => [...sosItems, ...items]);
      if (journeyItems.length) setJourneys((items) => [...journeyItems, ...items]);
      incidentItems.forEach((item) => dispatchIncidents({ type: "restore", payload: item }));
    });

    setSelected([]);
  };

  return (
    <>
      <PageHero
        label="History"
        title="Complete safety history"
        text="Review SOS activity, journey records, timeline events and incident summaries in one place."
        image="history"
      />

      <Card className="largeCard">
        {!historyItems.length ? (
          <EmptyState title="No history yet" text="Use SOS, Journey, Fake Call or Vault to create safety history." />
        ) : (
          <>
            <div className="historyActions">
              <label className="selectControl">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? [] : historyItems.map((item) => item.key))}
                />
                Select all
              </label>

              <button
                className="dangerButton"
                disabled={!selected.length}
                onClick={() => deleteHistoryItems(historyItems.filter((item) => selected.includes(item.key)))}
              >
                Delete Selected
              </button>

              <button className="dangerButton" onClick={() => deleteHistoryItems(historyItems)}>
                Delete All
              </button>
            </div>

            <div className="historyList selectableHistory">
              {historyItems.map((item) => (
                <article key={item.key} className={item.type}>
                  <label className="historySelect">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.key)}
                      onChange={() => toggleSelect(item.key)}
                    />
                  </label>

                  <div>
                    <span>{item.source}</span>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>

                  <time>{item.time}</time>
                </article>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}

function DangerWordTester({ words, onTrigger }) {
  const { showAlert } = useApp();
  const [message, setMessage] = useState("");
  const [detected, setDetected] = useState(false);

  const analyze = () => {
    const matched = words.find((word) => message.toLowerCase().includes(word.toLowerCase()));

    if (!message.trim()) {
      showAlert("Message required", "Write a message first before analyzing danger words.");
      return;
    }

    if (matched) {
      setDetected(true);
      onTrigger(message);
      return;
    }

    setDetected(false);
    showAlert("No danger word detected", "This message does not contain any saved danger word.", "info");
  };

  return (
    <Card className="largeCard dangerTester">
      <span className="eyebrow">Danger word detection</span>
      <h2>Silent phrase test</h2>
      <p>Type a message. If it contains a secret word, the app silently records a safety alert.</p>

      <textarea
        value={message}
        placeholder="Example: I forgot the red bag near gate 2"
        onChange={(event) => setMessage(event.target.value)}
      />

      <div className="wordRow">
        {words.slice(0, 3).map((word) => <span key={word}>{word}</span>)}
      </div>

      <button className="accentButton analyzeButton" onClick={analyze}>Analyze Message</button>

      {detected && <strong className="successStrip">Secret safety alert activated</strong>}
    </Card>
  );
}

function SmartSOS() {
  const {
    contacts,
    setSosHistory,
    setSafePlaces,
    addTimeline,
    showToast,
    showAlert,
    requestPin,
    navigate
  } = useApp();

  const [mode, setMode] = useState("Silent SOS");
  const [note, setNote] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [emergency, setEmergency] = useState(null);
  const [contactPopup, setContactPopup] = useState(false);

  const sosButtonRef = useRef(null);
  const countdownRef = useRef(null);
  const responseRef = useRef(null);

  const responseSteps = ["Alert sent", "Alert delivered", "Guardian viewed", "Guardian responding"];

  const priorityContacts = useMemo(() => {
    return [...contacts].sort((a, b) => Number(a.priority || 5) - Number(b.priority || 5));
  }, [contacts]);

  useEffect(() => {
    setSelectedContacts(priorityContacts.filter((item) => item.sosEnabled).map((item) => item.id));
  }, [priorityContacts]);

  useEffect(() => {
    sosButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!emergency) return;

    countdownRef.current = setInterval(() => {
      setEmergency((current) =>
        current ? { ...current, countdown: Math.max(0, current.countdown - 1) } : current
      );
    }, 1000);

    responseRef.current = setInterval(() => {
      setEmergency((current) =>
        current ? { ...current, responseIndex: Math.min(3, current.responseIndex + 1) } : current
      );
    }, 2200);

    return () => {
      clearInterval(countdownRef.current);
      clearInterval(responseRef.current);
    };
  }, [emergency?.id]);

  const activateSOS = () => {
    const receivers = contacts.filter((contact) => selectedContacts.includes(contact.id) && contact.sosEnabled);

    if (!receivers.length) {
      showAlert("Trusted contact required", "Add or enable at least one trusted contact before activating SOS.");
      navigate("circle");
      return;
    }

    if (mode === "Custom SOS" && !note.trim()) {
      showAlert("Custom note required", "Write a custom note before using Custom SOS.");
      return;
    }

    const selectedMode = sosModes[mode];

    const alert = {
      id: makeId(),
      mode,
      modeTitle: selectedMode.title,
      note: mode === "Quick SOS" ? "Quick SOS: I need help. Please check my location." : note || selectedMode.text,
      contacts: receivers.map((item) => item.name),
      location: "Live map location shared",
      time: getTime()
    };

    setSosHistory((items) => [alert, ...items]);

    setEmergency({
      ...alert,
      countdown: selectedMode.countdown,
      responseIndex: 0
    });

    addTimeline("SOS activated", `${mode} sent to ${receivers.length} trusted contact(s).`, "danger");
    showToast(`${mode} activated.`, "danger");
  };

  const shareLocation = () => {
    const locationText = "Open SheShield map and share current location with trusted contact.";
    navigator.clipboard?.writeText(locationText);
    addTimeline("Location shared", locationText, "info");
    showToast("Location sharing action saved.", "success");
  };

  const saveLocation = () => {
    setSafePlaces((items) => [
      {
        id: makeId(),
        name: "Emergency saved location",
        type: "Friend’s House",
        address: "Saved from emergency map",
        notes: `Saved during ${mode}`,
        trusted: false,
        createdAt: getTime()
      },
      ...items
    ]);

    addTimeline("Emergency location saved", "Location saved inside Journey trusted places.", "success");
    showToast("Location saved.", "success");
  };

  const cancelEmergency = () => {
    requestPin({
      title: "Cancel emergency mode",
      detail: "Enter Safety PIN to cancel active SOS.",
      onConfirm: () => {
        setEmergency(null);
        addTimeline("SOS cancelled", "Emergency mode was cancelled with Safety PIN.", "warning");
      }
    });
  };

  return (
    <>
      <PageHero
        label="Smart SOS"
        title="Choose the right emergency response"
        text="Select an SOS mode, choose trusted contacts, share location and activate emergency mode."
        image="sos"
      />

      <section className="twoColumn balanceGrid sosGrid">
        <Card className="largeCard sosPanel">
          <span className="eyebrow">SOS setup</span>
          <h2>Emergency mode</h2>

          <div className="modeGrid">
            {Object.keys(sosModes).map((item) => (
              <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="modeDescription">
            <strong>{sosModes[mode].title}</strong>
            <p>{sosModes[mode].text}</p>
          </div>

          <Field
            label="Emergency note"
            value={note}
            textarea
            placeholder="Example: I feel unsafe near the bus stop"
            onChange={setNote}
          />

          <button ref={sosButtonRef} className="sosButton" onClick={activateSOS}>
            <strong>SOS</strong>
            <span>{mode}</span>
          </button>
        </Card>

        <Card className="largeCard mapPanel">
          <span className="eyebrow">Location support</span>
          <h2>Live safety map</h2>

          <RealSafetyMap title="Current safety location" subtitle="Use location permission to show current area." risk="High" />

          <div className="buttonRow">
            <button className="accentButton" onClick={shareLocation}>Share Location</button>
            <button className="mutedButton bigTextButton" onClick={saveLocation}>Save Location</button>
          </div>

          <div className="contactSelector compactContacts">
            <div className="miniHeader">
              <h3>Trusted contacts for this SOS</h3>
              {contacts.length > 2 && (
                <button className="mutedButton" onClick={() => setContactPopup(true)}>
                  Show All Contacts
                </button>
              )}
            </div>

            {!contacts.length ? (
              <EmptyState title="No contacts added" text="Go to Trusted Circle and add emergency contacts first." />
            ) : (
              priorityContacts.slice(0, 2).map((contact) => (
                <label key={contact.id}>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    disabled={!contact.sosEnabled}
                    onChange={() =>
                      setSelectedContacts((current) =>
                        current.includes(contact.id)
                          ? current.filter((item) => item !== contact.id)
                          : [...current, contact.id]
                      )
                    }
                  />
                  <span>
                    {contact.name}
                    <small>{contact.role} · Priority {contact.priority}</small>
                  </span>
                </label>
              ))
            )}
          </div>
        </Card>
      </section>

      {contactPopup && (
        <ContactSelectionModal
          contacts={priorityContacts}
          selectedContacts={selectedContacts}
          setSelectedContacts={setSelectedContacts}
          close={() => setContactPopup(false)}
        />
      )}

      {emergency && (
        <EmergencyOverlay
          emergency={emergency}
          responseSteps={responseSteps}
          cancelEmergency={cancelEmergency}
          shareLocation={shareLocation}
          saveLocation={saveLocation}
        />
      )}
    </>
  );
}

function ContactSelectionModal({ contacts, selectedContacts, setSelectedContacts, close }) {
  return (
    <section className="detailOverlay">
      <div className="detailBox contactPickBox">
        <div className="detailHeader">
          <div>
            <span className="eyebrow">SOS contacts</span>
            <h2>Select trusted contacts</h2>
          </div>
          <button className="mutedButton" onClick={close}>Done</button>
        </div>

        <div className="contactPickList">
          {contacts.map((contact) => (
            <label key={contact.id}>
              <input
                type="checkbox"
                checked={selectedContacts.includes(contact.id)}
                disabled={!contact.sosEnabled}
                onChange={() =>
                  setSelectedContacts((current) =>
                    current.includes(contact.id)
                      ? current.filter((item) => item !== contact.id)
                      : [...current, contact.id]
                  )
                }
              />
              <span>
                <strong>{contact.name}</strong>
                <small>{contact.role} · Priority {contact.priority} · {contact.sosEnabled ? "SOS enabled" : "SOS disabled"}</small>
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmergencyOverlay({ emergency, responseSteps, cancelEmergency, shareLocation, saveLocation }) {
  return (
    <section className="emergencyOverlay">
      <div className="emergencyBox">
        <span className="alertIcon">!</span>
        <h2>Emergency Mode Active</h2>
        <p>{emergency.modeTitle}</p>

        <strong>00:{String(emergency.countdown).padStart(2, "0")}</strong>

        <div className="emergencyFlow">
          {responseSteps.map((step, index) => (
            <span key={step} className={index <= emergency.responseIndex ? "done" : ""}>
              {step}
            </span>
          ))}
        </div>

        <RealSafetyMap title="Live emergency map" subtitle="Use My Location to load current area." risk="High" />

        <div className="tagRow">
          {emergency.contacts.map((contact) => <span key={contact}>{contact}</span>)}
        </div>

        <div className="buttonRow centerButtons">
          <button className="accentButton largeButton" onClick={shareLocation}>Share Location</button>
          <button className="mutedButton largeButton" onClick={saveLocation}>Save Location</button>
          <button className="dangerButton largeButton dangerWide" onClick={cancelEmergency}>Cancel with Safety PIN</button>
        </div>
      </div>
    </section>
  );
}

function JourneyMode() {
  const {
    contacts,
    setJourneys,
    safePlaces,
    setSafePlaces,
    addTimeline,
    showToast,
    showAlert,
    showUndo,
    setDetailModal,
    navigate
  } = useApp();

  const [form, setForm] = useState({
    from: "",
    to: "",
    transport: "Walk",
    expectedMinutes: "10",
    contactId: "",
    checkInterval: "15"
  });

  const [placeForm, setPlaceForm] = useState({
    name: "",
    type: "Home",
    address: "",
    notes: "",
    trusted: true
  });

  const [filter, setFilter] = useState("All");
  const [journey, setJourney] = useState(null);
  const [checkIn, setCheckIn] = useState(false);
  const countdownRef = useRef(null);
  const checkInRef = useRef(null);
  const risk = useMemo(() => calculateJourneyRisk(form), [form]);

  const filteredPlaces = useMemo(() => {
    return safePlaces.filter((place) => filter === "All" || place.type === filter);
  }, [safePlaces, filter]);

  const visiblePlaces = filteredPlaces.slice(0, 2);

  useEffect(() => {
    if (!journey) return;

    countdownRef.current = setInterval(() => {
      setJourney((current) => {
        if (!current) return current;

        if (current.secondsLeft <= 1) {
          return { ...current, secondsLeft: 0, expired: true };
        }

        return { ...current, secondsLeft: current.secondsLeft - 1 };
      });
    }, 1000);

    checkInRef.current = setInterval(() => setCheckIn(true), Number(journey.checkInterval) * 1000);

    return () => {
      clearInterval(countdownRef.current);
      clearInterval(checkInRef.current);
    };
  }, [journey?.id]);

  useEffect(() => {
    if (journey?.expired) {
      clearInterval(countdownRef.current);
      clearInterval(checkInRef.current);
      showAlert("Journey timer expired", "The expected arrival time ended. Check safety or start SOS.");
      addTimeline("Journey timer expired", `${journey.from} to ${journey.to}`, "danger");
    }
  }, [journey?.expired]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setPlaceField = (key, value) => {
    setPlaceForm((current) => ({ ...current, [key]: value }));
  };

  const startJourney = async (event) => {
    event.preventDefault();

    if (!isRequired(form.from) || !isRequired(form.to)) {
      showAlert("Route details missing", "Enter both starting point and destination.");
      return;
    }

    if (Number(form.expectedMinutes) < 1 || Number(form.expectedMinutes) > 360) {
      showAlert("Invalid arrival time", "Expected arrival must be between 1 and 360 minutes.");
      return;
    }

    try {
      await Promise.all([findLocation(form.from), findLocation(form.to)]);
    } catch (error) {
      showAlert("Location not found", error.message);
      return;
    }

    const selectedContact = contacts.find((contact) => contact.id === form.contactId);

    const activeJourney = {
      ...form,
      id: makeId(),
      risk,
      contactName: selectedContact?.name || "No contact selected",
      secondsLeft: Math.max(30, Number(form.expectedMinutes) * 60),
      startedAt: getTime()
    };

    setJourney(activeJourney);
    addTimeline("Journey started", `${form.from} to ${form.to} · ${risk} risk`, "info");
    showToast("Journey started.", "success");
  };

  const reachedSafely = () => {
    setJourneys((items) => [{ ...journey, status: "Completed", completedAt: getTime() }, ...items]);
    addTimeline("Journey completed", `${journey.from} to ${journey.to}`, "success");
    setJourney(null);
    setCheckIn(false);
    showToast("Journey marked safe.", "success");
  };

  const needHelp = () => {
    setJourneys((items) => [{ ...journey, status: "Help requested", completedAt: getTime() }, ...items]);
    addTimeline("Help requested during journey", `${journey.from} to ${journey.to}`, "danger");
    setCheckIn(false);
    setJourney(null);
    navigate("sos");
  };

  const addSafePlace = async (event) => {
    event.preventDefault();

    if (!isRequired(placeForm.name) || !isRequired(placeForm.address)) {
      showAlert("Place details missing", "Place name and address are required.");
      return;
    }

    try {
      await findLocation(placeForm.address);
    } catch (error) {
      showAlert("Place not found", error.message);
      return;
    }

    const newPlace = { ...placeForm, id: makeId(), createdAt: getTime() };

    setSafePlaces((items) => [newPlace, ...items]);
    addTimeline("Trusted place added", placeForm.name, "success");
    showToast("Trusted place added.", "success");

    setPlaceForm({
      name: "",
      type: "Home",
      address: "",
      notes: "",
      trusted: true
    });
  };

  return (
    <>
      <PageHero
        label="Journey"
        title="Travel with check-ins, real map and trusted places"
        text="Start a route countdown, view real map directions, save trusted locations and escalate to SOS if needed."
        image="journey"
      />

      <section className="twoColumn balanceGrid">
        <form className="card formCard" onSubmit={startJourney}>
          <Field label="From" value={form.from} onChange={(value) => setField("from", value)} hint="Example: University gate, Karachi" />
          <Field label="To" value={form.to} onChange={(value) => setField("to", value)} hint="Example: Home, Gulshan Karachi" />
          <Field label="Transport" value={form.transport} options={transports} onChange={(value) => setField("transport", value)} />
          <Field
            label="Expected arrival in minutes"
            type="number"
            value={form.expectedMinutes}
            onChange={(value) => setField("expectedMinutes", value)}
          />
          <Field
            label="Trusted contact"
            value={form.contactId}
            options={[
              { label: "No contact selected", value: "" },
              ...contacts.map((contact) => ({
                label: `${contact.name} · ${contact.role}`,
                value: contact.id
              }))
            ]}
            onChange={(value) => setField("contactId", value)}
          />
          <Field
            label="Check-in reminder"
            value={form.checkInterval}
            options={[
              { label: "Every 15 seconds", value: "15" },
              { label: "Every 30 seconds", value: "30" },
              { label: "Every 60 seconds", value: "60" }
            ]}
            onChange={(value) => setField("checkInterval", value)}
          />

          <strong className={`riskPill ${risk.toLowerCase()}`}>Route risk: {risk}</strong>

          <button className="accentButton fullButton">Start Journey</button>
        </form>

        <Card className="largeCard liveJourney">
          {!journey ? (
            <>
              <span className="eyebrow">Route map</span>
              <h2>Preview your path</h2>
              <RealSafetyMap
                title="Journey map"
                subtitle="Enter From and To, then use Find Safest Path."
                from={form.from}
                to={form.to}
                risk={risk}
              />
            </>
          ) : (
            <>
              <span className="eyebrow">Live journey</span>
              <h2>{journey.from} → {journey.to}</h2>
              <strong>{formatTime(journey.secondsLeft)}</strong>
              <p>Trusted contact: {journey.contactName}</p>

              <RealSafetyMap
                title="Journey route"
                subtitle="Google route support"
                from={journey.from}
                to={journey.to}
                risk={journey.risk}
              />

              {journey.expired && <b className="warningStrip">Arrival time expired. Please check safety.</b>}

              <div className="buttonRow">
                <button className="accentButton" onClick={reachedSafely}>I Reached Safely</button>
                <button className="dangerButton" onClick={needHelp}>Need Help</button>
              </div>
            </>
          )}
        </Card>
      </section>

      <section className="twoColumn balanceGrid">
        <form className="card formCard" onSubmit={addSafePlace}>
          <span className="eyebrow">Trusted places</span>
          <h2>Save safe locations</h2>

          <Field label="Place name" value={placeForm.name} onChange={(value) => setPlaceField("name", value)} />
          <Field label="Type" value={placeForm.type} options={placeTypes} onChange={(value) => setPlaceField("type", value)} />
          <Field label="Address" value={placeForm.address} textarea onChange={(value) => setPlaceField("address", value)} />
          <Field label="Notes" value={placeForm.notes} onChange={(value) => setPlaceField("notes", value)} />

          <label className="toggleLine">
            <input type="checkbox" checked={placeForm.trusted} onChange={(event) => setPlaceField("trusted", event.target.checked)} />
            Mark as trusted
          </label>

          <button className="accentButton fullButton">Add Trusted Place</button>
        </form>

        <Card className="largeCard limitedListCard">
          <div className="toolbar">
            <h2>Saved trusted places</h2>

            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option>All</option>
              {placeTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>

          {!filteredPlaces.length ? (
            <EmptyState title="No trusted places" text="Add home, university, hospital or police station to see them here." />
          ) : (
            <>
              <div className="placeGrid limited">
                {visiblePlaces.map((place) => (
                  <Card key={place.id} title={place.name} text={`${place.type} · ${place.address}`}>
                    <div className="buttonRow">
                      <button
                        onClick={() =>
                          setSafePlaces((items) =>
                            items.map((item) =>
                              item.id === place.id ? { ...item, trusted: !item.trusted } : item
                            )
                          )
                        }
                      >
                        {place.trusted ? "Trusted" : "Mark Trusted"}
                      </button>

                      <button
                        className="dangerLight"
                        onClick={() => {
                          const deletedPlace = place;
                          setSafePlaces((items) => items.filter((item) => item.id !== place.id));
                          showUndo("Trusted place deleted.", () => {
                            setSafePlaces((items) => [deletedPlace, ...items]);
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredPlaces.length > 2 && (
                <button
                  className="accentButton showMoreButton"
                  onClick={() =>
                    setDetailModal({
                      title: "All trusted places",
                      type: "places",
                      data: filteredPlaces
                    })
                  }
                >
                  Show More
                </button>
              )}
            </>
          )}
        </Card>
      </section>

      {checkIn && journey && (
        <Modal title="Are you safe?" text={`Check-in reminder for your journey to ${journey.to}`}>
          <button
            className="accentButton"
            onClick={() => {
              setCheckIn(false);
              addTimeline("Journey check-in", "User confirmed safe.", "success");
            }}
          >
            Yes, I’m Safe
          </button>
          <button className="dangerButton" onClick={needHelp}>Need Help</button>
        </Modal>
      )}
    </>
  );
}

function calculateJourneyRisk(form) {
  let points = 0;

  if (["Walk", "Rickshaw"].includes(form.transport)) points += 2;
  if (`${form.from} ${form.to}`.toLowerCase().includes("isolated")) points += 3;
  if (`${form.from} ${form.to}`.toLowerCase().includes("unknown")) points += 2;
  if (Number(form.expectedMinutes) > 45) points += 1;

  if (points >= 4) return "High";
  if (points >= 2) return "Medium";
  return "Low";
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function TrustedCircle() {
  const { contacts, dispatchContacts, showToast, showAlert, showUndo, setDetailModal } = useApp();

  const [form, setForm] = useState(initialContact);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = `${contact.name} ${contact.phone} ${contact.city} ${contact.role}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesRole = roleFilter === "All" || contact.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [contacts, search, roleFilter]);

  const visibleContacts = filteredContacts.slice(0, 2);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!isRequired(form.name) || !isRequired(form.relation) || !isRequired(form.phone)) {
      showAlert("Contact details missing", "Name, relation and phone are required.");
      return;
    }

    if (!isPhone(form.phone)) {
      showAlert("Invalid phone number", "Enter a valid phone number with country code or proper mobile format.");
      return;
    }

    if (form.email && !isEmail(form.email)) {
      showAlert("Invalid email", "Enter a valid email address or leave the email field empty.");
      return;
    }

    if (Number(form.priority) < 1 || Number(form.priority) > 5) {
      showAlert("Invalid priority", "Priority must be from 1 to 5.");
      return;
    }

    if (editingId) {
      dispatchContacts({ type: "edit", payload: { ...form, id: editingId } });
      showToast("Contact updated.", "success");
    } else {
      dispatchContacts({ type: "add", payload: form });
      showToast("Contact added.", "success");
    }

    setForm(initialContact);
    setEditingId(null);
  };

  return (
    <>
      <PageHero
        label="Trusted Circle"
        title="Add people who can help you"
        text="Store emergency contacts by role, priority and SOS permission."
        image="circle"
      />

      <section className="twoColumn balanceGrid">
        <form className="card formCard compactForm" onSubmit={submit}>
          <div className="formGrid">
            <Field label="Name" value={form.name} onChange={(value) => setField("name", value)} />
            <Field label="Relation" value={form.relation} onChange={(value) => setField("relation", value)} />
            <Field label="Phone" value={form.phone} onChange={(value) => setField("phone", value)} />
            <Field label="Email" value={form.email} onChange={(value) => setField("email", value)} />
            <Field label="Priority" type="number" value={form.priority} onChange={(value) => setField("priority", value)} />
            <Field label="City" value={form.city} onChange={(value) => setField("city", value)} />
            <Field label="Role" value={form.role} options={contactRoles} onChange={(value) => setField("role", value)} />

            <label className="toggleLine">
              <input
                type="checkbox"
                checked={form.sosEnabled}
                onChange={(event) => setField("sosEnabled", event.target.checked)}
              />
              Enable for SOS
            </label>

            <label className="toggleLine">
              <input
                type="checkbox"
                checked={form.primary}
                onChange={(event) => setField("primary", event.target.checked)}
              />
              Primary Guardian
            </label>
          </div>

          <button className="accentButton fullButton">{editingId ? "Update Contact" : "Add Contact"}</button>
        </form>

        <Card className="largeCard limitedListCard">
          <div className="toolbar">
            <input value={search} placeholder="Search contacts" onChange={(event) => setSearch(event.target.value)} />

            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option>All</option>
              {contactRoles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </div>

          {!filteredContacts.length ? (
            <EmptyState title="No contacts" text="Add at least one trusted person before testing SOS." />
          ) : (
            <>
              <div className="itemList limited">
                {visibleContacts.map((contact) => (
                  <article key={contact.id} className="listItem">
                    <div>
                      <h3>
                        {contact.name}
                        {contact.primary && <span>Primary</span>}
                      </h3>
                      <p>{contact.role} · {contact.phone}</p>
                    </div>

                    <div className="itemActions">
                      <button onClick={() => dispatchContacts({ type: "toggleSOS", payload: contact.id })}>
                        {contact.sosEnabled ? "SOS On" : "SOS Off"}
                      </button>
                      <button onClick={() => dispatchContacts({ type: "primary", payload: contact.id })}>Primary</button>
                      <button onClick={() => { setForm(contact); setEditingId(contact.id); }}>Edit</button>
                      <button
                        className="dangerLight"
                        onClick={() => {
                          const deletedContact = contact;
                          dispatchContacts({ type: "delete", payload: contact.id });
                          showUndo("Contact deleted.", () => {
                            dispatchContacts({ type: "restore", payload: deletedContact });
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredContacts.length > 2 && (
                <button
                  className="accentButton showMoreButton"
                  onClick={() =>
                    setDetailModal({
                      title: "All trusted contacts",
                      type: "contacts",
                      data: filteredContacts
                    })
                  }
                >
                  Show More
                </button>
              )}
            </>
          )}
        </Card>
      </section>
    </>
  );
}

function FakeCall() {
  const { setFakeCallConfigured, addTimeline, showToast, showAlert } = useApp();

  const [config, setConfig] = useState({
    caller: "Ammi",
    relation: "Family",
    delay: "5"
  });

  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(0);
  const [duration, setDuration] = useState(0);

  const delayRef = useRef(null);
  const callRef = useRef(null);
  const audioRef = useRef({ rings: 0 });

  useEffect(() => {
    if (phase !== "scheduled") return;

    delayRef.current = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(delayRef.current);
          audioRef.current.rings += 1;
          setPhase("incoming");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(delayRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== "active") return;

    callRef.current = setInterval(() => {
      setDuration((current) => current + 1);
    }, 1000);

    return () => clearInterval(callRef.current);
  }, [phase]);

  const setField = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const start = () => {
    if (!isRequired(config.caller) || !isRequired(config.relation)) {
      showAlert("Caller details missing", "Caller name and relation are required.");
      return;
    }

    setCountdown(Number(config.delay));
    setDuration(0);
    setPhase("scheduled");
    setFakeCallConfigured(true);
    addTimeline("Fake call scheduled", `${config.caller} will call in ${config.delay} seconds.`, "info");
    showToast("Fake call scheduled.", "success");
  };

  const reset = () => {
    clearInterval(delayRef.current);
    clearInterval(callRef.current);
    setPhase("idle");
    setDuration(0);
    setCountdown(0);
  };

  return (
    <>
      <PageHero
        label="Fake Call"
        title="Create a safe excuse to leave"
        text="Schedule a realistic incoming call, accept it and use the script to exit calmly."
        image="fake"
      />

      <section className="twoColumn balanceGrid fakeCallGrid">
        <div className="card formCard fakeCallForm">
          <Field label="Caller name" value={config.caller} onChange={(value) => setField("caller", value)} />
          <Field label="Caller relation" value={config.relation} onChange={(value) => setField("relation", value)} />
          <Field
            label="Timer"
            value={config.delay}
            options={[
              { label: "5 seconds", value: "5" },
              { label: "10 seconds", value: "10" },
              { label: "30 seconds", value: "30" }
            ]}
            onChange={(value) => setField("delay", value)}
          />

          <button className="accentButton fullButton" onClick={start}>Start Fake Call</button>

          <div className="fakeSupportCards">
            <article>
              <b>Selected caller</b>
              <span>{config.caller} · {config.relation}</span>
            </article>
            <article>
              <b>Exit script</b>
              <span>Use the call to move away calmly and safely.</span>
            </article>
            <article>
              <b>Timeline record</b>
              <span>Accepted calls are saved in recent safety activity.</span>
            </article>
          </div>
        </div>

        <div className={`phoneScreen ${phase}`}>
          <div className="phoneSpeaker" />

          {phase === "idle" && <EmptyState title="Fake phone ready" text="Configure the call and start the simulator." />}

          {phase === "scheduled" && (
            <>
              <span>Incoming call in</span>
              <h2>{countdown}s</h2>
            </>
          )}

          {phase === "incoming" && (
            <>
              <span>Incoming call</span>
              <h2>{config.caller}</h2>
              <p>{config.relation}</p>

              <div className="callActions">
                <button className="declineCall" onClick={() => setPhase("ended")}>
                  <span className="callGlyph declineGlyph" />
                  Decline
                </button>
                <button
                  className="acceptCall"
                  onClick={() => {
                    setPhase("active");
                    addTimeline("Fake call accepted", `Call accepted from ${config.caller}.`, "success");
                  }}
                >
                  <span className="callGlyph acceptGlyph" />
                  Accept
                </button>
              </div>
            </>
          )}

          {phase === "active" && (
            <>
              <span>On call</span>
              <h2>{config.caller}</h2>
              <p>{formatTime(duration)}</p>

              <article>
                <strong>Script</strong>
                <p>Yes, I am coming outside now. Please stay on call with me.</p>
                <p>I will share my location. Keep checking for a few minutes.</p>
              </article>

              <button className="dangerButton largeButton dangerWide" onClick={reset}>End Call</button>
            </>
          )}

          {phase === "ended" && (
            <>
              <h2>Call ended</h2>
              <button className="accentButton" onClick={reset}>Reset</button>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function IncidentVault() {
  const {
    incidents,
    dispatchIncidents,
    requestPin,
    addTimeline,
    showToast,
    showAlert,
    showUndo,
    setDetailModal
  } = useApp();

  const [form, setForm] = useState(initialIncident);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = `${incident.title} ${incident.location}`.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter === "All" || incident.risk === riskFilter;
      const matchesStatus = statusFilter === "All" || incident.status === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [incidents, search, riskFilter, statusFilter]);

  const visibleIncidents = filteredIncidents.slice(0, 2);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const previewImage = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => setField("preview", reader.result);
    reader.readAsDataURL(file);
  };

  const submit = (event) => {
    event.preventDefault();

    if (!isRequired(form.title) || !isRequired(form.location) || !isRequired(form.description)) {
      showAlert("Incident details missing", "Title, location and description are required.");
      return;
    }

    dispatchIncidents({ type: "add", payload: form });
    addTimeline("Incident saved", `${form.title} · ${form.risk} risk`, form.risk === "High" ? "danger" : "info");
    setForm(initialIncident);
    showToast("Incident saved.", "success");
  };

  const deleteIncident = (incident) => {
    requestPin({
      title: "Delete incident",
      detail: "Enter Safety PIN to delete this sensitive report.",
      onConfirm: () => {
        dispatchIncidents({ type: "delete", payload: incident.id });
        showUndo("Incident deleted.", () => {
          dispatchIncidents({ type: "restore", payload: incident });
        });
      }
    });
  };

  return (
    <>
      <PageHero
        label="Incident Vault"
        title="Save sensitive details privately"
        text="Save facts, location, risk, status and evidence notes after an incident."
        image="vault"
      />

      <section className="twoColumn balanceGrid">
        <form className="card formCard compactForm" onSubmit={submit}>
          <div className="formGrid">
            <Field label="Title" value={form.title} onChange={(value) => setField("title", value)} />
            <Field label="Location" value={form.location} onChange={(value) => setField("location", value)} />
            <Field label="Date" type="date" value={form.date} onChange={(value) => setField("date", value)} />
            <Field label="Time" type="time" value={form.time} onChange={(value) => setField("time", value)} />
            <Field label="Person involved" value={form.person} onChange={(value) => setField("person", value)} />
            <Field label="Evidence note" value={form.evidence} onChange={(value) => setField("evidence", value)} />
            <Field label="Risk" value={form.risk} options={risks} onChange={(value) => setField("risk", value)} />
            <Field label="Status" value={form.status} options={statuses} onChange={(value) => setField("status", value)} />
          </div>

          <Field label="Description" value={form.description} textarea onChange={(value) => setField("description", value)} />

          <label className="fileBox">
            <span>Image preview</span>
            <input type="file" accept="image/*" onChange={(event) => previewImage(event.target.files?.[0])} />
          </label>

          {form.preview && <img className="previewImage" src={form.preview} alt="Incident preview" />}

          <button className="accentButton fullButton">Save Incident</button>
        </form>

        <Card className="largeCard limitedListCard">
          <div className="toolbar three">
            <input value={search} placeholder="Search" onChange={(event) => setSearch(event.target.value)} />

            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
              <option>All</option>
              {risks.map((risk) => <option key={risk}>{risk}</option>)}
            </select>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>All</option>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>

          {!filteredIncidents.length ? (
            <EmptyState title="No reports" text="Add an incident report to see it here." />
          ) : (
            <>
              <div className="itemList limited">
                {visibleIncidents.map((incident) => (
                  <article key={incident.id} className="listItem">
                    <div>
                      <h3>{incident.title}</h3>
                      <p>{incident.location} · {incident.risk} · {incident.status}</p>
                    </div>

                    {incident.preview && <img src={incident.preview} alt={incident.title} />}

                    <div className="itemActions">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            dispatchIncidents({
                              type: "status",
                              payload: { id: incident.id, status }
                            })
                          }
                        >
                          {status}
                        </button>
                      ))}

                      <button className="dangerLight" onClick={() => deleteIncident(incident)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredIncidents.length > 2 && (
                <button
                  className="accentButton showMoreButton"
                  onClick={() =>
                    setDetailModal({
                      title: "All incident reports",
                      type: "incidents",
                      data: filteredIncidents
                    })
                  }
                >
                  Show More
                </button>
              )}
            </>
          )}
        </Card>
      </section>
    </>
  );
}

function SafetyTips() {
  const { favoriteTips, setFavoriteTips, journeys, showAlert } = useApp();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const recentRisk = journeys[0]?.risk || "Medium";

  const categories = useMemo(() => ["All", ...new Set(safetyTips.map((tip) => tip.category))], []);

  const filteredTips = useMemo(() => {
    return safetyTips
      .filter((tip) => {
        const matchesSearch = `${tip.title} ${tip.text}`.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "All" || tip.category === category;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.risk === recentRisk) return -1;
        if (b.risk === recentRisk) return 1;
        return 0;
      });
  }, [search, category, recentRisk]);

  const toggleFavorite = (tipId) => {
    const alreadySaved = favoriteTips.includes(tipId);

    setFavoriteTips((items) =>
      alreadySaved ? items.filter((item) => item !== tipId) : [...items, tipId]
    );

    showAlert(
      alreadySaved ? "Tip removed" : "Tip saved",
      alreadySaved ? "This tip was removed from your saved tips." : "Tip has been saved successfully.",
      "info"
    );
  };

  return (
    <>
      <PageHero
        label="Safety Tips"
        title="Learn what to do in different risks"
        text="Search, filter and save practical tips for travel, ride safety, campus safety and emergency response."
        image="tips"
      />

      <Card className="largeCard">
        <div className="toolbar three">
          <input value={search} placeholder="Search safety tips" onChange={(event) => setSearch(event.target.value)} />

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>

          <span className="riskPill medium">Recommended: {recentRisk} Risk</span>
        </div>

        <div className="placeGrid tipsGrid">
          {filteredTips.map((tip) => (
            <Card key={tip.id} title={tip.title} text={tip.text}>
              <div className="tipMeta">
                <span>{tip.category}</span>
                <span>{tip.risk} Risk</span>
              </div>

              <button className={favoriteTips.includes(tip.id) ? "mutedButton saveTipButton" : "accentButton saveTipButton"} onClick={() => toggleFavorite(tip.id)}>
                {favoriteTips.includes(tip.id) ? "Saved Tip" : "Save Tip"}
              </button>
            </Card>
          ))}
        </div>
      </Card>
    </>
  );
}

function Profile() {
  const { profile, setProfile, addTimeline, showToast, showAlert } = useApp();
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const setField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: key === "safetyPin" ? value.replace(/\D/g, "").slice(0, 4) : value
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!isRequired(form.name) || !isEmail(form.email) || !isPhone(form.phone) || !isRequired(form.city)) {
      showAlert("Profile details missing", "Name, valid email, valid phone and city are required.");
      return;
    }

    if (form.safetyPin && !/^\d{4}$/.test(form.safetyPin)) {
      showAlert("Invalid Safety PIN", "Safety PIN must be exactly 4 digits.");
      return;
    }

    setProfile(form);
    addTimeline("Profile updated", "Safety profile was updated.", "success");
    showToast("Profile updated.", "success");
  };

  return (
    <>
      <PageHero
        label="Profile"
        title="Complete your safety identity"
        text="Set personal details, emergency note and Safety PIN before using protected features."
        image="profile"
      />

      <section className="twoColumn balanceGrid">
        <form className="card formCard compactForm" onSubmit={submit}>
          <div className="formGrid">
            <Field label="Name" value={form.name || ""} onChange={(value) => setField("name", value)} />
            <Field label="Email" value={form.email || ""} onChange={(value) => setField("email", value)} />
            <Field label="Phone" value={form.phone || ""} onChange={(value) => setField("phone", value)} />
            <Field label="City" value={form.city || ""} onChange={(value) => setField("city", value)} />
            <Field label="Blood group" value={form.blood || ""} onChange={(value) => setField("blood", value)} />
            <Field label="Safety PIN" value={form.safetyPin || ""} placeholder="4 digits" onChange={(value) => setField("safetyPin", value)} />
          </div>

          <Field
            label="Emergency note"
            value={form.emergencyNote || ""}
            textarea
            placeholder="Example: Allergic to penicillin, contact my sister first."
            onChange={(value) => setField("emergencyNote", value)}
          />

          <button className="accentButton fullButton">Save Profile</button>
        </form>

        <Card className="largeCard">
          <span className="eyebrow">Protected actions</span>
          <h2>Safety PIN is used for</h2>
          <div className="usageMap visible">
            <p>Cancel active SOS.</p>
            <p>Delete sensitive incident reports.</p>
            <p>Clear account safety data.</p>
          </div>
        </Card>
      </section>
    </>
  );
}

function Settings() {
  const {
    theme,
    setTheme,
    dangerWords,
    setDangerWords,
    requestPin,
    clearAccountData,
    logout,
    showToast,
    showAlert,
    showUndo,
    setDetailModal
  } = useApp();

  const [word, setWord] = useState("");

  const addWord = () => {
    const cleanWord = word.trim().toLowerCase();

    if (cleanWord.length < 2) {
      showAlert("Invalid danger word", "Danger word must be at least 2 characters.");
      return;
    }

    if (dangerWords.includes(cleanWord)) {
      showAlert("Already exists", "This danger word already exists.");
      return;
    }

    setDangerWords((items) => [cleanWord, ...items]);
    setWord("");
    showToast("Danger word added.", "success");
  };

  return (
    <>
      <PageHero
        label="Settings"
        title="Control app preferences"
        text="Manage theme, danger words and local browser data."
        image="settings"
      />

      <section className="settingsGrid fixedSettingsGrid">
        <Card className="settingsControlCard">
          <span className="eyebrow">App controls</span>
          <h2>Preferences and data</h2>
          <p>Current theme: {theme}</p>

          <div className="settingsMiniGrid">
            <article>
              <b>Theme</b>
              <span>Switch between dark safety mode and clean light mode.</span>
            </article>
            <article>
              <b>Data privacy</b>
              <span>Your saved data stays in this browser using localStorage.</span>
            </article>
            <article>
              <b>Protected reset</b>
              <span>Clearing safety data requires your 4-digit Safety PIN.</span>
            </article>
          </div>

          <div className="settingsButtons">
            <button className="accentButton" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              Switch Theme
            </button>

            <button
              className="dangerButton"
              onClick={() =>
                requestPin({
                  title: "Clear all safety data",
                  detail: "Enter Safety PIN to clear saved local data for this account.",
                  onConfirm: clearAccountData
                })
              }
            >
              Clear All Data
            </button>

            <button className="mutedButton" onClick={logout}>Logout</button>
          </div>
        </Card>

        <Card className="dangerWordsCard">
          <span className="eyebrow">Danger words</span>
          <h2>Secret alert phrases</h2>
          <p>Secret phrases that trigger a silent alert from Dashboard.</p>

          <div className="toolbar dangerWordInput">
            <input value={word} placeholder="Add word" onChange={(event) => setWord(event.target.value)} />
            <button className="accentButton" onClick={addWord}>Add</button>
          </div>

          <div className="wordRow limitedWords">
            {dangerWords.slice(0, 4).map((item) => (
              <button
                key={item}
                onClick={() => {
                  const deletedWord = item;
                  setDangerWords((words) => words.filter((wordItem) => wordItem !== item));
                  showUndo("Danger word deleted.", () => {
                    setDangerWords((words) => [deletedWord, ...words]);
                  });
                }}
              >
                {item} ×
              </button>
            ))}
          </div>

          {dangerWords.length > 4 && (
            <button
              className="accentButton showMoreButton"
              onClick={() =>
                setDetailModal({
                  title: "All danger words",
                  type: "words",
                  data: dangerWords
                })
              }
            >
              Show More
            </button>
          )}
        </Card>
      </section>
    </>
  );
}

function Modal({ title, text, children }) {
  return (
    <section className="modalOverlay">
      <div className="modalBox">
        <h2>{title}</h2>
        <p>{text}</p>
        <div>{children}</div>
      </div>
    </section>
  );
}

function DetailModal({ modal, close }) {
  const {
    dispatchContacts,
    setSafePlaces,
    dispatchIncidents,
    setDangerWords,
    showUndo
  } = useApp();

  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected([]);
  }, [modal.title, modal.type]);

  const getKey = (item) => {
    if (modal.type === "words") return item;
    return item.id;
  };

  const keys = modal.data.map(getKey);
  const allSelected = keys.length > 0 && selected.length === keys.length;

  const toggleItem = (key) => {
    setSelected((items) =>
      items.includes(key) ? items.filter((item) => item !== key) : [...items, key]
    );
  };

  const deleteItems = (itemsToDelete) => {
    if (!itemsToDelete.length) return;

    if (modal.type === "contacts") {
      itemsToDelete.forEach((item) => dispatchContacts({ type: "delete", payload: item.id }));
      showUndo("Selected contacts deleted.", () => {
        itemsToDelete.forEach((item) => dispatchContacts({ type: "restore", payload: item }));
      });
    }

    if (modal.type === "places") {
      const deletedIds = new Set(itemsToDelete.map((item) => item.id));
      setSafePlaces((items) => items.filter((item) => !deletedIds.has(item.id)));
      showUndo("Selected trusted places deleted.", () => {
        setSafePlaces((items) => [...itemsToDelete, ...items]);
      });
    }

    if (modal.type === "incidents") {
      itemsToDelete.forEach((item) => dispatchIncidents({ type: "delete", payload: item.id }));
      showUndo("Selected incident reports deleted.", () => {
        itemsToDelete.forEach((item) => dispatchIncidents({ type: "restore", payload: item }));
      });
    }

    if (modal.type === "words") {
      const deletedWords = new Set(itemsToDelete);
      setDangerWords((items) => items.filter((item) => !deletedWords.has(item)));
      showUndo("Selected danger words deleted.", () => {
        setDangerWords((items) => [...itemsToDelete, ...items]);
      });
    }

    close();
  };

  const selectedItems = modal.data.filter((item) => selected.includes(getKey(item)));

  return (
    <section className="detailOverlay">
      <div className="detailBox">
        <div className="detailHeader">
          <div>
            <span className="eyebrow">Complete details</span>
            <h2>{modal.title}</h2>
          </div>
          <button className="mutedButton" onClick={close}>Close</button>
        </div>

        <div className="detailActions">
          <label className="selectControl">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? [] : keys)}
            />
            Select all
          </label>

          <button
            className="dangerButton"
            disabled={!selected.length}
            onClick={() => deleteItems(selectedItems)}
          >
            Delete Selected
          </button>

          <button className="dangerButton" onClick={() => deleteItems(modal.data)}>
            Delete All
          </button>
        </div>

        <div className="detailList">
          {modal.type === "contacts" &&
            modal.data.map((item) => (
              <article key={item.id} className="detailItem">
                <label className="detailSelect">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                </label>
                <h3>{item.name}</h3>
                <p>{item.role} · {item.relation}</p>
                <p>{item.phone}</p>
                <p>{item.email || "No email"} · {item.city || "No city"}</p>
                <span>{item.primary ? "Primary guardian" : "Backup contact"} · {item.sosEnabled ? "SOS enabled" : "SOS disabled"}</span>
              </article>
            ))}

          {modal.type === "places" &&
            modal.data.map((item) => (
              <article key={item.id} className="detailItem">
                <label className="detailSelect">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                </label>
                <h3>{item.name}</h3>
                <p>{item.type}</p>
                <p>{item.address}</p>
                <p>{item.notes || "No notes"}</p>
                <span>{item.trusted ? "Trusted location" : "Not marked trusted"} · {item.createdAt}</span>
              </article>
            ))}

          {modal.type === "incidents" &&
            modal.data.map((item) => (
              <article key={item.id} className="detailItem">
                <label className="detailSelect">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                </label>
                <h3>{item.title}</h3>
                <p>{item.location} · {item.date} · {item.time || "No time"}</p>
                <p>{item.description}</p>
                <p>{item.person || "No person added"} · {item.evidence || "No evidence note"}</p>
                <span>{item.risk} risk · {item.status} · {item.createdAt}</span>
                {item.preview && <img src={item.preview} alt={item.title} />}
              </article>
            ))}

          {modal.type === "words" &&
            modal.data.map((item) => (
              <article key={item} className="detailItem">
                <label className="detailSelect">
                  <input
                    type="checkbox"
                    checked={selected.includes(item)}
                    onChange={() => toggleItem(item)}
                  />
                </label>
                <h3>{item}</h3>
                <p>This word can activate a silent safety alert from the Dashboard message analyzer.</p>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}

function AlertModal({ alert, close }) {
  return (
    <section className="alertOverlay">
      <div className={`alertBox ${alert.type}`}>
        <span>{alert.type === "info" ? "i" : "!"}</span>
        <h2>{alert.title}</h2>
        <p>{alert.message}</p>
        <button className="accentButton largeButton" onClick={close}>
          Got it
        </button>
      </div>
    </section>
  );
}

function UndoPopup({ undoPopup, close }) {
  return (
    <div className="undoPopup">
      <p>{undoPopup.message}</p>
      <button
        onClick={() => {
          undoPopup.onUndo?.();
          close();
        }}
      >
        Undo
      </button>
      <button onClick={close}>Dismiss</button>
    </div>
  );
}

function PinModal({ request, close }) {
  const { profile, showAlert } = useApp();
  const [pin, setPin] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const verify = () => {
    if (pin === profile.safetyPin) {
      request.onConfirm?.();
      close();
      return;
    }

    showAlert("Incorrect Safety PIN", "The PIN you entered does not match your saved Safety PIN.");
  };

  return (
    <Modal title={request.title} text={request.detail}>
      <input
        ref={inputRef}
        className="pinInput"
        value={pin}
        maxLength={4}
        inputMode="numeric"
        placeholder="PIN"
        onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
      />
      <button className="accentButton largeButton" onClick={verify}>Verify</button>
      <button className="mutedButton largeButton" onClick={close}>Cancel</button>
    </Modal>
  );
}

function Toasts({ items }) {
  return (
    <div className="toastStack">
      {items.map((item) => (
        <div key={item.id} className={item.type}>
          {item.message}
        </div>
      ))}
    </div>
  );
}

function Footer() {
  const { navigate } = useApp();

  return (
    <footer className="footer">
      <Logo />
      <p>Protecting confidence through smart safety planning, trusted support and private emergency tools.</p>

      <div>
        <button onClick={() => navigate("features")}>Features</button>
        <button onClick={() => navigate("awareness")}>Guide</button>
        <button onClick={() => navigate("settings")}>Settings</button>
      </div>
    </footer>
  );
}