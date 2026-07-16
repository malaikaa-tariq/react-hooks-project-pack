import { useEffect, useMemo, useState } from "react";
import "./App.css";
import studyLogo from "./assets/studypilot-logo.png";
import maleBot from "./assets/male-bot.png";
import femaleBot from "./assets/female-bot.png";

const USERS_KEY = "studypilot_users_v7";
const CURRENT_KEY = "studypilot_current_user_v7";
const THEME_KEY = "studypilot_theme_v7";

const uid = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const today = () => new Date().toISOString().slice(0, 10);

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const workspaceKey = (email) => `studypilot_workspace_v7_${email}`;

const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const clamp = (num, min, max) => Math.max(min, Math.min(max, num));

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const heroImages = {
  features:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  method:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  dashboard:
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
  planner:
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
  tasks:
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80",
  settings:
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
  certificate:
    "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
  login:
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
};

const COURSE_PROFILES = [
  {
    id: "medicine",
    title: "AI in Medicine",
    area: "medicine",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    useCases: ["medical triage", "radiology support", "patient risk scoring", "drug discovery"],
    dataTypes: ["clinical notes", "scan images", "lab reports", "patient history"],
    risks: ["misdiagnosis", "privacy leakage", "biased treatment suggestions", "over-trust in prediction"],
    metrics: ["sensitivity", "specificity", "clinical safety", "doctor review rate"],
    videoLesson: {
      title: "AI in Medicine: diagnosis support, patient safety, and clinical workflow",
      chapters: [
        "How AI supports doctors without replacing clinical judgment",
        "Why medical data quality and privacy are critical",
        "How triage, scans, and patient risk tools are evaluated",
        "Why human review is required before high-stakes decisions",
      ],
    },
  },
  {
    id: "banking",
    title: "AI in Banking",
    area: "banking",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    useCases: ["fraud detection", "credit scoring", "customer support", "risk monitoring"],
    dataTypes: ["transactions", "account history", "identity records", "complaint logs"],
    risks: ["false fraud flags", "biased credit decisions", "data misuse", "unexplained rejection"],
    metrics: ["fraud recall", "false positive rate", "approval fairness", "response time"],
    videoLesson: {
      title: "AI in Banking: fraud detection, credit risk, and responsible automation",
      chapters: [
        "How transaction patterns reveal unusual behavior",
        "Why explainable credit decisions matter",
        "How banks balance automation with compliance",
        "How customer trust depends on transparency",
      ],
    },
  },
  {
    id: "education",
    title: "AI in Education",
    area: "education",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    useCases: ["personalized tutoring", "skill gap detection", "content recommendation", "feedback support"],
    dataTypes: ["quiz attempts", "study time", "learning goals", "assignment feedback"],
    risks: ["unfair grading", "student surveillance", "weak feedback", "overdependence"],
    metrics: ["learning gain", "completion rate", "feedback quality", "student engagement"],
    videoLesson: {
      title: "AI in Education: personalized learning, assessment, and student support",
      chapters: [
        "How AI adapts learning paths for different students",
        "Why assessment needs fairness and teacher review",
        "How feedback tools improve practice",
        "How to protect student privacy and motivation",
      ],
    },
  },
  {
    id: "cybersecurity",
    title: "AI in Cybersecurity",
    area: "cybersecurity",
    image:
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=900&q=80",
    useCases: ["phishing detection", "malware analysis", "network anomaly detection", "incident response"],
    dataTypes: ["network logs", "email text", "device activity", "threat signatures"],
    risks: ["missed attacks", "false alerts", "adversarial manipulation", "alert fatigue"],
    metrics: ["detection rate", "mean time to respond", "false alert rate", "incident severity reduction"],
    videoLesson: {
      title: "AI in Cybersecurity: threat detection, response, and adversarial risk",
      chapters: [
        "How AI detects unusual network and email behavior",
        "Why attackers can manipulate models",
        "How alert quality affects security teams",
        "How human analysts validate high-risk findings",
      ],
    },
  },
  {
    id: "agriculture",
    title: "AI in Agriculture",
    area: "agriculture",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
    useCases: ["crop disease detection", "yield prediction", "irrigation planning", "soil monitoring"],
    dataTypes: ["drone images", "weather data", "soil readings", "crop growth records"],
    risks: ["wrong treatment advice", "sensor error", "climate uncertainty", "low farmer access"],
    metrics: ["yield improvement", "water saving", "disease detection accuracy", "cost reduction"],
    videoLesson: {
      title: "AI in Agriculture: smart farming, crop health, and resource planning",
      chapters: [
        "How AI reads crop and soil patterns",
        "Why weather and sensor quality matter",
        "How farmers use prediction for planning",
        "How AI can reduce waste and improve yield",
      ],
    },
  },
  {
    id: "marketing",
    title: "AI in Marketing",
    area: "marketing",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    useCases: ["audience segmentation", "campaign optimization", "content personalization", "sentiment analysis"],
    dataTypes: ["customer behavior", "ad performance", "survey responses", "social feedback"],
    risks: ["privacy invasion", "manipulative targeting", "brand mismatch", "biased segmentation"],
    metrics: ["conversion rate", "customer retention", "engagement quality", "campaign ROI"],
    videoLesson: {
      title: "AI in Marketing: personalization, campaigns, and ethical targeting",
      chapters: [
        "How AI groups customers by behavior",
        "Why personalization needs boundaries",
        "How campaign optimization works",
        "How ethical marketing protects trust",
      ],
    },
  },
  {
    id: "robotics",
    title: "AI in Robotics",
    area: "robotics",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80",
    useCases: ["navigation", "object detection", "human-robot interaction", "warehouse automation"],
    dataTypes: ["camera feeds", "sensor readings", "movement logs", "environment maps"],
    risks: ["unsafe movement", "sensor failure", "poor environment mapping", "human injury"],
    metrics: ["task success rate", "collision avoidance", "navigation accuracy", "response time"],
    videoLesson: {
      title: "AI in Robotics: perception, movement, and safe automation",
      chapters: [
        "How robots understand their environment",
        "Why sensors and maps affect decisions",
        "How robotic movement is tested safely",
        "How human interaction changes design choices",
      ],
    },
  },
  {
    id: "datascience",
    title: "AI in Data Science",
    area: "data science",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    useCases: ["prediction modeling", "data cleaning", "pattern discovery", "decision dashboards"],
    dataTypes: ["structured tables", "time series", "text data", "business records"],
    risks: ["bad assumptions", "data leakage", "overfitting", "misleading dashboards"],
    metrics: ["model accuracy", "error rate", "explainability", "business usefulness"],
    videoLesson: {
      title: "AI in Data Science: modeling, evaluation, and decision insight",
      chapters: [
        "How data becomes useful predictions",
        "Why cleaning and validation matter",
        "How dashboards can mislead users",
        "How to explain model results responsibly",
      ],
    },
  },
];

const moduleThemes = [
  {
    key: "foundations",
    label: "Foundations",
    objective: "Understand the real-world role and limits of AI in this field.",
    focus: "core concepts",
  },
  {
    key: "workflow",
    label: "Workflows & Data",
    objective: "Connect data, users, processes, and measurable outputs.",
    focus: "data and workflow design",
  },
  {
    key: "implementation",
    label: "Implementation",
    objective: "Design practical AI support with safe review steps.",
    focus: "solution design",
  },
  {
    key: "governance",
    label: "Strategy & Governance",
    objective: "Evaluate risk, trust, deployment, and long-term value.",
    focus: "ethics and governance",
  },
];

function longParagraph(course, theme, index) {
  const useCase = course.useCases[index % course.useCases.length];
  const data = course.dataTypes[index % course.dataTypes.length];
  const risk = course.risks[index % course.risks.length];
  const metric = course.metrics[index % course.metrics.length];

  const openers = [
    `AI in ${course.area} becomes useful when it is connected to a real human decision, not when it is added only because the technology looks modern.`,
    `A strong ${course.area} AI solution starts by identifying the workflow, the people affected by the result, and the evidence needed to support a safe recommendation.`,
    `Students learning AI for ${course.area} should understand that the model is only one part of a wider system involving data collection, review, feedback, and accountability.`,
    `The most valuable AI systems in ${course.area} usually support people by finding patterns, ranking risks, explaining options, or reducing repetitive work.`,
  ];

  return `${openers[index % openers.length]} In the area of ${theme.focus}, a practical example is ${useCase}. This type of solution may use ${data}, but the data must be checked for quality, missing values, privacy concerns, and real-world meaning. A poor system can create problems such as ${risk}, especially when users accept the output without review. A responsible team therefore defines success using measures such as ${metric}, tests the tool with realistic cases, and explains the result in language that a non-technical user can understand. The goal is not blind automation; the goal is better support, clearer decisions, and safer learning from evidence.`;
}

