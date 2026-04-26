import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import SectionCard from "./components/SectionCard";
import dashboardData from "./data/dashboardData";

function useIsMobile(breakpoint = 680) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = (e) => setIsMobile(e.matches);
    update(mql);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

function PrettyTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="pretty-tooltip">
      <p className="tooltip-title">{label}</p>
      {payload.map((item) => (
        <p key={`${label}-${item.name}`} className="tooltip-row">
          <span style={{ color: item.color }}>{item.name}</span>
          <strong>{typeof item.value === "number" ? item.value.toFixed(1) : item.value}</strong>
        </p>
      ))}
    </div>
  );
}

function KpiCard({ label, value, sub, percent, tone = "primary" }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <div>
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        <p className="kpi-sub">{sub}</p>
      </div>
      {typeof percent === "number" ? (
        <div className="kpi-ring" style={{ "--pct": `${Math.max(0, Math.min(100, percent))}%` }}>
          <span>{percent.toFixed(0)}%</span>
        </div>
      ) : null}
    </article>
  );
}

function RankingLeaderboard({ data }) {
  const accuracies = data.map((d) => d.accuracy);
  const max = Math.max(...accuracies);
  const min = Math.min(...accuracies);
  const range = max - min || 1;

  const tierClass = (idx) => {
    if (idx === 0) return "rank-gold";
    if (idx === 1) return "rank-silver";
    if (idx === 2) return "rank-bronze";
    return "";
  };

  return (
    <div className="ranking-list">
      {data.map((entry, i) => {
        const fillPct = 35 + ((entry.accuracy - min) / range) * 65;
        return (
          <div
            key={entry.model}
            className={`rank-row ${tierClass(i)} ${entry.proposed ? "rank-proposed" : ""}`}
            style={{
              "--fill-pct": `${fillPct}%`,
              "--rank-color": entry.color
            }}
          >
            <div className="rank-badge">
              <span className="rank-number">{i + 1}</span>
              {i === 0 ? <span className="rank-crown" aria-hidden="true">★</span> : null}
            </div>
            <div className="rank-content">
              <div className="rank-header">
                <span className="rank-model">
                  {entry.model}
                  {entry.proposed ? <em className="rank-tag">PROPOSED</em> : null}
                </span>
                <span className="rank-accuracy">{entry.accuracy.toFixed(1)}%</span>
              </div>
              <div className="rank-bar" aria-hidden="true">
                <div className="rank-bar-fill" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModelComparisonChart({ data, theme, COLORS, isMobile }) {
  const chartData = data.map((m) => ({
    model: m.model,
    short: isMobile
      ? m.model
          .replace("Audio-Visual - Temporal (Proposed)", "Temporal*")
          .replace("Audio-Visual - Static", "AV-Static")
          .replace("Visual - Static", "Visual")
          .replace("Audio-Only", "Audio")
      : m.model
          .replace("Audio-Visual - Temporal (Proposed)", "Temporal (Proposed)")
          .replace("Audio-Visual - Static", "Audio-Visual Static")
          .replace("Visual - Static", "Visual Static"),
    Accuracy: m.accuracy,
    F1: Number((m.f1Score * 100).toFixed(2)),
    f1Raw: m.f1Score,
    proposed: m.proposed
  }));

  const dotFill = theme === "dark" ? "#101a2b" : "#ffffff";

  return (
    <div className="mc-chart">
      <div className="mc-chart-legend">
        <span className="cd-legend-item">
          <i className="cd-legend-swatch mc-acc" />
          Accuracy
        </span>
        <span className="cd-legend-item">
          <i className="cd-legend-swatch mc-proposed" />
          Proposed
        </span>
        <span className="cd-legend-item">
          <i className="cd-legend-swatch mc-f1line" />
          F1 Score
        </span>
      </div>
      <div className="chart-box chart-large">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 28, right: 18, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="mcAccGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.45} />
              </linearGradient>
              <linearGradient id="mcAccProposedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.accent} stopOpacity={1} />
                <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.45} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#2e4a69" : "#d8e8f4"} vertical={false} />
            <XAxis
              dataKey="short"
              tick={{ fill: COLORS.text, fontSize: isMobile ? 10 : 11, fontWeight: 600 }}
              axisLine={{ stroke: theme === "dark" ? "#2e4a69" : "#c9ddee" }}
              tickLine={false}
              tickMargin={8}
              interval={0}
            />
            <YAxis
              domain={[80, 92]}
              tick={{ fill: COLORS.text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <Tooltip
              content={<PrettyTooltip />}
              cursor={{ fill: theme === "dark" ? "rgba(115,183,255,0.06)" : "rgba(18,53,91,0.04)" }}
            />
            <Bar dataKey="Accuracy" radius={[8, 8, 0, 0]} animationDuration={1100} barSize={isMobile ? 28 : 46}>
              {chartData.map((entry, i) => (
                <Cell key={`mc-cell-${i}`} fill={entry.proposed ? "url(#mcAccProposedGrad)" : "url(#mcAccGrad)"} />
              ))}
              <LabelList
                dataKey="Accuracy"
                position="top"
                formatter={(v) => `${v.toFixed(1)}%`}
                fill={COLORS.text}
                fontSize={isMobile ? 10 : 11}
                fontWeight={700}
              />
            </Bar>
            <Line
              type="monotone"
              dataKey="F1"
              stroke={COLORS.warm}
              strokeWidth={3}
              dot={{ r: 5, stroke: COLORS.warm, strokeWidth: 2.5, fill: dotFill }}
              activeDot={{ r: 7, stroke: COLORS.warm, strokeWidth: 2.5, fill: dotFill }}
              animationDuration={1200}
              animationBegin={300}
            >
              <LabelList
                dataKey="f1Raw"
                position="top"
                formatter={(v) => v.toFixed(2)}
                fill={COLORS.warm}
                fontSize={isMobile ? 10 : 11}
                fontWeight={800}
                offset={12}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DatasetStatCard({ name, accuracy, f1, samples, gradientId }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const accFraction = Math.max(0, Math.min(100, accuracy)) / 100;
  const offset = circumference * (1 - accFraction);
  const f1Pct = Math.max(0, Math.min(100, f1 * 100));

  return (
    <div className="ds-card">
      <div className="ds-ring-wrap">
        <svg className="ds-ring-svg" viewBox="0 0 140 140" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="ds-grad-start" />
              <stop offset="100%" className="ds-grad-end" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r={radius} className="ds-ring-track" />
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="ds-ring-progress"
            stroke={`url(#${gradientId})`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ "--ring-c": circumference, "--ring-target": offset }}
          />
        </svg>
        <div className="ds-ring-value">
          <strong>{accuracy.toFixed(1)}%</strong>
          <span>Accuracy</span>
        </div>
      </div>
      <h3 className="ds-name">{name}</h3>
      <div className="ds-meta">
        <div className="ds-f1">
          <span className="ds-f1-label">F1</span>
          <div className="ds-f1-bar">
            <div className="ds-f1-fill" style={{ "--f1-pct": `${f1Pct}%` }} />
          </div>
          <strong className="ds-f1-val">{f1.toFixed(2)}</strong>
        </div>
        <p className="ds-samples">{samples.toLocaleString()} samples</p>
      </div>
    </div>
  );
}

function CrossDatasetBars({ data, theme, COLORS, isMobile }) {
  const chartData = data.map((s) => ({
    split: isMobile ? `${s.source.slice(0, 4)}→${s.target.slice(0, 4)}` : `${s.source} → ${s.target}`,
    Accuracy: s.accuracy,
    F1: Number((s.f1 * 100).toFixed(2)),
    f1Raw: s.f1
  }));

  return (
    <div className="cd-bars">
      <div className="cd-bars-legend">
        <span className="cd-legend-item">
          <i className="cd-legend-swatch acc" />
          Accuracy
        </span>
        <span className="cd-legend-item">
          <i className="cd-legend-swatch f1" />
          F1 Score
        </span>
      </div>
      <div className="chart-box chart-medium">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 22, right: 12, left: 0, bottom: 6 }} barCategoryGap="22%">
            <defs>
              <linearGradient id="cdBarAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1} />
                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.45} />
              </linearGradient>
              <linearGradient id="cdBarF1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.accent} stopOpacity={1} />
                <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.45} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#2e4a69" : "#d8e8f4"} vertical={false} />
            <XAxis
              dataKey="split"
              tick={{ fill: COLORS.text, fontSize: isMobile ? 10 : 12, fontWeight: 600 }}
              axisLine={{ stroke: theme === "dark" ? "#2e4a69" : "#c9ddee" }}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[60, 95]}
              tick={{ fill: COLORS.text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<PrettyTooltip />} cursor={{ fill: theme === "dark" ? "rgba(115,183,255,0.06)" : "rgba(18,53,91,0.04)" }} />
            <Bar dataKey="Accuracy" fill="url(#cdBarAcc)" radius={[8, 8, 0, 0]} animationDuration={1100}>
              <LabelList
                dataKey="Accuracy"
                position="top"
                formatter={(v) => `${v.toFixed(1)}%`}
                fill={COLORS.text}
                fontSize={isMobile ? 10 : 11}
                fontWeight={700}
              />
            </Bar>
            <Bar dataKey="F1" fill="url(#cdBarF1)" radius={[8, 8, 0, 0]} animationDuration={1100} animationBegin={150}>
              <LabelList
                dataKey="f1Raw"
                position="top"
                formatter={(v) => v.toFixed(2)}
                fill={COLORS.text}
                fontSize={isMobile ? 10 : 11}
                fontWeight={700}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


function ConfusionMatrix({ labels, values, theme }) {
  const flat = values.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  const tone = theme === "dark"
    ? { start: [34, 51, 76], end: [115, 183, 255], lightText: "#eaf3ff", darkText: "#dceaff" }
    : { start: [236, 244, 252], end: [18, 53, 91], lightText: "#ffffff", darkText: "#0e2f50" };

  const getColor = (value) => {
    const t = (value - min) / (max - min || 1);
    const start = tone.start;
    const end = tone.end;
    const r = Math.round(start[0] + t * (end[0] - start[0]));
    const g = Math.round(start[1] + t * (end[1] - start[1]));
    const b = Math.round(start[2] + t * (end[2] - start[2]));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const wrapStyle = { "--matrix-cols": labels.length };

  return (
    <div className="matrix-wrap" style={wrapStyle}>
      <div className="matrix-row matrix-header">
        <div className="matrix-corner">Actual / Predicted</div>
        {labels.map((label) => (
          <div key={`h-${label}`} className="matrix-label">
            {label}
          </div>
        ))}
      </div>

      {values.map((row, i) => (
        <div className="matrix-row" key={`r-${labels[i]}`}>
          <div className="matrix-label row-label">{labels[i]}</div>
          {row.map((v, j) => (
            <div
              key={`c-${i}-${j}`}
              className="matrix-cell"
              style={{
                background: getColor(v),
                color: v > 0.55 ? tone.lightText : tone.darkText
              }}
            >
              {v.toFixed(2)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function App() {
  const isMobile = useIsMobile(680);
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem("viva-theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("viva-theme", theme);
  }, [theme]);

  const COLORS = theme === "dark"
    ? {
        primary: "#73b7ff",
        secondary: "#4f86b5",
        accent: "#36c3b2",
        warm: "#f0b35a",
        softBlue: "#2c415b",
        text: "#e6efff"
      }
    : {
        primary: "#12355b",
        secondary: "#2f6f9f",
        accent: "#1f9d8f",
        warm: "#d88a2d",
        softBlue: "#dce9f6",
        text: "#0f2239"
      };

  const { projectTitle, overallHighlights, datasetPerformance, modelComparison, crossDatasetGeneralization, confusionMatrix } = dashboardData;
  const rainColumns = Array.from({ length: 26 }, (_, i) => i);

  const modelRankingData = [...modelComparison]
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((m, i) => ({
      rank: `#${i + 1}`,
      model: m.model.replace("Audio-Visual - Temporal (Proposed)", "Temporal (Proposed)"),
      accuracy: m.accuracy,
      proposed: m.proposed,
      fill: m.proposed ? COLORS.accent : COLORS.secondary,
      color: m.proposed ? COLORS.accent : COLORS.secondary
    }));

  const crossSplits = crossDatasetGeneralization.map((d) => {
    const [source, target] = d.split.split(" to ");
    return { source, target, accuracy: d.accuracy, f1: d.f1Score };
  });

  return (
    <>
      <div className="tech-rain" aria-hidden="true">
        {rainColumns.map((i) => (
          <span
            key={`rain-${i}`}
            className="rain-drop"
            style={{
              "--x": `${(i / rainColumns.length) * 100}%`,
              "--delay": `${(i % 7) * 0.55}s`,
              "--duration": `${6 + (i % 5) * 1.1}s`
            }}
          />
        ))}
      </div>

      <div className="app-shell">
      <header className="hero">
        <div className="hero-pulse" aria-hidden="true" />
        <div className="hero-controls">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            aria-label="Toggle light and dark mode"
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
        <div className="hero-main">
          <img src="/logo.jpg" alt="Project logo" className="hero-logo" />
          <div>
            <h1>{projectTitle}</h1>
            <p className="hero-note">Temporal Fusion Analytics for Emotion Intelligence</p>
          </div>
        </div>
      </header>

      <section className="kpi-grid">
        <KpiCard
          label="Overall Accuracy"
          value={`${overallHighlights.overallAccuracy.toFixed(1)}%`}
          sub="High-confidence multimodal performance"
          percent={overallHighlights.overallAccuracy}
        />
        <KpiCard
          label="Overall F1 Score"
          value={overallHighlights.overallF1.toFixed(2)}
          sub="Balanced precision-recall quality"
          percent={overallHighlights.overallF1 * 100}
          tone="secondary"
        />
        <KpiCard label="Datasets Covered" value={String(overallHighlights.datasetsCovered)} sub="CREMA-D, RAVDESS, AFEW" tone="accent" />
        <KpiCard label="Best Model" value="Temporal Fusion" sub={overallHighlights.bestModel} tone="warm" />
      </section>

      <div className="grid">
        <SectionCard title="Dataset-Wise Performance" className="lifted">
          <div className="ds-grid">
            {datasetPerformance.map((d, i) => (
              <DatasetStatCard
                key={d.dataset}
                name={d.dataset}
                accuracy={d.accuracy}
                f1={d.f1Score}
                samples={d.samples}
                gradientId={`ds-grad-${i}`}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Model Comparison" className="lifted">
          <ModelComparisonChart data={modelComparison} theme={theme} COLORS={COLORS} isMobile={isMobile} />
        </SectionCard>

        <SectionCard title="Ranking" className="lifted">
          <RankingLeaderboard data={modelRankingData} />
        </SectionCard>

        <SectionCard title="Cross-Dataset Generalization" className="lifted">
          <CrossDatasetBars data={crossSplits} theme={theme} COLORS={COLORS} isMobile={isMobile} />
        </SectionCard>

        <SectionCard title="Confusion Matrix (Proposed Model)" className="lifted">
          <ConfusionMatrix labels={confusionMatrix.labels} values={confusionMatrix.values} theme={theme} />
        </SectionCard>
      </div>
      </div>
    </>
  );
}

export default App;
