-- Fix audit trigger to correctly get authenticated user's email
-- Problem: auth.jwt() ->> 'email' doesn't work in trigger context
-- Solution: Use auth.uid() and look up the email from profiles table

CREATE OR REPLACE FUNCTION "auditLogBeforeUpdate"()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    diff jsonb;
    user_identifier text;
    authenticated_user_id uuid;
BEGIN
    -- Calcular las diferencias entre el registro anterior y el nuevo
    diff := jsonb_custom_diff_recursive(row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);

    -- Obtener el ID del usuario autenticado
    authenticated_user_id := auth.uid();

    -- Determinar el identificador del usuario
    IF authenticated_user_id IS NOT NULL THEN
        -- Si hay un usuario autenticado (cambio desde la app), buscar su email
        SELECT email INTO user_identifier
        FROM profiles
        WHERE id = authenticated_user_id;

        -- Si no se encuentra el email, usar el ID
        IF user_identifier IS NULL THEN
            user_identifier := authenticated_user_id::text;
        END IF;
    ELSE
        -- Si no hay usuario autenticado, usar el usuario de PostgreSQL (cambio directo en DB)
        user_identifier := current_user;
    END IF;

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
