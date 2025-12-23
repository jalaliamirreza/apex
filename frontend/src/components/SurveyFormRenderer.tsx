import { useCallback } from 'react';
import { Model, surveyLocalization } from 'survey-core';
import { Survey } from 'survey-react-ui';

// Import ONLY the base CSS - no custom CSS
import 'survey-core/survey-core.min.css';

// Import theme
import { fioriTheme } from '../themes/fiori-theme';

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
  noEntriesText: 'هنوز ورودی وجود ندارد',
  more: 'بیشتر',
};

interface SurveyFormRendererProps {
  schema: any;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  initialData?: Record<string, any>;
  direction?: 'ltr' | 'rtl';
  navigationType?: 'default' | 'toc-left' | 'toc-right' | 'progress-buttons';
}

export function SurveyFormRenderer({
  schema,
  onSubmit,
  onCancel,
  loading,
  readOnly,
  initialData,
  direction = 'ltr',
  navigationType = 'default',
}: SurveyFormRendererProps) {
  const survey = new Model(schema);

  // Apply official theme
  survey.applyTheme(fioriTheme);

  // Set locale based on direction
  survey.locale = direction === 'rtl' ? 'fa' : 'en';

  // Apply navigation settings based on navigationType
  switch (navigationType) {
    case 'toc-left':
      survey.showTOC = true;
      survey.tocLocation = 'left';
      break;
    case 'toc-right':
      survey.showTOC = true;
      survey.tocLocation = 'right';
      break;
    case 'progress-buttons':
      survey.showProgressBar = 'top';
      survey.progressBarType = 'buttons';
      survey.showTOC = false;
      break;
    case 'default':
    default:
      // Keep default behavior (Next/Previous only)
      survey.showTOC = false;
      break;
  }

  // Configure survey options
  survey.showQuestionNumbers = 'off';
  survey.questionTitleLocation = 'top';
  survey.questionDescriptionLocation = 'underTitle';
  survey.questionErrorLocation = 'bottom';
  survey.focusFirstQuestionAutomatic = false;
  survey.widthMode = 'static'; // or 'responsive'
  survey.width = '100%';

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
      style={{
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        transition: 'opacity 0.2s',
      }}
    >
      <Survey model={survey} />
    </div>
  );
}