function makeQuiz(course, theme, moduleIndex) {
  const sets = [
    [
      {
        q: `What is the safest starting point when using AI for ${course.area}?`,
        a: "Define the human problem and success criteria first",
        w: ["Choose a random model first", "Ignore users and collect all data", "Launch without testing"],
      },
      {
        q: `Which example best matches ${course.area} decision support?`,
        a: course.useCases[0],
        w: ["Changing only button colors", "Writing a random slogan", "Removing every review step"],
      },
      {
        q: `Which information source is most useful for ${course.useCases[0]}?`,
        a: course.dataTypes[0],
        w: ["A decorative icon", "A website background image", "An unrelated music playlist"],
      },
      {
        q: `Why should users see explanations in ${course.area}?`,
        a: "So they can understand the recommendation and review it",
        w: ["So the result becomes impossible to question", "So testing is not needed", "So privacy can be ignored"],
      },
      {
        q: `Which risk needs attention in ${course.area}?`,
        a: course.risks[0],
        w: ["Too many rounded corners", "A long heading", "A footer with contact details"],
      },
      {
        q: `Which measure can help judge the value of the system?`,
        a: course.metrics[0],
        w: ["Logo size", "Number of decorative shapes", "Page animation speed only"],
      },
      {
        q: `What should happen if the AI output is uncertain?`,
        a: "Show uncertainty and ask for human review",
        w: ["Pretend the answer is perfect", "Hide the result permanently", "Delete the user account"],
      },
      {
        q: `Which design choice builds trust?`,
        a: "Evidence, confidence, and clear next steps",
        w: ["No explanation", "No feedback option", "Only a beautiful picture"],
      },
      {
        q: `Which action improves fairness?`,
        a: "Test with diverse and realistic cases",
        w: ["Test one perfect case only", "Ignore edge cases", "Remove all documentation"],
      },
      {
        q: `What is the main purpose of AI support here?`,
        a: "Improve decisions while keeping accountability clear",
        w: ["Remove all human responsibility", "Make random guesses", "Avoid measuring outcomes"],
      },
    ],
    [
      {
        q: `Which workflow step should come before model output in ${course.area}?`,
        a: "Collect relevant input and define the expected decision",
        w: ["Hide the input", "Skip the user journey", "Only change the page title"],
      },
      {
        q: `Which data type supports ${course.useCases[1]}?`,
        a: course.dataTypes[1],
        w: ["A random color palette", "A navigation label", "A loading spinner"],
      },
      {
        q: `Why is data quality important for ${course.area}?`,
        a: "Weak data can create weak or harmful recommendations",
        w: ["Data quality only affects fonts", "Data quality removes all risk", "Data quality is never relevant"],
      },
      {
        q: `Which workflow is more responsible?`,
        a: "Input, prediction, explanation, review, and feedback",
        w: ["Input and hidden result only", "Prediction without review", "Feedback without evidence"],
      },
      {
        q: `Which risk is connected with poor data handling?`,
        a: course.risks[1],
        w: ["Too much spacing", "Too many cards", "A missing hover effect"],
      },
      {
        q: `Which metric can show whether the workflow works?`,
        a: course.metrics[1],
        w: ["Image brightness", "Number of buttons", "Footer width"],
      },
      {
        q: `What should a feedback loop capture?`,
        a: "Mistakes, corrections, and user review outcomes",
        w: ["Only decorative images", "Only theme color", "Only random usernames"],
      },
      {
        q: `Which choice protects users?`,
        a: "Use only needed data and protect privacy",
        w: ["Collect everything forever", "Share sensitive data openly", "Ignore consent"],
      },
      {
        q: `What makes output easier to use?`,
        a: "Plain language, evidence, and action guidance",
        w: ["Hidden logic", "Unreadable labels", "No explanation"],
      },
      {
        q: `Which process improves long-term quality?`,
        a: "Review real outcomes and update the system carefully",
        w: ["Never update anything", "Remove testing", "Avoid all user feedback"],
      },
    ],
    [
      {
        q: `Which design supports safe implementation in ${course.area}?`,
        a: "A clear workflow with human checkpoints",
        w: ["Full automation without review", "Only a visual mockup", "No testing after launch"],
      },
      {
        q: `Which practical use case should be tested carefully?`,
        a: course.useCases[2],
        w: ["A random page animation", "A button shadow", "A footer link"],
      },
      {
        q: `Which input can support this practical use case?`,
        a: course.dataTypes[2],
        w: ["A random font file", "A copied slogan", "An empty image"],
      },
      {
        q: `Why should implementation include fallback options?`,
        a: "Because AI can be uncertain, incomplete, or wrong",
        w: ["Because fallback removes all user choice", "Because fallback hides mistakes", "Because fallback replaces testing"],
      },
      {
        q: `Which risk should be reduced before deployment?`,
        a: course.risks[2],
        w: ["A small navbar", "A large heading", "A visible footer"],
      },
      {
        q: `Which metric helps evaluate implementation quality?`,
        a: course.metrics[2],
        w: ["Logo color only", "Number of icons", "Spacing between cards"],
      },
      {
        q: `Which interface pattern is better?`,
        a: "Show result, reason, confidence, and next step",
        w: ["Show result without context", "Hide confidence", "Block all corrections"],
      },
      {
        q: `What should users be able to do?`,
        a: "Review, question, and correct the AI output",
        w: ["Only accept the result", "Never give feedback", "Never see evidence"],
      },
      {
        q: `Which testing style is strongest?`,
        a: "Realistic cases, edge cases, and expert review",
        w: ["One easy example only", "No expert review", "Only screenshots"],
      },
      {
        q: `What makes the solution more practical?`,
        a: "It fits the existing user workflow",
        w: ["It ignores daily work", "It adds confusion", "It removes user control"],
      },
    ],
    [
      {
        q: `Which governance habit is important in ${course.area}?`,
        a: "Document decisions, risks, testing, and review rules",
        w: ["Avoid documentation", "Hide every limitation", "Remove audit trails"],
      },
      {
        q: `Which use case needs ongoing monitoring?`,
        a: course.useCases[3],
        w: ["A static decorative card", "A footer paragraph", "A button label"],
      },
      {
        q: `Which data source should be governed carefully?`,
        a: course.dataTypes[3],
        w: ["A theme icon", "A public logo", "A heading font"],
      },
      {
        q: `Why does governance matter?`,
        a: "It keeps AI accountable, safe, and reviewable",
        w: ["It removes all responsibility", "It makes testing unnecessary", "It hides mistakes"],
      },
      {
        q: `Which risk belongs in a governance plan?`,
        a: course.risks[3],
        w: ["Rounded cards", "A visible logo", "A short footer"],
      },
      {
        q: `Which metric can support governance review?`,
        a: course.metrics[3],
        w: ["Cursor size", "Button border radius", "Image crop position"],
      },
      {
        q: `What should be done after deployment?`,
        a: "Monitor outcomes and update carefully",
        w: ["Never check performance", "Delete feedback", "Ignore failures"],
      },
      {
        q: `Which policy protects users?`,
        a: "Clear data limits, privacy rules, and escalation steps",
        w: ["Unlimited data collection", "No review process", "Hidden decisions"],
      },
      {
        q: `What should happen when users report a mistake?`,
        a: "Record it, review it, and improve the system",
        w: ["Ignore the report", "Blame the user automatically", "Hide the complaint"],
      },
      {
        q: `Which statement best describes responsible AI?`,
        a: "Useful automation with human accountability",
        w: ["Automation without responsibility", "Predictions without evidence", "Speed without safety"],
      },
    ],
  ];

  return sets[moduleIndex].map((item, index) => {
    const choices = shuffle([item.a, ...item.w]);
    return {
      id: `${course.id}_${theme.key}_${index}`,
      question: item.q,
      choices,
      answer: choices.indexOf(item.a),
      explanation: `This answer matches ${course.title} because responsible AI needs relevant data, clear goals, human review, and measurable safety.`,
    };
  });
}

function buildModule(course, index) {
  const theme = moduleThemes[index];

  return {
    id: theme.key,
    title: `${theme.label} of ${course.title.replace("AI in ", "")}`,
    objective: theme.objective,
    sections: Array.from({ length: 8 }, (_, sectionIndex) => ({
      heading: `${theme.label} Topic ${sectionIndex + 1}`,
      paragraphs: [
        longParagraph(course, theme, sectionIndex),
        longParagraph(course, theme, sectionIndex + 3),
        longParagraph(course, theme, sectionIndex + 6),
      ],
    })),
    questionPool: makeQuiz(course, theme, index),
  };
}

const COURSE_LIBRARY = COURSE_PROFILES.map((course) => ({
  ...course,
  modules: [0, 1, 2, 3].map((index) => buildModule(course, index)),
}));

function defaultWorkspace(user = {}) {
  return {
    profile: {
      fullName: user.name || "",
      email: user.email || "",
      gender: user.gender || "female",
      photo: "",
      degree: user.degree || "",
      semester: user.semester || "",
      dailyHours: user.dailyHours || "3",
      weeklyTarget: "14",
      preferredTime: "Evening",
      mainGoal: "Improve study consistency",
      weakSubjects: "",
      strongSubjects: "",
      interestedFields: "",
      university: "",
      phone: "",
    },
    planner: {
      subjects: [],
      plans: [],
    },
    tasks: [],
    courseProgress: {},
    certificates: [],
    activities: [],
  };
}

const PRIVATE_PAGES = {
  dashboard: "Dashboard",
  profile: "Profile Setup",
  planner: "Study Planner",
  tasks: "Task Hub",
  courses: "Courses",
  learning: "Course Learning",
  certificates: "Certificate Center",
  settings: "Settings",
};

