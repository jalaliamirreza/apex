import { useCallback } from 'react';
import { Model, surveyLocalization } from 'survey-core';
import { Survey } from 'survey-react-ui';

// Import SurveyJS default CSS (required base)
import 'survey-core/survey-core.min.css';

// Import our minimal overrides
import '../styles/surveyjs-custom.css';

// Persian translations
surveyLocalization.locales['fa'] = {
  pagePrevText: 'قبلی',
  pageNextText: 'بعدی',
  completeText: 'ثبت فرم',
  requiredError: 'این فیلد الزامی است',
  loadingFile: 'در حال بارگذاری...',
  chooseFileCaption: 'انتخاب فایل',
  removeFileCaption: 'حذف',
  emptyMessage: 'داده‌ای موجود نیست',
  selectToRankEmptyRankedAreaText: 'انتخاب کنید',
  selectToRankEmptyUnrankedAreaText: 'کشیدن و رها کردن',
};

// Fiori-inspired theme using SurveyJS CSS variables
const fioriTheme = {
  cssVariables: {
    // Primary colors
    "--sjs-primary-backcolor": "#0a6ed1",
    "--sjs-primary-backcolor-light": "rgba(10, 110, 209, 0.1)",
    "--sjs-primary-backcolor-dark": "#085cad",
    "--sjs-primary-forecolor": "#ffffff",
    "--sjs-primary-forecolor-light": "rgba(255, 255, 255, 0.25)",

    // Secondary/base colors
    "--sjs-secondary-backcolor": "#f5f6f7",
    "--sjs-secondary-backcolor-light": "#ffffff",
    "--sjs-secondary-backcolor-semi-light": "#fafbfc",
    "--sjs-secondary-forecolor": "#32363a",
    "--sjs-secondary-forecolor-light": "#6a6d70",

    // Semantic colors
    "--sjs-error-color": "#bb0000",
    "--sjs-error-background-color": "#fff0f0",
    "--sjs-success-color": "#107e3e",
    "--sjs-success-background-color": "#f0fff4",
    "--sjs-warning-color": "#e9730c",
    "--sjs-warning-background-color": "#fff8e6",

    // Border
    "--sjs-border-default": "#e5e5e5",
    "--sjs-border-light": "#ededed",

    // Shadow
    "--sjs-shadow-small": "0 1px 2px rgba(0,0,0,0.05)",
    "--sjs-shadow-medium": "0 2px 6px rgba(0,0,0,0.08)",
    "--sjs-shadow-large": "0 4px 12px rgba(0,0,0,0.12)",

    // Corner radius
    "--sjs-corner-radius": "8px",
    "--sjs-base-unit": "8px",

    // Font
    "--sjs-font-family": "'Vazirmatn', 'Segoe UI', Roboto, sans-serif",
    "--sjs-font-size": "14px",

    // Editor/Input
    "--sjs-editor-background": "#ffffff",
    "--sjs-editorpanel-backcolor": "#ffffff",
    "--sjs-editorpanel-hovercolor": "#f5f6f7",
    "--sjs-editor-border": "#e5e5e5",
    "--sjs-editor-border-hover": "#0a6ed1",
    "--sjs-editor-border-focus": "#0a6ed1",

    // Question
    "--sjs-question-background": "#ffffff",

    // Article/Panel
    "--sjs-article-font-xx-large-fontSize": "18px",
    "--sjs-article-font-xx-large-fontWeight": "600",
  },
  themeName: "fiori",
  colorPalette: "light",
  isPanelless: false,
};

interface SurveyFormRendererProps {
  schema: any;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  initialData?: Record<string, any>;
  direction?: 'ltr' | 'rtl';
}

export function SurveyFormRenderer({
  schema,
  onSubmit,
  onCancel,
  loading,
  readOnly,
  initialData,
  direction = 'ltr',
}: SurveyFormRendererProps) {
  const survey = new Model(schema);

  // Apply theme
  survey.applyTheme(fioriTheme);

  // Set locale based on direction
  survey.locale = direction === 'rtl' ? 'fa' : 'en';

  // Configure layout
  survey.questionTitleLocation = 'top';
  survey.questionDescriptionLocation = 'underTitle';
  survey.showQuestionNumbers = 'off';
  survey.questionErrorLocation = 'bottom';
  survey.focusFirstQuestionAutomatic = false;

  // Apply initial data
  if (initialData) {
    survey.data = initialData;
  }

  // Read-only mode
  if (readOnly) {
    survey.mode = 'display';
  }

  const handleComplete = useCallback(
    (sender: any) => {
      onSubmit(sender.data);
    },
    [onSubmit]
  );

  survey.onComplete.add(handleComplete);

  return (
    <div
      dir={direction}
      className="survey-container"
      style={{
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        transition: 'opacity 0.2s'
      }}
    >
      <Survey model={survey} />
    </div>
  );
}
