import { useCallback } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';
import '../styles/surveyjs-fiori-theme.css';

// Set RTL and Persian locale
import { surveyLocalization } from 'survey-core';

// Persian translations
surveyLocalization.locales['fa'] = {
  pagePrevText: 'قبلی',
  pageNextText: 'بعدی',
  completeText: 'ثبت',
  requiredError: 'این فیلد الزامی است',
  loadingFile: 'در حال بارگذاری...',
  chooseFileCaption: 'انتخاب فایل',
  removeFileCaption: 'حذف',
  emptyMessage: 'داده‌ای موجود نیست',
};

surveyLocalization.currentLocale = 'fa';

interface SurveyFormRendererProps {
  schema: any;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  initialData?: Record<string, any>;
}

export function SurveyFormRenderer({
  schema,
  onSubmit,
  onCancel,
  loading,
  readOnly,
  initialData,
}: SurveyFormRendererProps) {
  const survey = new Model(schema);

  // Set RTL
  survey.locale = 'fa';

  // Apply initial data if provided
  if (initialData) {
    survey.data = initialData;
  }

  // Set read-only mode
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
    <div dir="rtl" style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
      <Survey model={survey} />
      {onCancel && (
        <div style={{ marginTop: '1rem', textAlign: 'left' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #e5e5e5',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            انصراف
          </button>
        </div>
      )}
    </div>
  );
}