export default function App() {
  const storedUser = read(CURRENT_KEY, null);

  const [theme, setTheme] = useState(() => read(THEME_KEY, "light"));
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [page, setPage] = useState(storedUser ? "dashboard" : "home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [workspace, setWorkspace] = useState(() =>
    storedUser ? read(workspaceKey(storedUser.email), defaultWorkspace(storedUser)) : defaultWorkspace()
  );

  const [notice, setNotice] = useState(null);
  const [confirmBox, setConfirmBox] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(COURSE_LIBRARY[0].id);
  const [videoModal, setVideoModal] = useState(null);
  const [contentModal, setContentModal] = useState(null);
  const [quizModal, setQuizModal] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [listModal, setListModal] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    write(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!currentUser) return;
    write(CURRENT_KEY, currentUser);
    write(workspaceKey(currentUser.email), workspace);
  }, [currentUser, workspace]);

  const selectedCourse = useMemo(
    () => COURSE_LIBRARY.find((course) => course.id === selectedCourseId) || COURSE_LIBRARY[0],
    [selectedCourseId]
  );

  function notify(type, title, message) {
    setNotice({ type, title, message });
  }

  function updateWorkspace(updater) {
    setWorkspace((prev) => (typeof updater === "function" ? updater(prev) : updater));
  }

  function logActivity(message) {
    updateWorkspace((prev) => ({
      ...prev,
      activities: [{ id: uid(), message, date: new Date().toISOString() }, ...prev.activities].slice(0, 30),
    }));
  }

  function login(user) {
    setCurrentUser(user);
    const data = read(workspaceKey(user.email), defaultWorkspace(user));
    setWorkspace(data);
    setPage(data.profile.fullName ? "dashboard" : "profile");
    setAuthMode(null);
    notify("success", "Welcome back", "You are now inside your StudyPilot workspace.");
  }

  function logout() {
    localStorage.removeItem(CURRENT_KEY);
    setCurrentUser(null);
    setWorkspace(defaultWorkspace());
    setPage("home");
    setDrawerOpen(false);
    notify("info", "Logged out", "Your session has been closed safely.");
  }

  function saveProfile(profile) {
    updateWorkspace((prev) => ({ ...prev, profile }));

    if (currentUser) {
      const nextCurrent = {
        ...currentUser,
        name: profile.fullName,
        email: profile.email,
        gender: profile.gender,
        degree: profile.degree,
        semester: profile.semester,
        dailyHours: profile.dailyHours,
      };

      setCurrentUser(nextCurrent);

      const users = read(USERS_KEY, []);
      write(
        USERS_KEY,
        users.map((user) => (user.id === currentUser.id ? { ...user, ...nextCurrent } : user))
      );
    }

    logActivity("Updated profile settings.");
    notify("success", "Profile saved", "Your profile has been updated.");
  }

  function addSubject(subject) {
    updateWorkspace((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        subjects: [{ ...subject, id: uid(), createdAt: new Date().toISOString() }, ...prev.planner.subjects],
      },
    }));
    logActivity(`Added subject "${subject.name}".`);
    notify("success", "Subject added", `${subject.name} was added to your planner.`);
  }

  function removeSubject(id) {
    updateWorkspace((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        subjects: prev.planner.subjects.filter((item) => item.id !== id),
      },
    }));
  }

  function generateStudyPlan() {
    if (!workspace.planner.subjects.length) {
      notify("warning", "Add subjects first", "Please add at least one subject to generate a plan.");
      return;
    }

    const sorted = [...workspace.planner.subjects].sort((a, b) => {
      const score = (item) =>
        Number(item.weeklyHours || 0) + (item.priority === "High" ? 6 : item.priority === "Medium" ? 4 : 2);
      return score(b) - score(a);
    });

    const plan = {
      id: uid(),
      title: `Smart Plan for ${formatDate(today())}`,
      createdAt: new Date().toISOString(),
      blocks: sorted.slice(0, 5).map((subject, index) => ({
        id: uid(),
        title: subject.name,
        note: `${subject.weeklyHours}h weekly target, ${subject.priority.toLowerCase()} priority, target grade ${subject.targetGrade || "not set"}.`,
        duration: `${45 + index * 10} min`,
      })),
    };

    updateWorkspace((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        plans: [plan, ...prev.planner.plans],
      },
    }));

    logActivity("Generated a smart study plan.");
    notify("success", "Plan generated", "Your plan is ready in the planner board.");
  }

  function addTask(task) {
    updateWorkspace((prev) => ({
      ...prev,
      tasks: [{ ...task, id: uid(), completed: false, createdAt: new Date().toISOString() }, ...prev.tasks],
    }));
    logActivity(`Added ${task.type.toLowerCase()} "${task.title}".`);
    notify("success", "Task saved", `${task.title} was added to Task Hub.`);
  }

  function toggleTask(id) {
    updateWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  }

  function removeTask(id) {
    updateWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  }

  function getCourseProgress(courseId) {
    return (
      workspace.courseProgress[courseId] || {
        currentModule: 0,
        modules: {},
        completedModules: [],
        finalReflection: "",
        completed: false,
      }
    );
  }

  function updateCourseProgress(courseId, nextProgress) {
    updateWorkspace((prev) => ({
      ...prev,
      courseProgress: {
        ...prev.courseProgress,
        [courseId]: nextProgress,
      },
    }));
  }

  function markContentDone(courseId, moduleIndex) {
    const progress = getCourseProgress(courseId);
    const moduleState = progress.modules[moduleIndex] || {};

    updateCourseProgress(courseId, {
      ...progress,
      modules: {
        ...progress.modules,
        [moduleIndex]: { ...moduleState, contentDone: true },
      },
    });

    notify("success", "Content completed", "You can now watch the video and attempt the quiz.");
  }

  function markVideoDone(courseId, moduleIndex) {
    const progress = getCourseProgress(courseId);
    const moduleState = progress.modules[moduleIndex] || {};

    updateCourseProgress(courseId, {
      ...progress,
      modules: {
        ...progress.modules,
        [moduleIndex]: { ...moduleState, videoDone: true },
      },
    });

    notify("success", "Video completed", "The related video step has been marked completed.");
  }

  function openQuiz(course, moduleIndex) {
    const currentModule = course.modules[moduleIndex];
    const quizSet = shuffle(currentModule.questionPool).slice(0, 10).map((question) => ({ ...question }));

    setQuizModal({
      course,
      moduleIndex,
      questions: quizSet,
      currentIndex: 0,
      answers: {},
      submitted: false,
      score: 0,
      timer: 300,
    });
  }

  function submitQuizResult(result) {
    const { courseId, moduleIndex, questions, answers } = result;
    const progress = getCourseProgress(courseId);

    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.answer) correct += 1;
    });

    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= 75;
    const moduleState = progress.modules[moduleIndex] || {};
    const course = COURSE_LIBRARY.find((item) => item.id === courseId);

    const completedModules = passed
      ? Array.from(new Set([...progress.completedModules, moduleIndex]))
      : progress.completedModules;

    updateCourseProgress(courseId, {
      ...progress,
      currentModule: passed ? Math.min(moduleIndex + 1, course.modules.length - 1) : moduleIndex,
      modules: {
        ...progress.modules,
        [moduleIndex]: {
          ...moduleState,
          contentDone: true,
          videoDone: true,
          quizPassed: passed,
          lastScore: percentage,
          lastAttemptAt: new Date().toISOString(),
        },
      },
      completedModules,
    });

    if (passed) {
      notify("success", "Quiz passed", `You scored ${percentage}% and unlocked the next module.`);
    } else {
      notify("warning", "Quiz not passed", `You scored ${percentage}%. Reattempt to score 75% or above.`);
    }
  }

  function submitFinalReflection(course) {
    const progress = getCourseProgress(course.id);

    if (progress.completedModules.length !== course.modules.length) {
      notify("warning", "Modules incomplete", "Finish all modules before generating a certificate.");
      return;
    }

    if (!progress.finalReflection || progress.finalReflection.trim().split(/\s+/).length < 40) {
      notify("warning", "Reflection too short", "Write at least 40 words in your final reflection.");
      return;
    }

    const certificate = {
      id: uid(),
      courseId: course.id,
      courseName: course.title,
      learnerName: workspace.profile.fullName || currentUser?.name || "Student",
      date: today(),
      score: clamp(86 + Math.floor(Math.random() * 12), 86, 98),
    };

    updateWorkspace((prev) => ({
      ...prev,
      certificates: prev.certificates.some((item) => item.courseId === course.id)
        ? prev.certificates
        : [certificate, ...prev.certificates],
      courseProgress: {
        ...prev.courseProgress,
        [course.id]: {
          ...progress,
          completed: true,
        },
      },
    }));

    setCertificatePreview(certificate);
    logActivity(`Earned certificate for ${course.title}.`);
    notify("success", "Certificate earned", `Congratulations! Your ${course.title} certificate is ready.`);
  }

  function clearStudyData(password) {
    if (!currentUser || password !== currentUser.password) {
      notify("error", "Wrong password", "The password you entered is incorrect.");
      return;
    }

    updateWorkspace((prev) => ({
      ...prev,
      planner: { subjects: [], plans: [] },
      tasks: [],
      courseProgress: {},
      certificates: [],
      activities: [],
    }));

    setConfirmBox(null);
    notify("warning", "Study data cleared", "Your study-related data has been removed.");
  }

  const stats = useMemo(() => {
    const subjects = workspace.planner.subjects.length;
    const tasks = workspace.tasks;
    const completedTasks = tasks.filter((item) => item.completed).length;
    const pendingTasks = tasks.filter((item) => !item.completed).length;
    const certificates = workspace.certificates.length;
    const plans = workspace.planner.plans.length;

    const studyLoad =
      subjects === 0 && tasks.length === 0
        ? 0
        : clamp(
            Math.round(
              workspace.planner.subjects.reduce((sum, item) => sum + Number(item.weeklyHours || 0), 0) *
                2 +
                pendingTasks * 8
            ),
            0,
            100
          );

    const completion =
      tasks.length === 0 ? 0 : Math.round((completedTasks / Math.max(tasks.length, 1)) * 100);

    return {
      studyLoad,
      completion,
      subjects,
      pendingTasks,
      certificates,
      plans,
      trendData: [
        { name: "Subjects", value: subjects },
        { name: "Plans", value: plans },
        { name: "Pending", value: pendingTasks },
        { name: "Certificates", value: certificates },
      ],
    };
  }, [workspace]);

  return (
    <div className="app-shell">
      <CursorGlow />

      <Header
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        page={page}
        setPage={setPage}
        logout={logout}
        setDrawerOpen={setDrawerOpen}
        setAuthMode={setAuthMode}
        profile={workspace.profile}
      />

      {currentUser && (
        <Drawer open={drawerOpen} setOpen={setDrawerOpen} page={page} setPage={setPage} />
      )}

      <main className={currentUser ? "page-wrap logged-page" : "page-wrap"}>
        {!currentUser ? (
          <>
            {page === "home" && <HomePage setAuthMode={setAuthMode} setPage={setPage} />}
            {page === "features" && <FeaturesPage setPage={setPage} />}
            {page === "method" && <MethodPage />}
          </>
        ) : (
          <>
            {page === "dashboard" && (
              <DashboardPage
                workspace={workspace}
                profile={workspace.profile}
                stats={stats}
                chartType={chartType}
                setChartType={setChartType}
                setPage={setPage}
              />
            )}

            {page === "profile" && (
              <ProfilePage profile={workspace.profile} saveProfile={saveProfile} notify={notify} />
            )}

            {page === "planner" && (
              <PlannerPage
                workspace={workspace}
                addSubject={addSubject}
                removeSubject={removeSubject}
                generateStudyPlan={generateStudyPlan}
                setListModal={setListModal}
              />
            )}

            {page === "tasks" && (
              <TaskHubPage
                tasks={workspace.tasks}
                addTask={addTask}
                toggleTask={toggleTask}
                removeTask={removeTask}
                setListModal={setListModal}
              />
            )}

            {page === "courses" && (
              <CoursesPage
                selectedCourseId={selectedCourseId}
                setSelectedCourseId={setSelectedCourseId}
                workspace={workspace}
                setPage={setPage}
              />
            )}

            {page === "learning" && (
              <LearningPage
                course={selectedCourse}
                progress={getCourseProgress(selectedCourse.id)}
                updateCourseProgress={updateCourseProgress}
                openContent={(course, moduleIndex) => setContentModal({ course, moduleIndex })}
                openVideo={(course, moduleIndex) => setVideoModal({ course, moduleIndex })}
                openQuiz={openQuiz}
                submitFinalReflection={submitFinalReflection}
              />
            )}

            {page === "certificates" && (
              <CertificateCenterPage
                certificates={workspace.certificates}
                setCertificatePreview={setCertificatePreview}
              />
            )}

            {page === "settings" && (
              <SettingsPage
                profile={workspace.profile}
                stats={stats}
                onClear={() =>
                  setConfirmBox({
                    title: "Clear Study Data",
                    message:
                      "Enter your password to permanently clear study data, tasks, course progress, and certificates.",
                    actionLabel: "Clear Data",
                    mode: "password",
                    onConfirm: clearStudyData,
                  })
                }
              />
            )}
          </>
        )}
      </main>

      <Footer />

      {authMode && (
        <AuthModal mode={authMode} close={() => setAuthMode(null)} onLogin={login} notify={notify} />
      )}

      {notice && <NoticeModal notice={notice} close={() => setNotice(null)} />}
      {confirmBox && <ConfirmModal box={confirmBox} close={() => setConfirmBox(null)} />}
      {listModal && <ListModal modal={listModal} close={() => setListModal(null)} />}

      {contentModal && (
        <ContentModal
          modal={contentModal}
          close={() => setContentModal(null)}
          markComplete={() => {
            markContentDone(contentModal.course.id, contentModal.moduleIndex);
            setContentModal(null);
          }}
        />
      )}

      {videoModal && (
        <VideoModal
          modal={videoModal}
          close={() => setVideoModal(null)}
          markComplete={() => {
            markVideoDone(videoModal.course.id, videoModal.moduleIndex);
            setVideoModal(null);
          }}
        />
      )}

      {quizModal && (
        <QuizModal
          modal={quizModal}
          close={() => setQuizModal(null)}
          submitQuizResult={submitQuizResult}
        />
      )}

      {certificatePreview && (
        <CertificateModal certificate={certificatePreview} close={() => setCertificatePreview(null)} />
      )}
    </div>
  );
}

