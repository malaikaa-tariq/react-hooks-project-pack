import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const STORAGE_KEY = "disaster-alert-helper-clean-final";
const USERS_KEY = "disaster-alert-users-clean-final";

const disasterData = {
  flood: {
    label: "Flood",
    icon: "🌊",
    image:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
    tone: "#2563eb",
    scanTitle: "Flood Risk Scanner",
    short: "Rainfall, blocked roads, water level, and evacuation readiness.",
    liveFocus: "rainfall, humidity, wind, and flood-prone travel safety",
    checklist: [
      "Move documents and electronics to a waterproof bag",
      "Keep drinking water and dry food ready",
      "Charge phone and power bank",
      "Avoid walking or driving through flood water",
      "Decide a safe high-ground meeting point",
      "Keep emergency cash and medicine ready",
    ],
    kit: ["Waterproof bag", "Power bank", "Torch", "Dry food", "Medicine", "Cash"],
  },
  fire: {
    label: "Fire",
    icon: "🔥",
    image:
      "https://images.unsplash.com/photo-1523861751938-121b5323b48b?auto=format&fit=crop&w=1200&q=80",
    tone: "#dc2626",
    scanTitle: "Fire Safety Scanner",
    short: "Exit plan, smoke safety, gas switches, and emergency action.",
    liveFocus: "temperature, wind speed, dryness, and fire spread risk",
    checklist: [
      "Know two exit routes from your room/home",
      "Check gas switch and electric points",
      "Do not use elevator during fire",
      "Keep a wet cloth or mask available",
      "Stay low under smoke",
      "Keep emergency numbers ready",
    ],
    kit: ["Wet cloth", "Torch", "Whistle", "First-aid", "Water bottle"],
  },
  earthquake: {
    label: "Earthquake",
    icon: "🏚️",
    image:
      "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?auto=format&fit=crop&w=1200&q=80",
    tone: "#7c3aed",
    scanTitle: "Earthquake Readiness Scanner",
    short: "Building safety, indoor safe zones, and family meeting plan.",
    liveFocus: "readiness score because earthquakes cannot be predicted by weather APIs",
    checklist: [
      "Identify safe spots under sturdy furniture",
      "Keep shoes near your bed",
      "Secure shelves, mirrors, and heavy items",
      "Practice Drop, Cover, and Hold On",
      "Decide a family meeting point",
      "Keep whistle and flashlight accessible",
    ],
    kit: ["Shoes", "Whistle", "Torch", "Water", "Medicine", "ID copy"],
  },
  heatwave: {
    label: "Heatwave",
    icon: "☀️",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tone: "#f59e0b",
    scanTitle: "Heatwave Risk Scanner",
    short: "Heat stress, hydration, outdoor safety, and health protection.",
    liveFocus: "temperature, humidity, dehydration risk, and outdoor safety",
    checklist: [
      "Drink water before feeling thirsty",
      "Avoid direct sunlight from 12 PM to 4 PM",
      "Wear light breathable clothes",
      "Keep ORS or electrolyte drink ready",
      "Check on elderly family members",
      "Avoid heavy outdoor activity",
    ],
    kit: ["Water", "ORS", "Cap", "Light scarf", "Sunscreen", "Umbrella"],
  },
};

const weatherCodeText = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Severe thunderstorm",
};

const notificationMessages = [
  "Check your emergency kit and keep your phone charged.",
  "Review your family meeting point and safe route.",
  "Keep trusted contacts updated before any emergency.",
  "Share your location if you are travelling during risky weather.",
  "Stay calm, follow your checklist, and avoid unsafe routes.",
];

const defaultContacts = [
  {
    id: crypto.randomUUID(),
    name: "Rescue Emergency",
    phone: "1122",
    relation: "Emergency Helpline",
  },
];

