-- Migration 011: Create comprehensive SurveyJS test form
-- Tests all field types, panels, layout, validations

INSERT INTO forms (id, slug, name, name_fa, description, icon, color, direction, status, schema)
VALUES (
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  'comprehensive-surveyjs-test',
  'Comprehensive SurveyJS Test',
  'فرم تست جامع SurveyJS',
  'A comprehensive form testing all SurveyJS features including panels, multi-column layout, and all field types',
  'checklist-item',
  '#6366f1',
  'ltr',
  'active',
  '{
    "title": "Comprehensive SurveyJS Test Form",
    "description": "Testing all field types, layouts, and features",
    "logoPosition": "right",
    "pages": [
      {
        "name": "page1",
        "title": "Personal Information",
        "elements": [
          {
            "type": "panel",
            "name": "basic_info_panel",
            "title": "Basic Information",
            "description": "Please provide your basic details",
            "elements": [
              {
                "type": "text",
                "name": "first_name",
                "title": "First Name",
                "isRequired": true,
                "placeholder": "Enter your first name",
                "startWithNewLine": true
              },
              {
                "type": "text",
                "name": "last_name",
                "title": "Last Name",
                "isRequired": true,
                "placeholder": "Enter your last name",
                "startWithNewLine": false
              },
              {
                "type": "text",
                "name": "middle_name",
                "title": "Middle Name",
                "placeholder": "Optional",
                "startWithNewLine": false
              },
              {
                "type": "text",
                "name": "email",
                "title": "Email Address",
                "isRequired": true,
                "inputType": "email",
                "placeholder": "your.email@example.com",
                "validators": [{"type": "email"}],
                "startWithNewLine": true
              },
              {
                "type": "text",
                "name": "phone",
                "title": "Phone Number",
                "inputType": "tel",
                "placeholder": "+1 (555) 123-4567",
                "startWithNewLine": false
              },
              {
                "type": "text",
                "name": "age",
                "title": "Age",
                "inputType": "number",
                "min": 18,
                "max": 100,
                "startWithNewLine": false
              }
            ]
          },
          {
            "type": "panel",
            "name": "address_panel",
            "title": "Address Information",
            "elements": [
              {
                "type": "text",
                "name": "street",
                "title": "Street Address",
                "isRequired": true,
                "startWithNewLine": true
              },
              {
                "type": "text",
                "name": "city",
                "title": "City",
                "isRequired": true,
                "startWithNewLine": false
              },
              {
                "type": "dropdown",
                "name": "country",
                "title": "Country",
                "isRequired": true,
                "startWithNewLine": false,
                "choices": [
                  {"value": "us", "text": "United States"},
                  {"value": "uk", "text": "United Kingdom"},
                  {"value": "ca", "text": "Canada"},
                  {"value": "de", "text": "Germany"},
                  {"value": "fr", "text": "France"},
                  {"value": "ir", "text": "Iran"},
                  {"value": "ae", "text": "UAE"},
                  {"value": "other", "text": "Other"}
                ]
              },
              {
                "type": "text",
                "name": "postal_code",
                "title": "Postal Code",
                "startWithNewLine": true
              },
              {
                "type": "text",
                "name": "state",
                "title": "State/Province",
                "startWithNewLine": false
              }
            ]
          }
        ]
      },
      {
        "name": "page2",
        "title": "Preferences & Choices",
        "elements": [
          {
            "type": "panel",
            "name": "preferences_panel",
            "title": "Your Preferences",
            "elements": [
              {
                "type": "radiogroup",
                "name": "gender",
                "title": "Gender",
                "isRequired": true,
                "choices": [
                  {"value": "male", "text": "Male"},
                  {"value": "female", "text": "Female"},
                  {"value": "other", "text": "Other"},
                  {"value": "prefer_not", "text": "Prefer not to say"}
                ],
                "colCount": 4,
                "startWithNewLine": true
              },
              {
                "type": "radiogroup",
                "name": "experience_level",
                "title": "Experience Level",
                "isRequired": true,
                "choices": [
                  {"value": "junior", "text": "Junior (0-2 years)"},
                  {"value": "mid", "text": "Mid-Level (2-5 years)"},
                  {"value": "senior", "text": "Senior (5-10 years)"},
                  {"value": "expert", "text": "Expert (10+ years)"}
                ],
                "colCount": 2,
                "startWithNewLine": true
              },
              {
                "type": "checkbox",
                "name": "skills",
                "title": "Technical Skills (Select all that apply)",
                "isRequired": true,
                "choices": [
                  {"value": "javascript", "text": "JavaScript"},
                  {"value": "typescript", "text": "TypeScript"},
                  {"value": "python", "text": "Python"},
                  {"value": "java", "text": "Java"},
                  {"value": "csharp", "text": "C#"},
                  {"value": "go", "text": "Go"},
                  {"value": "rust", "text": "Rust"},
                  {"value": "sql", "text": "SQL"},
                  {"value": "react", "text": "React"},
                  {"value": "angular", "text": "Angular"},
                  {"value": "vue", "text": "Vue.js"},
                  {"value": "node", "text": "Node.js"}
                ],
                "colCount": 4,
                "startWithNewLine": true
              },
              {
                "type": "dropdown",
                "name": "primary_language",
                "title": "Primary Programming Language",
                "isRequired": true,
                "choices": [
                  {"value": "javascript", "text": "JavaScript"},
                  {"value": "typescript", "text": "TypeScript"},
                  {"value": "python", "text": "Python"},
                  {"value": "java", "text": "Java"},
                  {"value": "csharp", "text": "C#"},
                  {"value": "go", "text": "Go"},
                  {"value": "rust", "text": "Rust"},
                  {"value": "other", "text": "Other"}
                ],
                "startWithNewLine": true
              },
              {
                "type": "dropdown",
                "name": "work_preference",
                "title": "Work Preference",
                "choices": [
                  {"value": "remote", "text": "Fully Remote"},
                  {"value": "hybrid", "text": "Hybrid"},
                  {"value": "onsite", "text": "On-site"}
                ],
                "startWithNewLine": false
              },
              {
                "type": "tagbox",
                "name": "interests",
                "title": "Areas of Interest",
                "description": "Select multiple interests",
                "choices": [
                  {"value": "frontend", "text": "Frontend Development"},
                  {"value": "backend", "text": "Backend Development"},
                  {"value": "fullstack", "text": "Full Stack"},
                  {"value": "mobile", "text": "Mobile Development"},
                  {"value": "devops", "text": "DevOps"},
                  {"value": "ml", "text": "Machine Learning"},
                  {"value": "data", "text": "Data Science"},
                  {"value": "security", "text": "Security"},
                  {"value": "cloud", "text": "Cloud Architecture"}
                ],
                "startWithNewLine": false
              }
            ]
          },
          {
            "type": "panel",
            "name": "ratings_panel",
            "title": "Self Assessment",
            "elements": [
              {
                "type": "rating",
                "name": "communication_skill",
                "title": "Communication Skills",
                "rateMin": 1,
                "rateMax": 5,
                "minRateDescription": "Poor",
                "maxRateDescription": "Excellent",
                "startWithNewLine": true
              },
              {
                "type": "rating",
                "name": "teamwork_skill",
                "title": "Teamwork",
                "rateMin": 1,
                "rateMax": 5,
                "minRateDescription": "Poor",
                "maxRateDescription": "Excellent",
                "startWithNewLine": false
              },
              {
                "type": "rating",
                "name": "problem_solving",
                "title": "Problem Solving",
                "rateMin": 1,
                "rateMax": 5,
                "minRateDescription": "Poor",
                "maxRateDescription": "Excellent",
                "startWithNewLine": false
              },
              {
                "type": "boolean",
                "name": "willing_to_relocate",
                "title": "Willing to Relocate?",
                "labelTrue": "Yes",
                "labelFalse": "No",
                "startWithNewLine": true
              },
              {
                "type": "boolean",
                "name": "has_passport",
                "title": "Do you have a valid passport?",
                "labelTrue": "Yes",
                "labelFalse": "No",
                "startWithNewLine": false
              },
              {
                "type": "boolean",
                "name": "can_travel",
                "title": "Available for business travel?",
                "labelTrue": "Yes",
                "labelFalse": "No",
                "startWithNewLine": false
              }
            ]
          }
        ]
      },
      {
        "name": "page3",
        "title": "Additional Details",
        "elements": [
          {
            "type": "panel",
            "name": "dates_panel",
            "title": "Important Dates",
            "elements": [
              {
                "type": "text",
                "name": "birth_date",
                "title": "Date of Birth",
                "inputType": "date",
                "isRequired": true,
                "startWithNewLine": true
              },
              {
                "type": "text",
                "name": "available_from",
                "title": "Available From",
                "inputType": "date",
                "startWithNewLine": false
              },
              {
                "type": "text",
                "name": "preferred_interview_time",
                "title": "Preferred Interview Time",
                "inputType": "datetime-local",
                "startWithNewLine": false
              }
            ]
          },
          {
            "type": "panel",
            "name": "salary_panel",
            "title": "Compensation",
            "elements": [
              {
                "type": "text",
                "name": "expected_salary",
                "title": "Expected Salary (Annual)",
                "inputType": "number",
                "min": 0,
                "placeholder": "e.g., 75000",
                "startWithNewLine": true
              },
              {
                "type": "dropdown",
                "name": "salary_currency",
                "title": "Currency",
                "defaultValue": "usd",
                "choices": [
                  {"value": "usd", "text": "USD ($)"},
                  {"value": "eur", "text": "EUR (€)"},
                  {"value": "gbp", "text": "GBP (£)"},
                  {"value": "irr", "text": "IRR (﷼)"},
                  {"value": "aed", "text": "AED (د.إ)"}
                ],
                "startWithNewLine": false
              },
              {
                "type": "radiogroup",
                "name": "salary_negotiable",
                "title": "Is salary negotiable?",
                "choices": [
                  {"value": "yes", "text": "Yes, flexible"},
                  {"value": "somewhat", "text": "Somewhat"},
                  {"value": "no", "text": "No, firm"}
                ],
                "colCount": 3,
                "startWithNewLine": false
              }
            ]
          },
          {
            "type": "panel",
            "name": "documents_panel",
            "title": "Documents & Links",
            "elements": [
              {
                "type": "text",
                "name": "linkedin_url",
                "title": "LinkedIn Profile URL",
                "inputType": "url",
                "placeholder": "https://linkedin.com/in/yourprofile",
                "startWithNewLine": true
              },
              {
                "type": "text",
                "name": "github_url",
                "title": "GitHub Profile URL",
                "inputType": "url",
                "placeholder": "https://github.com/yourusername",
                "startWithNewLine": false
              },
              {
                "type": "text",
                "name": "portfolio_url",
                "title": "Portfolio Website",
                "inputType": "url",
                "placeholder": "https://yourportfolio.com",
                "startWithNewLine": false
              },
              {
                "type": "file",
                "name": "resume",
                "title": "Upload Resume/CV",
                "description": "Accepted formats: PDF, DOC, DOCX (Max 5MB)",
                "acceptedTypes": ".pdf,.doc,.docx",
                "maxSize": 5242880,
                "startWithNewLine": true
              }
            ]
          }
        ]
      },
      {
        "name": "page4",
        "title": "Final Questions",
        "elements": [
          {
            "type": "panel",
            "name": "matrix_panel",
            "title": "Technology Proficiency Matrix",
            "elements": [
              {
                "type": "matrix",
                "name": "tech_proficiency",
                "title": "Rate your proficiency in each technology:",
                "columns": [
                  {"value": "none", "text": "None"},
                  {"value": "basic", "text": "Basic"},
                  {"value": "intermediate", "text": "Intermediate"},
                  {"value": "advanced", "text": "Advanced"},
                  {"value": "expert", "text": "Expert"}
                ],
                "rows": [
                  {"value": "html_css", "text": "HTML/CSS"},
                  {"value": "javascript", "text": "JavaScript"},
                  {"value": "react", "text": "React"},
                  {"value": "nodejs", "text": "Node.js"},
                  {"value": "databases", "text": "Databases (SQL/NoSQL)"},
                  {"value": "docker", "text": "Docker/Containers"},
                  {"value": "cloud", "text": "Cloud Services (AWS/Azure/GCP)"}
                ],
                "startWithNewLine": true
              }
            ]
          },
          {
            "type": "panel",
            "name": "comments_panel",
            "title": "Additional Information",
            "elements": [
              {
                "type": "comment",
                "name": "why_interested",
                "title": "Why are you interested in this position?",
                "isRequired": true,
                "rows": 4,
                "placeholder": "Please describe your motivation and interest...",
                "startWithNewLine": true
              },
              {
                "type": "comment",
                "name": "achievements",
                "title": "Describe your most significant professional achievement",
                "rows": 4,
                "placeholder": "Tell us about a project or accomplishment you are proud of...",
                "startWithNewLine": true
              },
              {
                "type": "comment",
                "name": "additional_notes",
                "title": "Additional Notes or Questions",
                "rows": 3,
                "placeholder": "Anything else you would like us to know?",
                "startWithNewLine": true
              }
            ]
          },
          {
            "type": "panel",
            "name": "consent_panel",
            "title": "Consent & Agreement",
            "elements": [
              {
                "type": "boolean",
                "name": "agree_terms",
                "title": "I agree to the terms and conditions",
                "isRequired": true,
                "labelTrue": "I Agree",
                "labelFalse": "I Disagree",
                "startWithNewLine": true
              },
              {
                "type": "boolean",
                "name": "agree_privacy",
                "title": "I consent to the processing of my personal data",
                "isRequired": true,
                "labelTrue": "I Consent",
                "labelFalse": "I Do Not Consent",
                "startWithNewLine": false
              },
              {
                "type": "boolean",
                "name": "subscribe_newsletter",
                "title": "Subscribe to our newsletter",
                "labelTrue": "Yes, subscribe me",
                "labelFalse": "No thanks",
                "startWithNewLine": false
              },
              {
                "type": "signaturepad",
                "name": "signature",
                "title": "Your Signature",
                "description": "Please sign below to confirm your application",
                "isRequired": true,
                "startWithNewLine": true
              }
            ]
          }
        ]
      }
    ],
    "showProgressBar": "top",
    "progressBarType": "questions",
    "showQuestionNumbers": "off",
    "questionTitleLocation": "top",
    "questionDescriptionLocation": "underTitle",
    "showCompletedPage": true,
    "completedHtml": "<div style=\"text-align: center; padding: 2rem;\"><h3>Thank you for completing the form!</h3><p>Your submission has been received.</p></div>"
  }'::jsonb
);

-- Create a tile for this test form in IT section
INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active, form_id)
SELECT 
  'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
  s.id,
  'SurveyJS Test Form',
  'فرم تست SurveyJS',
  'surveyjs-test-form',
  'Comprehensive test of all SurveyJS features',
  'checklist-item',
  '#6366f1',
  'form',
  10,
  'ltr',
  '{}',
  true,
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'it' AND p.slug = 'main'
LIMIT 1;

-- Verify
SELECT 'Form created:' as status, slug, name, jsonb_array_length(schema->'pages') as pages FROM forms WHERE slug = 'comprehensive-surveyjs-test';
SELECT 'Tile created:' as status, name, type, form_id FROM tiles WHERE slug = 'surveyjs-test-form';