function Header({
  theme,
  setTheme,
  currentUser,
  page,
  setPage,
  logout,
  setDrawerOpen,
  setAuthMode,
  profile,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {currentUser && (
          <button className="icon-btn" onClick={() => setDrawerOpen(true)} type="button">
            ☰
          </button>
        )}

        <button
          className="brand"
          type="button"
          onClick={() => setPage(currentUser ? "dashboard" : "home")}
        >
          <img src={studyLogo} alt="StudyPilot logo" />
          <div className="brand-name">
            <span className="brand-study">Study</span>
            <span className="brand-pilot">Pilot</span>
            <small>{currentUser ? "Student workspace" : "Explore. Learn. Soar."}</small>
          </div>
        </button>
      </div>

      {!currentUser ? (
        <nav className="public-links">
          <button
            type="button"
            className={page === "home" ? "nav-pill active" : "nav-pill"}
            onClick={() => setPage("home")}
          >
            Home
          </button>
          <button
            type="button"
            className={page === "features" ? "nav-pill active" : "nav-pill"}
            onClick={() => setPage("features")}
          >
            Features
          </button>
          <button
            type="button"
            className={page === "method" ? "nav-pill active" : "nav-pill"}
            onClick={() => setPage("method")}
          >
            Study Method
          </button>
        </nav>
      ) : (
        <div className="page-chip">{PRIVATE_PAGES[page]}</div>
      )}

      <div className="topbar-right">
        <button
          className="icon-btn"
          type="button"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="toggle theme"
        >
          {theme === "light" ? "☾" : "☀"}
        </button>

        {!currentUser ? (
          <>
            <button className="mini-outline" type="button" onClick={() => setAuthMode("login")}>
              Login
            </button>
            <button className="mini-solid" type="button" onClick={() => setAuthMode("signup")}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            <div className="user-chip">
              <Avatar profile={profile} />
              <strong>Hello, {profile.fullName ? profile.fullName.split(" ")[0] : "Student"}!</strong>
            </div>
            <button className="mini-outline" type="button" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function Avatar({ profile, large = false }) {
  const defaultAvatar = profile.gender === "male" ? maleBot : femaleBot;

  return (
    <div className={large ? "avatar-frame large" : "avatar-frame"}>
      <img
        className={large ? "avatar-img large" : "avatar-img"}
        src={profile.photo || defaultAvatar}
        alt="profile"
      />
    </div>
  );
}

function Drawer({ open, setOpen, page, setPage }) {
  return (
    <>
      <div className={open ? "drawer-backdrop show" : "drawer-backdrop"} onClick={() => setOpen(false)} />
      <aside className={open ? "drawer show" : "drawer"}>
        <div className="drawer-head">
          <div className="drawer-logo">
            <img src={studyLogo} alt="logo" />
            <div>
              <strong>StudyPilot</strong>
              <small>Workspace Menu</small>
            </div>
          </div>
          <button className="icon-btn" type="button" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        {Object.entries(PRIVATE_PAGES).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={page === id ? "drawer-link active" : "drawer-link"}
            onClick={() => {
              setPage(id);
              setOpen(false);
            }}
          >
            {label}
          </button>
        ))}
      </aside>
    </>
  );
}

function HomePage({ setAuthMode, setPage }) {
  return (
    <>
      <section className="home-hero">
        <div className="hero-scene">
          <div className="building-lines left-building" />
          <div className="building-lines right-building" />
          <div className="cloud cloud-one" />
          <div className="cloud cloud-two" />

          <div className="big-globe">
            <div className="globe-ring" />
            <div className="globe-land land-one" />
            <div className="globe-land land-two" />
            <div className="globe-land land-three" />
          </div>

          <div className="learner-on-books left-learner">
            <div className="book-stack-3d">
              <span />
              <span />
              <span />
            </div>
            <div className="person-3d">
              <i />
              <b />
            </div>
          </div>

          <div className="learner-on-books right-learner">
            <div className="book-stack-3d">
              <span />
              <span />
              <span />
            </div>
            <div className="mini-globe" />
            <div className="person-3d laptop-person">
              <i />
              <b />
            </div>
          </div>

          <div className="open-book-3d">
            <span />
            <span />
          </div>
        </div>

        <div className="home-title-card">
          <img src={studyLogo} alt="StudyPilot logo" />
          <h1>
            <span className="study-word">Study</span>
            <span className="pilot-word">Pilot</span>
          </h1>
          <p>Explore. Learn. Soar.</p>
          <div className="hero-actions center">
            <button className="primary-btn" type="button" onClick={() => setAuthMode("signup")}>
              Get Start
            </button>
            <button className="secondary-btn" type="button" onClick={() => setPage("features")}>
              Learn Now
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="creative-strip">
          <div className="creative-left">
            <span className="eyebrow">Why StudyPilot</span>
            <h2>More than a form-based planner.</h2>
            <p>
              StudyPilot mixes planning, progress visuals, guided course modules,
              profile personalization, and certificates so students do not feel stuck
              in repetitive data entry.
            </p>
          </div>
          <div className="creative-orbs">
            <div className="orb-card">
              <strong>Interactive planner</strong>
              <p>Generate study plans from subjects, priorities, and workload.</p>
            </div>
            <div className="orb-card">
              <strong>Task hub</strong>
              <p>Assignments, exams, and schedule stay together in one academic timeline.</p>
            </div>
            <div className="orb-card">
              <strong>AI courses</strong>
              <p>Complete modules, videos, timed quizzes, and certificates.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeaturesPage({ setPage }) {
  return (
    <>
      <section className="magazine-layout">
        <div className="feature-photo-box">
          <img src={heroImages.features} alt="students collaborating" />
          <div className="feature-float">
            <strong>Built for modern students</strong>
          </div>
        </div>

        <div className="feature-text-box">
          <span className="eyebrow">Features</span>
          <h1>Less repetition, more interaction.</h1>
          <p>
            StudyPilot keeps similar tools merged together: subjects and planning in
            the planner, assignments and exams in Task Hub, and progress inside dashboard.
          </p>
          <button className="primary-btn" type="button" onClick={() => setPage("method")}>
            Explore Study Method
          </button>
        </div>
      </section>

      <section className="section">
        <div className="zigzag-list">
          {[
            ["Planning", "Subject Manager and Smart Planner are merged to avoid repeated pages.", "✦"],
            ["Task Hub", "Assignments, exams, and schedule are grouped because they all manage time-based academic work.", "✓"],
            ["Certification", "Certificates unlock after content, related video, timed quiz, and final reflection completion.", "★"],
            ["Dashboard Progress", "Charts and summaries show progress without needing a duplicate analytics page.", "◔"],
          ].map(([title, text, icon]) => (
            <article key={title} className="zig-card">
              <div className="zig-icon">{icon}</div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="cert-info-banner">
          <img src={studyLogo} alt="StudyPilot logo" />
          <div>
            <h3>About Certifications</h3>
            <p>
              Certificates are designed to feel meaningful. Students must complete module content,
              video checkpoints, timed MCQs, and a final reflection before a certificate is created.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function MethodPage() {
  return (
    <>
      <section className="radial-method">
        <div className="method-copy">
          <span className="eyebrow">Study Method</span>
          <h1>Plan your week with workload, energy, and progress in mind.</h1>
          <p>
            StudyPilot uses a practical study flow where students map subjects,
            turn them into realistic blocks, connect them with tasks, and learn
            through guided AI modules.
          </p>
        </div>

        <div className="method-wheel">
          <div className="wheel-center">Study Flow</div>
          {[
            "Map subjects",
            "Set priorities",
            "Generate plan",
            "Complete tasks",
            "Study modules",
            "Earn certificate",
          ].map((step, index) => (
            <div key={step} className={`wheel-step step-${index + 1}`}>
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="method-cards">
          {[
            ["Subject Mapping", "Add only useful subject details instead of long tiring forms."],
            ["Priority Logic", "Rank difficult and urgent work first so planning becomes realistic."],
            ["Unified Tasks", "Assignments, exams, and schedule are managed together for clarity."],
            ["Interactive Learning", "Course content, video, MCQs, timer, and final task open in focused popups."],
            ["Controlled Certification", "Certificates require successful completion, not random clicking."],
            ["Review and Adjust", "Dashboard summaries help students adapt their next study cycle."],
          ].map(([title, text], index) => (
            <article key={title} className="method-panel">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function DashboardPage({ workspace, profile, stats, chartType, setChartType, setPage }) {
  const pendingTasks = workspace.tasks.filter((task) => !task.completed).slice(0, 4);
  const latestPlan = workspace.planner.plans[0];

  return (
    <>
      <section className="dashboard-hero-grid">
        <div className="welcome-panel">
          <span className="eyebrow">Dashboard</span>
          <h1>Welcome, {profile.fullName ? profile.fullName.split(" ")[0] : "Student"}.</h1>
          <p>
            Your dashboard focuses on progress, summaries, and the next recommended
            action instead of showing more input forms.
          </p>
          <div className="dashboard-quick-buttons">
            <button className="primary-btn" type="button" onClick={() => setPage("planner")}>
              Open Planner
            </button>
            <button className="secondary-btn" type="button" onClick={() => setPage("courses")}>
              Explore Courses
            </button>
          </div>
        </div>

        <div className="dashboard-image-card">
          <img src={heroImages.dashboard} alt="books and workspace" />
          <div className="mini-overlay">
            <strong>Main Goal</strong>
            <p>{profile.mainGoal || "Set your study goal in profile."}</p>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard title="Study Load" value={`${stats.studyLoad}%`} note={stats.studyLoad === 0 ? "No study load yet" : "Based on current workload"} />
        <StatCard title="Task Completion" value={`${stats.completion}%`} note="From Task Hub activity" />
        <StatCard title="Subjects" value={stats.subjects} note="In your planner" />
        <StatCard title="Certificates" value={stats.certificates} note="Earned certificates" />
      </section>

      <section className="dashboard-lower-grid">
        <div className="chart-panel">
          <div className="panel-head-row chart-head-row">
            <div>
              <h3>Workspace Overview</h3>
              <p>Choose one visual style at a time.</p>
            </div>
            <select className="chart-dropdown" value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="bar">Bar Graph</option>
              <option value="pie">Pie Chart</option>
              <option value="line">Line Graph</option>
            </select>
          </div>
          <SimpleChart type={chartType} data={stats.trendData} />
        </div>

        <div className="next-step-panel">
          <h3>What to do next</h3>
          {workspace.planner.subjects.length === 0 ? (
            <div className="next-step-card">
              <strong>Start by adding subjects</strong>
              <p>Use the planner page to add a few subjects and generate your first study plan.</p>
            </div>
          ) : latestPlan ? (
            <div className="next-step-card">
              <strong>{latestPlan.title}</strong>
              <p>Your latest plan is ready. Review its study blocks from the planner page.</p>
            </div>
          ) : (
            <div className="next-step-card">
              <strong>Generate a study plan</strong>
              <p>You already have subjects. Open the planner and create a smart plan.</p>
            </div>
          )}

          <h4 className="subheading">Upcoming Items</h4>
          <div className="timeline-list">
            {pendingTasks.length ? (
              pendingTasks.map((task) => (
                <div key={task.id} className="timeline-item">
                  <span />
                  <div>
                    <strong>{task.title}</strong>
                    <small>
                      {task.type} • {task.date ? formatDate(task.date) : "No date"}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-text">No pending items yet.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ProfilePage({ profile, saveProfile, notify }) {
  const [form, setForm] = useState(profile);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => set("photo", reader.result);
    reader.readAsDataURL(file);
  }

  function submit(event) {
    event.preventDefault();

    if (!form.fullName.trim()) {
      notify("warning", "Name required", "Please enter your full name.");
      return;
    }

    if (!validEmail(form.email)) {
      notify("warning", "Invalid email", "Please enter a valid email.");
      return;
    }

    if (!form.degree.trim() || !form.semester.trim()) {
      notify("warning", "Academic details required", "Please enter degree and semester.");
      return;
    }

    if (Number(form.dailyHours) <= 0 || Number(form.weeklyTarget) <= 0) {
      notify("warning", "Invalid study target", "Daily and weekly study hours must be greater than zero.");
      return;
    }

    saveProfile(form);
  }

  return (
    <section className="profile-layout">
      <div className="profile-side-card">
        <Avatar profile={form} large />
        <h3>{form.fullName || "Your profile preview"}</h3>
        <p>
          Upload a photo or use a gender-based StudyPilot bot avatar automatically.
        </p>
        <label className="upload-btn">
          Upload Photo
          <input type="file" accept="image/*" onChange={handlePhoto} hidden />
        </label>
      </div>

      <form className="profile-form-card" onSubmit={submit}>
        <div className="grid two">
          <Field label="Full name">
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
        </div>

        <div className="grid three">
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Degree / Program">
            <input value={form.degree} onChange={(e) => set("degree", e.target.value)} />
          </Field>
          <Field label="Semester">
            <input value={form.semester} onChange={(e) => set("semester", e.target.value)} />
          </Field>
        </div>

        <div className="grid three">
          <Field label="Daily study hours">
            <input type="number" value={form.dailyHours} onChange={(e) => set("dailyHours", e.target.value)} />
          </Field>
          <Field label="Weekly target">
            <input type="number" value={form.weeklyTarget} onChange={(e) => set("weeklyTarget", e.target.value)} />
          </Field>
          <Field label="Preferred study time">
            <select value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)}>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </Field>
        </div>

        <Field label="Main goal">
          <input value={form.mainGoal} onChange={(e) => set("mainGoal", e.target.value)} />
        </Field>

        <button className="details-toggle" type="button" onClick={() => setShowMore((prev) => !prev)}>
          <span>{showMore ? "Hide optional details" : "Show optional details"}</span>
          <b>{showMore ? "▴" : "▾"}</b>
        </button>

        {showMore && (
          <div className="optional-panel">
            <div className="grid two">
              <Field label="University / College">
                <input value={form.university} onChange={(e) => set("university", e.target.value)} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </div>

            <div className="grid three">
              <Field label="Weak subjects">
                <textarea value={form.weakSubjects} onChange={(e) => set("weakSubjects", e.target.value)} />
              </Field>
              <Field label="Strong subjects">
                <textarea value={form.strongSubjects} onChange={(e) => set("strongSubjects", e.target.value)} />
              </Field>
              <Field label="Interested AI fields">
                <textarea value={form.interestedFields} onChange={(e) => set("interestedFields", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        <button className="primary-btn full-width profile-save-btn" type="submit">
          Save Profile
        </button>
      </form>
    </section>
  );
}

function PlannerPage({ workspace, addSubject, removeSubject, generateStudyPlan, setListModal }) {
  const [form, setForm] = useState({
    name: "",
    priority: "Medium",
    weeklyHours: "",
    targetGrade: "",
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function submit(event) {
    event.preventDefault();

    if (!form.name.trim()) return;
    if (Number(form.weeklyHours) <= 0) return;

    addSubject(form);
    setForm({
      name: "",
      priority: "Medium",
      weeklyHours: "",
      targetGrade: "",
    });
  }

  const latestPlan = workspace.planner.plans[0];

  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  const shownSubjects = [...workspace.planner.subjects]
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 3);

  return (
    <>
      <section className="planner-banner">
        <img src={heroImages.planner} alt="study planning" />
        <div>
          <span className="eyebrow">Planner Hub</span>
          <h1>Plan your studies with priority, time, and goals.</h1>
          <p>
            Subject Manager and Smart Planner are merged here so planning feels simpler
            and less repetitive.
          </p>
        </div>
      </section>

      <section className="planner-main-grid">
        <form className="subject-card bg-card-subject" onSubmit={submit}>
          <h3>Quick Subject Add</h3>
          <p className="muted-text">Add only the details that matter for planning.</p>

          <div className="grid two">
            <Field label="Subject name">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>

            <Field label="Weekly hours">
              <input
                type="number"
                min="1"
                value={form.weeklyHours}
                onChange={(e) => set("weeklyHours", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid two">
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>

            <Field label="Target grade">
              <input value={form.targetGrade} onChange={(e) => set("targetGrade", e.target.value)} />
            </Field>
          </div>

          <button className="primary-btn full-width subject-add-btn" type="submit">
            Add Subject
          </button>
        </form>

        <div className="plan-generator-card bg-card-plan">
          <div className="plan-header">
            <div>
              <h3>Generate Plan</h3>
              <p>Create a smart plan from your current subjects.</p>
            </div>
          </div>

          <div className="plan-content-area">
            {latestPlan ? (
              <div className="plan-preview">
                <strong>{latestPlan.title}</strong>
                {latestPlan.blocks.slice(0, 1).map((block) => (
                  <div key={block.id} className="plan-block">
                    <div>
                      <h4>{block.title}</h4>
                      <p>{block.note}</p>
                    </div>
                    <span>{block.duration}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-box">Your generated study plan will appear here.</div>
            )}
          </div>

          <div className="plan-actions plan-actions-bottom">
            <button className="primary-btn" type="button" onClick={generateStudyPlan}>
              Generate
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                setListModal({
                  title: "All Saved Plans",
                  items: workspace.planner.plans,
                  render: (plan) => (
                    <>
                      <strong>{plan.title}</strong>
                      <small>{new Date(plan.createdAt).toLocaleString()}</small>
                    </>
                  ),
                })
              }
            >
              View All
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="subject-board bg-card-board">
          <div className="panel-head-row subject-board-head">
            <div>
              <h3>Subject Board</h3>
              <p>Showing top 3 subjects by priority.</p>
            </div>

            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                setListModal({
                  title: "All Subjects",
                  items: workspace.planner.subjects,
                  render: (item) => (
                    <>
                      <strong>{item.name}</strong>
                      <small>
                        Priority: {item.priority} • Weekly hours: {item.weeklyHours} • Target grade:{" "}
                        {item.targetGrade || "Not set"}
                      </small>
                    </>
                  ),
                })
              }
            >
              Show More
            </button>
          </div>

          <div className="subject-grid">
            {shownSubjects.length ? (
              shownSubjects.map((item) => (
                <article key={item.id} className="subject-mini-card">
                  <strong>{item.name}</strong>
                  <p>
                    Weekly hours: <b>{item.weeklyHours}</b>
                  </p>
                  <p>
                    Priority: <b>{item.priority}</b>
                  </p>
                  <p>
                    Target grade: <b>{item.targetGrade || "Not set"}</b>
                  </p>
                  <button className="danger-link" type="button" onClick={() => removeSubject(item.id)}>
                    Remove
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-box">No subjects added yet.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function TaskHubPage({ tasks, addTask, toggleTask, removeTask, setListModal }) {
  const [tab, setTab] = useState("All");
  const [form, setForm] = useState({
    type: "Assignment",
    title: "",
    subject: "",
    date: "",
    time: "",
    priority: "Medium",
    notes: "",
  });

  const filtered = tasks.filter((item) => tab === "All" || item.type === tab);
  const shownTasks = filtered.slice(0, 3);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    addTask(form);
    setForm({
      type: "Assignment",
      title: "",
      subject: "",
      date: "",
      time: "",
      priority: "Medium",
      notes: "",
    });
  }

  return (
    <>
      <section className="task-hero-card">
        <img src={heroImages.tasks} alt="calendar and notes" />
        <div>
          <span className="eyebrow">Task Hub</span>
          <h1>Assignments, exams, and schedule in one academic timeline.</h1>
          <p>
            These features are merged because they all manage date-based study activity.
          </p>
        </div>
      </section>

      <section className="task-main-grid">
        <form className="task-form-card" onSubmit={submit}>
          <h3>Add Task</h3>

          <div className="grid two">
            <Field label="Type">
              <select value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option>Assignment</option>
                <option>Exam</option>
                <option>Schedule</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>
          </div>

          <div className="grid two">
            <Field label="Title">
              <input value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Subject / Category">
              <input value={form.subject} onChange={(e) => set("subject", e.target.value)} />
            </Field>
          </div>

          <div className="grid two">
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Time">
              <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>

          <button className="primary-btn full-width" type="submit">
            Save Task
          </button>
        </form>

        <div className="task-list-card bg-card-tasks">
          <div className="task-tab-row">
            {["All", "Assignment", "Exam", "Schedule"].map((label) => (
              <button
                key={label}
                type="button"
                className={tab === label ? "switch-chip active" : "switch-chip"}
                onClick={() => setTab(label)}
              >
                {label}
              </button>
            ))}
            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                setListModal({
                  title: "All Tasks",
                  items: filtered,
                  render: (task) => (
                    <>
                      <strong>{task.title}</strong>
                      <small>
                        {task.type} • {task.date ? formatDate(task.date) : "No date"} • {task.completed ? "Completed" : "Pending"}
                      </small>
                    </>
                  ),
                })
              }
            >
              View All
            </button>
          </div>

          <div className="task-cards-wrap">
            {shownTasks.length ? (
              shownTasks.map((task) => (
                <article key={task.id} className="task-item-card">
                  <div className="task-item-head">
                    <div>
                      <strong>{task.title}</strong>
                      <small>
                        {task.type} • {task.subject || "General"}
                      </small>
                    </div>
                    <span className={task.completed ? "status-done" : "status-pending"}>
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <p>
                    Date: <b>{task.date ? formatDate(task.date) : "No date"}</b>
                    {task.time ? ` • Time: ${task.time}` : ""}
                  </p>
                  <p>
                    Priority: <b>{task.priority}</b>
                  </p>
                  <p>{task.notes || "No notes added."}</p>
                  <div className="task-actions">
                    <button className="mini-solid" type="button" onClick={() => toggleTask(task.id)}>
                      {task.completed ? "Mark Pending" : "Complete"}
                    </button>
                    <button className="mini-outline" type="button" onClick={() => removeTask(task.id)}>
                      Remove
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-box">No tasks found for this tab.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CoursesPage({ selectedCourseId, setSelectedCourseId, workspace, setPage }) {
  return (
    <>
      <section className="courses-header">
        <div className="courses-title">
          <span className="eyebrow">Courses</span>
          <h1>Explore AI fields through guided modules.</h1>
          <p>
            Each course includes unique content, a related video lesson, one-by-one MCQs with timer,
            and certificate completion flow.
          </p>
        </div>
      </section>

      <section className="course-grid">
        {COURSE_LIBRARY.map((course) => {
          const progress = workspace.courseProgress[course.id];
          const completed = Boolean(progress?.completed);
          const moduleCount = progress?.completedModules?.length || 0;

          return (
            <article
              key={course.id}
              className={selectedCourseId === course.id ? "course-card selected" : "course-card"}
              onClick={() => setSelectedCourseId(course.id)}
            >
              <img src={course.image} alt={course.title} />
              <div className="course-card-body">
                <h3>{course.title}</h3>
                <p>
                  <b>Status:</b> {completed ? "Completed" : "In progress / Not started"}
                </p>
                <p>
                  <b>Modules completed:</b> {moduleCount} / {course.modules.length}
                </p>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedCourseId(course.id);
                    setPage("learning");
                  }}
                >
                  Open Course
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="cert-info-banner">
        <img src={studyLogo} alt="StudyPilot logo" />
        <div>
          <h3>How course completion works</h3>
          <p>
            Open the course, complete the reading popup, complete the video lesson popup,
            pass the timed quiz, and submit the final reflection.
          </p>
        </div>
      </section>
    </>
  );
}

function LearningPage({
  course,
  progress,
  updateCourseProgress,
  openContent,
  openVideo,
  openQuiz,
  submitFinalReflection,
}) {
  const [reflection, setReflection] = useState(progress.finalReflection || "");

  useEffect(() => {
    setReflection(progress.finalReflection || "");
  }, [course.id, progress.finalReflection]);

  const allCompleted = progress.completedModules.length === course.modules.length;

  function saveReflectionText(value) {
    setReflection(value);
    updateCourseProgress(course.id, {
      ...progress,
      finalReflection: value,
    });
  }

  return (
    <>
      <section className="learning-hero">
        <div className="learning-photo">
          <img src={course.image} alt={course.title} />
        </div>
        <div className="learning-copy">
          <span className="eyebrow">Course Learning</span>
          <h1>{course.title}</h1>
          <p>
            Work through each module in order. Every module includes long reading content,
            a related video popup, and a timed quiz that appears one question at a time.
          </p>
          <p>
            <b>Course status:</b> {progress.completed ? "Completed" : "Active"}
          </p>
        </div>
      </section>

      <section className="module-board">
        {course.modules.map((module, index) => {
          const state = progress.modules[index] || {};
          const locked = index > progress.completedModules.length;

          return (
            <article key={module.id} className={locked ? "module-card locked" : "module-card"}>
              <div className="module-top">
                <div>
                  <small>Module {index + 1}</small>
                  <h3>{module.title}</h3>
                </div>
                <span>{state.quizPassed ? "Passed" : locked ? "Locked" : "Open"}</span>
              </div>

              <p>{module.objective}</p>

              <div className="module-status-list">
                <p>
                  Reading status: <b>{state.contentDone ? "Completed" : "Pending"}</b>
                </p>
                <p>
                  Video status: <b>{state.videoDone ? "Completed" : "Pending"}</b>
                </p>
                <p>
                  Quiz status: <b>{state.quizPassed ? `Passed (${state.lastScore}%)` : "Not passed yet"}</b>
                </p>
              </div>

              <div className="module-actions">
                <button className="mini-solid" type="button" disabled={locked} onClick={() => openContent(course, index)}>
                  Open Content
                </button>
                <button className="mini-outline" type="button" disabled={locked} onClick={() => openVideo(course, index)}>
                  Watch Video
                </button>
                <button
                  className="mini-outline"
                  type="button"
                  disabled={locked || !state.contentDone || !state.videoDone}
                  onClick={() => openQuiz(course, index)}
                >
                  Start Quiz
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="final-task-card">
        <div className="panel-head-row">
          <div>
            <h3>Final Reflection / Project Task</h3>
            <p>
              After passing all modules, write your final reflection or mini project proposal for this course.
            </p>
          </div>
          <span className={allCompleted ? "status-done" : "status-pending"}>
            {allCompleted ? "Unlocked" : "Locked"}
          </span>
        </div>

        <textarea
          className="big-textarea"
          value={reflection}
          onChange={(event) => saveReflectionText(event.target.value)}
          placeholder={`Write your final reflection for ${course.title}...`}
        />

        <button className="primary-btn" type="button" onClick={() => submitFinalReflection(course)}>
          Generate Certificate
        </button>
      </section>
    </>
  );
}

function CertificateCenterPage({ certificates, setCertificatePreview }) {
  return (
    <>
      <section className="cert-center-hero">
        <div className="cert-center-copy">
          <span className="eyebrow">Certificate Center</span>
          <h1>Showcase verified learning achievements.</h1>
          <p>
            Your certificates appear here after you complete course content, video lessons,
            timed quizzes, and final reflection tasks.
          </p>
        </div>
        <div className="cert-center-image">
          <img src={heroImages.certificate} alt="certificate workspace" />
        </div>
      </section>

      <section className="cert-list-grid">
        {certificates.length ? (
          certificates.map((item) => (
            <article key={item.id} className="certificate-item-card">
              <img src={studyLogo} alt="logo" />
              <h3>{item.courseName}</h3>
              <p>
                Issued to <b>{item.learnerName}</b>
              </p>
              <p>
                Completion date: <b>{formatDate(item.date)}</b>
              </p>
              <button className="primary-btn" type="button" onClick={() => setCertificatePreview(item)}>
                View Certificate
              </button>
            </article>
          ))
        ) : (
          <div className="empty-box wide-empty">No certificates earned yet.</div>
        )}
      </section>
    </>
  );
}

function SettingsPage({ profile, stats, onClear }) {
  return (
    <>
      <section className="settings-layout">
        <div className="settings-copy-card">
          <span className="eyebrow">Settings</span>
          <h1>Make your workspace safer and richer.</h1>
          <p>
            Manage your identity, check workspace health, and clear study data only after
            password confirmation.
          </p>
        </div>

        <div className="settings-photo-card">
          <img src={heroImages.settings} alt="settings workspace" />
        </div>
      </section>

      <section className="settings-grid">
        <article className="settings-box">
          <h3>Identity Summary</h3>
          <div className="identity-row">
            <Avatar profile={profile} />
            <div>
              <strong>{profile.fullName || "Student"}</strong>
              <p>{profile.email || "Email not added yet"}</p>
            </div>
          </div>
        </article>

        <article className="settings-box">
          <h3>Workspace Summary</h3>
          <ul>
            <li>Subjects: {stats.subjects}</li>
            <li>Pending Tasks: {stats.pendingTasks}</li>
            <li>Certificates: {stats.certificates}</li>
            <li>Saved Plans: {stats.plans}</li>
          </ul>
        </article>

        <article className="settings-box warning-box">
          <h3>Protected Clear Data</h3>
          <p>Clearing your study data requires your account password.</p>
          <button className="danger-btn" type="button" onClick={onClear}>
            Clear Study Data
          </button>
        </article>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src={studyLogo} alt="StudyPilot logo" />
        <div>
          <h3>
            <span className="brand-study">Study</span>
            <span className="brand-pilot">Pilot</span>
          </h3>
          <p>
            A smart study planning platform that helps students organize workload,
            learn AI fields, and earn meaningful certificates.
          </p>
        </div>
      </div>

      <div className="footer-contact">
        <strong>Contact</strong>
        <p>Email: support@studypilot.app</p>
        <p>Location: Karachi, Pakistan</p>
      </div>
    </footer>
  );
}

function Field({ label, children }) {
  return (
    <label className="field-block">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatCard({ title, value, note }) {
  return (
    <article className="stat-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function CursorGlow() {
  const [pos, setPos] = useState({ x: -80, y: -80 });

  useEffect(() => {
    const move = (event) => setPos({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return <div className="cursor-dot" style={{ left: pos.x, top: pos.y }} />;
}

function NoticeModal({ notice, close }) {
  const icons = {
    success: "✓",
    warning: "!",
    error: "✕",
    info: "i",
  };

  return (
    <div className="modal-backdrop">
      <div className="notice-modal">
        <div className={`notice-icon ${notice.type}`}>{icons[notice.type] || "i"}</div>
        <div className="notice-body">
          <h3>{notice.title}</h3>
          <p>{notice.message}</p>
        </div>
        <button className="primary-btn" type="button" onClick={close}>
          OK
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ box, close }) {
  const [password, setPassword] = useState("");

  return (
    <div className="modal-backdrop">
      <div className="confirm-modal">
        <h3>{box.title}</h3>
        <p>{box.message}</p>

        {box.mode === "password" && (
          <input
            className="confirm-input"
            type="password"
            value={password}
            placeholder="Enter password"
            onChange={(event) => setPassword(event.target.value)}
          />
        )}

        <div className="modal-actions">
          <button className="mini-outline" type="button" onClick={close}>
            Cancel
          </button>
          <button className="danger-btn" type="button" onClick={() => box.onConfirm(password)}>
            {box.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ mode, close, onLogin, notify }) {
  const isSignup = mode === "signup";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    degree: "",
    semester: "",
    dailyHours: "3",
    gender: "female",
  });

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function submit(event) {
    event.preventDefault();

    const users = read(USERS_KEY, []);

    if (!validEmail(form.email)) {
      notify("warning", "Invalid email", "Please enter a valid email.");
      return;
    }

    if (!form.password.trim()) {
      notify("warning", "Password required", "Please enter your password.");
      return;
    }

    if (isSignup) {
      if (!form.name.trim()) {
        notify("warning", "Name required", "Please enter your full name.");
        return;
      }

      if (form.password.length < 6) {
        notify("warning", "Weak password", "Password must be at least 6 characters.");
        return;
      }

      if (form.password !== form.confirm) {
        notify("warning", "Password mismatch", "Confirm password does not match.");
        return;
      }

      if (!form.degree.trim() || !form.semester.trim()) {
        notify("warning", "Academic details required", "Please enter degree and semester.");
        return;
      }

      const exists = users.some((user) => user.email.toLowerCase() === form.email.toLowerCase());

      if (exists) {
        notify("warning", "Email already exists", "Please login with this account.");
        return;
      }

      const user = {
        id: uid(),
        name: form.name,
        email: form.email,
        password: form.password,
        degree: form.degree,
        semester: form.semester,
        dailyHours: form.dailyHours,
        gender: form.gender,
      };

      write(USERS_KEY, [user, ...users]);
      write(workspaceKey(user.email), defaultWorkspace(user));
      onLogin(user);
      return;
    }

    const user = users.find((item) => item.email.toLowerCase() === form.email.toLowerCase());

    if (!user) {
      notify("error", "Account not found", "Please sign up first with this email.");
      return;
    }

    if (user.password !== form.password) {
      notify("error", "Wrong password", "The password is incorrect.");
      return;
    }

    onLogin(user);
  }

  return (
    <div className="modal-backdrop auth-backdrop">
      <div className="auth-modal">
        <button className="close-icon" type="button" onClick={close}>
          ×
        </button>

        <div className="auth-left">
          <img src={heroImages.login} alt="study workspace" />
          <div className="auth-overlay">
            <strong>{isSignup ? "Create your workspace" : "Welcome back"}</strong>
            <p>StudyPilot keeps planning, learning, and certification in one place.</p>
          </div>
        </div>

        <form className="auth-right" onSubmit={submit}>
          <span className="eyebrow">{isSignup ? "Sign Up" : "Login"}</span>
          <h2>{isSignup ? "Start your planning system." : "Continue your study flow."}</h2>

          {isSignup && (
            <>
              <Field label="Full name">
                <input value={form.name} onChange={(event) => set("name", event.target.value)} />
              </Field>

              <Field label="Gender">
                <select value={form.gender} onChange={(event) => set("gender", event.target.value)}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </Field>
            </>
          )}

          <Field label="Email">
            <input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
          </Field>

          <Field label="Password">
            <input type="password" value={form.password} onChange={(event) => set("password", event.target.value)} />
          </Field>

          {isSignup && (
            <>
              <Field label="Confirm password">
                <input type="password" value={form.confirm} onChange={(event) => set("confirm", event.target.value)} />
              </Field>

              <div className="grid two">
                <Field label="Degree">
                  <input value={form.degree} onChange={(event) => set("degree", event.target.value)} />
                </Field>

                <Field label="Semester">
                  <input value={form.semester} onChange={(event) => set("semester", event.target.value)} />
                </Field>
              </div>
            </>
          )}

          <button className="primary-btn full-width" type="submit">
            {isSignup ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ListModal({ modal, close }) {
  return (
    <div className="modal-backdrop">
      <div className="list-modal">
        <div className="modal-top-row">
          <h2>{modal.title}</h2>
          <button className="close-icon" type="button" onClick={close}>
            ×
          </button>
        </div>

        <div className="list-modal-items">
          {modal.items.length ? (
            modal.items.map((item) => (
              <article key={item.id} className="list-modal-item">
                {modal.render(item)}
              </article>
            ))
          ) : (
            <div className="empty-box">No items available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentModal({ modal, close, markComplete }) {
  const module = modal.course.modules[modal.moduleIndex];

  return (
    <div className="modal-backdrop">
      <div className="content-modal">
        <div className="modal-top-row">
          <div>
            <span className="eyebrow">
              {modal.course.title} • Module {modal.moduleIndex + 1}
            </span>
            <h2>{module.title}</h2>
          </div>
          <button className="close-icon" type="button" onClick={close}>
            ×
          </button>
        </div>

        <div className="article-scroll-area">
          {module.sections.map((section) => (
            <section key={section.heading} className="article-section">
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="modal-actions">
          <button className="mini-outline" type="button" onClick={close}>
            Close
          </button>
          <button className="primary-btn" type="button" onClick={markComplete}>
            Mark Completed
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ modal, close, markComplete }) {
  const lesson = modal.course.videoLesson;
  const module = modal.course.modules[modal.moduleIndex];

  return (
    <div className="modal-backdrop">
      <div className="video-modal">
        <div className="modal-top-row">
          <div>
            <span className="eyebrow">Course Video Lesson • Module {modal.moduleIndex + 1}</span>
            <h2>{modal.course.title}</h2>
          </div>

          <button className="close-icon" type="button" onClick={close}>
            ×
          </button>
        </div>

        <BuiltInVideoPlayer course={modal.course} module={module} lesson={lesson} />

        <div className="modal-actions">
          <button className="mini-outline" type="button" onClick={close}>
            Close
          </button>

          <button className="primary-btn" type="button" onClick={markComplete}>
            Mark Video Completed
          </button>
        </div>
      </div>
    </div>
  );
}

function BuiltInVideoPlayer({ course, module, lesson }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const chapters = [
    module.objective,
    ...lesson.chapters,
    `How this lesson connects directly with ${course.title}.`,
  ];

  const activeChapter = Math.min(
    Math.floor((progress / 100) * chapters.length),
    chapters.length - 1
  );

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setPlaying(false);
          return 100;
        }
        return prev + 1;
      });
    }, 260);

    return () => clearInterval(timer);
  }, [playing]);

  function restart() {
    setProgress(0);
    setPlaying(true);
  }

  return (
    <div className="lesson-video-box">
      <div className="lesson-screen">
        <img src={course.image} alt={course.title} />

        <div className="video-dark-layer" />

        <button
          className={playing ? "play-circle playing" : "play-circle"}
          type="button"
          onClick={() => setPlaying((prev) => !prev)}
        >
          {playing ? "❚❚" : "▶"}
        </button>

        <div className="video-caption">
          <strong>{module.title}</strong>
          <p>{chapters[activeChapter]}</p>
        </div>

        <div className="lesson-progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="video-control-row">
          <button type="button" onClick={() => setPlaying((prev) => !prev)}>
            {playing ? "Pause" : "Play"}
          </button>

          <button type="button" onClick={restart}>
            Restart
          </button>

          <small>{progress}% watched</small>
        </div>
      </div>

      <div className="lesson-info">
        <span className="eyebrow">Related lesson</span>
        <h3>{lesson.title}</h3>
        <p>
          This lesson is built inside StudyPilot for this course and module, so it stays playable
          and does not depend on unavailable external embeds.
        </p>

        <ol>
          {chapters.map((chapter, index) => (
            <li key={`${chapter}-${index}`} className={index === activeChapter ? "active-chapter" : ""}>
              {chapter}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function QuizModal({ modal, close, submitQuizResult }) {
  const [state, setState] = useState(modal);

  useEffect(() => {
    if (state.submitted) return;
    if (state.timer <= 0) return;

    const id = setInterval(() => {
      setState((prev) => ({ ...prev, timer: prev.timer - 1 }));
    }, 1000);

    return () => clearInterval(id);
  }, [state.timer, state.submitted]);

  useEffect(() => {
    if (!state.submitted && state.timer <= 0) submit();
  }, [state.timer]);

  const currentQuestion = state.questions[state.currentIndex];
  const isLast = state.currentIndex === state.questions.length - 1;
  const minutes = String(Math.floor(state.timer / 60)).padStart(2, "0");
  const seconds = String(state.timer % 60).padStart(2, "0");

  function choose(answerIndex) {
    if (state.submitted) return;
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentIndex]: answerIndex },
    }));
  }

  function next() {
    if (state.currentIndex < state.questions.length - 1) {
      setState((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
  }

  function prev() {
    if (state.currentIndex > 0) {
      setState((prev) => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
    }
  }

  function submit() {
    let correct = 0;
    state.questions.forEach((question, index) => {
      if (state.answers[index] === question.answer) correct += 1;
    });
    const score = Math.round((correct / state.questions.length) * 100);

    submitQuizResult({
      courseId: state.course.id,
      moduleIndex: state.moduleIndex,
      questions: state.questions,
      answers: state.answers,
    });

    setState((prev) => ({ ...prev, submitted: true, score }));
  }

  function newAttempt() {
    const newQuestions = shuffle(state.course.modules[state.moduleIndex].questionPool)
      .slice(0, 10)
      .map((question) => ({ ...question }));

    setState((prev) => ({
      ...prev,
      questions: newQuestions,
      currentIndex: 0,
      answers: {},
      submitted: false,
      score: 0,
      timer: 300,
    }));
  }

  return (
    <div className="modal-backdrop">
      <div className="quiz-modal">
        <div className="modal-top-row">
          <div>
            <span className="eyebrow">Timed Quiz • Module {state.moduleIndex + 1}</span>
            <h2>{state.course.title}</h2>
          </div>
          <div className="quiz-top-right">
            <span className="timer-box">
              {minutes}:{seconds}
            </span>
            <button className="close-icon" type="button" onClick={close}>
              ×
            </button>
          </div>
        </div>

        <div className="quiz-progress">
          Question {state.currentIndex + 1} of {state.questions.length}
        </div>

        <div className="single-question-card">
          <h3>{currentQuestion.question}</h3>

          <div className="options-list">
            {currentQuestion.choices.map((choice, index) => {
              const selected = state.answers[state.currentIndex] === index;
              const correct = currentQuestion.answer === index;
              const wrongSelected = state.submitted && selected && !correct;
              const correctShown = state.submitted && correct;

              return (
                <button
                  key={choice}
                  type="button"
                  className={
                    correctShown
                      ? "option-btn correct"
                      : wrongSelected
                      ? "option-btn wrong"
                      : selected
                      ? "option-btn selected"
                      : "option-btn"
                  }
                  onClick={() => choose(index)}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {state.submitted && (
            <div className="quiz-explanation">
              <strong>Explanation:</strong>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="mini-outline" type="button" onClick={prev} disabled={state.currentIndex === 0}>
            Previous
          </button>

          {!state.submitted && !isLast && (
            <button className="mini-solid" type="button" onClick={next}>
              Next
            </button>
          )}

          {!state.submitted && isLast && (
            <button className="primary-btn" type="button" onClick={submit}>
              Submit Quiz
            </button>
          )}

          {state.submitted && (
            <>
              <div className="score-badge">Score: {state.score}%</div>
              <button className="mini-outline" type="button" onClick={newAttempt}>
                New Attempt
              </button>
              <button className="primary-btn" type="button" onClick={close}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CertificateModal({ certificate, close }) {
  return (
    <div className="modal-backdrop">
      <div className="certificate-modal">
        <button className="close-icon" type="button" onClick={close}>
          ×
        </button>

        <div className="certificate-preview">
          <div className="certificate-top">
            <img src={studyLogo} alt="StudyPilot logo" />
            <div>
              <small>StudyPilot Learning System</small>
              <h2>Certificate of Completion</h2>
            </div>
          </div>

          <div className="certificate-body">
            <p>This certifies that</p>
            <h1>{certificate.learnerName}</h1>
            <p>has successfully completed the course</p>
            <h3>{certificate.courseName}</h3>
            <p>
              Final course completion score: <b>{certificate.score}%</b>
            </p>
          </div>

          <div className="certificate-bottom">
            <div>
              <small>Completion Date</small>
              <strong>{formatDate(certificate.date)}</strong>
            </div>

            <div className="signature-wrap">
              <div className="signature-text">Malaika Tariq</div>
              <small>Authorized Signature</small>
            </div>

            <div>
              <small>Certificate ID</small>
              <strong>SP-{certificate.id.slice(0, 8).toUpperCase()}</strong>
            </div>
          </div>

          <div className="certificate-footnote">
            Verified by StudyPilot after full module, video, quiz, and final reflection completion.
          </div>
        </div>

        <div className="modal-actions">
          <button className="mini-outline" type="button" onClick={close}>
            Close
          </button>
          <button className="primary-btn" type="button" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleChart({ type, data }) {
  const colors = ["#75464a", "#aa7c7a", "#beaba7", "#d2b7ac"];
  const max = Math.max(...data.map((item) => item.value), 1);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (type === "bar") {
    return (
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={item.name} className="bar-col">
            <div className="bar-shell">
              <span
                style={{
                  height: total === 0 ? "4%" : `${(item.value / max) * 100}%`,
                  background: colors[index % colors.length],
                }}
              />
            </div>
            <strong>{item.value}</strong>
            <small>{item.name}</small>
          </div>
        ))}
      </div>
    );
  }

  if (type === "line") {
    const width = 520;
    const height = 250;
    const stepX = width / Math.max(data.length - 1, 1);
    const points =
      total === 0
        ? data.map((_, index) => `${index * stepX + 16},${height - 52}`).join(" ")
        : data
            .map((item, index) => {
              const x = index * stepX + 16;
              const y = height - (item.value / max) * 170 - 52;
              return `${x},${y}`;
            })
            .join(" ");

    return (
      <div className="line-chart-wrap">
        <svg viewBox={`0 0 ${width + 34} ${height}`} className="line-chart">
          <polyline fill="none" stroke="currentColor" strokeWidth="4" points={points} />
          {data.map((item, index) => {
            const x = index * stepX + 16;
            const y = total === 0 ? height - 52 : height - (item.value / max) * 170 - 52;
            return (
              <g key={item.name}>
                <circle cx={x} cy={y} r="6" fill={colors[index % colors.length]} />
                <text x={x} y={height - 14} textAnchor="middle">
                  {item.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="pie-chart-wrap">
        <svg viewBox="0 0 220 220" className="pie-chart">
          <circle cx="110" cy="110" r="88" fill="rgba(117,70,74,0.08)" stroke="#75464a" strokeWidth="2" />
          <circle cx="110" cy="110" r="48" fill="var(--surface-solid)" />
          <text x="110" y="116" textAnchor="middle" fill="currentColor" fontSize="18">
            0%
          </text>
        </svg>
        <div className="pie-legend">
          {data.map((item, index) => (
            <div key={item.name} className="legend-item">
              <span style={{ background: colors[index % colors.length] }} />
              <small>{item.name}: 0</small>
            </div>
          ))}
        </div>
      </div>
    );
  }

  let angle = 0;

  return (
    <div className="pie-chart-wrap">
      <svg viewBox="0 0 220 220" className="pie-chart">
        {data.map((item, index) => {
          const slice = (item.value / total) * Math.PI * 2;
          const x1 = 110 + 90 * Math.cos(angle);
          const y1 = 110 + 90 * Math.sin(angle);
          angle += slice;
          const x2 = 110 + 90 * Math.cos(angle);
          const y2 = 110 + 90 * Math.sin(angle);
          const large = slice > Math.PI ? 1 : 0;
          const path = `M110 110 L${x1} ${y1} A90 90 0 ${large} 1 ${x2} ${y2} Z`;
          return <path key={item.name} d={path} fill={colors[index % colors.length]} />;
        })}
      </svg>

      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={item.name} className="legend-item">
            <span style={{ background: colors[index % colors.length] }} />
            <small>
              {item.name}: {item.value}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}