-- Actualizar la función del trigger para capturar el email del usuario autenticado
-- Esta migración modifica el trigger de auditoría para que:
-- 1. Si el cambio viene desde la aplicación (usuario autenticado), registre el email del usuario
-- 2. Si el cambio viene directo desde la base de datos, registre el usuario de PostgreSQL

CREATE OR REPLACE FUNCTION "auditLogBeforeUpdate"()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    diff jsonb;
    user_identifier text;
BEGIN
    -- Calcular las diferencias entre el registro anterior y el nuevo
    diff := jsonb_custom_diff_recursive(row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);

    -- Determinar el identificador del usuario
    -- Si hay un JWT (usuario autenticado desde la app), usar el email
    -- Si no hay JWT, usar el usuario de PostgreSQL (cambio directo en DB)
    user_identifier := COALESCE(
        auth.jwt() ->> 'email',
        current_user
    );

    -- Insertar el registro de auditoría
    INSERT INTO "auditLog" (
        "nameTable",
        updated,
        "idUser",
        "beforeUpdate",
        "idObject",
        "afterUpdate",
        diff
    ) VALUES (
        TG_TABLE_NAME,
        NOW(),
        user_identifier,
        row_to_json(OLD),
        OLD.id,
        row_to_json(NEW),
        diff
    );

    RETURN NEW;
END;
$function$;
