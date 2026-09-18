/* 30 ejercicios: 20 faciles, 10 intermedios.
   check.tipo:
     "rows"   -> compara el resultado del SELECT contra la solucion (orden importa si ordered:true)
     "state"  -> compara el estado de la tabla despues de un UPDATE/ALTER
   requiere: tokens que DEBEN aparecer (validacion semantica ligera)
   prohibe:  tokens que NO deben aparecer
*/
(function (root) {
"use strict";
var E = [
/* ---------------------- FACILES (1-20) ---------------------- */
{
  n: 1, dif: "facil", tema: "SELECT", titulo: "Listar el catalogo",
  bloque: "Leer una tabla", aprende: "ORDER BY es la ultima operacion logica de la consulta: primero se arma el conjunto de filas y al final se ordena. Sin ORDER BY el motor no promete ningun orden, aunque hoy parezca ordenado.", reto: "Cambia DESC por ASC y fijate como cambia la primera fila.",
  pide: "Muestra el sku, el nombre y el precio de todos los productos, ordenados del mas caro al mas barato.",
  tips: ["La tabla es productos y conviene darle el alias p.", "ORDER BY siempre va al final."],
  pista: "La estructura basica es SELECT columnas FROM tabla alias ORDER BY columna. Para el orden de mayor a menor, la palabra es DESC al final.",
  sol: "SELECT p.sku,\n       p.nombre,\n       p.precio\n  FROM productos p\n ORDER BY p.precio DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 2, dif: "facil", tema: "SELECT", titulo: "Filtrar por categoria",
  bloque: "Leer una tabla", aprende: "WHERE se evalua fila por fila: si la condicion da verdadero, la fila pasa. Los literales de texto van entre comillas simples; las dobles son para nombres de columnas.", reto: "Prueba con la categoria 'Ferreteria' y cuenta cuantas filas salen.",
  pide: "Muestra el nombre y el precio de los productos de la categoria 'Pintura', ordenados por nombre.",
  tips: ["Los textos van entre comillas simples."],
  pista: "Agrega WHERE p.categoria = 'Pintura' antes del ORDER BY.",
  sol: "SELECT p.nombre,\n       p.precio\n  FROM productos p\n WHERE p.categoria = 'Pintura'\n ORDER BY p.nombre;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 3, dif: "facil", tema: "SELECT", titulo: "Rango de precios",
  bloque: "Filtrar", aprende: "BETWEEN incluye los dos extremos. Con fechas es traicionero: BETWEEN de un solo dia deja fuera cualquier hora posterior a las 00:00.", reto: "Escribe la version equivalente con >= y <= y compara los resultados.",
  pide: "Muestra el sku y el precio de los productos que cuestan entre 100 y 500 pesos, incluidos ambos extremos. Ordena por precio ascendente.",
  tips: ["Hay un operador que hace exactamente esto en una sola condicion."],
  pista: "BETWEEN 100 AND 500 incluye los dos extremos.",
  sol: "SELECT p.sku,\n       p.precio\n  FROM productos p\n WHERE p.precio BETWEEN 100 AND 500\n ORDER BY p.precio;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 4, dif: "facil", tema: "SELECT", titulo: "Contar filas",
  bloque: "Agregar", aprende: "COUNT(*) cuenta filas; COUNT(columna) cuenta solo los valores no nulos de esa columna. La diferencia importa en cuanto aparece un LEFT JOIN.", reto: "Corre COUNT(*) sin el WHERE y compara los dos numeros.",
  pide: "Cuenta cuantos empleados activos hay (activo = 1). Nombra la columna resultado como total.",
  tips: ["Contar filas es COUNT(*)."],
  pista: "SELECT COUNT(*) AS total FROM empleados e WHERE ...",
  sol: "SELECT COUNT(*) AS total\n  FROM empleados e\n WHERE e.activo = 1;",
  check: { tipo: "rows" }
},
{
  n: 5, dif: "facil", tema: "SELECT", titulo: "Valores unicos",
  bloque: "Filtrar", aprende: "DISTINCT aplica al conjunto completo de columnas del SELECT, no solo a la primera. Obliga al motor a ordenar o hashear todo el resultado, asi que cuesta caro en tablas grandes.", reto: "Agrega s.nombre al SELECT y observa como DISTINCT deja de agrupar ciudades.",
  pide: "Lista las ciudades donde hay sucursales, sin repetir, en orden alfabetico.",
  tips: ["DISTINCT elimina filas repetidas del resultado."],
  pista: "SELECT DISTINCT s.ciudad FROM sucursales s ORDER BY ...",
  sol: "SELECT DISTINCT s.ciudad\n  FROM sucursales s\n ORDER BY s.ciudad;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 6, dif: "facil", tema: "SELECT", titulo: "Los cinco mas caros",
  bloque: "Leer una tabla", aprende: "Primero se ordena, despues se corta. En Oracle esto mismo se escribe FETCH FIRST 5 ROWS ONLY, que tambien funciona en PostgreSQL.", reto: "Agrega OFFSET 5 y obtendras del sexto al decimo.",
  pide: "Muestra el nombre y el precio de los 5 productos mas caros.",
  tips: ["Primero ordenas, despues cortas."],
  pista: "ORDER BY p.precio DESC seguido de LIMIT 5.",
  sol: "SELECT p.nombre,\n       p.precio\n  FROM productos p\n ORDER BY p.precio DESC\n LIMIT 5;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 7, dif: "facil", tema: "SELECT", titulo: "Buscar por texto",
  bloque: "Filtrar", aprende: "LIKE usa % para cualquier cadena y _ para exactamente un caracter. En PostgreSQL, ILIKE hace lo mismo ignorando mayusculas; en Oracle no existe.", reto: "Prueba LIKE '%vinilica%' para buscar en medio del nombre.",
  pide: "Muestra el nombre de los productos cuyo nombre empieza con 'Pintura'.",
  tips: ["El comodin % representa cualquier cantidad de caracteres."],
  pista: "LIKE 'Pintura%' acepta lo que sea despues de esa palabra.",
  sol: "SELECT p.nombre\n  FROM productos p\n WHERE p.nombre LIKE 'Pintura%';",
  check: { tipo: "rows" }
},
{
  n: 8, dif: "facil", tema: "SELECT", titulo: "Ausencia de dato",
  bloque: "Filtrar", aprende: "NULL significa valor desconocido, y comparar algo desconocido con = nunca da verdadero. Por eso IS NULL es la unica forma valida de preguntar por la ausencia de dato.", reto: "Cambia IS NULL por = NULL y comprueba que devuelve cero filas.",
  pide: "Muestra el sku y el nombre de los productos que NO tienen descripcion capturada.",
  tips: ["NULL no se compara con el signo igual."],
  pista: "La unica forma valida es IS NULL.",
  sol: "SELECT p.sku,\n       p.nombre\n  FROM productos p\n WHERE p.descripcion IS NULL;",
  check: { tipo: "rows" }
},
{
  n: 9, dif: "facil", tema: "SELECT", titulo: "Varias categorias",
  bloque: "Filtrar", aprende: "IN contra una lista es una forma corta de escribir varios OR. Tambien acepta una subconsulta en lugar de la lista.", reto: "Reescribela con OR y verifica que da lo mismo.",
  pide: "Muestra el nombre y la categoria de los productos de 'Plomeria' o 'Electrico', ordenados por categoria y luego por nombre.",
  tips: ["Hay una forma corta de escribir varios OR."],
  pista: "IN ('Plomeria', 'Electrico') equivale a dos condiciones con OR.",
  sol: "SELECT p.nombre,\n       p.categoria\n  FROM productos p\n WHERE p.categoria IN ('Plomeria', 'Electrico')\n ORDER BY p.categoria, p.nombre;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 10, dif: "facil", tema: "SELECT", titulo: "Columna calculada",
  bloque: "Calcular", aprende: "El SELECT puede traer expresiones calculadas, no solo columnas. El alias con AS es documentacion: quien lea el resultado sabra que significa esa columna.", reto: "Agrega una columna valor_inventario con precio * stock.",
  pide: "Muestra el nombre, el precio y una columna llamada precio_con_iva con el precio multiplicado por 1.16, redondeado a dos decimales. Ordena por id.",
  tips: ["ROUND(expresion, 2) redondea a dos decimales.", "El alias se define con AS."],
  pista: "ROUND(p.precio * 1.16, 2) AS precio_con_iva",
  sol: "SELECT p.nombre,\n       p.precio,\n       ROUND(p.precio * 1.16, 2) AS precio_con_iva\n  FROM productos p\n ORDER BY p.id;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 11, dif: "facil", tema: "SELECT", titulo: "Resumen del catalogo",
  bloque: "Agregar", aprende: "Las funciones de agregacion sin GROUP BY colapsan toda la tabla en una sola fila. Ojo: sobre una tabla vacia, COUNT devuelve 0 pero SUM devuelve NULL.", reto: "Agrega SUM(p.stock) y compara con COUNT(*).",
  pide: "En una sola fila, muestra cuantos productos hay (columna total), el precio promedio redondeado a dos decimales (promedio), el mas barato (minimo) y el mas caro (maximo).",
  tips: ["Las funciones de agregacion sin GROUP BY resumen toda la tabla."],
  pista: "COUNT(*), ROUND(AVG(p.precio), 2), MIN(p.precio), MAX(p.precio).",
  sol: "SELECT COUNT(*)                AS total,\n       ROUND(AVG(p.precio), 2) AS promedio,\n       MIN(p.precio)           AS minimo,\n       MAX(p.precio)           AS maximo\n  FROM productos p;",
  check: { tipo: "rows" }
},
{
  n: 12, dif: "facil", tema: "SELECT", titulo: "Agrupar por categoria",
  bloque: "Agregar", aprende: "GROUP BY parte la tabla en cubetas y aplica la agregacion a cada una. Toda columna del SELECT que no este dentro de una agregacion debe aparecer en el GROUP BY.", reto: "Quita el GROUP BY y lee el error: dice exactamente que falta.",
  pide: "Muestra cada categoria con cuantos productos tiene (columna n) y la suma de su stock (columna piezas). Ordena por categoria.",
  tips: ["Toda columna que no este dentro de una agregacion debe ir en el GROUP BY."],
  pista: "GROUP BY p.categoria.",
  sol: "SELECT p.categoria,\n       COUNT(*)     AS n,\n       SUM(p.stock) AS piezas\n  FROM productos p\n GROUP BY p.categoria\n ORDER BY p.categoria;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 13, dif: "facil", tema: "SELECT", titulo: "Ordenar por dos criterios",
  bloque: "Leer una tabla", aprende: "ORDER BY acepta varias columnas: la primera manda y la segunda desempata. Cada una lleva su propia direccion.", reto: "Invierte el orden de las dos columnas y observa como se mezclan las sucursales.",
  pide: "Muestra nombre, sucursal_id y salario de los empleados, ordenados por sucursal ascendente y, dentro de cada sucursal, por salario de mayor a menor.",
  tips: ["ORDER BY acepta varias columnas, cada una con su propia direccion."],
  pista: "ORDER BY e.sucursal_id ASC, e.salario DESC",
  sol: "SELECT e.nombre,\n       e.sucursal_id,\n       e.salario\n  FROM empleados e\n ORDER BY e.sucursal_id ASC,\n          e.salario     DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 14, dif: "facil", tema: "UPDATE", titulo: "Corregir un precio",
  bloque: "Modificar datos", aprende: "Todo UPDATE nace como SELECT: escribes el SELECT con el WHERE, confirmas cuantas filas salen y solo entonces cambias el encabezado. En PostgreSQL el alias no puede calificar la columna del SET.", reto: "Corre primero el SELECT equivalente y confirma que devuelve una sola fila.",
  pide: "El producto con id 3 debe quedar en 89.90 pesos. Actualizalo.",
  tips: ["Sin WHERE cambiarias toda la tabla.", "En el SET va solo el nombre de la columna, sin alias."],
  pista: "La estructura es UPDATE tabla alias SET columna = valor WHERE condicion. Fijate en dos cosas: el SET no lleva el alias delante de la columna, y sin WHERE el cambio alcanza a toda la tabla.",
  sol: "UPDATE productos p\n   SET precio = 89.90\n WHERE p.id = 3;",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 15, dif: "facil", tema: "UPDATE", titulo: "Aumento por categoria",
  bloque: "Modificar datos", aprende: "El lado derecho del igual usa el valor actual de la fila, y ahi el alias si es valido. Multiplicar por 1.10 es mas limpio que sumar precio * 0.10.", reto: "Ejecutala dos veces: el aumento se aplica dos veces. Por eso los UPDATE van dentro de una transaccion.",
  pide: "Sube 10% el precio de todos los productos de la categoria 'Electrico'. Redondea a dos decimales.",
  tips: ["El valor nuevo se calcula a partir del actual.", "Multiplicar por 1.10 es mas limpio que sumar el 10%."],
  pista: "SET precio = ROUND(p.precio * 1.10, 2)",
  sol: "UPDATE productos p\n   SET precio = ROUND(p.precio * 1.10, 2)\n WHERE p.categoria = 'Electrico';",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 16, dif: "facil", tema: "UPDATE", titulo: "Aumento de sueldo",
  bloque: "Modificar datos", aprende: "Sumar sobre el valor actual es el patron mas comun del UPDATE. La condicion del WHERE decide a quien alcanza el cambio.", reto: "Cambia el 500 por un porcentaje: salario * 1.05.",
  pide: "Sube 500 pesos el salario de todos los empleados de la sucursal 3.",
  tips: ["Necesitas el salario actual del lado derecho del igual."],
  pista: "SET salario = e.salario + 500",
  sol: "UPDATE empleados e\n   SET salario = e.salario + 500\n WHERE e.sucursal_id = 3;",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 17, dif: "facil", tema: "ALTER", titulo: "Agregar una columna",
  bloque: "Cambiar estructura", aprende: "ALTER es DDL: cambia la definicion de la tabla, no su contenido. Sin DEFAULT, las filas existentes reciben NULL en la columna nueva.", reto: "Agrega tambien una columna telefono en la misma sentencia, separando con coma.",
  pide: "Agrega a la tabla empleados una columna llamada email, de tipo texto de hasta 120 caracteres.",
  tips: ["En PostgreSQL se escribe ADD COLUMN."],
  pista: "Es un ALTER TABLE con la accion ADD COLUMN. Necesitas el nombre de la columna y su tipo: para texto limitado, VARCHAR con la longitud entre parentesis.",
  sol: "ALTER TABLE empleados\n  ADD COLUMN email VARCHAR(120);",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 18, dif: "facil", tema: "ALTER", titulo: "Columna obligatoria con default",
  bloque: "Cambiar estructura", aprende: "NOT NULL sin DEFAULT falla cuando la tabla ya tiene filas, porque no hay con que llenarlas. Con DEFAULT, el motor rellena y la restriccion se cumple desde el primer momento.", reto: "Quita el DEFAULT y lee el error que aparece.",
  pide: "Agrega a productos una columna peso_kg, numerica con dos decimales, que nunca sea nula y que arranque en 0.",
  tips: ["Sin DEFAULT, el NOT NULL falla porque la tabla ya tiene filas."],
  pista: "ADD COLUMN peso_kg NUMERIC(6,2) DEFAULT 0 NOT NULL",
  sol: "ALTER TABLE productos\n  ADD COLUMN peso_kg NUMERIC(6,2) DEFAULT 0 NOT NULL;",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 19, dif: "facil", tema: "ALTER", titulo: "Renombrar una columna",
  bloque: "Cambiar estructura", aprende: "RENAME COLUMN es identico en PostgreSQL y en Oracle. Es barato para el motor y carisimo para tu codigo: rompe vistas, funciones y reportes que usen el nombre viejo.", reto: "Devuelvela a su nombre original con otro RENAME.",
  pide: "La columna activo de empleados debe llamarse esta_activo.",
  tips: ["Es un cambio de estructura, no de datos."],
  pista: "La accion se llama RENAME COLUMN y lleva la palabra TO entre el nombre viejo y el nuevo. No se toca ningun dato: solo el nombre.",
  sol: "ALTER TABLE empleados\n  RENAME COLUMN activo TO esta_activo;",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 20, dif: "facil", tema: "ALTER", titulo: "Poner una regla de negocio",
  bloque: "Cambiar estructura", aprende: "Una restriccion es una regla que el motor hace cumplir siempre, sin importar quien escriba. Nombrala tu: si dejas que el motor invente el nombre, el error en produccion no te dira nada util.", reto: "Intenta agregar un CHECK que ya violan los datos actuales y mira el error.",
  pide: "Impide que se capture un precio menor o igual a cero en productos. La restriccion debe llamarse ck_productos_precio_pos.",
  tips: ["ADD CONSTRAINT nombre CHECK (condicion)."],
  pista: "Es un ALTER TABLE con ADD CONSTRAINT. Despues del nombre que te piden va la palabra CHECK y, entre parentesis, la condicion que toda fila debe cumplir.",
  sol: "ALTER TABLE productos\n  ADD CONSTRAINT ck_productos_precio_pos CHECK (precio > 0);",
  check: { tipo: "state", tabla: "productos", constraints: true }
},

/* ---------------------- INTERMEDIOS (21-30) ---------------------- */
{
  n: 21, dif: "medio", tema: "SELECT", titulo: "Unir dos tablas",
  bloque: "Unir tablas", aprende: "El ON dice como se emparejan las filas: la llave foranea de una tabla contra la llave primaria de la otra. Relacionar las columnas equivocadas produce un resultado que parece valido pero no lo es.", reto: "Cambia el ON a e.id = s.id y observa cuantas filas salen.",
  pide: "Muestra el nombre de cada empleado junto al nombre de su sucursal. Llama a las columnas empleado y sucursal. Ordena por el id del empleado.",
  tips: ["El ON relaciona la llave foranea con la llave primaria."],
  pista: "JOIN sucursales s ON s.id = e.sucursal_id",
  sol: "SELECT e.nombre AS empleado,\n       s.nombre AS sucursal\n  FROM empleados  e\n  JOIN sucursales s\n    ON s.id = e.sucursal_id\n ORDER BY e.id;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 22, dif: "medio", tema: "SELECT", titulo: "Filtrar grupos",
  bloque: "Agregar", aprende: "WHERE filtra filas antes de agrupar; HAVING filtra grupos ya agregados. Son dos momentos distintos de la misma consulta y no son intercambiables.", reto: "Mueve la condicion de SUM al WHERE y lee el error.",
  pide: "Muestra las categorias que suman mas de 100 piezas de stock, con la categoria y la suma (columna piezas). Considera solo productos no descontinuados. Ordena por piezas de mayor a menor.",
  tips: ["Una condicion filtra filas y la otra filtra grupos: van en clausulas distintas."],
  pista: "descontinuado = 0 va en WHERE; SUM(p.stock) > 100 va en HAVING.",
  sol: "SELECT p.categoria,\n       SUM(p.stock) AS piezas\n  FROM productos p\n WHERE p.descontinuado = 0\n GROUP BY p.categoria\nHAVING SUM(p.stock) > 100\n ORDER BY piezas DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 23, dif: "medio", tema: "SELECT", titulo: "Incluir los que no tienen",
  bloque: "Unir tablas", aprende: "LEFT JOIN conserva todas las filas de la izquierda. En las que no encuentran pareja, las columnas de la derecha vienen en NULL: por eso COUNT(v.id) da 0 y COUNT(*) daria 1.", reto: "Cambia COUNT(e.id) por COUNT(*) y busca la sucursal que miente.",
  pide: "Muestra TODAS las sucursales con cuantos empleados tiene cada una (columna empleados). Las que no tienen ninguno deben aparecer con 0. Ordena por nombre de sucursal.",
  tips: ["Un JOIN normal descarta las sucursales sin pareja.", "COUNT(*) contaria 1 donde deberia haber 0."],
  pista: "LEFT JOIN empleados e ON e.sucursal_id = s.id, y cuenta COUNT(e.id).",
  sol: "SELECT s.nombre,\n       COUNT(e.id) AS empleados\n  FROM sucursales s\n  LEFT JOIN empleados e\n    ON e.sucursal_id = s.id\n GROUP BY s.nombre\n ORDER BY s.nombre;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 24, dif: "medio", tema: "SELECT", titulo: "Comparar contra el promedio",
  bloque: "Subconsultas", aprende: "Una subconsulta escalar se evalua una sola vez y devuelve un unico valor. El alias distinto (p2) evita confundir la tabla interna con la externa.", reto: "Cambia AVG por MAX y observa cuantas filas quedan.",
  pide: "Muestra nombre y precio de los productos cuyo precio supera el promedio del catalogo. Ordena por precio descendente.",
  tips: ["El promedio se calcula con una subconsulta que devuelve un solo valor."],
  pista: "WHERE p.precio > (SELECT AVG(p2.precio) FROM productos p2)",
  sol: "SELECT p.nombre,\n       p.precio\n  FROM productos p\n WHERE p.precio > (SELECT AVG(p2.precio)\n                     FROM productos p2)\n ORDER BY p.precio DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 25, dif: "medio", tema: "SELECT", titulo: "Reporte de tres tablas",
  bloque: "Unir tablas", aprende: "Cuando dos tablas no se conocen directamente, se llega de una a otra pasando por la tabla intermedia. Aqui ventas no sabe de sucursales: el camino es via empleados.", reto: "Agrega un filtro por anio con EXTRACT(YEAR FROM v.fecha).",
  pide: "Por cada sucursal, muestra su nombre (columna sucursal), cuantas ventas registro (num_ventas) y el importe total (importe). Ordena por importe de mayor a menor.",
  tips: ["ventas no conoce la sucursal directamente: llega a ella pasando por empleados."],
  pista: "ventas JOIN empleados ON e.id = v.empleado_id JOIN sucursales ON s.id = e.sucursal_id",
  sol: "SELECT s.nombre     AS sucursal,\n       COUNT(*)     AS num_ventas,\n       SUM(v.total) AS importe\n  FROM ventas     v\n  JOIN empleados  e\n    ON e.id = v.empleado_id\n  JOIN sucursales s\n    ON s.id = e.sucursal_id\n GROUP BY s.nombre\n ORDER BY importe DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 26, dif: "medio", tema: "SELECT", titulo: "Clasificar con CASE",
  bloque: "Calcular", aprende: "CASE evalua los WHEN en orden y se queda con el primero verdadero. Por eso el caso mas especifico va primero; si no, queda como codigo muerto.", reto: "Invierte los dos primeros WHEN y busca que producto cambia de etiqueta.",
  pide: "Muestra nombre, stock y una columna alerta con estas reglas: stock 0 es 'Agotado', stock menor o igual a 10 es 'Reponer', en otro caso 'OK'. Ordena por id.",
  tips: ["El orden de los WHEN importa: el primero verdadero gana."],
  pista: "Pon el caso mas especifico (stock = 0) antes del mas general (stock <= 10).",
  sol: "SELECT p.nombre,\n       p.stock,\n       CASE\n         WHEN p.stock  = 0  THEN 'Agotado'\n         WHEN p.stock <= 10 THEN 'Reponer'\n         ELSE                    'OK'\n       END AS alerta\n  FROM productos p\n ORDER BY p.id;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 27, dif: "medio", tema: "SELECT", titulo: "Los que nunca se vendieron",
  bloque: "Subconsultas", aprende: "NOT EXISTS pregunta por la ausencia de filas relacionadas y es a prueba de NULL. NOT IN, en cambio, devuelve cero filas si la subconsulta trae un solo NULL.", reto: "Reescribela con NOT IN y comprueba que aqui si funciona, porque producto_id nunca es nulo.",
  pide: "Muestra el sku y el nombre de los productos que no tienen ninguna venta registrada. Ordena por id.",
  tips: ["NOT EXISTS es a prueba de NULL; NOT IN no lo es."],
  pista: "WHERE NOT EXISTS (SELECT 1 FROM ventas v WHERE v.producto_id = p.id)",
  sol: "SELECT p.sku,\n       p.nombre\n  FROM productos p\n WHERE NOT EXISTS (SELECT 1\n                     FROM ventas v\n                    WHERE v.producto_id = p.id)\n ORDER BY p.id;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 28, dif: "medio", tema: "UPDATE", titulo: "Descontar inventario con seguridad",
  bloque: "Modificar datos", aprende: "Una condicion defensiva en el WHERE vale mas que un CHECK cuando lo que quieres es que la fila simplemente no se toque, en vez de que la sentencia falle.", reto: "Quita la condicion de stock y observa cuantas filas mas se verian afectadas.",
  pide: "Descuenta 5 piezas del stock a los productos de la categoria 'Pintura', pero solo a los que tengan al menos 5 piezas, para que ninguno quede en negativo.",
  tips: ["La condicion defensiva va en el WHERE, junto al filtro de categoria."],
  pista: "WHERE p.categoria = 'Pintura' AND p.stock >= 5",
  sol: "UPDATE productos p\n   SET stock = p.stock - 5\n WHERE p.categoria = 'Pintura'\n   AND p.stock     >= 5;",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 29, dif: "medio", tema: "UPDATE", titulo: "Actualizar con subconsulta",
  bloque: "Subconsultas", aprende: "Cuando el criterio vive en otra tabla, la subconsulta lo traduce a ids. La sintaxis UPDATE ... JOIN es de MySQL: PostgreSQL usa subconsulta o UPDATE ... FROM.", reto: "Cambia 'Puebla' por 'CDMX' y compara el numero de filas afectadas.",
  pide: "Marca como inactivos (activo = 0) a los empleados que trabajan en sucursales de la ciudad 'Puebla'.",
  tips: ["La ciudad no esta en empleados: hay que buscarla en sucursales."],
  pista: "WHERE e.sucursal_id IN (SELECT s.id FROM sucursales s WHERE s.ciudad = 'Puebla')",
  sol: "UPDATE empleados e\n   SET activo = 0\n WHERE e.sucursal_id IN (SELECT s.id\n                           FROM sucursales s\n                          WHERE s.ciudad = 'Puebla');",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 30, dif: "medio", tema: "UPDATE", titulo: "Depurar el catalogo",
  bloque: "Modificar datos", aprende: "Un proceso idempotente se puede correr dos veces sin efectos extra. La condicion descontinuado = 0 es lo que lo hace idempotente, y ademas evita reescribir filas que ya estaban bien.", reto: "Ejecutala dos veces seguidas: la segunda debe afectar 0 filas.",
  pide: "Marca como descontinuados (descontinuado = 1) los productos que nunca se han vendido, sin volver a escribir los que ya estaban marcados.",
  tips: ["Dos condiciones: que no este ya marcado, y que no tenga ventas.", "Asi la sentencia se puede correr dos veces sin efectos extra."],
  pista: "WHERE p.descontinuado = 0 AND NOT EXISTS (SELECT 1 FROM ventas v WHERE v.producto_id = p.id)",
  sol: "UPDATE productos p\n   SET descontinuado = 1\n WHERE p.descontinuado = 0\n   AND NOT EXISTS (SELECT 1\n                     FROM ventas v\n                    WHERE v.producto_id = p.id);",
  check: { tipo: "state", tabla: "productos" }
}
];
root.EJERCICIOS = E;
})(typeof window !== "undefined" ? window : globalThis);

export default (typeof window !== "undefined" ? window : globalThis).EJERCICIOS;
