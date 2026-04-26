const dashboardData = {
  projectTitle: "WavDino - Temporal Metrics DashBoard",
  projectSubtitle: "",
  overallHighlights: {
    overallAccuracy: 87.3,
    overallF1: 0.86,
    datasetsCovered: 3,
    bestModel: "Audio-Visual - Temporal (Proposed)"
  },
  datasetPerformance: [
    { dataset: "CREMA-D", samples: 7442, accuracy: 87.8, f1Score: 0.87 },
    { dataset: "RAVDESS", samples: 24144, accuracy: 86.7, f1Score: 0.86 },
    { dataset: "AFEW", samples: 1867, accuracy: 73.1, f1Score: 0.7 }
  ],
  modelComparison: [
    { model: "Audio-Only", accuracy: 84.5, f1Score: 0.83, proposed: false },
    { model: "Visual - Static", accuracy: 83.2, f1Score: 0.82, proposed: false },
    { model: "Audio-Visual - Static", accuracy: 86.0, f1Score: 0.85, proposed: false },
    { model: "Audio-Visual - Temporal (Proposed)", accuracy: 87.3, f1Score: 0.86, proposed: true }
  ],
  crossDatasetGeneralization: [
    { split: "CREMA-D to RAVDESS", accuracy: 85.0, f1Score: 0.84 },
    { split: "CREMA-D to AFEW", accuracy: 71.4, f1Score: 0.69 },
    { split: "RAVDESS to CREMA-D", accuracy: 83.8, f1Score: 0.83 }
  ],
  confusionMatrix: {
    labels: ["Happy", "Sad", "Angry", "Neutral"],
    values: [
      [0.92, 0.04, 0.03, 0.01],
      [0.05, 0.89, 0.04, 0.02],
      [0.04, 0.04, 0.9, 0.02],
      [0.03, 0.03, 0.03, 0.91]
    ]
  },
  backboneResearch: {
    finalSelection: {
      visual: "DINOv2",
      audio: "Wav2Vec 2.0",
      fusion: "Transformer Fusion",
      badge: "DINOv2 + Wav2Vec 2.0 + Transformer Fusion",
      tagline: "Best Overall Performance"
    },
    visualBackbones: [
      { model: "YOLOv26", accuracy: 78.4, precision: 0.77, recall: 0.76, f1: 0.76, selected: false },
      { model: "DINO iBOT", accuracy: 82.6, precision: 0.82, recall: 0.81, f1: 0.81, selected: false },
      { model: "DINOv2", accuracy: 87.3, precision: 0.87, recall: 0.86, f1: 0.86, selected: true }
    ],
    visualInsight: "DINOv2 achieves superior visual representation and facial semantic extraction.",
    audioBackbones: [
      { model: "HuBERT", accuracy: 81.2, efficiency: 62, latencyMs: 28, selected: false },
      { model: "Wav2Vec 2.0", accuracy: 86.4, efficiency: 88, latencyMs: 18, selected: true },
      { model: "Wav2Vec-BERT", accuracy: 85.1, efficiency: 71, latencyMs: 24, selected: false }
    ],
    audioInsight: "Wav2Vec 2.0 provides the best balance of contextual speech understanding and computational efficiency."
  }
};

export default dashboardData;
