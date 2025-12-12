-- Insertar rol admin
-- Ejecutar este script en Supabase Studio > SQL Editor

INSERT INTO roles (name, description)
VALUES ('admin', 'Administrador del sistema')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Verificar que se insertó correctamente
SELECT * FROM roles WHERE name = 'admin';
