import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const APP_KEY = "advanced_internship_tracker_apps";
const USER_KEY = "advanced_internship_tracker_user";
const AUTH_KEY = "advanced_internship_tracker_auth";
const PROFILE_KEY = "advanced_internship_tracker_profile";
const RESUME_KEY = "advanced_internship_tracker_resume";

const statusOptions = ["Applied", "Interview", "Selected", "Rejected"];
const priorityOptions = ["High", "Medium", "Low"];

const emptyForm = {
  company: "",
  role: "",
  deadline: "",
  status: "Applied",
  priority: "Medium",
  platform: "",
  location: "",
  salary: "",
  link: "",
  notes: "",
};

const defaultProfile = {
  name: "",
  username: "",
  education: "",
  field: "",
  skills: "",
  portfolio: "",
  photo: "",
};

const defaultResumeData = {
  fullName: "",
  address: "",
  email: "",
  phone: "",
  linkedin: "",
  summary: "",
  education: "",
  skills: "",
  experience: "",
  certifications: "",
};

const imageLibrary = {
  dashboard:
    "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200",
  email:
    "https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=1200",
  interview:
    "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200",
  resume:
    "https://images.pexels.com/photos/5989933/pexels-photo-5989933.jpeg?auto=compress&cs=tinysrgb&w=1200",
  followup:
    "https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

const resourceCards = [
  {
    id: "email",
    title: "Cold Email Formula",
    text: "Learn internship emails, follow-up emails, networking emails, and professional examples.",
    tag: "Outreach",
  },
  {
    id: "interview",
    title: "Interview Preparation",
    text: "Understand introductions, project explanations, HR answers, and strong interview preparation.",
    tag: "Interview",
  },
  {
    id: "resume",
    title: "Resume Formats & Builder",
    text: "Understand chronological, functional, and combination resumes with examples.",
    tag: "Resume",
  },
  {
    id: "followup",
    title: "Follow-up Strategy",
    text: "Know when to follow up after applications or interviews with practical templates.",
    tag: "Follow-up",
  },
];

const resourceDetails = {
  email: {
    id: "email",
    tag: "Outreach",
    title: "Cold Email Formula",
    subtitle:
      "Write strong internship, networking, and follow-up emails as a student or beginner.",
    intro:
      "A cold email is a short professional message sent to a recruiter, company, mentor, or professional contact when you want guidance, an internship, or an opportunity.",
    sections: [
      {
        heading: "When should you use a cold email?",
        points: [
          "When you want to ask for an internship opportunity",
          "When a company has no public internship form",
          "When you want guidance or a referral",
          "When you want to follow up after applying",
          "When you want to share your portfolio",
        ],
      },
      {
        heading: "Best email structure",
        points: [
          "Clear subject line",
          "Professional greeting",
          "Brief self-introduction",
          "Reason for contacting",
          "Relevant skills or project proof",
          "Specific request",
          "Polite closing and signature",
        ],
      },
      {
        heading: "Student internship email example",
        text:
          "Subject: Internship Opportunity Inquiry\n\nDear Hiring Team,\n\nMy name is [Your Name], and I am a Software Engineering student with hands-on experience in React, JavaScript, HTML, CSS, and database-driven projects. I am writing to express my interest in internship opportunities at [Company Name]. I would be grateful if you could guide me regarding any available openings.\n\nI have worked on practical projects and would be happy to share my resume and portfolio.\n\nRegards,\n[Your Name]",
      },
      {
        heading: "Follow-up email example",
        text:
          "Subject: Follow-up on Internship Application\n\nDear Hiring Team,\n\nI hope you are doing well. I recently applied for the [Role Name] internship and wanted to politely follow up regarding the status of my application. I remain very interested in the opportunity and would be grateful for any update.\n\nBest regards,\n[Your Name]",
      },
    ],
  },

  interview: {
    id: "interview",
    tag: "Interview",
    title: "Interview Preparation Guide",
    subtitle:
      "Prepare your introduction, project explanations, technical review, and HR answers.",
    intro:
      "Interview preparation is about understanding your own profile, clearly presenting your projects, and showing that you are ready to learn and contribute.",
    sections: [
      {
        heading: "Before the interview",
        points: [
          "Research the company and role",
          "Read the internship requirements carefully",
          "Revise your resume and projects",
          "Practice your self-introduction",
          "Prepare 2–3 projects you can explain confidently",
          "Test your internet and meeting link if online",
        ],
      },
      {
        heading: "Common interview questions",
        points: [
          "Tell me about yourself",
          "Why do you want this internship?",
          "Explain one project you built",
          "What technologies are you comfortable with?",
          "What challenge did you face in a project?",
          "How do you handle deadlines or teamwork?",
        ],
      },
      {
        heading: "Strong self-introduction example",
        text:
          "My name is [Your Name], and I am a Software Engineering student with practical experience in web development using React, JavaScript, HTML, CSS, and databases. I enjoy building student-focused and real-world applications, and I am interested in improving my frontend and full-stack skills through hands-on internship experience.",
      },
    ],
  },

  resume: {
    id: "resume",
    tag: "Resume",
    title: "Resume Formats & Template Guide",
    subtitle:
      "Understand the right resume type and create a polished student resume step by step.",
    intro:
      "The best resume format depends on your experience, strengths, and goals. Students and beginners often need a format that highlights projects, skills, and education.",
    formats: [
      {
        name: "Chronological Resume",
        bestFor:
          "Best for people who already have clear internship, job, or work experience.",
        useWhen: [
          "You have internship or job experience",
          "Your experience matches the role",
          "You want recruiters to see your latest work first",
        ],
        structure:
          "Header → Summary → Experience → Education → Skills → Certifications",
      },
      {
        name: "Functional Resume",
        bestFor:
          "Best for beginners, career changers, or students with limited formal experience.",
        useWhen: [
          "You have limited experience",
          "You want to highlight skills more than history",
          "You have project work but not formal job experience",
        ],
        structure:
          "Header → Summary → Skills → Projects → Education → Certifications",
      },
      {
        name: "Combination Resume",
        bestFor:
          "Best for students who want to show both skills and project experience.",
        useWhen: [
          "You want to highlight both skills and projects",
          "You are a student or fresher",
          "You have academic, project, volunteer, or internship experience",
        ],
        structure:
          "Header → Summary → Skills → Experience / Projects → Education → Certifications",
      },
    ],
    essentials: [
      "Full name and professional contact details",
      "Short professional summary",
      "Education details",
      "Technical skills",
      "Projects or experience",
      "Certifications and achievements",
      "Portfolio, LinkedIn, and GitHub links",
    ],
    examples: {
      summary:
        "Software Engineering student with hands-on experience in React, JavaScript, HTML, CSS, and database-driven projects. Passionate about building practical web applications, solving real-world problems, and continuously improving through project-based learning.",
      project:
        "Internship Application Tracker — React, JavaScript, LocalStorage\nBuilt a responsive web application to manage internship applications with authentication, profile management, filtering, sorting, deadline alerts, analytics, and resource pages.",
    },
  },

  followup: {
    id: "followup",
    tag: "Follow-up",
    title: "Follow-up Reminder Strategy",
    subtitle:
      "Know when and how to follow up after applying or after an interview.",
    intro:
      "A follow-up message reminds the recruiter about your application in a polite and professional way. It shows continued interest without sounding forceful.",
    sections: [
      {
        heading: "When should you follow up?",
        points: [
          "5–7 days after applying",
          "24 hours after an interview for a thank-you note",
          "After the mentioned response timeline passes",
          "When a recruiter asked you to wait and the waiting time has passed",
        ],
      },
      {
        heading: "Rules for a good follow-up",
        points: [
          "Keep it short",
          "Mention the role clearly",
          "Be polite and respectful",
          "Do not send too many reminders",
          "Thank them for their time",
        ],
      },
      {
        heading: "Application follow-up example",
        text:
          "Subject: Follow-up on Internship Application\n\nDear Hiring Team,\n\nI hope you are doing well. I applied for the [Role Name] internship on [Date] and wanted to politely follow up regarding the status of my application. I remain very interested in the opportunity and would appreciate any update.\n\nRegards,\n[Your Name]",
      },
    ],
  },
};

function App() {
  const [page, setPage] = useState("home");
  const [selectedResource, setSelectedResource] = useState(null);

  const [apps, setApps] = useState(() => {
    const saved = localStorage.getItem(APP_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem(RESUME_KEY);
    return saved ? JSON.parse(saved) : defaultResumeData;
  });

  const [resumeStep, setResumeStep] = useState(0);
  const [resumeFormat, setResumeFormat] = useState("Combination");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("deadline");
  const [toast, setToast] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const companyRef = useRef(null);
  const authNameRef = useRef(null);
  const cursorRef = useRef(null);
  const profileNameRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(APP_KEY, JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  }, [authUser]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(RESUME_KEY, JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${e.clientX}px`;
      cursorRef.current.style.top = `${e.clientY}px`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysLeft = (date) => {
    const deadline = new Date(date);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  };

  const deadlineLabel = (date) => {
    const days = daysLeft(date);
    if (days < 0) return "Expired";
    if (days === 0) return "Due Today";
    if (days === 1) return "Due Tomorrow";
    return `${days} days left`;
  };

  const deadlineClass = (date) => {
    const days = daysLeft(date);
    if (days < 0) return "expired";
    if (days <= 2) return "urgent";
    if (days <= 7) return "soon";
    return "safe";
  };

  const stats = useMemo(() => {
    const total = apps.length;
    const selected = apps.filter((a) => a.status === "Selected").length;
    const interview = apps.filter((a) => a.status === "Interview").length;
    const applied = apps.filter((a) => a.status === "Applied").length;
    const rejected = apps.filter((a) => a.status === "Rejected").length;
    const urgent = apps.filter((a) => {
      const d = daysLeft(a.deadline);
      return d >= 0 && d <= 7;
    }).length;

    return {
      total,
      selected,
      interview,
      applied,
      rejected,
      urgent,
      successRate: total ? Math.round((selected / total) * 100) : 0,
      activeRate: total ? Math.round(((applied + interview) / total) * 100) : 0,
    };
  }, [apps]);

  const filteredApps = useMemo(() => {
    let list = [...apps];

    if (filter !== "All") {
      list = list.filter((app) => app.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (app) =>
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          app.platform.toLowerCase().includes(q) ||
          app.location.toLowerCase().includes(q)
      );
    }

    if (sort === "deadline") {
      list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    if (sort === "company") {
      list.sort((a, b) => a.company.localeCompare(b.company));
    }

    if (sort === "priority") {
      const order = { High: 1, Medium: 2, Low: 3 };
      list.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    return list;
  }, [apps, filter, search, sort]);

  const requireLogin = (targetPage) => {
    if (!authUser) {
      setAuthMode("login");
      setPage("auth");
      setToast("Please login first");
      return;
    }

    setPage(targetPage);
  };

  const handleNav = (target) => {
    if (
      target === "tracker" ||
      target === "analytics" ||
      target === "profile" ||
      target === "resumeBuilder"
    ) {
      requireLogin(target);
      return;
    }

    setPage(target);
  };

  const openResourceDetail = (id) => {
    setSelectedResource(id);
    setPage("resourceDetail");
  };

  const validateApp = () => {
    if (!form.company.trim()) {
      setToast("Company name is required");
      companyRef.current?.focus();
      return false;
    }

    if (form.company.trim().length < 2) {
      setToast("Company name is too short");
      companyRef.current?.focus();
      return false;
    }

    if (!form.role.trim()) {
      setToast("Role is required");
      return false;
    }

    if (!form.deadline) {
      setToast("Deadline is required");
      return false;
    }

    if (!form.platform.trim()) {
      setToast("Platform is required");
      return false;
    }

    if (form.link && !form.link.startsWith("http")) {
      setToast("Application link must start with http or https");
      return false;
    }

    return true;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setTimeout(() => companyRef.current?.focus(), 50);
  };

  const submitApp = (e) => {
    e.preventDefault();

    if (!validateApp()) return;

    if (editingId) {
      setApps((old) =>
        old.map((app) =>
          app.id === editingId
            ? { ...app, ...form, updatedAt: new Date().toISOString() }
            : app
        )
      );

      setToast("Application updated");
      resetForm();
      return;
    }

    setApps((old) => [
      {
        id: crypto.randomUUID(),
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      },
      ...old,
    ]);

    setToast("Application added successfully");
    resetForm();
  };

  const editApp = (app) => {
    setForm({
      company: app.company,
      role: app.role,
      deadline: app.deadline,
      status: app.status,
      priority: app.priority,
      platform: app.platform,
      location: app.location,
      salary: app.salary,
      link: app.link,
      notes: app.notes,
    });

    setEditingId(app.id);
    setPage("tracker");
    setTimeout(() => companyRef.current?.focus(), 100);
  };

  const deleteApp = (id) => {
    setApps((old) => old.filter((app) => app.id !== id));
    setToast("Application deleted");
  };

  const changeStatus = (id, status) => {
    setApps((old) =>
      old.map((app) =>
        app.id === id
          ? { ...app, status, updatedAt: new Date().toISOString() }
          : app
      )
    );

    setToast(`Moved to ${status}`);
  };

  const clearAll = () => {
    if (!apps.length) return;
    const ok = window.confirm("Delete all internship applications?");
    if (!ok) return;
    setApps([]);
    setToast("All applications cleared");
  };

  const signup = (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const name = data.get("name").trim();
    const email = data.get("email").trim();
    const password = data.get("password").trim();
    const confirm = data.get("confirm").trim();

    if (name.length < 3) {
      setToast("Name must be at least 3 characters");
      authNameRef.current?.focus();
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setToast("Enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setToast("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setToast("Passwords do not match");
      return;
    }

    const username = name.split(" ")[0].toLowerCase();
    const newUser = { name, email, password };

    setUser(newUser);
    setAuthUser({ name, email });

    setProfile({
      ...defaultProfile,
      name,
      username,
      education: "BS Software Engineering Student",
      field: "Frontend / Full Stack Development",
    });

    setResumeData((old) => ({
      ...old,
      fullName: name,
      email,
    }));

    setToast("Account created successfully");
    setPage("profile");
  };

  const login = (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const email = data.get("email").trim();
    const password = data.get("password").trim();

    if (!user) {
      setToast("No account found. Please sign up first");
      setAuthMode("signup");
      return;
    }

    if (email !== user.email) {
      setToast("This email is not registered");
      return;
    }

    if (password !== user.password) {
      setToast("Incorrect password");
      return;
    }

    setAuthUser({ name: user.name, email: user.email });
    setToast("Login successful");
    setPage("tracker");
  };

  const logout = () => {
    setAuthUser(null);
    setToast("Logged out");
    setPage("home");
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((old) => ({ ...old, [name]: value }));
  };

  const updateProfile = (e) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      setToast("Profile name is required");
      profileNameRef.current?.focus();
      return;
    }

    if (!profile.username.trim()) {
      setToast("Username is required");
      return;
    }

    setAuthUser((old) => (old ? { ...old, name: profile.name } : old));
    setUser((old) => (old ? { ...old, name: profile.name } : old));
    setResumeData((old) => ({
      ...old,
      fullName: old.fullName || profile.name,
    }));

    setToast("Profile updated");
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((old) => ({ ...old, photo: reader.result }));
      setToast("Profile photo added");
    };
    reader.readAsDataURL(file);
  };

  const handleResumeInput = (e) => {
    const { name, value } = e.target;
    setResumeData((old) => ({ ...old, [name]: value }));
  };

  const resumeSteps = [
    "Personal Info",
    "Summary",
    "Education",
    "Skills & Expertise",
    "Projects / Experience",
    "Certifications",
  ];

  const nextResumeStep = () => {
    if (resumeStep === 0) {
      if (!resumeData.fullName.trim()) {
        setToast("Full name is required");
        return;
      }

      if (!resumeData.email.trim()) {
        setToast("Email is required");
        return;
      }
    }

    setResumeStep((old) => Math.min(old + 1, resumeSteps.length - 1));
  };

  const prevResumeStep = () => {
    setResumeStep((old) => Math.max(old - 1, 0));
  };

  return (
    <div className="site">
      <div className="cursor-glow" ref={cursorRef}></div>
      <div className="animated-bg-shape shape-one"></div>
      <div className="animated-bg-shape shape-two"></div>

      {toast && <div className="toast">{toast}</div>}

      <Navbar
        page={page}
        handleNav={handleNav}
        authUser={authUser}
        profile={profile}
        logout={logout}
        setPage={setPage}
        setAuthMode={setAuthMode}
      />

      {page === "home" && (
        <Home
          stats={stats}
          apps={apps}
          authUser={authUser}
          requireLogin={requireLogin}
          setPage={setPage}
        />
      )}

      {page === "tracker" && authUser && (
        <Tracker
          form={form}
          handleInput={handleInput}
          submitApp={submitApp}
          companyRef={companyRef}
          editingId={editingId}
          resetForm={resetForm}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
          filteredApps={filteredApps}
          deadlineLabel={deadlineLabel}
          deadlineClass={deadlineClass}
          changeStatus={changeStatus}
          editApp={editApp}
          deleteApp={deleteApp}
          clearAll={clearAll}
          stats={stats}
        />
      )}

      {page === "analytics" && authUser && (
        <Analytics apps={apps} stats={stats} daysLeft={daysLeft} />
      )}

      {page === "resources" && (
        <Resources openResourceDetail={openResourceDetail} />
      )}

      {page === "resourceDetail" &&
        selectedResource &&
        selectedResource !== "resume" && (
          <ResourceDetail
            detail={resourceDetails[selectedResource]}
            setPage={setPage}
          />
        )}

      {page === "resourceDetail" && selectedResource === "resume" && (
        <ResumeGuideDetail detail={resourceDetails.resume} setPage={setPage} />
      )}

      {page === "resumeBuilder" && authUser && (
        <ResumeBuilder
          setPage={setPage}
          resumeData={resumeData}
          handleResumeInput={handleResumeInput}
          resumeStep={resumeStep}
          setResumeStep={setResumeStep}
          resumeSteps={resumeSteps}
          nextResumeStep={nextResumeStep}
          prevResumeStep={prevResumeStep}
          resumeFormat={resumeFormat}
          setResumeFormat={setResumeFormat}
        />
      )}

      {page === "profile" && authUser && (
        <Profile
          profile={profile}
          handleProfileChange={handleProfileChange}
          handlePhotoUpload={handlePhotoUpload}
          updateProfile={updateProfile}
          profileNameRef={profileNameRef}
          stats={stats}
        />
      )}

      {page === "auth" && (
        <Auth
          authMode={authMode}
          setAuthMode={setAuthMode}
          signup={signup}
          login={login}
          authNameRef={authNameRef}
        />
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="logo-mark" aria-label="CareerForge logo">
      <svg
        className="logo-svg"
        viewBox="0 0 80 80"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="capGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff6cc" />
            <stop offset="52%" stopColor="#d9a514" />
            <stop offset="100%" stopColor="#8b5a00" />
          </linearGradient>

          <linearGradient id="paperGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fffdf1" />
            <stop offset="60%" stopColor="#fff2bd" />
            <stop offset="100%" stopColor="#dfc56f" />
          </linearGradient>

          <linearGradient id="ribbonGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8c637" />
            <stop offset="100%" stopColor="#a87500" />
          </linearGradient>
        </defs>

        <circle className="logo-glow-circle" cx="40" cy="40" r="31" />

        <g className="logo-paper" transform="translate(13 35) rotate(-13 26 12)">
          <rect
            x="3"
            y="4"
            width="45"
            height="20"
            rx="10"
            fill="url(#paperGrad)"
          />
          <ellipse cx="7" cy="14" rx="7" ry="10" fill="#fff8d8" />
          <ellipse
            cx="47"
            cy="14"
            rx="7"
            ry="10"
            fill="#d8b65a"
            opacity="0.85"
          />
          <rect x="23" y="1" width="8" height="27" rx="4" fill="url(#ribbonGrad)" />
          <path d="M23 25 L27 32 L31 25 Z" fill="#7b4e00" opacity="0.95" />
        </g>

        <g className="logo-cap-group" transform="translate(19 14)">
          <path
            d="M21 0 L47 10 L21 21 L-5 10 Z"
            fill="url(#capGrad)"
            stroke="#211602"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M8 18 C14 24 29 24 35 18 L35 30 C27 36 16 36 8 30 Z"
            fill="#211602"
            opacity="0.96"
          />
          <path
            d="M12 19 C18 23 27 23 33 19"
            fill="none"
            stroke="#fff2bd"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M46 11 C50 18 49 23 46 30"
            fill="none"
            stroke="#211602"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="46" cy="31" r="4" fill="#211602" />
        </g>

        <circle cx="21" cy="23" r="3" fill="#fff8dc" opacity="0.9" />
        <circle cx="58" cy="54" r="2.6" fill="#fff8dc" opacity="0.85" />
      </svg>
    </div>
  );
}

function Avatar({ profile, authUser, large = false }) {
  const name = profile?.name || authUser?.name || "User";
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={large ? "avatar large-avatar" : "avatar"}>
      {profile?.photo ? (
        <img src={profile.photo} alt="Profile" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function Navbar({
  page,
  handleNav,
  authUser,
  profile,
  logout,
  setPage,
  setAuthMode,
}) {
  return (
    <header className="navbar">
      <button className="brand" onClick={() => handleNav("home")}>
        <Logo />
        <div>
          <strong>CareerForge</strong>
          <small>Internship Command Center</small>
        </div>
      </button>

      <nav>
        <button
          className={page === "home" ? "active" : ""}
          onClick={() => handleNav("home")}
        >
          Home
        </button>

        <button
          className={page === "tracker" ? "active" : ""}
          onClick={() => handleNav("tracker")}
        >
          Tracker
        </button>

        <button
          className={page === "analytics" ? "active" : ""}
          onClick={() => handleNav("analytics")}
        >
          Analytics
        </button>

        <button
          className={
            page === "resources" || page === "resourceDetail" ? "active" : ""
          }
          onClick={() => handleNav("resources")}
        >
          Resources
        </button>

        <button
          className={page === "resumeBuilder" ? "active" : ""}
          onClick={() => handleNav("resumeBuilder")}
        >
          Resume Builder
        </button>
      </nav>

      <div className="nav-actions">
        {authUser ? (
          <>
            <button className="profile-chip" onClick={() => handleNav("profile")}>
              <Avatar profile={profile} authUser={authUser} />
              <span>
                {profile?.name || authUser.name}
                <small>{profile?.education || "Manage profile"}</small>
              </span>
            </button>

            <button className="outline-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="outline-btn"
              onClick={() => {
                setAuthMode("login");
                setPage("auth");
              }}
            >
              Login
            </button>

            <button
              className="primary-small"
              onClick={() => {
                setAuthMode("signup");
                setPage("auth");
              }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function RealImageCard({ src, alt, compact = false, label = "" }) {
  return (
    <div className={`real-image-card ${compact ? "compact" : ""}`}>
      <img src={src} alt={alt} loading="lazy" />
      {label && <span className="image-label">{label}</span>}
    </div>
  );
}

function Home({ stats, apps, authUser, requireLogin, setPage }) {
  const isLoggedIn = Boolean(authUser);

  const defaultHomeStats = {
    total: 2,
    applied: 1,
    interview: 1,
    selected: 0,
  };

  const defaultRecentApps = [
    {
      id: "default-1",
      company: "Systems Limited",
      role: "Frontend Intern",
      status: "Applied",
    },
    {
      id: "default-2",
      company: "Contour Software",
      role: "Software Intern",
      status: "Interview",
    },
  ];

  const displayStats = isLoggedIn ? stats : defaultHomeStats;
  const recent = isLoggedIn ? apps.slice(0, 3) : defaultRecentApps;

  return (
    <>
      <section className="hero-section">
        <div className="hero-text">
          <h1>
            Track Your <span>Internship Journey</span>
          </h1>

          <p>
            CareerForge helps students track applications, manage deadlines,
            improve resumes, organize profiles, and prepare with professional
            internship resources.
          </p>

          <div className="hero-buttons">
            <button onClick={() => requireLogin("tracker")} className="main-btn">
              Start Tracking
            </button>
            <button onClick={() => setPage("resources")} className="soft-btn">
              Explore Resources
            </button>
          </div>

          <div className="hero-points">
            <span>Profile management</span>
            <span>Resume builder</span>
            <span>Analytics dashboard</span>
          </div>
        </div>

        <div className="hero-visual floating-card">
          <RealImageCard
            src={imageLibrary.dashboard}
            alt="Professional team planning career applications"
            label="Career Planning"
          />

          <div className="visual-top">
            <div>
              <span>Career Dashboard</span>
              <h3>Recent Applications</h3>
            </div>
            <b>{displayStats.total}</b>
          </div>

          <div className="mini-list">
            {recent.map((app) => (
              <div className="mini-app" key={app.id}>
                <div>
                  <strong>{app.company}</strong>
                  <small>{app.role}</small>
                </div>
                <span>{app.status}</span>
              </div>
            ))}
          </div>

          <div className="visual-stats">
            <div>
              <strong>{displayStats.applied}</strong>
              <span>Applied</span>
            </div>
            <div>
              <strong>{displayStats.interview}</strong>
              <span>Interview</span>
            </div>
            <div>
              <strong>{displayStats.selected}</strong>
              <span>Accepted</span>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-title">
          <h2>More than a simple tracker</h2>
          <p>
            This is a complete internship preparation website with profile,
            resources, resume guidance, analytics, and application tracking.
          </p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            label="Profile"
            title="User Profile"
            text="Manage profile photo, username, education, skills, and portfolio."
          />
          <FeatureCard
            label="Board"
            title="Application Board"
            text="Add, edit, search, filter, and track internship applications easily."
          />
          <FeatureCard
            label="Data"
            title="Analytics"
            text="View weekly progress, status breakdown, urgent deadlines, and acceptance rate."
          />
          <FeatureCard
            label="Guides"
            title="Resource Center"
            text="Open full pages for email writing, interviews, follow-ups, and resume building."
          />
        </div>
      </section>
    </>
  );
}

function FeatureCard({ label, title, text }) {
  return (
    <article className="feature-card hover-lift">
      <div className="feature-icon-text">{label}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Tracker({
  form,
  handleInput,
  submitApp,
  companyRef,
  editingId,
  resetForm,
  filter,
  setFilter,
  search,
  setSearch,
  sort,
  setSort,
  filteredApps,
  deadlineLabel,
  deadlineClass,
  changeStatus,
  editApp,
  deleteApp,
  clearAll,
  stats,
}) {
  return (
    <main className="page-wrap">
      <section className="dashboard-cards">
        <Stat label="Total" value={stats.total} />
        <Stat label="Applied" value={stats.applied} />
        <Stat label="Interviews" value={stats.interview} />
        <Stat label="Urgent" value={stats.urgent} danger />
      </section>

      <section className="tracker-layout">
        <form className="tracker-form glass" onSubmit={submitApp}>
          <div className="form-head">
            <div>
              <span>Application Form</span>
              <h2>{editingId ? "Update Application" : "Add New Application"}</h2>
            </div>

            {editingId && (
              <button type="button" className="tiny-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          <label>
            Company Name
            <input
              ref={companyRef}
              name="company"
              value={form.company}
              onChange={handleInput}
              placeholder="Example: Systems Limited"
            />
          </label>

          <label>
            Internship Role
            <input
              name="role"
              value={form.role}
              onChange={handleInput}
              placeholder="Example: Frontend Intern"
            />
          </label>

          <div className="double">
            <label>
              Deadline
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleInput}
              />
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleInput}>
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="double">
            <label>
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={handleInput}
              >
                {priorityOptions.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label>
              Platform
              <input
                name="platform"
                value={form.platform}
                onChange={handleInput}
                placeholder="LinkedIn, Rozee, Email"
              />
            </label>
          </div>

          <div className="double">
            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={handleInput}
                placeholder="Remote, Karachi, Lahore"
              />
            </label>

            <label>
              Stipend
              <input
                name="salary"
                value={form.salary}
                onChange={handleInput}
                placeholder="Example: 30k"
              />
            </label>
          </div>

          <label>
            Application Link
            <input
              name="link"
              value={form.link}
              onChange={handleInput}
              placeholder="https://..."
            />
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleInput}
              placeholder="HR contact, interview timing, requirements, follow-up plan..."
            />
          </label>

          <button className="main-btn full">
            {editingId ? "Save Changes" : "Add Application"}
          </button>
        </form>

        <section className="board glass">
          <div className="board-head">
            <div>
              <span>Career Pipeline</span>
              <h2>Application Board</h2>
            </div>
            <button className="danger-btn" onClick={clearAll}>
              Clear All
            </button>
          </div>

          <div className="tools">
            <input
              placeholder="Search company, role, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="deadline">Sort by Deadline</option>
              <option value="company">Sort by Company</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>

          {filteredApps.length === 0 ? (
            <div className="empty-box">
              <div>📁</div>
              <h3>No application found</h3>
              <p>Add your first internship application or change filters.</p>
            </div>
          ) : (
            <div className="cards-list">
              {filteredApps.map((app) => (
                <article
                  key={app.id}
                  className={`application-card ${deadlineClass(app.deadline)}`}
                >
                  <div className="card-top">
                    <div>
                      <h3>{app.company}</h3>
                      <p>{app.role}</p>
                    </div>
                    <span className={`pill ${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="info-grid">
                    <span>
                      <b>Deadline</b>
                      {app.deadline}
                    </span>
                    <span>
                      <b>Time Left</b>
                      {deadlineLabel(app.deadline)}
                    </span>
                    <span>
                      <b>Priority</b>
                      {app.priority}
                    </span>
                    <span>
                      <b>Platform</b>
                      {app.platform}
                    </span>
                    <span>
                      <b>Location</b>
                      {app.location || "Not added"}
                    </span>
                    <span>
                      <b>Stipend</b>
                      {app.salary || "Not added"}
                    </span>
                  </div>

                  {app.notes && <p className="note-box">{app.notes}</p>}

                  <div className="pipeline">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        className={app.status === s ? "step active-step" : "step"}
                        onClick={() => changeStatus(app.id, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  <div className="card-actions">
                    {app.link && (
                      <a href={app.link} target="_blank" rel="noreferrer">
                        Open Link
                      </a>
                    )}
                    <button onClick={() => editApp(app)}>Edit</button>
                    <button className="delete" onClick={() => deleteApp(app.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value, danger }) {
  return (
    <article className={danger ? "stat-card danger" : "stat-card"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Analytics({ apps, stats, daysLeft }) {
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks = [0, 0, 0, 0];

    apps.forEach((app) => {
      const created = new Date(app.createdAt || now);
      const diff = now - created;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days >= 0 && days < 28) {
        const index = 3 - Math.floor(days / 7);
        weeks[index] += 1;
      }
    });

    return weeks;
  }, [apps]);

  const highestWeek = Math.max(...weeklyData, 5);

  const statusCounts = {
    applied: stats.applied,
    interview: stats.interview,
    selected: stats.selected,
    rejected: stats.rejected,
  };

  const totalStatus = Math.max(
    statusCounts.applied +
      statusCounts.interview +
      statusCounts.selected +
      statusCounts.rejected,
    1
  );

  const appliedDeg = (statusCounts.applied / totalStatus) * 360;
  const interviewDeg = (statusCounts.interview / totalStatus) * 360;
  const selectedDeg = (statusCounts.selected / totalStatus) * 360;
  const rejectedDeg = (statusCounts.rejected / totalStatus) * 360;

  const pieStyle = {
    background: `conic-gradient(
      #22c55e 0deg ${appliedDeg}deg,
      #8b5cf6 ${appliedDeg}deg ${appliedDeg + interviewDeg}deg,
      #f59e0b ${appliedDeg + interviewDeg}deg ${
      appliedDeg + interviewDeg + selectedDeg
    }deg,
      #94a3b8 ${appliedDeg + interviewDeg + selectedDeg}deg ${
      appliedDeg + interviewDeg + selectedDeg + rejectedDeg
    }deg
    )`,
  };

  const upcomingDeadlines = [...apps]
    .filter((app) => {
      const d = daysLeft(app.deadline);
      return d >= 0 && d <= 7;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  return (
    <main className="page-wrap analytics-page">
      <section className="analytics-top-cards">
        <article className="analytics-top-card">
          <span>Total Applications</span>
          <strong>{stats.total}</strong>
        </article>

        <article className="analytics-top-card">
          <span>Applied</span>
          <strong>{stats.applied}</strong>
        </article>

        <article className="analytics-top-card">
          <span>In Progress</span>
          <strong>{stats.interview}</strong>
        </article>

        <article className="analytics-top-card">
          <span>Accepted</span>
          <strong>{stats.selected}</strong>
        </article>
      </section>

      <section className="analytics-chart-grid">
        <article className="analytics-chart-card">
          <h2>Weekly Progress</h2>

          <div className="weekly-chart">
            {weeklyData.map((value, index) => (
              <div className="weekly-bar-wrap" key={index}>
                <div className="weekly-bar-track">
                  <div
                    className="weekly-bar"
                    style={{
                      height: value ? `${(value / highestWeek) * 100}%` : "0%",
                    }}
                  ></div>
                </div>
                <span>Week {index + 1}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-chart-card">
          <h2>Application Status Breakdown</h2>

          <div className="status-chart-layout">
            <div className="status-pie" style={pieStyle}></div>

            <div className="status-legend">
              <div>
                <span className="legend-color applied-dot"></span>
                Applied
                <b>{statusCounts.applied}</b>
              </div>
              <div>
                <span className="legend-color interview-dot"></span>
                Interview
                <b>{statusCounts.interview}</b>
              </div>
              <div>
                <span className="legend-color selected-dot"></span>
                Selected
                <b>{statusCounts.selected}</b>
              </div>
              <div>
                <span className="legend-color rejected-dot"></span>
                Rejected
                <b>{statusCounts.rejected}</b>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="analytics-wide-card">
        <h3>Upcoming Deadlines</h3>

        {upcomingDeadlines.length ? (
          <div className="deadline-list">
            {upcomingDeadlines.map((app) => (
              <div className="deadline-item" key={app.id}>
                <strong>{app.company}</strong>
                <span>{app.role}</span>
                <small>{daysLeft(app.deadline)} day(s) left</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="analytics-muted">
            No urgent deadlines in the next 7 days.
          </p>
        )}
      </section>

      <section className="analytics-motivation">
        <h3>Keep Going!</h3>
        <p>
          Pro tip: Customize each application to match the job description. Use
          role-specific keywords in your resume and cover letter.
        </p>
      </section>
    </main>
  );
}

function Resources({ openResourceDetail }) {
  return (
    <main className="page-wrap">
      <section className="resource-hero glass">
        <div>
          <span>Internship Help Center</span>
          <h1>Resources to Improve Your Chances</h1>
          <p>
            Each guide opens a full page with detailed explanation, examples,
            templates, and practical use cases.
          </p>
        </div>

        <RealImageCard
          src={imageLibrary.email}
          alt="Professional writing an email"
          label="Career Resources"
        />
      </section>

      <section className="resource-grid">
        {resourceCards.map((item) => (
          <article className="resource-card hover-lift" key={item.id}>
            <RealImageCard
              src={imageLibrary[item.id]}
              alt={item.title}
              compact
            />
            <span>{item.tag}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <button
              className="resource-btn"
              onClick={() => openResourceDetail(item.id)}
            >
              View Full Guide
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

function ResourceDetail({ detail, setPage }) {
  return (
    <main className="page-wrap">
      <button className="back-btn" onClick={() => setPage("resources")}>
        ← Back to Resources
      </button>

      <section className="detail-hero glass">
        <div>
          <span>{detail.tag}</span>
          <h1>{detail.title}</h1>
          <p>{detail.subtitle}</p>
        </div>

        <RealImageCard
          src={imageLibrary[detail.id]}
          alt={detail.title}
          label={detail.tag}
        />
      </section>

      <section className="detail-layout">
        <article className="detail-main glass">
          <h2>Overview</h2>
          <p>{detail.intro}</p>

          {detail.sections.map((section) => (
            <div className="detail-section" key={section.heading}>
              <h3>{section.heading}</h3>

              {section.points && (
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}

              {section.text && <pre>{section.text}</pre>}
            </div>
          ))}
        </article>

        <aside className="detail-side glass">
          <h3>Quick Checklist</h3>
          <div className="check-row">Professional tone</div>
          <div className="check-row">Clear structure</div>
          <div className="check-row">Short and relevant</div>
          <div className="check-row">Proofread before sending</div>
          <div className="check-row">Keep examples ready</div>
        </aside>
      </section>
    </main>
  );
}

function ResumeGuideDetail({ detail, setPage }) {
  return (
    <main className="page-wrap">
      <button className="back-btn" onClick={() => setPage("resources")}>
        ← Back to Resources
      </button>

      <section className="detail-hero glass">
        <div>
          <span>{detail.tag}</span>
          <h1>{detail.title}</h1>
          <p>{detail.subtitle}</p>
        </div>

        <RealImageCard
          src={imageLibrary.resume}
          alt="Resume and career planning"
          label="Resume Guide"
        />
      </section>

      <section className="resume-guide-layout no-builder-sidebar">
        <article className="detail-main glass">
          <h2>How to choose the right resume format</h2>
          <p>{detail.intro}</p>

          <div className="resume-format-grid">
            {detail.formats.map((format) => (
              <div className="resume-format-card" key={format.name}>
                <h3>{format.name}</h3>
                <p>{format.bestFor}</p>

                <h4>Use it when:</h4>
                <ul>
                  {format.useWhen.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <h4>Typical structure:</h4>
                <div className="format-structure">{format.structure}</div>
              </div>
            ))}
          </div>

          <div className="detail-section">
            <h3>Essential sections for a strong student resume</h3>
            <ul>
              {detail.essentials.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Project example</h3>
            <pre>{detail.examples.project}</pre>
          </div>

          <div className="detail-section">
            <h3>Resume summary example</h3>
            <pre>{detail.examples.summary}</pre>
          </div>
        </article>
      </section>
    </main>
  );
}

function ResumeBuilder({
  setPage,
  resumeData,
  handleResumeInput,
  resumeStep,
  setResumeStep,
  resumeSteps,
  nextResumeStep,
  prevResumeStep,
  resumeFormat,
  setResumeFormat,
}) {
  const progress = Math.round(((resumeStep + 1) / resumeSteps.length) * 100);

  const getResumeSections = () => {
    if (resumeFormat === "Chronological") {
      return [
        ["Professional Summary", resumeData.summary],
        ["Experience / Projects", resumeData.experience],
        ["Education", resumeData.education],
        ["Skills", resumeData.skills],
        ["Certifications", resumeData.certifications],
      ];
    }

    if (resumeFormat === "Functional") {
      return [
        ["Professional Summary", resumeData.summary],
        ["Skills", resumeData.skills],
        ["Projects / Achievements", resumeData.experience],
        ["Education", resumeData.education],
        ["Certifications", resumeData.certifications],
      ];
    }

    return [
      ["Professional Summary", resumeData.summary],
      ["Skills", resumeData.skills],
      ["Experience / Projects", resumeData.experience],
      ["Education", resumeData.education],
      ["Certifications", resumeData.certifications],
    ];
  };

  const safeText = (text = "") =>
    String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const buildPlainTextResume = () => {
    const lines = [];

    lines.push(resumeData.fullName || "Your Name");
    lines.push(
      [resumeData.address, resumeData.email, resumeData.phone]
        .filter(Boolean)
        .join(" | ")
    );

    if (resumeData.linkedin) lines.push(resumeData.linkedin);
    lines.push("");

    getResumeSections().forEach(([title, value]) => {
      lines.push(title.toUpperCase());
      lines.push(value || "Add details here...");
      lines.push("");
    });

    return lines.join("\n");
  };

  const buildResumeHTML = () => {
    const sectionHtml = getResumeSections()
      .map(
        ([title, value]) => `
          <section style="margin-bottom:18px;">
            <h3 style="margin:0 0 8px; font-size:14px; color:#111827; text-transform:uppercase; letter-spacing:1px;">${safeText(
              title
            )}</h3>
            <p style="margin:0; color:#374151; line-height:1.7; white-space:pre-wrap;">${safeText(
              value || "Add details here..."
            )}</p>
          </section>
        `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>${safeText(resumeData.fullName || "Resume")}</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 36px; color: #111827;">
        <header style="border-bottom: 2px solid #e5e7eb; padding-bottom: 14px; margin-bottom: 20px;">
          <h1 style="margin:0 0 8px; font-size: 32px;">${safeText(
            resumeData.fullName || "Your Name"
          )}</h1>
          <p style="margin:4px 0; color:#4b5563;">${safeText(
            [resumeData.address, resumeData.email, resumeData.phone]
              .filter(Boolean)
              .join(" • ")
          )}</p>
          ${
            resumeData.linkedin
              ? `<p style="margin:4px 0; color:#4b5563;">${safeText(
                  resumeData.linkedin
                )}</p>`
              : ""
          }
        </header>
        ${sectionHtml}
      </body>
      </html>
    `;
  };

  const downloadBlob = (content, fileName, type) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadTxt = () => {
    const fileName = `${(resumeData.fullName || "resume").replaceAll(
      " ",
      "_"
    )}.txt`;

    downloadBlob(buildPlainTextResume(), fileName, "text/plain;charset=utf-8");
  };

  const handleDownloadDoc = () => {
    const fileName = `${(resumeData.fullName || "resume").replaceAll(
      " ",
      "_"
    )}.doc`;

    downloadBlob(buildResumeHTML(), fileName, "application/msword");
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(buildResumeHTML());
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <main className="page-wrap resume-builder-page">
      <button className="back-btn" onClick={() => setPage("home")}>
        ← Back to Home
      </button>

      <section className="resume-builder-layout">
        <article className="resume-builder-form">
          <div className="builder-top">
            <div>
              <span>
                Step {resumeStep + 1} of {resumeSteps.length}
              </span>
              <small>{progress}%</small>
            </div>

            <div className="builder-tabs">
              {resumeSteps.map((step, index) => (
                <button
                  key={step}
                  className={resumeStep === index ? "active-tab-step" : ""}
                  onClick={() => setResumeStep(index)}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          <div className="builder-content">
            {resumeStep === 0 && (
              <>
                <h2>Personal Information</h2>
                <p>Let’s start with your basic information.</p>

                <label>
                  Full Name
                  <input
                    name="fullName"
                    value={resumeData.fullName}
                    onChange={handleResumeInput}
                    placeholder="e.g., John Doe"
                  />
                </label>

                <label>
                  Address
                  <input
                    name="address"
                    value={resumeData.address}
                    onChange={handleResumeInput}
                    placeholder="e.g., Karachi, Pakistan"
                  />
                </label>

                <label>
                  Email
                  <input
                    name="email"
                    value={resumeData.email}
                    onChange={handleResumeInput}
                    placeholder="e.g., john@example.com"
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    name="phone"
                    value={resumeData.phone}
                    onChange={handleResumeInput}
                    placeholder="e.g., +92 300 1234567"
                  />
                </label>

                <label>
                  LinkedIn / Portfolio
                  <input
                    name="linkedin"
                    value={resumeData.linkedin}
                    onChange={handleResumeInput}
                    placeholder="e.g., linkedin.com/in/username"
                  />
                </label>
              </>
            )}

            {resumeStep === 1 && (
              <>
                <h2>Professional Summary</h2>
                <p>Write a short summary about your profile and goals.</p>

                <label>
                  Summary
                  <textarea
                    name="summary"
                    value={resumeData.summary}
                    onChange={handleResumeInput}
                    placeholder="Software Engineering student with hands-on experience in..."
                  />
                </label>
              </>
            )}

            {resumeStep === 2 && (
              <>
                <h2>Education</h2>
                <p>Add your degree, institution, and academic details.</p>

                <label>
                  Education
                  <textarea
                    name="education"
                    value={resumeData.education}
                    onChange={handleResumeInput}
                    placeholder="BS Software Engineering — Jinnah University for Women — 2024 to Present"
                  />
                </label>
              </>
            )}

            {resumeStep === 3 && (
              <>
                <h2>Skills & Expertise</h2>
                <p>Add technical, soft, or domain skills relevant to the role.</p>

                <label>
                  Skills
                  <textarea
                    name="skills"
                    value={resumeData.skills}
                    onChange={handleResumeInput}
                    placeholder="React, JavaScript, TypeScript, Tailwind CSS, Firebase..."
                  />
                </label>
              </>
            )}

            {resumeStep === 4 && (
              <>
                <h2>Projects / Experience</h2>
                <p>Add your projects, internships, volunteering, or experience.</p>

                <label>
                  Experience / Projects
                  <textarea
                    name="experience"
                    value={resumeData.experience}
                    onChange={handleResumeInput}
                    placeholder="Internship Application Tracker — React, JavaScript..."
                  />
                </label>
              </>
            )}

            {resumeStep === 5 && (
              <>
                <h2>Certifications</h2>
                <p>Add certifications, workshops, or achievements.</p>

                <label>
                  Certifications
                  <textarea
                    name="certifications"
                    value={resumeData.certifications}
                    onChange={handleResumeInput}
                    placeholder="Google UX Design Certificate, Hackathon Participation..."
                  />
                </label>
              </>
            )}
          </div>

          <div className="builder-actions">
            <button
              type="button"
              className="builder-secondary"
              onClick={prevResumeStep}
              disabled={resumeStep === 0}
            >
              Previous
            </button>

            <button
              type="button"
              className="builder-primary"
              onClick={nextResumeStep}
            >
              {resumeStep === resumeSteps.length - 1 ? "Finish" : "Continue"}
            </button>
          </div>
        </article>

        <aside className="resume-preview-panel">
          <div className="preview-top-card">
            <h3>Choose Resume Format</h3>
            <div className="format-switch">
              {["Chronological", "Functional", "Combination"].map((format) => (
                <button
                  key={format}
                  className={resumeFormat === format ? "active-format" : ""}
                  onClick={() => setResumeFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="resume-download-actions">
            <button type="button" onClick={handleDownloadPdf}>
              Download PDF
            </button>
            <button type="button" onClick={handleDownloadDoc}>
              Download DOC
            </button>
            <button type="button" onClick={handleDownloadTxt}>
              Download TXT
            </button>
          </div>

          <p className="download-note">
            PDF opens the browser print window, where you can save it as PDF.
          </p>

          <div className="resume-sheet-preview">
            <header className="resume-header">
              <h1>{resumeData.fullName || "Your Name"}</h1>
              <p>
                {[resumeData.address, resumeData.email, resumeData.phone]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
              {resumeData.linkedin && <p>{resumeData.linkedin}</p>}
            </header>

            {getResumeSections().map(([title, value]) => (
              <ResumeSection key={title} title={title} text={value} />
            ))}
          </div>

          <div className="template-tip-card">
            <h4>When to use {resumeFormat}</h4>
            <p>
              {resumeFormat === "Chronological" &&
                "Use this when you already have a clear experience timeline and want recruiters to see your latest work first."}
              {resumeFormat === "Functional" &&
                "Use this when you have less experience and want to highlight skills, projects, and strengths."}
              {resumeFormat === "Combination" &&
                "Use this when you are a student or fresher and want to show both skills and projects together."}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ResumeSection({ title, text }) {
  return (
    <section className="resume-preview-section">
      <h4>{title}</h4>
      <p>{text || "Add details here..."}</p>
    </section>
  );
}

function Profile({
  profile,
  handleProfileChange,
  handlePhotoUpload,
  updateProfile,
  profileNameRef,
  stats,
}) {
  return (
    <main className="page-wrap">
      <section className="profile-layout">
        <article className="profile-preview glass">
          <Avatar profile={profile} large />
          <h1>{profile.name || "Your Name"}</h1>
          <p>@{profile.username || "username"}</p>

          <div className="profile-tags">
            <span>{profile.education || "Education not added"}</span>
            <span>{profile.field || "Field not added"}</span>
          </div>

          <div className="profile-stats">
            <div>
              <strong>{stats.total}</strong>
              <span>Applications</span>
            </div>
            <div>
              <strong>{stats.interview}</strong>
              <span>Interviews</span>
            </div>
            <div>
              <strong>{stats.selected}</strong>
              <span>Selected</span>
            </div>
          </div>
        </article>

        <form className="profile-form glass" onSubmit={updateProfile}>
          <div className="form-head">
            <div>
              <span>User Profile</span>
              <h2>Manage Your Profile</h2>
            </div>
          </div>

          <label>
            Profile Photo
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>

          <label>
            Full Name
            <input
              ref={profileNameRef}
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              placeholder="Malaika Tariq"
            />
          </label>

          <label>
            Username
            <input
              name="username"
              value={profile.username}
              onChange={handleProfileChange}
              placeholder="malaika"
            />
          </label>

          <label>
            Education
            <input
              name="education"
              value={profile.education}
              onChange={handleProfileChange}
              placeholder="BS Software Engineering Student"
            />
          </label>

          <label>
            Career Field
            <input
              name="field"
              value={profile.field}
              onChange={handleProfileChange}
              placeholder="Frontend Developer / Full Stack Developer"
            />
          </label>

          <label>
            Skills
            <textarea
              name="skills"
              value={profile.skills}
              onChange={handleProfileChange}
              placeholder="React, JavaScript, Tailwind, Firebase, MongoDB..."
            />
          </label>

          <label>
            Portfolio / LinkedIn / GitHub
            <input
              name="portfolio"
              value={profile.portfolio}
              onChange={handleProfileChange}
              placeholder="https://..."
            />
          </label>

          <button className="main-btn full">Save Profile</button>
        </form>
      </section>
    </main>
  );
}

function Auth({ authMode, setAuthMode, signup, login, authNameRef }) {
  return (
    <main className="auth-page">
      <section className="auth-card glass">
        <div className="auth-visual">
          <Logo />
          <span>Welcome to CareerForge</span>
          <h1>Manage your career journey with confidence.</h1>
          <p>
            Login or create your account to access your tracker, analytics,
            resource pages, resume builder, and profile dashboard.
          </p>
        </div>

        <div className="auth-form-box">
          <div className="auth-tabs">
            <button
              className={authMode === "login" ? "active-tab" : ""}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              className={authMode === "signup" ? "active-tab" : ""}
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {authMode === "signup" ? (
            <form onSubmit={signup}>
              <label>
                Full Name
                <input
                  ref={authNameRef}
                  name="name"
                  placeholder="Enter your full name"
                />
              </label>

              <label>
                Email
                <input name="email" placeholder="example@gmail.com" />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                />
              </label>

              <label>
                Confirm Password
                <input
                  name="confirm"
                  type="password"
                  placeholder="Re-enter password"
                />
              </label>

              <button className="main-btn full">Create Account</button>
            </form>
          ) : (
            <form onSubmit={login}>
              <label>
                Email
                <input name="email" placeholder="example@gmail.com" />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                />
              </label>

              <button className="main-btn full">Login</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;