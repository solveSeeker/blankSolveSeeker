-- Insertar rol admin
INSERT INTO roles (name, description)
VALUES ('admin', 'Administrador del sistema')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- Verificar que se insertó
SELECT * FROM roles WHERE name = 'admin';
