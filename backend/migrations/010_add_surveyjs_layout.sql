-- Migration 010: Add SurveyJS layout properties to form schemas
-- Adds: startWithNewLine, colSpan, panels for grouping

-- ============================================
-- FUNCTION: Add layout properties to elements
-- ============================================

CREATE OR REPLACE FUNCTION add_surveyjs_layout(schema jsonb) RETURNS jsonb AS $$
DECLARE
    elements jsonb;
    elem jsonb;
    new_elements jsonb := '[]'::jsonb;
    elem_index int := 0;
    elem_type text;
    total_elements int;
BEGIN
    elements := schema->'elements';

    IF elements IS NULL THEN
        RETURN schema;
    END IF;

    total_elements := jsonb_array_length(elements);

    -- Process each element
    FOR elem IN SELECT * FROM jsonb_array_elements(elements)
    LOOP
        elem_type := elem->>'type';

        -- Full-width types: comment (textarea), file, html, matrix
        IF elem_type IN ('comment', 'file', 'html', 'matrix', 'matrixdynamic', 'paneldynamic', 'signaturepad') THEN
            -- Start new line, full width
            elem := elem || jsonb_build_object('startWithNewLine', true);
        ELSE
            -- For regular fields: 2-3 per row
            -- Every 3rd field starts new line (index 0, 3, 6, ...)
            IF elem_index % 3 = 0 THEN
                elem := elem || jsonb_build_object('startWithNewLine', true);
            ELSE
                elem := elem || jsonb_build_object('startWithNewLine', false);
            END IF;
        END IF;

        new_elements := new_elements || jsonb_build_array(elem);
        elem_index := elem_index + 1;
    END LOOP;

    RETURN jsonb_build_object('elements', new_elements);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Wrap elements in panel
-- ============================================

CREATE OR REPLACE FUNCTION wrap_in_panel(
    schema jsonb,
    panel_title text,
    panel_title_fa text
) RETURNS jsonb AS $$
DECLARE
    elements jsonb;
BEGIN
    elements := schema->'elements';

    IF elements IS NULL THEN
        RETURN schema;
    END IF;

    -- Wrap elements in a panel
    RETURN jsonb_build_object(
        'elements', jsonb_build_array(
            jsonb_build_object(
                'type', 'panel',
                'name', 'main_panel',
                'title', panel_title,
                'elements', elements
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE ALL FORMS WITH LAYOUT
-- ============================================

-- IT Equipment Request (Persian)
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'it';
UPDATE forms SET schema = wrap_in_panel(schema, 'Equipment Request Details', 'اطلاعات درخواست تجهیزات') WHERE slug = 'it';

-- Vacation Request
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'vacation-request';
UPDATE forms SET schema = wrap_in_panel(schema, 'Leave Request Details', 'اطلاعات درخواست مرخصی') WHERE slug = 'vacation-request';

-- Daycare Allowance (Persian)
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'daycare-allowance-request-fa';
UPDATE forms SET schema = wrap_in_panel(schema, 'Daycare Allowance Request', 'درخواست کمک هزینه مهد کودک') WHERE slug = 'daycare-allowance-request-fa';

-- Daycare Allowance (English)
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'daycare-allowance-request';
UPDATE forms SET schema = wrap_in_panel(schema, 'Daycare Allowance Request', 'Daycare Allowance Request') WHERE slug = 'daycare-allowance-request';

-- Department Heads
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'department-heads-information';
UPDATE forms SET schema = wrap_in_panel(schema, 'Department Head Information', 'اطلاعات مدیر بخش') WHERE slug = 'department-heads-information';

-- Equipment List
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'equipment-list-in-the-room';
UPDATE forms SET schema = wrap_in_panel(schema, 'Room Equipment List', 'لیست تجهیزات اتاق') WHERE slug = 'equipment-list-in-the-room';

-- Branch Managers
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'branch-managers-list';
UPDATE forms SET schema = wrap_in_panel(schema, 'Branch Manager Information', 'اطلاعات مدیر شعبه') WHERE slug = 'branch-managers-list';

-- Comprehensive Test Form
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'comprehensive-test-form';
UPDATE forms SET schema = wrap_in_panel(schema, 'Comprehensive Form', 'فرم جامع') WHERE slug = 'comprehensive-test-form';

-- Family Members
UPDATE forms SET schema = add_surveyjs_layout(schema) WHERE slug = 'family-members-information';
UPDATE forms SET schema = wrap_in_panel(schema, 'Family Member Information', 'اطلاعات اعضای خانواده') WHERE slug = 'family-members-information';

-- ============================================
-- VERIFY
-- ============================================

SELECT slug,
       schema->'elements'->0->>'type' as root_type,
       schema->'elements'->0->>'title' as panel_title,
       jsonb_array_length(schema->'elements'->0->'elements') as field_count
FROM forms;

-- Show IT form structure
SELECT jsonb_pretty(schema) FROM forms WHERE slug = 'it';

-- Cleanup (optional)
-- DROP FUNCTION IF EXISTS add_surveyjs_layout(jsonb);
-- DROP FUNCTION IF EXISTS wrap_in_panel(jsonb, text, text);
