// PyLearn PWA – src/app.jsx
// Loaded via Babel standalone (no build step needed)

const { useState, useEffect, useRef, useCallback } = React;

// ─── Data ────────────────────────────────────────────────────────────────────

const EXERCISES = [
  {
    id: 1, level: 1, title: "Tu primer print",
    description: "Muestra el mensaje Hola, mundo! en pantalla.",
    hint: "Usa la función print() con el texto entre comillas.",
    starter: "# Escribe tu código aquí\n",
    tests: [{ expected: "Hola, mundo!" }],
    topic: "Salida básica"
  },
  {
    id: 2, level: 1, title: "Suma de dos números",
    description: "Calcula la suma de a = 5 y b = 3 e imprímela.",
    hint: "Usa el operador + para sumar y print() para mostrar el resultado.",
    starter: "a = 5\nb = 3\n# Imprime la suma\n",
    tests: [{ expected: "8" }],
    topic: "Variables y operadores"
  },
  {
    id: 3, level: 1, title: "Área de un rectángulo",
    description: "Dado base = 10 y altura = 4, calcula e imprime el área.",
    hint: "El área de un rectángulo es base × altura.",
    starter: "base = 10\naltura = 4\n# Calcula e imprime el área\n",
    tests: [{ expected: "40" }],
    topic: "Variables y operadores"
  },
  {
    id: 4, level: 2, title: "Par o impar",
    description: "Dado n = 7, imprime Par si es par o Impar si es impar.",
    hint: "Usa el operador % (módulo) para saber el resto de la división por 2.",
    starter: "n = 7\n# Determina si es par o impar\n",
    tests: [{ expected: "Impar" }],
    topic: "Condicionales"
  },
  {
    id: 5, level: 2, title: "Mayor de dos números",
    description: "Dados x = 12 e y = 8, imprime el mayor de los dos.",
    hint: "Usa if/else para comparar los dos valores.",
    starter: "x = 12\ny = 8\n# Imprime el mayor\n",
    tests: [{ expected: "12" }],
    topic: "Condicionales"
  },
  {
    id: 6, level: 2, title: "Suma del 1 al 10",
    description: "Usa un bucle for para calcular e imprimir la suma de los números del 1 al 10.",
    hint: "Usa range(1, 11) para iterar del 1 al 10.",
    starter: "# Suma los números del 1 al 10\n",
    tests: [{ expected: "55" }],
    topic: "Bucles"
  },
  {
    id: 7, level: 3, title: "Tabla de multiplicar",
    description: "Imprime la tabla del 3 (del 3×1 al 3×5), una por línea. Formato: 3 x 1 = 3",
    hint: "Usa un bucle for con range(1, 6) y f-strings para formatear.",
    starter: "# Tabla del 3\n",
    tests: [{ expected: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15" }],
    topic: "Bucles y formato"
  },
  {
    id: 8, level: 3, title: "Lista de pares",
    description: "Crea una lista con los números pares del 1 al 20 e imprímela.",
    hint: "Puedes usar list comprehension: [x for x in range(...) if ...]",
    starter: "# Crea la lista de pares\n",
    tests: [{ expected: "[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]" }],
    topic: "Listas"
  },
  {
    id: 9, level: 3, title: "Función doble",
    description: "Define una función llamada doble que reciba un número y devuelva su doble. Luego imprime doble(6).",
    hint: "Define la función con def doble(n): y usa return.",
    starter: "# Define la función doble\n",
    tests: [{ expected: "12" }],
    topic: "Funciones"
  },
  {
    id: 10, level: 4, title: "Fibonacci",
    description: "Imprime los primeros 8 números de Fibonacci separados por comas. Empieza por 0, 1.",
    hint: "Comienza con a=0, b=1 y en cada paso: a, b = b, a+b",
    starter: "# Secuencia de Fibonacci\n",
    tests: [{ expected: "0, 1, 1, 2, 3, 5, 8, 13" }],
    topic: "Algoritmos"
  },
];

const LEVELS = [
  { num: 1, name: "Iniciación",   color: "#4ade80", emoji: "🌱" },
  { num: 2, name: "Fundamentos",  color: "#60a5fa", emoji: "🔵" },
  { num: 3, name: "Intermedio",   color: "#a78bfa", emoji: "🟣" },
  { num: 4, name: "Avanzado",     color: "#f97316", emoji: "🔥" },
];

// ─── AI helpers ───────────────────────────────────────────────────────────────

async function runCodeWithAI(code, exercise) {
  const prompt = `Eres un intérprete de Python educativo. El estudiante ha escrito este código para el ejercicio "${exercise.title}":

\`\`\`python
${code}
\`\`\`

Descripción del ejercicio: ${exercise.description}
Salida esperada exacta: ${exercise.tests[0].expected}

Simula la ejecución del código y responde ÚNICAMENTE en este formato JSON (sin ningún otro texto ni markdown):
{"output":"salida al ejecutarse o vacío si hay error","error":"mensaje de error o vacío","correct":true_o_false,"feedback":"feedback breve y motivador en español (máx 2 frases)"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  const text = data.content.map(i => i.text || "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

async function getHintFromAI(code, exercise) {
  const prompt = `Eres un tutor de Python. El estudiante está atascado en: "${exercise.title}"\nDescripción: ${exercise.description}\nCódigo actual:\n\`\`\`python\n${code}\n\`\`\`\nDa una pista útil en español en máximo 2 frases sin dar la solución. Sé motivador.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content.map(i => i.text || "").join("");
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  app: { display: "flex", height: "100dvh", background: "#0d1117", color: "#e6edf3", fontFamily: "inherit", overflow: "hidden", flexDirection: "column" },
  topBar: { display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#161b22", borderBottom: "1px solid #30363d", flexShrink: 0, minHeight: 50 },
  logo: { fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 6 },
  body: { flex: 1, display: "flex", overflow: "hidden" },
  sidebar: { width: 260, background: "#161b22", borderRight: "1px solid #30363d", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" },
  sidebarMobile: { position: "fixed", inset: 0, zIndex: 100, background: "#161b22", display: "flex", flexDirection: "column", overflowY: "auto" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  panel: { flex: 1, display: "flex", overflow: "hidden" },
  editorCol: { flex: 1, display: "flex", flexDirection: "column", padding: 12, gap: 10, overflow: "auto", minWidth: 0 },
  outputCol: { width: 300, background: "#0d1117", borderLeft: "1px solid #30363d", display: "flex", flexDirection: "column", padding: 12, gap: 10, flexShrink: 0 },
  textarea: { flex: 1, background: "#0d1117", border: "1px solid #30363d", borderTop: "none", borderRadius: "0 0 8px 8px", color: "#e6edf3", fontSize: 13, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: 12, resize: "none", outline: "none", lineHeight: 1.7, minHeight: 160 },
  btn: (bg, fg = "#fff") => ({ padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: bg, color: fg, fontFamily: "inherit", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "opacity .15s" }),
  card: { background: "#161b22", borderRadius: 8, border: "1px solid #30363d", padding: "12px 14px" },
  label: { fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
};

// ─── Components ───────────────────────────────────────────────────────────────

function ProgressBar({ value, color = "#4ade80", height = 5 }) {
  return (
    React.createElement("div", { style: { background: "#21262d", borderRadius: 4, height, overflow: "hidden" } },
      React.createElement("div", { style: { width: `${value}%`, height: "100%", background: color, transition: "width .4s ease", borderRadius: 4 } })
    )
  );
}

function ExerciseItem({ ex, active, done, onClick }) {
  const lev = LEVELS.find(l => l.num === ex.level);
  return (
    React.createElement("div", {
      onClick,
      style: {
        padding: "11px 14px", cursor: "pointer",
        borderLeft: `3px solid ${active ? lev.color : "transparent"}`,
        background: active ? "#21262d" : "transparent",
        borderBottom: "1px solid #21262d",
      }
    },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
        React.createElement("div", { style: { flex: 1 } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 5, marginBottom: 2 } },
            React.createElement("span", { style: { fontSize: 12 } }, done ? "✅" : "⬜"),
            React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: active ? "#e6edf3" : "#c9d1d9" } }, ex.title)
          ),
          React.createElement("div", { style: { fontSize: 11, color: "#8b949e" } }, ex.topic)
        ),
        React.createElement("span", {
          style: { fontSize: 10, padding: "2px 7px", borderRadius: 10, background: lev.color + "22", color: lev.color, whiteSpace: "nowrap", marginLeft: 6 }
        }, `Nv.${ex.level}`)
      )
    )
  );
}

function Sidebar({ exercises, selected, completed, activeLevel, setActiveLevel, onSelect, onClose }) {
  const progress = Math.round((completed.size / EXERCISES.length) * 100);
  return (
    React.createElement(React.Fragment, null,
      // Header
      React.createElement("div", { style: { padding: "16px 14px 10px", borderBottom: "1px solid #30363d" } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
          React.createElement("div", { style: S.logo }, React.createElement("span", null, "🐍"), "PyLearn"),
          onClose && React.createElement("button", {
            onClick: onClose,
            style: { background: "none", border: "none", color: "#8b949e", cursor: "pointer", fontSize: 18 }
          }, "✕")
        ),
        React.createElement(ProgressBar, { value: progress }),
        React.createElement("div", { style: { fontSize: 11, color: "#8b949e", marginTop: 4 } },
          `${completed.size}/${EXERCISES.length} completados`)
      ),
      // Level filters
      React.createElement("div", { style: { padding: "8px 10px", borderBottom: "1px solid #30363d", display: "flex", gap: 5, flexWrap: "wrap" } },
        React.createElement("button", {
          onClick: () => setActiveLevel(null),
          style: { ...S.btn(activeLevel === null ? "#238636" : "#21262d", activeLevel === null ? "#fff" : "#8b949e"), padding: "3px 10px", fontSize: 11, borderRadius: 20, fontWeight: 400 }
        }, "Todos"),
        LEVELS.map(l =>
          React.createElement("button", {
            key: l.num,
            onClick: () => setActiveLevel(activeLevel === l.num ? null : l.num),
            style: { ...S.btn(activeLevel === l.num ? l.color + "33" : "#21262d", activeLevel === l.num ? l.color : "#8b949e"), padding: "3px 10px", fontSize: 11, borderRadius: 20, fontWeight: 400, outline: activeLevel === l.num ? `1px solid ${l.color}55` : "none" }
          }, `${l.emoji} ${l.name}`)
        )
      ),
      // List
      React.createElement("div", { style: { overflowY: "auto", flex: 1 } },
        exercises.map(ex =>
          React.createElement(ExerciseItem, {
            key: ex.id, ex,
            active: selected.id === ex.id,
            done: completed.has(ex.id),
            onClick: () => { onSelect(ex); onClose && onClose(); }
          })
        )
      )
    )
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  const [selectedEx, setSelectedEx] = useState(EXERCISES[0]);
  const [code, setCode] = useState(EXERCISES[0].starter);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("pylearn-done") || "[]")); } catch { return new Set(); }
  });
  const [hintText, setHintText] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [activeLevel, setActiveLevel] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showOutput, setShowOutput] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Persist progress
  useEffect(() => {
    localStorage.setItem("pylearn-done", JSON.stringify([...completed]));
  }, [completed]);

  const selectExercise = useCallback((ex) => {
    // Save current code draft
    localStorage.setItem(`pylearn-draft-${selectedEx.id}`, code);
    setSelectedEx(ex);
    const draft = localStorage.getItem(`pylearn-draft-${ex.id}`);
    setCode(draft || ex.starter);
    setResult(null);
    setHintText("");
    setShowOutput(false);
  }, [selectedEx, code]);

  const handleRun = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setShowOutput(true);
    try {
      const res = await runCodeWithAI(code, selectedEx);
      setResult(res);
      if (res.correct) setCompleted(prev => new Set([...prev, selectedEx.id]));
    } catch {
      setResult({ error: "Error al conectar. ¿Tienes conexión a internet?", correct: false, feedback: "", output: "" });
    }
    setLoading(false);
  };

  const handleHint = async () => {
    setHintLoading(true);
    setHintText("");
    try {
      const h = await getHintFromAI(code, selectedEx);
      setHintText(h);
    } catch {
      setHintText(selectedEx.hint);
    }
    setHintLoading(false);
  };

  const handleTab = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = e.target.selectionStart, end = e.target.selectionEnd;
      const next = code.substring(0, s) + "    " + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; });
    }
  };

  const filteredEx = activeLevel ? EXERCISES.filter(e => e.level === activeLevel) : EXERCISES;
  const lev = LEVELS.find(l => l.num === selectedEx.level);
  const progress = Math.round((completed.size / EXERCISES.length) * 100);

  // ── Desktop layout ────────────────────────────────────────────
  const desktopLayout = () =>
    React.createElement("div", { style: S.body },
      // Sidebar
      React.createElement("div", { style: S.sidebar },
        React.createElement(Sidebar, { exercises: filteredEx, selected: selectedEx, completed, activeLevel, setActiveLevel, onSelect: selectExercise })
      ),
      // Main
      React.createElement("div", { style: S.main },
        // Subtitle bar
        React.createElement("div", { style: { padding: "8px 16px", background: "#161b22", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: 10 } },
          React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, selectedEx.title),
          React.createElement("span", { style: { color: "#8b949e", fontSize: 12 } }, "·", selectedEx.topic),
          React.createElement("span", { style: { marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 20, background: lev.color + "22", color: lev.color, border: `1px solid ${lev.color}44` } }, `${lev.emoji} ${lev.name}`)
        ),
        React.createElement("div", { style: S.panel },
          React.createElement(EditorPanel, { ex: selectedEx, code, setCode, handleRun, handleHint, handleTab, loading, hintText, hintLoading, setCode }),
          React.createElement(OutputPanel, { result, loading, completed, selectedEx, onNext: () => { const nx = EXERCISES.find(e => e.id === selectedEx.id + 1); if (nx) selectExercise(nx); } })
        )
      )
    );

  // ── Mobile layout ─────────────────────────────────────────────
  const mobileLayout = () =>
    React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } },
      // Exercise info
      React.createElement("div", { style: { ...S.card, margin: "10px 10px 0", flexShrink: 0 } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } },
          React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, selectedEx.title),
          React.createElement("span", { style: { fontSize: 10, padding: "2px 8px", borderRadius: 10, background: lev.color + "22", color: lev.color } }, lev.emoji)
        ),
        React.createElement("div", { style: { fontSize: 13, color: "#c9d1d9", lineHeight: 1.5, marginBottom: 6 } }, selectedEx.description),
        React.createElement("code", { style: { fontSize: 11, background: "#0d1117", padding: "3px 8px", borderRadius: 4, color: "#4ade80" } },
          "→ " + selectedEx.tests[0].expected.replace(/\n/g, " ↵ "))
      ),
      // Editor
      React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", padding: "10px 10px 0", minHeight: 0 } },
        React.createElement("div", { style: { background: "#161b22", borderRadius: "8px 8px 0 0", padding: "6px 12px", border: "1px solid #30363d", display: "flex", gap: 6, alignItems: "center" } },
          React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" } }),
          React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: "#febc2e", display: "inline-block" } }),
          React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: "#28c840", display: "inline-block" } }),
          React.createElement("span", { style: { marginLeft: 6, fontSize: 11, color: "#8b949e" } }, "ejercicio.py")
        ),
        React.createElement("textarea", {
          ref: textareaRef, value: code,
          onChange: e => setCode(e.target.value),
          onKeyDown: handleTab, spellCheck: false,
          style: { ...S.textarea, flex: 1 }
        })
      ),
      // Actions
      React.createElement("div", { style: { padding: "8px 10px", display: "flex", gap: 8, flexShrink: 0 } },
        React.createElement("button", { onClick: handleRun, disabled: loading, style: { ...S.btn("#238636"), flex: 1 } },
          loading ? "⚙️ Ejecutando..." : "▶ Ejecutar"),
        React.createElement("button", { onClick: handleHint, disabled: hintLoading, style: S.btn("#21262d", "#8b949e") }, "💡"),
        React.createElement("button", { onClick: () => { setCode(selectedEx.starter); setResult(null); setHintText(""); }, style: S.btn("#21262d", "#8b949e") }, "🔄")
      ),
      hintText && React.createElement("div", { style: { margin: "0 10px 8px", background: "#1c2128", border: "1px solid #d97706", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#fbbf24" } },
        "💡 " + hintText),
      // Output (collapsible)
      result && React.createElement("div", { style: { margin: "0 10px 10px", background: result.correct ? "#0f2d1a" : "#2d1212", border: `1px solid ${result.correct ? "#238636" : "#da3633"}`, borderRadius: 8, padding: "12px 14px", flexShrink: 0 } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 4, color: result.correct ? "#4ade80" : "#f85149" } },
          result.correct ? "✅ ¡Correcto!" : "❌ No es correcto"),
        result.output && React.createElement("div", { style: { fontSize: 12, fontFamily: "monospace", color: "#e6edf3", marginBottom: 4, whiteSpace: "pre-wrap" } }, result.output),
        result.error && React.createElement("div", { style: { fontSize: 12, color: "#f85149", marginBottom: 4 } }, "⚠ " + result.error),
        result.feedback && React.createElement("div", { style: { fontSize: 12, color: "#8b949e" } }, result.feedback),
        result.correct && selectedEx.id < EXERCISES.length &&
          React.createElement("button", {
            onClick: () => { const nx = EXERCISES.find(e => e.id === selectedEx.id + 1); if (nx) selectExercise(nx); },
            style: { ...S.btn("#238636"), marginTop: 8, fontSize: 12 }
          }, "Siguiente →")
      )
    );

  return (
    React.createElement("div", { style: S.app },
      // Top bar (always visible)
      React.createElement("div", { style: S.topBar },
        isMobile && React.createElement("button", {
          onClick: () => setShowSidebar(true),
          style: { background: "#21262d", border: "1px solid #30363d", color: "#8b949e", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 13 }
        }, "☰"),
        React.createElement("div", { style: S.logo }, React.createElement("span", null, "🐍"), "PyLearn"),
        React.createElement("div", { style: { flex: 1, maxWidth: 200, marginLeft: 10 } },
          React.createElement(ProgressBar, { value: progress })
        ),
        React.createElement("span", { style: { fontSize: 12, color: "#8b949e", marginLeft: 6 } }, `${completed.size}/${EXERCISES.length}`),
        !isMobile && React.createElement("button", {
          onClick: () => setShowSidebar(s => !s),
          style: { ...S.btn("#21262d", "#8b949e"), padding: "5px 10px", marginLeft: "auto", fontSize: 12 }
        }, showSidebar ? "◀" : "▶ Ejercicios")
      ),

      // Mobile sidebar overlay
      isMobile && showSidebar && React.createElement("div", { style: S.sidebarMobile },
        React.createElement(Sidebar, { exercises: filteredEx, selected: selectedEx, completed, activeLevel, setActiveLevel, onSelect: selectExercise, onClose: () => setShowSidebar(false) })
      ),

      // Body
      isMobile ? mobileLayout() : desktopLayout(),

      React.createElement("style", null, `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea::placeholder { color: #484f58; }
      `)
    )
  );
}

// ─── Sub-panels (desktop) ─────────────────────────────────────────────────────

function EditorPanel({ ex, code, setCode, handleRun, handleHint, handleTab, loading, hintText, hintLoading }) {
  const lev = LEVELS.find(l => l.num === ex.level);
  return (
    React.createElement("div", { style: S.editorCol },
      // Description card
      React.createElement("div", { style: S.card },
        React.createElement("div", { style: S.label }, "📋 Ejercicio"),
        React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6 } }, ex.description),
        React.createElement("div", { style: { marginTop: 8, fontSize: 12, color: "#8b949e" } },
          "Salida esperada: ",
          React.createElement("code", { style: { background: "#0d1117", padding: "2px 8px", borderRadius: 4, color: "#4ade80" } },
            ex.tests[0].expected.replace(/\n/g, " ↵ "))
        )
      ),
      // Editor
      React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 160 } },
        React.createElement("div", { style: { background: "#161b22", borderRadius: "8px 8px 0 0", padding: "7px 14px", border: "1px solid #30363d", display: "flex", gap: 6, alignItems: "center" } },
          React.createElement("span", { style: { width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", display: "inline-block" } }),
          React.createElement("span", { style: { width: 11, height: 11, borderRadius: "50%", background: "#febc2e", display: "inline-block" } }),
          React.createElement("span", { style: { width: 11, height: 11, borderRadius: "50%", background: "#28c840", display: "inline-block" } }),
          React.createElement("span", { style: { marginLeft: 8, fontSize: 11, color: "#8b949e" } }, "ejercicio.py")
        ),
        React.createElement("textarea", {
          value: code, onChange: e => setCode(e.target.value), onKeyDown: handleTab, spellCheck: false,
          style: { ...S.textarea, flex: 1 }
        })
      ),
      // Buttons
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        React.createElement("button", { onClick: handleRun, disabled: loading, style: { ...S.btn("#238636"), flex: 1 } },
          loading ? React.createElement("span", { style: { animation: "spin 1s linear infinite", display: "inline-block" } }, "⚙️") : null,
          loading ? " Ejecutando..." : "▶ Ejecutar código"
        ),
        React.createElement("button", { onClick: handleHint, disabled: hintLoading, style: S.btn("#21262d", "#8b949e") }, hintLoading ? "..." : "💡 Pista"),
        React.createElement("button", { onClick: () => setCode(ex.starter), style: S.btn("#21262d", "#8b949e") }, "🔄")
      ),
      hintText && React.createElement("div", { style: { background: "#1c2128", border: "1px solid #d97706", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#fbbf24" } },
        "💡 " + hintText)
    )
  );
}

function OutputPanel({ result, loading, completed, selectedEx, onNext }) {
  return (
    React.createElement("div", { style: S.outputCol },
      React.createElement("div", { style: S.label }, "Terminal"),
      // Output terminal
      React.createElement("div", { style: { flex: 1, ...S.card, fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, overflowY: "auto" } },
        !result && !loading && React.createElement("div", { style: { color: "#484f58", fontSize: 12 } }, "> Escribe código y pulsa Ejecutar..."),
        loading && React.createElement("div", { style: { color: "#60a5fa", fontSize: 12 } }, "> Analizando con IA..."),
        result && result.output && React.createElement("div", { style: { color: "#e6edf3", whiteSpace: "pre-wrap" } }, result.output),
        result && result.error && React.createElement("div", { style: { color: "#f85149", whiteSpace: "pre-wrap" } }, "⚠ " + result.error)
      ),
      // Feedback
      result && React.createElement("div", { style: { background: result.correct ? "#0f2d1a" : "#2d1212", border: `1px solid ${result.correct ? "#238636" : "#da3633"}`, borderRadius: 8, padding: "12px 14px" } },
        React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 5, color: result.correct ? "#4ade80" : "#f85149" } },
          result.correct ? "✅ ¡Correcto!" : "❌ No es correcto"),
        result.feedback && React.createElement("div", { style: { fontSize: 12, color: "#8b949e", lineHeight: 1.5 } }, result.feedback),
        result.correct && selectedEx.id < EXERCISES.length &&
          React.createElement("button", { onClick: onNext, style: { ...S.btn("#238636"), marginTop: 8, fontSize: 12 } }, "Siguiente →")
      ),
      // Level progress
      React.createElement("div", { style: S.card },
        React.createElement("div", { style: S.label }, "Progreso"),
        LEVELS.map(lv => {
          const total = EXERCISES.filter(e => e.level === lv.num).length;
          const done = EXERCISES.filter(e => e.level === lv.num && completed.has(e.id)).length;
          return React.createElement("div", { key: lv.num, style: { marginBottom: 8 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 } },
              React.createElement("span", { style: { color: lv.color } }, `${lv.emoji} ${lv.name}`),
              React.createElement("span", { style: { color: "#8b949e" } }, `${done}/${total}`)
            ),
            React.createElement(ProgressBar, { value: total ? (done / total) * 100 : 0, color: lv.color, height: 4 })
          );
        })
      )
    )
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
