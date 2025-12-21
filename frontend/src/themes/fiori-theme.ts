// SurveyJS Fiori-Inspired Theme
// Based on SAP Fiori design guidelines

export const fioriTheme = {
  // Theme metadata
  themeName: "fiori",
  colorPalette: "light" as const,
  isPanelless: false,
  backgroundImage: "",
  backgroundImageFit: "cover" as const,
  backgroundImageAttachment: "scroll" as const,
  backgroundOpacity: 1,

  cssVariables: {
    // ============================================
    // PRIMARY COLORS (Fiori Blue)
    // ============================================
    "--sjs-primary-backcolor": "#0a6ed1",
    "--sjs-primary-backcolor-light": "rgba(10, 110, 209, 0.1)",
    "--sjs-primary-backcolor-dark": "#085cad",
    "--sjs-primary-forecolor": "#ffffff",
    "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",

    // ============================================
    // BACKGROUND COLORS
    // ============================================
    "--sjs-general-backcolor": "#ffffff",
    "--sjs-general-backcolor-dim": "#f4f6f8",
    "--sjs-general-backcolor-dim-light": "#f9fafb",
    "--sjs-general-backcolor-dim-dark": "#eceef2",

    // ============================================
    // TEXT COLORS
    // ============================================
    "--sjs-general-forecolor": "#1d2939",
    "--sjs-general-forecolor-light": "rgba(29, 41, 57, 0.7)",
    "--sjs-general-dim-forecolor": "#667085",
    "--sjs-general-dim-forecolor-light": "rgba(102, 112, 133, 0.7)",

    // ============================================
    // SEMANTIC COLORS
    // ============================================
    "--sjs-error-color": "#dc2626",
    "--sjs-error-background-color": "#fef2f2",
    "--sjs-success-color": "#16a34a",
    "--sjs-success-background-color": "#f0fdf4",
    "--sjs-warning-color": "#ea580c",
    "--sjs-warning-background-color": "#fff7ed",

    // ============================================
    // BORDER & LINES
    // ============================================
    "--sjs-border-default": "#d0d5dd",
    "--sjs-border-light": "#e4e7ec",
    "--sjs-border-inside": "#e4e7ec",

    // ============================================
    // SHADOWS
    // ============================================
    "--sjs-shadow-small": "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
    "--sjs-shadow-medium": "0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
    "--sjs-shadow-large": "0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)",
    "--sjs-shadow-inner": "inset 0 2px 4px 0 rgba(16, 24, 40, 0.05)",

    // ============================================
    // CORNER RADIUS
    // ============================================
    "--sjs-corner-radius": "8px",
    "--sjs-base-unit": "8px",

    // ============================================
    // TYPOGRAPHY
    // ============================================
    "--sjs-font-family": "'Vazirmatn', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', sans-serif",
    "--sjs-font-size": "14px",
    "--sjs-font-weight-regular": "400",
    "--sjs-font-weight-semibold": "600",
    "--sjs-font-weight-bold": "700",

    // ============================================
    // EDITOR (Input Fields)
    // ============================================
    "--sjs-editor-background": "#ffffff",
    "--sjs-editor-border": "#d0d5dd",
    "--sjs-editor-font-weight": "400",
    "--sjs-editorpanel-backcolor": "#f9fafb",
    "--sjs-editorpanel-hovercolor": "#f4f6f8",
    "--sjs-editorpanel-cornerRadius": "8px",

    // ============================================
    // QUESTION
    // ============================================
    "--sjs-question-background": "#ffffff",

    // ============================================
    // ARTICLE/PANEL FONTS
    // ============================================
    "--sjs-article-font-xx-large-fontSize": "24px",
    "--sjs-article-font-xx-large-fontWeight": "700",
    "--sjs-article-font-x-large-fontSize": "18px",
    "--sjs-article-font-x-large-fontWeight": "600",
    "--sjs-article-font-large-fontSize": "16px",
    "--sjs-article-font-large-fontWeight": "600",
    "--sjs-article-font-medium-fontSize": "14px",
    "--sjs-article-font-medium-fontWeight": "600",
    "--sjs-article-font-default-fontSize": "14px",
    "--sjs-article-font-default-fontWeight": "400",

    // ============================================
    // SPECIAL ELEMENTS
    // ============================================
    "--sjs-special-red": "#dc2626",
    "--sjs-special-red-light": "rgba(220, 38, 38, 0.1)",
    "--sjs-special-green": "#16a34a",
    "--sjs-special-green-light": "rgba(22, 163, 74, 0.1)",
    "--sjs-special-blue": "#0a6ed1",
    "--sjs-special-blue-light": "rgba(10, 110, 209, 0.1)",
    "--sjs-special-yellow": "#ca8a04",
    "--sjs-special-yellow-light": "rgba(202, 138, 4, 0.1)",
  },

  // Header configuration
  header: {
    height: 256,
    inheritWidthFrom: "container" as const,
    textAreaWidth: 512,
    overlapEnabled: false,
    backgroundColorSwitch: "none" as const,
    backgroundImageOpacity: 1,
    backgroundImageFit: "cover" as const,
    logoPositionX: "right" as const,
    logoPositionY: "top" as const,
    titlePositionX: "left" as const,
    titlePositionY: "bottom" as const,
    descriptionPositionX: "left" as const,
    descriptionPositionY: "bottom" as const,
  },
};

// Dark theme variant (optional, for future use)
export const fioriThemeDark = {
  ...fioriTheme,
  themeName: "fiori-dark",
  colorPalette: "dark",
  cssVariables: {
    ...fioriTheme.cssVariables,
    "--sjs-general-backcolor": "#1e293b",
    "--sjs-general-backcolor-dim": "#0f172a",
    "--sjs-general-forecolor": "#f1f5f9",
    "--sjs-general-forecolor-light": "rgba(241, 245, 249, 0.7)",
    "--sjs-editor-background": "#334155",
    "--sjs-border-default": "#475569",
    "--sjs-border-light": "#334155",
  },
};