function App() {
  const [selectedDisaster, setSelectedDisaster] = useState("flood");
  const [preparedItems, setPreparedItems] = useState([]);
  const [contacts, setContacts] = useState(defaultContacts);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", relation: "" });
  const [familyNote, setFamilyNote] = useState("");
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [locationScanning, setLocationScanning] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [alertSystemOn, setAlertSystemOn] = useState(false);
  const [notificationAllowed, setNotificationAllowed] = useState(false);
  const [noticePopup, setNoticePopup] = useState("");

  const [authView, setAuthView] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const nameInputRef = useRef(null);
  const emailRef = useRef(null);
  const scannerRef = useRef(null);
  const notificationIntervalRef = useRef(null);
  const notificationIndexRef = useRef(0);

  const currentDisaster = disasterData[selectedDisaster];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved) {
      setSelectedDisaster(saved.selectedDisaster || "flood");
      setPreparedItems(saved.preparedItems || []);
      setContacts(saved.contacts?.length ? saved.contacts : defaultContacts);
      setFamilyNote(saved.familyNote || "");
      setLocation(saved.location || null);
      setCurrentUser(saved.currentUser || null);
    }

    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationAllowed(true);
    }

    setTimeout(() => nameInputRef.current?.focus(), 500);

    return () => stopNotificationLoop();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedDisaster,
        preparedItems,
        contacts,
        familyNote,
        location,
        currentUser,
      })
    );
  }, [selectedDisaster, preparedItems, contacts, familyNote, location, currentUser]);

  useEffect(() => {
    if (location) {
      fetchWeatherRisk(location.latitude, location.longitude);
    }
  }, [location, selectedDisaster]);

  const completion = useMemo(() => {
    return Math.round((preparedItems.length / currentDisaster.checklist.length) * 100);
  }, [preparedItems, currentDisaster]);

  const allMarked = preparedItems.length === currentDisaster.checklist.length;

  const readinessLabel = useMemo(() => {
    if (completion >= 85) return "Family Ready";
    if (completion >= 50) return "Needs Final Preparation";
    return "High Preparation Gap";
  }, [completion]);

  const alertMessage = useMemo(() => {
    const place = location
      ? `Location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : "Location not shared yet";

    const weatherLine = weather
      ? `Weather: ${weather.temperature}°C, ${weather.condition}, wind ${weather.wind} km/h, humidity ${weather.humidity}%`
      : "Weather not scanned yet";

    return `Emergency Alert: ${currentDisaster.label} safety mode is active.\nReadiness: ${completion}% (${readinessLabel}).\n${weatherLine}\n${place}\nNote: ${
      familyNote || "Please stay reachable and follow the safety plan."
    }`;
  }, [currentDisaster, completion, readinessLabel, weather, location, familyNote]);

  function showPopup(message) {
    setNoticePopup(message);
    setTimeout(() => setNoticePopup(""), 2600);
  }

  function handleAuthSubmit(event) {
    event.preventDefault();
    setError("");

    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    if (!emailPattern.test(email)) {
      setError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (authView === "signup") {
      if (!authForm.name.trim()) {
        setError("Name is required for signup.");
        return;
      }

      const alreadyExists = users.some((user) => user.email === email);

      if (alreadyExists) {
        setError("This email is already registered. Please login instead.");
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        name: authForm.name.trim(),
        email,
        password,
      };

      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      setCurrentUser({ name: newUser.name, email: newUser.email });
      setAuthOpen(false);
      setAuthForm({ name: "", email: "", password: "" });
      showPopup("Account created and logged in successfully.");
      return;
    }

    const emailExists = users.some((user) => user.email === email);

    if (!emailExists) {
      setError("This email is not signed up. Please create an account first.");
      return;
    }

    const foundUser = users.find((user) => user.email === email && user.password === password);

    if (!foundUser) {
      setError("Wrong password. Please try again.");
      return;
    }

    setCurrentUser({ name: foundUser.name, email: foundUser.email });
    setAuthOpen(false);
    setAuthForm({ name: "", email: "", password: "" });
    showPopup("Logged in successfully.");
  }

  function logout() {
    setCurrentUser(null);
    showPopup("Logged out successfully.");
  }

  function changeDisaster(type) {
    setSelectedDisaster(type);
    setPreparedItems([]);
    setTimeout(() => scannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function togglePrepared(item) {
    setPreparedItems((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  function toggleMarkAll() {
    setPreparedItems(allMarked ? [] : currentDisaster.checklist);
  }

  function validateContact() {
    const phoneRegex = /^[0-9+()\-\s]{4,20}$/;

    if (!contactForm.name.trim()) {
      setError("Contact name is required.");
      nameInputRef.current?.focus();
      return false;
    }

    if (!contactForm.phone.trim()) {
      setError("Phone number is required.");
      return false;
    }

    if (!phoneRegex.test(contactForm.phone.trim())) {
      setError("Enter a valid phone number.");
      return false;
    }

    if (!contactForm.relation.trim()) {
      setError("Relation or role is required.");
      return false;
    }

    return true;
  }

  function addContact(event) {
    event.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Please login first to add emergency contacts.");
      setAuthView("login");
      setAuthOpen(true);
      return;
    }

    if (!validateContact()) return;

    setContacts((prev) => [
      {
        id: crypto.randomUUID(),
        name: contactForm.name.trim(),
        phone: contactForm.phone.trim(),
        relation: contactForm.relation.trim(),
      },
      ...prev,
    ]);

    setContactForm({ name: "", phone: "", relation: "" });
    nameInputRef.current?.focus();
    showPopup("Contact added successfully.");
  }

  function deleteContact(id) {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  }

  function getCurrentLocation() {
    setError("");
    setLocationScanning(true);
    setLoadingWeather(true);

    if (!navigator.geolocation) {
      setLocationScanning(false);
      setLoadingWeather(false);
      setError("Location is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
        };

        setLocation(newLocation);
        showPopup("Location detected. Scanning live risk...");
      },
      () => {
        setLocationScanning(false);
        setLoadingWeather(false);
        setError("Location permission denied. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function fetchWeatherRisk(latitude, longitude) {
    setLoadingWeather(true);
    setError("");

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=auto`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Weather data could not be loaded.");
      }

      const data = await response.json();
      const current = data.current;

      const weatherInfo = {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        rain: current.rain,
        wind: current.wind_speed_10m,
        code: current.weather_code,
        condition: weatherCodeText[current.weather_code] || "Weather condition unavailable",
      };

      setWeather(weatherInfo);
      createRiskReport(weatherInfo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingWeather(false);
      setLocationScanning(false);
    }
  }

  function createRiskReport(info) {
    let level = "Low";
    let message = `No serious ${currentDisaster.label.toLowerCase()} risk detected from current weather.`;
    let suggestions = [
      "Keep emergency contacts updated.",
      "Review your family safety plan.",
      "Keep phone and power bank charged.",
    ];

    const heavyRainCodes = [61, 63, 65, 80, 81, 82, 95, 96, 99];

    if (selectedDisaster === "flood") {
      if (heavyRainCodes.includes(info.code) || info.rain >= 3 || info.precipitation >= 3) {
        level = "High";
        message = "Heavy rain or storm activity detected. Flood risk may increase in low areas.";
        suggestions = [
          "Avoid underpasses and flooded roads.",
          "Move important items above floor level.",
          "Share your live location with family.",
          "Keep emergency bag ready.",
        ];
      } else {
        suggestions = [
          "Flood risk is low now, but keep waterproof documents ready.",
          "Avoid low routes if rain starts.",
          "Check weather again before travelling.",
        ];
      }
    }

    if (selectedDisaster === "fire") {
      if (info.temperature >= 38 || info.wind >= 35) {
        level = "Medium";
        message = "High temperature or strong wind may increase fire spread danger.";
        suggestions = [
          "Avoid open flames.",
          "Check gas switches.",
          "Keep exit route clear.",
          "Do not overload electric sockets.",
        ];
      } else {
        suggestions = [
          "Current weather is not showing strong fire spread risk.",
          "Still check gas switches and electric boards.",
          "Keep emergency exit clear.",
        ];
      }
    }

    if (selectedDisaster === "earthquake") {
      level = completion < 50 ? "Medium" : "Low";
      message =
        "Earthquakes cannot be predicted using weather data. This scanner checks your readiness instead.";
      suggestions = [
        "Secure shelves and heavy objects.",
        "Practice Drop, Cover, and Hold On.",
        "Keep shoes and flashlight near your bed.",
      ];
    }

    if (selectedDisaster === "heatwave") {
      if (info.temperature >= 40 || info.feelsLike >= 40) {
        level = "High";
        message = "Extreme heat or high feels-like temperature detected. Heatwave precautions are recommended.";
        suggestions = [
          "Avoid direct sunlight.",
          "Drink water frequently.",
          "Keep ORS or electrolytes ready.",
          "Check on elderly people and children.",
        ];
      } else if (info.temperature >= 35 || info.feelsLike >= 38) {
        level = "Medium";
        message = "High heat index detected. Outdoor activity should be reduced.";
        suggestions = [
          "Wear light clothes.",
          "Stay in shaded areas.",
          "Carry water while travelling.",
        ];
      } else {
        suggestions = [
          "Heatwave risk is currently low.",
          "Still stay hydrated.",
          "Avoid long outdoor exposure.",
        ];
      }
    }

    const report = { level, message, suggestions };
    setRiskReport(report);

    if (level === "High" && alertSystemOn && notificationAllowed) {
      sendBrowserNotification(`${currentDisaster.label} High Risk Alert`, message);
    }
  }

  function stopNotificationLoop() {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
  }

  function startNotificationLoop() {
    stopNotificationLoop();

    notificationIntervalRef.current = setInterval(() => {
      const message =
        notificationMessages[notificationIndexRef.current % notificationMessages.length];

      notificationIndexRef.current += 1;

      sendBrowserNotification(
        `${currentDisaster.label} Safety Reminder`,
        `${message} ${riskReport?.message || ""}`
      );
    }, 40000);
  }

  async function toggleAlertSystem() {
    setError("");

    if (alertSystemOn) {
      stopNotificationLoop();
      setAlertSystemOn(false);
      showPopup("Alert system disabled. Notifications stopped.");
      return;
    }

    if (!("Notification" in window)) {
      setError("Browser notifications are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      setNotificationAllowed(false);
      setAlertSystemOn(false);
      stopNotificationLoop();
      showPopup("Notifications blocked by browser.");
      return;
    }

    setNotificationAllowed(true);
    setAlertSystemOn(true);
    showPopup("Alert system enabled. Reminders every 40 seconds.");
    sendBrowserNotification("Alert System Enabled", "Disaster safety reminders are now active.");

    setTimeout(() => {
      startNotificationLoop();
    }, 300);
  }

  function sendBrowserNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/vite.svg",
      });
    }
  }

  function sendTestAlert() {
    if (!alertSystemOn) {
      showPopup("Alert system is disabled. Enable it first.");
      return;
    }

    sendBrowserNotification(
      "Test Disaster Alert",
      `${currentDisaster.label} safety mode is active. Notification system is working.`
    );
  }

  async function copyAlertMessage() {
    await navigator.clipboard.writeText(alertMessage);
    setCopied(true);
    showPopup("Alert message copied.");
    setTimeout(() => setCopied(false), 1600);
  }

  function shareToWhatsApp(message) {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  function alertFamily() {
    if (!currentUser) {
      setError("Please login first to send family alerts.");
      setAuthView("login");
      setAuthOpen(true);
      return;
    }

    shareToWhatsApp(alertMessage);
  }

  function alertSavedContact(contact) {
    if (!currentUser) {
      setError("Please login first to alert saved contacts.");
      setAuthView("login");
      setAuthOpen(true);
      return;
    }

    const selectedMessage = `Hi ${contact.name},\n\n${alertMessage}`;
    shareToWhatsApp(selectedMessage);
  }

  function shareLocation() {
    if (!location) {
      setError("Please allow location first before sharing.");
      return;
    }

    shareToWhatsApp(alertMessage);
  }

  function callEmergency() {
    window.location.href = "tel:1122";
  }

  function resetAll() {
    const confirmReset = confirm("Clear all saved contacts, notes, and checklist data?");
    if (!confirmReset) return;

    stopNotificationLoop();
    localStorage.removeItem(STORAGE_KEY);
    setSelectedDisaster("flood");
    setPreparedItems([]);
    setContacts(defaultContacts);
    setFamilyNote("");
    setLocation(null);
    setWeather(null);
    setRiskReport(null);
    setError("");
    setAlertSystemOn(false);
    setLocationScanning(false);
    setLoadingWeather(false);
  }

  return (
    <main className="app">
      <div className="animated-bg">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {(locationScanning || loadingWeather) && (
        <div className="scan-loader">
          <div className="loader-card">
            <div className="radar"></div>
            <h2>Scanning live location risk...</h2>
            <p>Checking weather, rain, wind, humidity, heat index, and safety signals.</p>
          </div>
        </div>
      )}

      {noticePopup && <div className="toast">{noticePopup}</div>}

      {authOpen && (
        <div className="auth-overlay">
          <div className="auth-card">
            <button className="close-auth" onClick={() => setAuthOpen(false)}>
              ×
            </button>

            <span className="mini-title">
              {authView === "login" ? "Welcome Back" : "Create Account"}
            </span>

            <h2>{authView === "login" ? "Login to continue" : "Sign up for safety access"}</h2>

            <form onSubmit={handleAuthSubmit}>
              {authView === "signup" && (
                <input
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Full name *"
                />
              )}

              <input
                ref={emailRef}
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="Email address *"
              />

              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="Password *"
              />

              <button>{authView === "login" ? "Login" : "Create Account"}</button>
            </form>

            <p>
              {authView === "login" ? "No account yet?" : "Already registered?"}{" "}
              <button
                className="switch-auth"
                onClick={() => {
                  setError("");
                  setAuthView(authView === "login" ? "signup" : "login");
                }}
              >
                {authView === "login" ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      )}

      <section className="hero">
        <header className="top-header">
          <div className="brand">
            <div className="brand-logo">🛡️</div>
            <div>
              <h1>Disaster Alert Helper</h1>
              <p>Smart emergency readiness and live risk scanner</p>
            </div>
          </div>

          <div className="header-actions">
            {currentUser ? (
              <>
                <span className="user-pill">Hi, {currentUser.name.split(" ")[0]}</span>
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthView("login");
                    setAuthOpen(true);
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthView("signup");
                    setAuthOpen(true);
                  }}
                >
                  Sign Up
                </button>
              </>
            )}

            <button className={alertSystemOn ? "danger-btn" : ""} onClick={toggleAlertSystem}>
              {alertSystemOn ? "Disable Alerts" : "Enable Alerts"}
            </button>
          </div>
        </header>

        <div className="hero-grid">
          <div className="hero-text">
            <span className="status-chip">{currentDisaster.scanTitle}</span>
            <h2>Stay ready before danger turns into panic.</h2>
            <p>
              Prepare emergency kits, scan live risk, save trusted contacts, share your
              location, and send family or selected-contact alerts.
            </p>

            <div className="hero-buttons">
              <button onClick={getCurrentLocation}>
                {loadingWeather || locationScanning ? "Scanning..." : "Use My Location"}
              </button>
              <button className="glass-btn" onClick={alertFamily}>Alert Family</button>
              <button className="glass-btn" onClick={sendTestAlert}>Test Notification</button>
              <button className="glass-btn" onClick={callEmergency}>Call 1122</button>
            </div>

            {error && <div className="error-box">{error}</div>}
          </div>

          <div className="risk-card">
            <div className="pulse-ring" style={{ "--progress": `${completion * 3.6}deg` }}>
              <span>{completion}%</span>
            </div>
            <h3>{readinessLabel}</h3>
            <p>{currentDisaster.liveFocus}</p>

            <div className="risk-mini">
              <div>
                <strong>{alertSystemOn ? "On" : "Off"}</strong>
                <span>Alerts</span>
              </div>
              <div>
                <strong>{contacts.length}</strong>
                <span>Contacts</span>
              </div>
              <div>
                <strong>{riskReport?.level || "Not Scanned"}</strong>
                <span>Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="disaster-gallery">
        {Object.entries(disasterData).map(([key, item]) => (
          <button
            key={key}
            className={`visual-card ${selectedDisaster === key ? "active" : ""} ${key === "earthquake" ? "earthquake-card" : ""}`}
            onClick={() => changeDisaster(key)}
            style={{ "--tone": item.tone, backgroundImage: `url(${item.image})` }}
          >
            <div>
              <span>{item.icon}</span>
              <h3>{item.label}</h3>
              <p>{item.short}</p>
            </div>
          </button>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel large-panel">
          <div className="panel-top">
            <div>
              <span className="mini-title">Active Emergency Plan</span>
              <h2>
                {currentDisaster.icon} {currentDisaster.label} Response Center
              </h2>
            </div>

            <button onClick={toggleMarkAll}>
              {allMarked ? "Unmark All" : "Mark All Ready"}
            </button>
          </div>

          <div className="progress-bar">
            <div style={{ width: `${completion}%` }}></div>
          </div>

          <div className="checklist">
            {currentDisaster.checklist.map((item) => (
              <label className={`check-row ${preparedItems.includes(item) ? "done" : ""}`} key={item}>
                <input
                  type="checkbox"
                  checked={preparedItems.includes(item)}
                  onChange={() => togglePrepared(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="kit-box">
            <h3>Emergency Kit</h3>
            <div>
              {currentDisaster.kit.map((kit) => (
                <span key={kit}>{kit}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="panel scanner-panel" ref={scannerRef}>
          <span className="mini-title">Live Risk Scanner</span>
          <h2>{currentDisaster.scanTitle}</h2>

          {!weather && (
            <p className="muted-text">
              Click “Use My Location” to scan {currentDisaster.liveFocus}.
            </p>
          )}

          {weather && (
            <div className="weather-box">
              <div>
                <strong>{weather.temperature}°C</strong>
                <span>
                  {weather.condition} • Feels like {weather.feelsLike}°C
                </span>
              </div>

              <div className="weather-stats">
                <p>Rain: {weather.rain} mm</p>
                <p>Wind: {weather.wind} km/h</p>
                <p>Humidity: {weather.humidity}%</p>
              </div>
            </div>
          )}

          {riskReport && (
            <div className={`risk-report ${riskReport.level.toLowerCase()}`}>
              <strong>{riskReport.level} Risk</strong>
              <p>{riskReport.message}</p>

              <ul>
                {riskReport.suggestions.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="action-stack">
            <button onClick={getCurrentLocation}>Scan Again</button>
            <button className="secondary-action" onClick={shareLocation}>Share Location</button>
            <button className="secondary-action" onClick={copyAlertMessage}>
              {copied ? "Copied!" : "Copy Alert Message"}
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <span className="mini-title">Family Alert Message</span>
          <h2>Emergency Note</h2>

          <textarea
            value={familyNote}
            onChange={(e) => setFamilyNote(e.target.value)}
            placeholder="Write family instructions: meeting point, medicine, documents, safe route..."
          />

          <div className="alert-action-row">
            <button onClick={alertFamily}>Send Family Alert</button>
            <button className="secondary-action" onClick={copyAlertMessage}>
              {copied ? "Copied!" : "Copy Message"}
            </button>
          </div>

          <div className="preview-message">
            <strong>Alert Preview</strong>
            <p>{alertMessage}</p>
          </div>
        </div>

        <div className="panel">
          <span className="mini-title">Trusted Contacts</span>
          <h2>Emergency Contacts</h2>

          <form className="contact-form" onSubmit={addContact}>
            <input
              ref={nameInputRef}
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              placeholder="Contact name *"
            />

            <input
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              placeholder="Phone number *"
            />

            <input
              value={contactForm.relation}
              onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value })}
              placeholder="Relation / role *"
            />

            <button>Add Contact</button>
          </form>

          <div className="contacts">
            {contacts.map((contact) => (
              <div className="contact-card" key={contact.id}>
                <div>
                  <strong>{contact.name}</strong>
                  <span>{contact.relation}</span>
                  <p>{contact.phone}</p>
                </div>

                <div className="contact-actions">
                  <a href={`tel:${contact.phone}`}>Call</a>
                  <button onClick={() => alertSavedContact(contact)}>Alert</button>
                  <button onClick={() => deleteContact(contact.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bottom-actions">
        <button onClick={alertFamily}>Send Family Alert</button>
        <button onClick={shareLocation}>Share Live Location</button>
        <button onClick={copyAlertMessage}>{copied ? "Alert Copied" : "Copy Safety Message"}</button>
        <button className="danger-outline" onClick={resetAll}>Reset App</button>
      </section>
    </main>
  );
}

export default App;