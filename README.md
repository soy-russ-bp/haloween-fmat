# Halloween FMAT — Registro de disfraces

## Instalación
1. Crea un proyecto gratis en https://supabase.com.
2. En **SQL Editor**, pega y ejecuta `database.sql`.
3. En **Project Settings > API Keys** copia la URL del proyecto y la clave **publishable/anon** (NUNCA `service_role` ni secret).
4. Copia `.env.example` a `.env` y reemplaza los valores.
5. En la carpeta del proyecto ejecuta `npm install` y `npm run dev`.
6. Para publicar en Netlify: sube el repositorio a GitHub; en Netlify importa el repositorio, configura `npm run build`, carpeta `dist` y las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Publica.

## Ranking de invitados
En Supabase > SQL Editor ejecuta:
```sql
select invitado_por as nombre, count(*) as inscritos
from public.inscripciones
where invitado_por is not null
group by invitado_por
order by inscritos desc, nombre;
```
Para ver participantes, usa Table Editor > inscripciones. Puedes exportar a CSV desde el panel de Supabase.

## Seguridad y consideraciones
- El formulario permite INSERT público pero no SELECT/UPDATE/DELETE anónimos; el ranking solo se consulta en SQL Editor.
- No pongas la clave `service_role` ni una clave secreta en el navegador.
- La comparación es por nombre y apellido normalizados a mayúsculas y espacios simples. Revisa nombres repetidos, variantes, registros falsos o duplicados antes de otorgar premios.
- Para un concurso con dinero, es preferible asignar un código único a cada promotor y verificar participantes, porque los nombres no son identificadores únicos. Puedes añadir captcha/Turnstile y limitación de tasa antes de abrirlo ampliamente.
- Si hay inscripciones de equipos, este formulario registra un integrante por envío.
