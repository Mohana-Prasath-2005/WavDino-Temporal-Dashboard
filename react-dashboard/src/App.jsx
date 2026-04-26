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


function FinalSelectionBadge({ selection }) {
  return (
    <section className="final-badge" aria-label="Final selected architecture">
      <div className="final-badge-orbit" aria-hidden="true">
        <span className="orbit-dot orbit-dot-1" />
        <span className="orbit-dot orbit-dot-2" />
        <span className="orbit-dot orbit-dot-3" />
      </div>
      <div className="final-badge-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26">
          <path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="final-badge-text">
        <p className="final-badge-eyebrow">Final Selected Architecture</p>
        <h2 className="final-badge-title">{selection.badge}</h2>
        <p className="final-badge-sub">{selection.tagline}</p>
      </div>
      <div className="final-badge-pills">
        <span className="final-pill final-pill-visual">Visual ▸ {selection.visual}</span>
        <span className="final-pill final-pill-audio">Audio ▸ {selection.audio}</span>
        <span className="final-pill final-pill-fusion">{selection.fusion}</span>
      </div>
    </section>
  );
}

function VisualHexCard({ model, gradId, hovered, onHover }) {
  const accFraction = Math.max(0, Math.min(1, model.accuracy / 100));
  const hexPerimeter = 6 * 44;
  const drawn = hexPerimeter * accFraction;
  return (
    <button
      type="button"
      className={`hex-card ${model.selected ? "hex-selected" : ""} ${hovered ? "hex-hovered" : ""}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      aria-label={`${model.model} — ${model.accuracy.toFixed(1)} percent accuracy`}
    >
      <div className="hex-shape">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="hex-grad-start" />
              <stop offset="100%" className="hex-grad-end" />
            </linearGradient>
          </defs>
          <polygon className="hex-track" points="50,6 91.6,28 91.6,72 50,94 8.4,72 8.4,28" />
          <polygon
            className="hex-progress"
            points="50,6 91.6,28 91.6,72 50,94 8.4,72 8.4,28"
            stroke={`url(#${gradId})`}
            strokeDasharray={`${drawn} ${hexPerimeter}`}
          />
          <polygon className="hex-fill" points="50,18 80,34 80,66 50,82 20,66 20,34" />
        </svg>
        <div className="hex-content">
          <strong className="hex-acc">{model.accuracy.toFixed(1)}%</strong>
          <span className="hex-acc-label">Accuracy</span>
        </div>
        {model.selected ? <span className="hex-crown" aria-hidden="true">★</span> : null}
      </div>
      <h3 className="hex-name">{model.model}</h3>
      <div className="hex-metrics">
        <div className="hex-metric">
          <span className="hex-metric-label">P</span>
          <div className="hex-metric-track">
            <i className="hex-metric-fill" style={{ "--w": `${model.precision * 100}%` }} />
          </div>
          <strong className="hex-metric-val">{model.precision.toFixed(2)}</strong>
        </div>
        <div className="hex-metric">
          <span className="hex-metric-label">R</span>
          <div className="hex-metric-track">
            <i className="hex-metric-fill" style={{ "--w": `${model.recall * 100}%` }} />
          </div>
          <strong className="hex-metric-val">{model.recall.toFixed(2)}</strong>
        </div>
        <div className="hex-metric">
          <span className="hex-metric-label">F1</span>
          <div className="hex-metric-track">
            <i className="hex-metric-fill" style={{ "--w": `${model.f1 * 100}%` }} />
          </div>
          <strong className="hex-metric-val">{model.f1.toFixed(2)}</strong>
        </div>
      </div>
      {model.selected ? <span className="hex-selected-pill">SELECTED</span> : null}
    </button>
  );
}

function VisualBackboneSection({ data, insight }) {
  const [hovered, setHovered] = useState(() => data.findIndex((d) => d.selected));
  return (
    <div className="bb-wrap">
      <div className="hex-grid">
        {data.map((m, i) => (
          <VisualHexCard
            key={m.model}
            model={m}
            gradId={`hex-grad-${i}`}
            hovered={hovered === i}
            onHover={() => setHovered(i)}
          />
        ))}
      </div>
      <div className="bb-insight">
        <span className="bb-insight-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z" fill="currentColor" />
          </svg>
        </span>
        <div className="bb-insight-body">
          <p className="bb-insight-eyebrow">Key Research Insight</p>
          <p className="bb-insight-text">{insight}</p>
        </div>
        <span className="bb-insight-glow" aria-hidden="true" />
      </div>
    </div>
  );
}

function SpectrumRow({ model, isMobile }) {
  const numBars = isMobile ? 18 : 28;
  const seed = model.accuracy * 0.13 + (model.efficiency || 0) * 0.07;
  const baseline = Math.max(0.18, Math.min(0.92, model.accuracy / 100));
  const bars = Array.from({ length: numBars }, (_, i) => {
    const w1 = Math.sin((i / numBars) * Math.PI * 4 + seed) * 0.28;
    const w2 = Math.cos((i / numBars) * Math.PI * 7 + seed * 0.6) * 0.18;
    const peakBoost = i === Math.floor(numBars / 2) ? 0.1 : 0;
    const h = Math.max(0.16, Math.min(0.96, baseline + w1 + w2 + peakBoost));
    return Math.round(h * 100);
  });
  return (
    <div className={`spectrum-row ${model.selected ? "spectrum-selected" : ""}`}>
      <div className="spectrum-info">
        <div className="spectrum-info-head">
          <strong className="spectrum-name">{model.model}</strong>
          {model.selected ? <span className="spectrum-pill">SELECTED</span> : null}
        </div>
        <span className="spectrum-acc">{model.accuracy.toFixed(1)}%</span>
        <span className="spectrum-acc-label">Accuracy</span>
      </div>
      <div className="spectrum-wave" aria-hidden="true">
        {bars.map((h, i) => (
          <span
            key={`bar-${model.model}-${i}`}
            className="spectrum-bar"
            style={{ "--h": `${h}%`, "--d": `${(i % 7) * 0.12}s` }}
          />
        ))}
      </div>
      <div className="spectrum-stats">
        <div className="spectrum-stat">
          <span>Efficiency</span>
          <strong>{model.efficiency}/100</strong>
          <i className="spectrum-stat-fill" style={{ "--w": `${model.efficiency}%` }} />
        </div>
        <div className="spectrum-stat">
          <span>Latency</span>
          <strong>{model.latencyMs} ms</strong>
          <i className="spectrum-stat-fill" style={{ "--w": `${Math.max(15, 100 - model.latencyMs * 2.2)}%` }} />
        </div>
      </div>
    </div>
  );
}

function AudioBackboneSection({ data, insight, isMobile }) {
  return (
    <div className="bb-wrap">
      <div className="spectrum-list">
        {data.map((m) => (
          <SpectrumRow key={m.model} model={m} isMobile={isMobile} />
        ))}
      </div>
      <div className="bb-insight">
        <span className="bb-insight-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z" fill="currentColor" />
          </svg>
        </span>
        <div className="bb-insight-body">
          <p className="bb-insight-eyebrow">Key Research Insight</p>
          <p className="bb-insight-text">{insight}</p>
        </div>
        <span className="bb-insight-glow" aria-hidden="true" />
      </div>
    </div>
  );
}

function FusionArchitectureFlow({ selection, theme }) {
  return (
    <div className="arch-wrap">
      <div className="arch-row arch-encoders">
        <div className="arch-node arch-encoder arch-visual">
          <span className="arch-tag">Visual Stream</span>
          <strong className="arch-title">{selection.visual}</strong>
          <em className="arch-sub">Visual Encoder</em>
          <p className="arch-note">Facial semantic features</p>
        </div>
        <div className="arch-node arch-encoder arch-audio">
          <span className="arch-tag">Audio Stream</span>
          <strong className="arch-title">{selection.audio}</strong>
          <em className="arch-sub">Audio Encoder</em>
          <p className="arch-note">Contextual speech features</p>
        </div>
      </div>

      <div className="arch-merge" aria-hidden="true">
        <svg viewBox="0 0 400 80" preserveAspectRatio="none">
          <path d="M 80 0 L 80 30 Q 80 50 200 50 Q 320 50 320 30 L 320 0" className="arch-merge-path" />
          <path d="M 200 50 L 200 78" className="arch-merge-down" />
          <polygon points="195,72 200,82 205,72" className="arch-merge-arrow" />
        </svg>
      </div>

      <div className="arch-node arch-stage arch-projection">
        <span className="arch-tag">Stage 1</span>
        <strong className="arch-title">Feature Projection</strong>
        <em className="arch-sub">Cross-modal alignment to shared embedding space</em>
      </div>

      <div className="arch-arrow" aria-hidden="true">
        <span className="arch-arrow-line" />
        <span className="arch-arrow-tip" />
      </div>

      <div className="arch-node arch-stage arch-fusion">
        <span className="arch-tag">Stage 2 ▸ Core</span>
        <strong className="arch-title">Transformer Fusion</strong>
        <em className="arch-sub">Cross-attention ▸ multi-head temporal reasoning</em>
        <div className="arch-attn">
          <span className="arch-attn-cell" />
          <span className="arch-attn-cell" />
          <span className="arch-attn-cell" />
          <span className="arch-attn-cell" />
          <span className="arch-attn-cell" />
          <span className="arch-attn-cell" />
        </div>
      </div>

      <div className="arch-arrow" aria-hidden="true">
        <span className="arch-arrow-line" />
        <span className="arch-arrow-tip" />
      </div>

      <div className="arch-node arch-stage arch-head">
        <span className="arch-tag">Stage 3</span>
        <strong className="arch-title">Classification Head</strong>
        <em className="arch-sub">MLP ▸ Softmax probability distribution</em>
      </div>

      <div className="arch-arrow" aria-hidden="true">
        <span className="arch-arrow-line" />
        <span className="arch-arrow-tip" />
      </div>

      <div className="arch-output">
        <span className="arch-tag">Emotion Prediction</span>
        <div className="arch-emotions">
          <span className="arch-emotion"><b>Happy</b></span>
          <span className="arch-emotion"><b>Sad</b></span>
          <span className="arch-emotion"><b>Angry</b></span>
          <span className="arch-emotion"><b>Neutral</b></span>
        </div>
      </div>

      <div className="arch-caption" role="note">
        <span className="arch-caption-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z" fill="currentColor" />
          </svg>
        </span>
        <strong className="arch-caption-title">{selection.badge}</strong>
        <span className="arch-caption-divider" aria-hidden="true">|</span>
        <span className="arch-caption-tag">{selection.tagline}</span>
      </div>

      <figure className="arch-figure">
        <img
          src={theme === "dark" ? "/research-architecture-dark.png" : "/research-architecture-light.png"}
          alt="Multimodal Fusion Architecture diagram: video frames and audio waveform feed DINOv2 visual encoder and Wav2Vec 2.0 audio encoder, projected and fused via a transformer encoder before classification."
          loading="lazy"
        />
      </figure>
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
  const [activeTab, setActiveTab] = useState(() => {
    const saved = window.localStorage.getItem("viva-tab");
    return saved === "research" ? "research" : "dashboard";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("viva-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("viva-tab", activeTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

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

  const { projectTitle, overallHighlights, datasetPerformance, modelComparison, crossDatasetGeneralization, confusionMatrix, backboneResearch } = dashboardData;
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
        <nav className="hero-nav" role="tablist" aria-label="Primary sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "dashboard"}
            className={`hero-nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="hero-nav-icon" aria-hidden="true">▦</span>
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "research"}
            className={`hero-nav-btn ${activeTab === "research" ? "active" : ""}`}
            onClick={() => setActiveTab("research")}
          >
            <span className="hero-nav-icon" aria-hidden="true">◈</span>
            <span>Research</span>
          </button>
        </nav>
      </header>

      {activeTab === "dashboard" ? (
        <>
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
        </>
      ) : (
        <>
          <div className="research-divider" aria-hidden="true">
            <span />
            <p>Backbone Model Comparison &amp; Final Selection</p>
            <span />
          </div>
          <p className="research-subtitle">Multimodal Emotion Recognition (Audio + Visual) — Research Evaluation</p>

          <div className="grid">
            <SectionCard title="Visual Backbone Comparison" className="lifted">
              <VisualBackboneSection
                data={backboneResearch.visualBackbones}
                insight={backboneResearch.visualInsight}
              />
            </SectionCard>

            <SectionCard title="Audio Backbone Comparison" className="lifted">
              <AudioBackboneSection
                data={backboneResearch.audioBackbones}
                insight={backboneResearch.audioInsight}
                isMobile={isMobile}
              />
            </SectionCard>

            <SectionCard title="Final Model Selection & Fusion Architecture" className="lifted arch-section">
              <FusionArchitectureFlow selection={backboneResearch.finalSelection} theme={theme} />
            </SectionCard>
          </div>
        </>
      )}

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logo.jpg" alt="" className="footer-logo" />
            <div>
              <strong>WavDino — Temporal Metrics Dashboard</strong>
              <p>Audio-Visual Temporal Fusion for Multimodal Emotion Recognition</p>
            </div>
          </div>
          <div className="footer-stats">
            <span><b>{overallHighlights.datasetsCovered}</b><i>Datasets</i></span>
            <span><b>{confusionMatrix.labels.length}</b><i>Emotions</i></span>
            <span><b>{overallHighlights.overallAccuracy.toFixed(1)}%</b><i>Peak Acc.</i></span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} · WavDino Research Project</span>
          <span className="footer-tech">Built with React · Vite · Recharts</span>
        </div>
      </footer>
      </div>
    </>
  );
}

export default App;
