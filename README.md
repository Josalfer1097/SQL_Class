# SQL Quest · El Archivo de Umbra

Aprende SQL como si fuera un RPG. Nueve reinos, un maestro encapuchado de ojos rojos que te corrige con sarcasmo, y un **motor SQL real corriendo en tu navegador**: nada de simulaciones, tus consultas se ejecutan de verdad.

- **48 desafíos** de básico a avanzado: SELECT, filtros, agregación, JOIN, subconsultas, ALTER, UPDATE, una migración encadenada de 10 pasos, y CTE + funciones de ventana.
- **IDE integrado**: resaltado de sintaxis, autocompletado por alias, formato automático con el estilo del curso, esquema navegable, deshacer/restaurar de la base y vista del modelo que se actualiza con tus `ALTER`.
- **Revisión que enseña**: no dice solo "mal"; dice qué fila falta, qué fila sobra, qué construcción usa la solución y tú no, y qué prácticas de estilo te faltan.
- **XP y rangos**: las pistas cuestan XP, las soluciones cuestan más, los jefes no las venden.
- **Personaje**: silueta, piel, cabello, ojos, túnica, capa y detalle. Todo dibujado en SVG.

## Arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. El progreso se guarda en el navegador (localStorage).

```bash
npm test          # motor SQL, revisor y los 48 ejercicios
npm run build     # bundle de producción en dist/
```

## Estructura

```
src/
  engine/       motor SQL (parser + evaluador), datos, formateador, revisor
  game/         reinos, ejercicios, XP, diálogos de Umbra, estado y persistencia
  components/   pantallas (intro, creador, mapa, nivel), editor, personajes SVG
  styles/       tema visual
tests/          pruebas con node:test
```

## Cómo agregar un desafío

1. Añade un objeto al archivo de ejercicios que corresponda (`src/game/ejercicios_*.js`) con `n`, `titulo`, `pide`, `pista`, `sol`, `check`, `aprende`.
2. Inclúyelo en `niveles` del reino en `src/game/mundo.ts` (el último de la lista es el jefe).
3. `npm test` valida que la solución de referencia pase su propia revisión.

## El motor

Subconjunto de PostgreSQL implementado en JavaScript puro, contrastado consulta por consulta contra PostgreSQL 16 real: SELECT completo (JOIN, GROUP BY, HAVING, DISTINCT, subconsultas, EXISTS, CASE), CTE, funciones de ventana (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, agregados con `OVER`, acumulados), UPDATE/DELETE/INSERT y ALTER TABLE con restricciones. Los mensajes de error son los de PostgreSQL, con una explicación en español al lado.

Lo que no soporta a propósito: transacciones (cada desafío tiene su propia base con deshacer), y funciones que el curso no usa.

## Créditos

Hecho para el curso de SQL de Grupo Shuma. Umbra no existe, pero opina.
