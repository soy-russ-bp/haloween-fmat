
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.inscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    disfraz TEXT NOT NULL
      CHECK (char_length(trim(disfraz)) BETWEEN 2 AND 120),

    integrante TEXT NOT NULL
      CHECK (char_length(trim(integrante)) BETWEEN 3 AND 120),

    carrera TEXT NOT NULL
      CHECK (char_length(trim(carrera)) BETWEEN 2 AND 100),

    invitado BOOLEAN NOT NULL,

    invitado_por TEXT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT invitacion_valida CHECK (
      (invitado = true AND invitado_por IS NOT NULL
        AND length(trim(invitado_por)) >= 3)
      OR
      (invitado = false AND invitado_por IS NULL)
    ),

    CONSTRAINT no_autoinvitacion CHECK (
      invitado_por IS NULL OR integrante <> invitado_por
    )
);

CREATE OR REPLACE FUNCTION public.normalizar_inscripcion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.integrante := upper(
      regexp_replace(btrim(NEW.integrante), '[[:space:]]+', ' ', 'g')
    );

    IF NEW.invitado_por IS NOT NULL THEN
      NEW.invitado_por := upper(
        regexp_replace(btrim(NEW.invitado_por), '[[:space:]]+', ' ', 'g')
      );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalizar_inscripcion_trigger
ON public.inscripciones;

CREATE TRIGGER normalizar_inscripcion_trigger
BEFORE INSERT OR UPDATE ON public.inscripciones
FOR EACH ROW
EXECUTE FUNCTION public.normalizar_inscripcion();

CREATE INDEX IF NOT EXISTS idx_inscripciones_invitado_por
ON public.inscripciones(invitado_por);

ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.inscripciones FROM anon, authenticated;

GRANT INSERT ON public.inscripciones TO anon, authenticated;

DROP POLICY IF EXISTS "registro_publico"
ON public.inscripciones;

CREATE POLICY "registro_publico"
ON public.inscripciones
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
