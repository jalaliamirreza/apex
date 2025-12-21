-- Migration 009: Convert Form.io schemas to SurveyJS format
-- All forms currently use Form.io format but SurveyFormRenderer expects SurveyJS

-- ============================================
-- CONVERSION MAPPING:
-- Form.io              →  SurveyJS
-- ============================================
-- components[]         →  elements[]
-- key                  →  name
-- label                →  title
-- type: "textfield"    →  type: "text"
-- type: "select"       →  type: "dropdown"
-- type: "textarea"     →  type: "comment"
-- type: "checkbox"     →  type: "boolean"
-- type: "radio"        →  type: "radiogroup"
-- type: "number"       →  type: "text", inputType: "number"
-- type: "email"        →  type: "text", inputType: "email"
-- type: "datetime"     →  type: "text", inputType: "date"
-- validate.required    →  isRequired
-- data.values[]        →  choices[]
-- data.values[].label  →  choices[].text
-- data.values[].value  →  choices[].value
-- ============================================

-- Create a function to convert a single Form.io component to SurveyJS element
CREATE OR REPLACE FUNCTION convert_formio_component(comp jsonb) RETURNS jsonb AS $$
DECLARE
    result jsonb;
    formio_type text;
    surveyjs_type text;
    choices jsonb;
    choice jsonb;
    new_choices jsonb;
BEGIN
    formio_type := comp->>'type';
    
    -- Map Form.io types to SurveyJS types
    CASE formio_type
        WHEN 'textfield' THEN surveyjs_type := 'text';
        WHEN 'textarea' THEN surveyjs_type := 'comment';
        WHEN 'select' THEN surveyjs_type := 'dropdown';
        WHEN 'checkbox' THEN surveyjs_type := 'boolean';
        WHEN 'radio' THEN surveyjs_type := 'radiogroup';
        WHEN 'number' THEN surveyjs_type := 'text';
        WHEN 'email' THEN surveyjs_type := 'text';
        WHEN 'datetime' THEN surveyjs_type := 'text';
        WHEN 'date' THEN surveyjs_type := 'text';
        WHEN 'file' THEN surveyjs_type := 'file';
        ELSE surveyjs_type := 'text';
    END CASE;
    
    -- Build base result
    result := jsonb_build_object(
        'type', surveyjs_type,
        'name', comp->>'key',
        'title', comp->>'label'
    );
    
    -- Add isRequired if validate.required is true
    IF (comp->'validate'->>'required')::boolean = true THEN
        result := result || jsonb_build_object('isRequired', true);
    END IF;
    
    -- Add inputType for special text fields
    IF formio_type = 'number' THEN
        result := result || jsonb_build_object('inputType', 'number');
    ELSIF formio_type = 'email' THEN
        result := result || jsonb_build_object('inputType', 'email');
    ELSIF formio_type IN ('datetime', 'date') THEN
        result := result || jsonb_build_object('inputType', 'date');
    END IF;
    
    -- Convert choices for dropdown/radiogroup
    IF formio_type IN ('select', 'radio') AND comp->'data'->'values' IS NOT NULL THEN
        new_choices := '[]'::jsonb;
        FOR choice IN SELECT * FROM jsonb_array_elements(comp->'data'->'values')
        LOOP
            new_choices := new_choices || jsonb_build_array(
                jsonb_build_object(
                    'value', choice->>'value',
                    'text', choice->>'label'
                )
            );
        END LOOP;
        result := result || jsonb_build_object('choices', new_choices);
    END IF;
    
    -- Add placeholder if exists
    IF comp->>'placeholder' IS NOT NULL THEN
        result := result || jsonb_build_object('placeholder', comp->>'placeholder');
    END IF;
    
    -- Add description if exists
    IF comp->>'description' IS NOT NULL THEN
        result := result || jsonb_build_object('description', comp->>'description');
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to convert entire Form.io schema to SurveyJS
CREATE OR REPLACE FUNCTION convert_formio_to_surveyjs(formio_schema jsonb) RETURNS jsonb AS $$
DECLARE
    components jsonb;
    comp jsonb;
    elements jsonb := '[]'::jsonb;
    converted jsonb;
BEGIN
    -- Get components array
    components := formio_schema->'components';
    
    IF components IS NULL THEN
        -- Already might be SurveyJS or empty
        RETURN formio_schema;
    END IF;
    
    -- Convert each component
    FOR comp IN SELECT * FROM jsonb_array_elements(components)
    LOOP
        converted := convert_formio_component(comp);
        elements := elements || jsonb_build_array(converted);
    END LOOP;
    
    -- Return SurveyJS structure
    RETURN jsonb_build_object('elements', elements);
END;
$$ LANGUAGE plpgsql;

-- Backup original schemas (optional - for rollback)
CREATE TABLE IF NOT EXISTS forms_schema_backup AS 
SELECT id, slug, schema as original_schema, NOW() as backup_date 
FROM forms;

-- Convert all forms
UPDATE forms 
SET schema = convert_formio_to_surveyjs(schema)
WHERE schema->>'components' IS NOT NULL;

-- Verify conversion
SELECT slug, name, 
       schema->>'elements' IS NOT NULL as has_elements,
       jsonb_array_length(schema->'elements') as element_count
FROM forms;

-- Cleanup functions (optional - can keep for future use)
-- DROP FUNCTION IF EXISTS convert_formio_component(jsonb);
-- DROP FUNCTION IF EXISTS convert_formio_to_surveyjs(jsonb);

-- Show sample converted schema
SELECT slug, jsonb_pretty(schema) as surveyjs_schema 
FROM forms 
WHERE slug = 'it';
