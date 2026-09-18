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
  pide: "Muestra el nombre, la categoria y el stock de todos los productos, del que mas existencias tiene al que menos.",
  tips: ["La tabla es productos y conviene darle el alias p.", "ORDER BY siempre va al final."],
  pistas: ["Es la consulta mas simple que existe: pedir columnas de una tabla y decidir en que orden salen.", "Necesitas SELECT con tres columnas, FROM productos con alias, y ORDER BY al final.", "SELECT p.___, p.___, p.___ FROM productos p ORDER BY p.___ ___;  — la ultima palabra decide si va de mayor a menor."],
  sol: "SELECT p.nombre,\n       p.categoria,\n       p.stock\n  FROM productos p\n ORDER BY p.stock DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 2, dif: "facil", tema: "SELECT", titulo: "Filtrar por categoria",
  bloque: "Leer una tabla", aprende: "WHERE se evalua fila por fila: si la condicion da verdadero, la fila pasa. Los literales de texto van entre comillas simples; las dobles son para nombres de columnas.", reto: "Prueba con la categoria 'Ferreteria' y cuenta cuantas filas salen.",
  pide: "Muestra el sku y el precio de los productos de la categoria 'Herramienta', ordenados por sku.",
  tips: ["Los textos van entre comillas simples."],
  pistas: ["Hay que quedarse solo con las filas de una categoria. Eso es filtrar.", "La clausula es WHERE, va entre FROM y ORDER BY, y el texto va entre comillas simples.", "WHERE p.categoria = '____'  — ojo: comillas simples, no dobles."],
  sol: "SELECT p.sku,\n       p.precio\n  FROM productos p\n WHERE p.categoria = 'Herramienta'\n ORDER BY p.sku;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 3, dif: "facil", tema: "SELECT", titulo: "Rango de precios",
  bloque: "Filtrar", aprende: "BETWEEN incluye los dos extremos. Con fechas es traicionero: BETWEEN de un solo dia deja fuera cualquier hora posterior a las 00:00.", reto: "Escribe la version equivalente con >= y <= y compara los resultados.",
  pide: "Muestra el nombre y el stock de los productos que tienen entre 20 y 100 piezas, incluidos ambos extremos. Ordena por stock.",
  tips: ["Hay un operador que hace exactamente esto en una sola condicion."],
  pistas: ["Un rango cerrado: desde un valor hasta otro, con los dos extremos dentro.", "Existe un operador que hace esto en una sola condicion, y en SQL es inclusivo por ambos lados.", "WHERE p.stock ___ 20 ___ 100  — dos palabras, y la segunda tambien se usa para unir condiciones."],
  sol: "SELECT p.nombre,\n       p.stock\n  FROM productos p\n WHERE p.stock BETWEEN 20 AND 100\n ORDER BY p.stock;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 4, dif: "facil", tema: "SELECT", titulo: "Contar filas",
  bloque: "Agregar", aprende: "COUNT(*) cuenta filas; COUNT(columna) cuenta solo los valores no nulos de esa columna. La diferencia importa en cuanto aparece un LEFT JOIN.", reto: "Corre COUNT(*) sin el WHERE y compara los dos numeros.",
  pide: "Cuenta cuantos productos estan descontinuados (descontinuado = 1). Llama a la columna total.",
  tips: ["Contar filas es COUNT(*)."],
  pistas: ["No quieres ver las filas: quieres saber cuantas son.", "La funcion que cuenta filas es COUNT, y el nombre de la columna se pone con AS.", "SELECT ____(*) AS total FROM productos p WHERE ...;"],
  sol: "SELECT COUNT(*) AS total\n  FROM productos p\n WHERE p.descontinuado = 1;",
  check: { tipo: "rows" }
},
{
  n: 5, dif: "facil", tema: "SELECT", titulo: "Valores unicos",
  bloque: "Filtrar", aprende: "DISTINCT aplica al conjunto completo de columnas del SELECT, no solo a la primera. Obliga al motor a ordenar o hashear todo el resultado, asi que cuesta caro en tablas grandes.", reto: "Agrega s.nombre al SELECT y observa como DISTINCT deja de agrupar ciudades.",
  pide: "Lista los puestos que existen entre los empleados, sin repetir, en orden alfabetico.",
  tips: ["DISTINCT elimina filas repetidas del resultado."],
  pistas: ["Varios empleados comparten puesto, y tu solo quieres la lista de puestos distintos.", "La palabra va justo despues de SELECT y elimina las filas repetidas del resultado.", "SELECT ________ e.puesto FROM empleados e ORDER BY ...;"],
  sol: "SELECT DISTINCT e.puesto\n  FROM empleados e\n ORDER BY e.puesto;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 6, dif: "facil", tema: "SELECT", titulo: "Los cinco mas caros",
  bloque: "Leer una tabla", aprende: "Primero se ordena, despues se corta. En Oracle esto mismo se escribe FETCH FIRST 5 ROWS ONLY, que tambien funciona en PostgreSQL.", reto: "Agrega OFFSET 5 y obtendras del sexto al decimo.",
  pide: "Muestra el nombre y el salario de los 4 empleados peor pagados.",
  tips: ["Primero ordenas, despues cortas."],
  pistas: ["Primero decides el orden, despues cortas. Si cortas antes, cortas lo que no era.", "ORDER BY ascendente pone los valores bajos arriba; LIMIT se queda con las primeras filas.", "ORDER BY e.salario ___ LIMIT _;  — la direccion ascendente es la que deja a los mas bajos primero."],
  sol: "SELECT e.nombre,\n       e.salario\n  FROM empleados e\n ORDER BY e.salario ASC\n LIMIT 4;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 7, dif: "facil", tema: "SELECT", titulo: "Buscar por texto",
  bloque: "Filtrar", aprende: "LIKE usa % para cualquier cadena y _ para exactamente un caracter. En PostgreSQL, ILIKE hace lo mismo ignorando mayusculas; en Oracle no existe.", reto: "Prueba LIKE '%vinilica%' para buscar en medio del nombre.",
  pide: "Muestra el nombre de los productos que contienen la palabra 'PVC' en cualquier parte del nombre.",
  tips: ["El comodin % representa cualquier cantidad de caracteres."],
  pistas: ["No es una coincidencia exacta: la palabra puede estar al inicio, en medio o al final.", "El operador es LIKE y el comodin % representa cualquier cantidad de caracteres.", "WHERE p.nombre LIKE '_PVC_'  — pon el comodin de los dos lados."],
  sol: "SELECT p.nombre\n  FROM productos p\n WHERE p.nombre LIKE '%PVC%';",
  check: { tipo: "rows" }
},
{
  n: 8, dif: "facil", tema: "SELECT", titulo: "Ausencia de dato",
  bloque: "Filtrar", aprende: "NULL significa valor desconocido, y comparar algo desconocido con = nunca da verdadero. Por eso IS NULL es la unica forma valida de preguntar por la ausencia de dato.", reto: "Cambia IS NULL por = NULL y comprueba que devuelve cero filas.",
  pide: "Muestra el sku y la categoria de los productos que SI tienen descripcion capturada. Ordena por id.",
  tips: ["NULL no se compara con el signo igual."],
  pistas: ["Preguntar por la presencia de un dato no se hace con el signo igual.", "NULL solo se compara con IS NULL o con su negacion.", "WHERE p.descripcion IS ___ NULL  — una sola palabra en el hueco."],
  sol: "SELECT p.sku,\n       p.categoria\n  FROM productos p\n WHERE p.descripcion IS NOT NULL\n ORDER BY p.id;",
  check: { tipo: "rows" }
},
{
  n: 9, dif: "facil", tema: "SELECT", titulo: "Varias categorias",
  bloque: "Filtrar", aprende: "IN contra una lista es una forma corta de escribir varios OR. Tambien acepta una subconsulta en lugar de la lista.", reto: "Reescribela con OR y verifica que da lo mismo.",
  pide: "Muestra el nombre y el puesto de los empleados que son 'Gerente' o 'Supervisor', ordenados por puesto y luego por nombre.",
  tips: ["Hay una forma corta de escribir varios OR."],
  pistas: ["Dos valores posibles para la misma columna. Se puede con OR, pero hay algo mas corto.", "IN recibe una lista entre parentesis y equivale a varios OR encadenados.", "WHERE e.puesto __ ('______', '__________')"],
  sol: "SELECT e.nombre,\n       e.puesto\n  FROM empleados e\n WHERE e.puesto IN ('Gerente', 'Supervisor')\n ORDER BY e.puesto, e.nombre;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 10, dif: "facil", tema: "SELECT", titulo: "Columna calculada",
  bloque: "Calcular", aprende: "El SELECT puede traer expresiones calculadas, no solo columnas. El alias con AS es documentacion: quien lea el resultado sabra que significa esa columna.", reto: "Agrega una columna valor_inventario con precio * stock.",
  pide: "Muestra el nombre, el stock y una columna llamada valor_inventario con el precio multiplicado por el stock, redondeado a dos decimales. Ordena por id.",
  tips: ["ROUND(expresion, 2) redondea a dos decimales.", "El alias se define con AS."],
  pistas: ["El SELECT no solo trae columnas: tambien puede calcular.", "Multiplica las dos columnas y envuelve el resultado en ROUND con dos decimales. El nombre se pone con AS.", "_____(p.precio * p.stock, _) AS valor_inventario"],
  sol: "SELECT p.nombre,\n       p.stock,\n       ROUND(p.precio * p.stock, 2) AS valor_inventario\n  FROM productos p\n ORDER BY p.id;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 11, dif: "facil", tema: "SELECT", titulo: "Resumen del catalogo",
  bloque: "Agregar", aprende: "Las funciones de agregacion sin GROUP BY colapsan toda la tabla en una sola fila. Ojo: sobre una tabla vacia, COUNT devuelve 0 pero SUM devuelve NULL.", reto: "Agrega SUM(p.stock) y compara con COUNT(*).",
  pide: "En una sola fila muestra cuantos empleados hay (columna total), el salario promedio redondeado a dos decimales (promedio), el menor (minimo) y el mayor (maximo).",
  tips: ["Las funciones de agregacion sin GROUP BY resumen toda la tabla."],
  pistas: ["Cuatro numeros que resumen toda la tabla. Sin GROUP BY, las funciones de agregacion colapsan todo en una fila.", "Son cuatro funciones: una cuenta, una promedia, una busca el minimo y otra el maximo.", "SELECT _____(*) AS total, ROUND(___(e.salario), 2) AS promedio, ___(...), ___(...) FROM empleados e;"],
  sol: "SELECT COUNT(*)                 AS total,\n       ROUND(AVG(e.salario), 2) AS promedio,\n       MIN(e.salario)           AS minimo,\n       MAX(e.salario)           AS maximo\n  FROM empleados e;",
  check: { tipo: "rows" }
},
{
  n: 12, dif: "facil", tema: "SELECT", titulo: "Agrupar por categoria",
  bloque: "Agregar", aprende: "GROUP BY parte la tabla en cubetas y aplica la agregacion a cada una. Toda columna del SELECT que no este dentro de una agregacion debe aparecer en el GROUP BY.", reto: "Quita el GROUP BY y lee el error: dice exactamente que falta.",
  pide: "Muestra cada puesto con cuantos empleados lo tienen (columna n) y el salario promedio del puesto redondeado a dos decimales (columna promedio). Ordena por puesto.",
  tips: ["Toda columna que no este dentro de una agregacion debe ir en el GROUP BY."],
  pistas: ["Una fila por puesto, no una fila por empleado. Eso significa agrupar.", "GROUP BY parte la tabla en cubetas. Toda columna que no este dentro de una agregacion debe aparecer ahi.", "SELECT e.puesto, COUNT(*) AS n, ... FROM empleados e _____ __ e.puesto ORDER BY ...;"],
  sol: "SELECT e.puesto,\n       COUNT(*)                 AS n,\n       ROUND(AVG(e.salario), 2) AS promedio\n  FROM empleados e\n GROUP BY e.puesto\n ORDER BY e.puesto;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 13, dif: "facil", tema: "SELECT", titulo: "Ordenar por dos criterios",
  bloque: "Leer una tabla", aprende: "ORDER BY acepta varias columnas: la primera manda y la segunda desempata. Cada una lleva su propia direccion.", reto: "Invierte el orden de las dos columnas y observa como se mezclan las sucursales.",
  pide: "Muestra sku, categoria y precio de los productos, ordenados por categoria ascendente y, dentro de cada categoria, por precio de mayor a menor.",
  tips: ["ORDER BY acepta varias columnas, cada una con su propia direccion."],
  pistas: ["Dos criterios: el primero agrupa visualmente, el segundo desempata dentro de cada grupo.", "ORDER BY acepta varias columnas separadas por coma, y cada una lleva su propia direccion.", "ORDER BY p.categoria ___, p.precio ____"],
  sol: "SELECT p.sku,\n       p.categoria,\n       p.precio\n  FROM productos p\n ORDER BY p.categoria ASC,\n          p.precio    DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 14, dif: "facil", tema: "UPDATE", titulo: "Corregir un precio",
  bloque: "Modificar datos", aprende: "Todo UPDATE nace como SELECT: escribes el SELECT con el WHERE, confirmas cuantas filas salen y solo entonces cambias el encabezado. En PostgreSQL el alias no puede calificar la columna del SET.", reto: "Corre primero el SELECT equivalente y confirma que devuelve una sola fila.",
  pide: "El empleado con id 7 recibio un ajuste: su salario debe quedar en 33500. Actualizalo.",
  tips: ["Sin WHERE cambiarias toda la tabla.", "En el SET va solo el nombre de la columna, sin alias."],
  pistas: ["Un solo registro cambia. Lo que decide a quien alcanza el cambio es la condicion del final.", "La estructura es UPDATE tabla alias SET columna = valor WHERE condicion. Sin WHERE cambias toda la tabla.", "UPDATE empleados e SET ______ = 33500 _____ e.id = 7;  — en el SET va solo el nombre de la columna, sin el alias."],
  sol: "UPDATE empleados e\n   SET salario = 33500\n WHERE e.id = 7;",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 15, dif: "facil", tema: "UPDATE", titulo: "Aumento por categoria",
  bloque: "Modificar datos", aprende: "El lado derecho del igual usa el valor actual de la fila, y ahi el alias si es valido. Multiplicar por 1.10 es mas limpio que sumar precio * 0.10.", reto: "Ejecutala dos veces: el aumento se aplica dos veces. Por eso los UPDATE van dentro de una transaccion.",
  pide: "Aplica un descuento del 15% al precio de los productos descontinuados (descontinuado = 1). Redondea a dos decimales.",
  tips: ["El valor nuevo se calcula a partir del actual.", "Multiplicar por 1.10 es mas limpio que sumar el 10%."],
  pistas: ["Quitar 15% es lo mismo que quedarse con el 85%. El valor nuevo se calcula desde el actual.", "Del lado derecho del igual si puedes usar el alias. Envuelve la multiplicacion en ROUND con dos decimales.", "SET precio = _____(p.precio * ____, 2)"],
  sol: "UPDATE productos p\n   SET precio = ROUND(p.precio * 0.85, 2)\n WHERE p.descontinuado = 1;",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 16, dif: "facil", tema: "UPDATE", titulo: "Aumento de sueldo",
  bloque: "Modificar datos", aprende: "Sumar sobre el valor actual es el patron mas comun del UPDATE. La condicion del WHERE decide a quien alcanza el cambio.", reto: "Cambia el 500 por un porcentaje: salario * 1.05.",
  pide: "Los empleados con puesto 'Cajero' reciben un aumento de 800 pesos. Aplicalo.",
  tips: ["Necesitas el salario actual del lado derecho del igual."],
  pistas: ["El salario nuevo depende del que ya tenia cada quien, no es un valor fijo.", "Del lado derecho del igual lee la columna actual y sumale la cantidad.", "SET salario = e.______ + ___ WHERE e.puesto = '______'"],
  sol: "UPDATE empleados e\n   SET salario = e.salario + 800\n WHERE e.puesto = 'Cajero';",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 17, dif: "facil", tema: "ALTER", titulo: "Agregar una columna",
  bloque: "Cambiar estructura", aprende: "ALTER es DDL: cambia la definicion de la tabla, no su contenido. Sin DEFAULT, las filas existentes reciben NULL en la columna nueva.", reto: "Agrega tambien una columna telefono en la misma sentencia, separando con coma.",
  pide: "Agrega a la tabla sucursales una columna llamada telefono, de texto de hasta 20 caracteres.",
  tips: ["En PostgreSQL se escribe ADD COLUMN."],
  pistas: ["Esto no cambia datos: cambia la forma de la tabla. Es DDL.", "La accion se llama ADD COLUMN y necesita nombre y tipo. Para texto limitado, VARCHAR con la longitud entre parentesis.", "ALTER TABLE sucursales ___ ______ telefono _______(20);"],
  sol: "ALTER TABLE sucursales\n  ADD COLUMN telefono VARCHAR(20);",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 18, dif: "facil", tema: "ALTER", titulo: "Columna obligatoria con default",
  bloque: "Cambiar estructura", aprende: "NOT NULL sin DEFAULT falla cuando la tabla ya tiene filas, porque no hay con que llenarlas. Con DEFAULT, el motor rellena y la restriccion se cumple desde el primer momento.", reto: "Quita el DEFAULT y lee el error que aparece.",
  pide: "Agrega a la tabla ventas una columna canal, de texto de hasta 20 caracteres, que nunca sea nula y que arranque con el valor 'Mostrador'.",
  tips: ["Sin DEFAULT, el NOT NULL falla porque la tabla ya tiene filas."],
  pistas: ["La tabla ya tiene 96 filas. Si la columna es obligatoria, esas filas necesitan con que llenarse.", "DEFAULT define el valor de arranque y NOT NULL la obligatoriedad. Sin el DEFAULT, el NOT NULL falla.", "ADD COLUMN canal VARCHAR(20) _______ '_________' ___ ____;"],
  sol: "ALTER TABLE ventas\n  ADD COLUMN canal VARCHAR(20) DEFAULT 'Mostrador' NOT NULL;",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 19, dif: "facil", tema: "ALTER", titulo: "Renombrar una columna",
  bloque: "Cambiar estructura", aprende: "RENAME COLUMN es identico en PostgreSQL y en Oracle. Es barato para el motor y carisimo para tu codigo: rompe vistas, funciones y reportes que usen el nombre viejo.", reto: "Devuelvela a su nombre original con otro RENAME.",
  pide: "La columna descontinuado de productos debe llamarse fuera_de_linea.",
  tips: ["Es un cambio de estructura, no de datos."],
  pistas: ["Solo cambia el nombre. Los datos no se tocan.", "La accion es RENAME COLUMN y lleva una palabra entre el nombre viejo y el nuevo.", "ALTER TABLE productos ______ ______ descontinuado __ fuera_de_linea;"],
  sol: "ALTER TABLE productos\n  RENAME COLUMN descontinuado TO fuera_de_linea;",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 20, dif: "facil", tema: "ALTER", titulo: "Poner una regla de negocio",
  bloque: "Cambiar estructura", aprende: "Una restriccion es una regla que el motor hace cumplir siempre, sin importar quien escriba. Nombrala tu: si dejas que el motor invente el nombre, el error en produccion no te dira nada util.", reto: "Intenta agregar un CHECK que ya violan los datos actuales y mira el error.",
  pide: "Impide que se capture un stock negativo en productos. La restriccion debe llamarse ck_productos_stock_no_neg.",
  tips: ["ADD CONSTRAINT nombre CHECK (condicion)."],
  pistas: ["Una regla que el motor hace cumplir siempre, sin importar quien escriba la sentencia.", "Se agrega con ADD CONSTRAINT, luego el nombre, luego la palabra CHECK y la condicion entre parentesis.", "ADD __________ ck_productos_stock_no_neg _____ (stock __ 0);"],
  sol: "ALTER TABLE productos\n  ADD CONSTRAINT ck_productos_stock_no_neg CHECK (stock >= 0);",
  check: { tipo: "state", tabla: "productos", constraints: true }
},

/* ---------------------- INTERMEDIOS (21-30) ---------------------- */
{
  n: 21, dif: "medio", tema: "SELECT", titulo: "Unir dos tablas",
  bloque: "Unir tablas", aprende: "El ON dice como se emparejan las filas: la llave foranea de una tabla contra la llave primaria de la otra. Relacionar las columnas equivocadas produce un resultado que parece valido pero no lo es.", reto: "Cambia el ON a e.id = s.id y observa cuantas filas salen.",
  pide: "Muestra el folio de cada venta junto al nombre del producto vendido. Llama a las columnas folio y producto. Ordena por el id de la venta y limita a 15 filas.",
  tips: ["El ON relaciona la llave foranea con la llave primaria."],
  pistas: ["El nombre del producto no esta en ventas: esta en otra tabla. Hay que unirlas.", "El ON dice como se emparejan: la llave foranea de una tabla contra la llave primaria de la otra.", "JOIN productos p ON p.__ = v.___________"],
  sol: "SELECT v.folio  AS folio,\n       p.nombre AS producto\n  FROM ventas    v\n  JOIN productos p\n    ON p.id = v.producto_id\n ORDER BY v.id\n LIMIT 15;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 22, dif: "medio", tema: "SELECT", titulo: "Filtrar grupos",
  bloque: "Agregar", aprende: "WHERE filtra filas antes de agrupar; HAVING filtra grupos ya agregados. Son dos momentos distintos de la misma consulta y no son intercambiables.", reto: "Mueve la condicion de SUM al WHERE y lee el error.",
  pide: "Muestra los puestos cuyo salario total supera los 50000, con el puesto y la suma (columna nomina). Considera solo empleados activos (activo = 1). Ordena por nomina descendente.",
  tips: ["Una condicion filtra filas y la otra filtra grupos: van en clausulas distintas."],
  pistas: ["Hay dos filtros distintos: uno descarta empleados y el otro descarta puestos completos.", "El filtro por fila va en WHERE; el filtro sobre el resultado de una suma va en HAVING, despues del GROUP BY.", "WHERE e.activo = 1 ... GROUP BY e.puesto ______ SUM(e.salario) > 50000"],
  sol: "SELECT e.puesto,\n       SUM(e.salario) AS nomina\n  FROM empleados e\n WHERE e.activo = 1\n GROUP BY e.puesto\nHAVING SUM(e.salario) > 50000\n ORDER BY nomina DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 23, dif: "medio", tema: "SELECT", titulo: "Incluir los que no tienen",
  bloque: "Unir tablas", aprende: "LEFT JOIN conserva todas las filas de la izquierda. En las que no encuentran pareja, las columnas de la derecha vienen en NULL: por eso COUNT(v.id) da 0 y COUNT(*) daria 1.", reto: "Cambia COUNT(e.id) por COUNT(*) y busca la sucursal que miente.",
  pide: "Muestra TODOS los productos con cuantas ventas tiene cada uno (columna ventas). Los que nunca se vendieron deben aparecer con 0. Ordena por ventas ascendente y luego por id.",
  tips: ["Un JOIN normal descarta las sucursales sin pareja.", "COUNT(*) contaria 1 donde deberia haber 0."],
  pistas: ["Un JOIN normal borraria del reporte justo a los productos que te interesa detectar.", "LEFT JOIN conserva todas las filas de la izquierda. Y cuenta una columna de la tabla derecha, no COUNT(*).", "LEFT JOIN ventas v ON ... GROUP BY ... con COUNT(v.__) — si cuentas con asterisco, los ceros se vuelven unos."],
  sol: "SELECT p.nombre,\n       COUNT(v.id) AS ventas\n  FROM productos   p\n  LEFT JOIN ventas v\n    ON v.producto_id = p.id\n GROUP BY p.id, p.nombre\n ORDER BY ventas, p.id;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 24, dif: "medio", tema: "SELECT", titulo: "Comparar contra el promedio",
  bloque: "Subconsultas", aprende: "Una subconsulta escalar se evalua una sola vez y devuelve un unico valor. El alias distinto (p2) evita confundir la tabla interna con la externa.", reto: "Cambia AVG por MAX y observa cuantas filas quedan.",
  pide: "Muestra nombre y salario de los empleados que ganan menos que el promedio de la empresa. Ordena por salario ascendente.",
  tips: ["El promedio se calcula con una subconsulta que devuelve un solo valor."],
  pistas: ["Necesitas comparar cada fila contra un numero que hay que calcular primero.", "Una subconsulta entre parentesis que devuelve un solo valor se puede usar dentro del WHERE.", "WHERE e.salario < (SELECT ___(e2.salario) FROM empleados e2)  — usa un alias distinto adentro."],
  sol: "SELECT e.nombre,\n       e.salario\n  FROM empleados e\n WHERE e.salario < (SELECT AVG(e2.salario)\n                      FROM empleados e2)\n ORDER BY e.salario;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 25, dif: "medio", tema: "SELECT", titulo: "Reporte de tres tablas",
  bloque: "Unir tablas", aprende: "Cuando dos tablas no se conocen directamente, se llega de una a otra pasando por la tabla intermedia. Aqui ventas no sabe de sucursales: el camino es via empleados.", reto: "Agrega un filtro por anio con EXTRACT(YEAR FROM v.fecha).",
  pide: "Por cada categoria de producto muestra cuantas ventas tuvo (num_ventas) y el importe total (importe). Ordena por importe descendente.",
  tips: ["ventas no conoce la sucursal directamente: llega a ella pasando por empleados."],
  pistas: ["La categoria vive en productos y el importe en ventas: primero las unes, despues agrupas.", "JOIN para traer la categoria, GROUP BY para tener una fila por categoria, y dos agregaciones.", "FROM ventas v JOIN productos p ON ... GROUP BY p._________"],
  sol: "SELECT p.categoria,\n       COUNT(*)     AS num_ventas,\n       SUM(v.total) AS importe\n  FROM ventas    v\n  JOIN productos p\n    ON p.id = v.producto_id\n GROUP BY p.categoria\n ORDER BY importe DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 26, dif: "medio", tema: "SELECT", titulo: "Clasificar con CASE",
  bloque: "Calcular", aprende: "CASE evalua los WHEN en orden y se queda con el primero verdadero. Por eso el caso mas especifico va primero; si no, queda como codigo muerto.", reto: "Invierte los dos primeros WHEN y busca que producto cambia de etiqueta.",
  pide: "Muestra nombre, salario y una columna rango con estas reglas: 25000 o mas es 'Alto', 15000 o mas es 'Medio', y el resto 'Base'. Ordena por salario descendente.",
  tips: ["El orden de los WHEN importa: el primero verdadero gana."],
  pistas: ["Cada fila cae en una de tres etiquetas segun su valor. El orden en que evalues las reglas lo cambia todo.", "CASE evalua los WHEN de arriba hacia abajo y se queda con el primero verdadero. Por eso el corte mas alto va primero.", "CASE WHEN e.salario >= _____ THEN 'Alto' WHEN ... ____ 'Base' ___ AS rango"],
  sol: "SELECT e.nombre,\n       e.salario,\n       CASE\n         WHEN e.salario >= 25000 THEN 'Alto'\n         WHEN e.salario >= 15000 THEN 'Medio'\n         ELSE                         'Base'\n       END AS rango\n  FROM empleados e\n ORDER BY e.salario DESC;",
  check: { tipo: "rows", ordered: true }
},
{
  n: 27, dif: "medio", tema: "SELECT", titulo: "Los que nunca se vendieron",
  bloque: "Subconsultas", aprende: "NOT EXISTS pregunta por la ausencia de filas relacionadas y es a prueba de NULL. NOT IN, en cambio, devuelve cero filas si la subconsulta trae un solo NULL.", reto: "Reescribela con NOT IN y comprueba que aqui si funciona, porque producto_id nunca es nulo.",
  pide: "Muestra el nombre y la ciudad de las sucursales que no tienen ningun empleado asignado.",
  tips: ["NOT EXISTS es a prueba de NULL; NOT IN no lo es."],
  pistas: ["Estas buscando ausencia: sucursales para las que no existe ninguna fila relacionada.", "NOT EXISTS con una subconsulta correlacionada. Es mas seguro que NOT IN, que se rompe con un solo NULL.", "WHERE ___ ______ (SELECT 1 FROM empleados e WHERE e.sucursal_id = s.__)"],
  sol: "SELECT s.nombre,\n       s.ciudad\n  FROM sucursales s\n WHERE NOT EXISTS (SELECT 1\n                     FROM empleados e\n                    WHERE e.sucursal_id = s.id);",
  check: { tipo: "rows", ordered: true }
},
{
  n: 28, dif: "medio", tema: "UPDATE", titulo: "Descontar inventario con seguridad",
  bloque: "Modificar datos", aprende: "Una condicion defensiva en el WHERE vale mas que un CHECK cuando lo que quieres es que la fila simplemente no se toque, en vez de que la sentencia falle.", reto: "Quita la condicion de stock y observa cuantas filas mas se verian afectadas.",
  pide: "Sube 3 piezas al stock de los productos de la categoria 'Electrico' que tengan menos de 100 piezas. Los demas no se tocan.",
  tips: ["La condicion defensiva va en el WHERE, junto al filtro de categoria."],
  pistas: ["Dos condiciones tienen que cumplirse a la vez para que la fila cambie.", "Une las dos condiciones con AND dentro del mismo WHERE.", "WHERE p.categoria = '________' ___ p.stock < ___"],
  sol: "UPDATE productos p\n   SET stock = p.stock + 3\n WHERE p.categoria = 'Electrico'\n   AND p.stock     < 100;",
  check: { tipo: "state", tabla: "productos" }
},
{
  n: 29, dif: "medio", tema: "UPDATE", titulo: "Actualizar con subconsulta",
  bloque: "Subconsultas", aprende: "Cuando el criterio vive en otra tabla, la subconsulta lo traduce a ids. La sintaxis UPDATE ... JOIN es de MySQL: PostgreSQL usa subconsulta o UPDATE ... FROM.", reto: "Cambia 'Puebla' por 'CDMX' y compara el numero de filas afectadas.",
  pide: "Marca como descontinuados (descontinuado = 1) los productos cuya categoria sea de las que tienen menos de 4 productos en el catalogo.",
  tips: ["La ciudad no esta en empleados: hay que buscarla en sucursales."],
  pistas: ["El criterio no esta en la fila: depende de cuantos productos tiene su categoria. Hay que calcularlo aparte.", "Una subconsulta que agrupe por categoria y filtre con HAVING te da la lista de categorias; luego IN contra esa lista.", "WHERE p.categoria __ (SELECT p2.categoria FROM productos p2 GROUP BY p2.categoria ______ COUNT(*) < 4)"],
  sol: "UPDATE productos p\n   SET descontinuado = 1\n WHERE p.categoria IN (SELECT p2.categoria\n                         FROM productos p2\n                        GROUP BY p2.categoria\n                        HAVING COUNT(*) < 4);",
  check: { tipo: "state", tabla: "empleados" }
},
{
  n: 30, dif: "medio", tema: "UPDATE", titulo: "Depurar el catalogo",
  bloque: "Modificar datos", aprende: "Un proceso idempotente se puede correr dos veces sin efectos extra. La condicion descontinuado = 0 es lo que lo hace idempotente, y ademas evita reescribir filas que ya estaban bien.", reto: "Ejecutala dos veces seguidas: la segunda debe afectar 0 filas.",
  pide: "Marca como inactivos (activo = 0) a los empleados que nunca han registrado una venta, sin volver a escribir los que ya estaban inactivos.",
  tips: ["Dos condiciones: que no este ya marcado, y que no tenga ventas.", "Asi la sentencia se puede correr dos veces sin efectos extra."],
  pistas: ["Dos cosas: que no tenga ventas, y que no estuviera ya marcado. La segunda hace la sentencia repetible.", "NOT EXISTS para la ausencia de ventas, y una condicion extra sobre la columna activo.", "WHERE e.activo = _ AND NOT ______ (SELECT 1 FROM ventas v WHERE v.___________ = e.id)"],
  sol: "UPDATE empleados e\n   SET activo = 0\n WHERE e.activo = 1\n   AND NOT EXISTS (SELECT 1\n                     FROM ventas v\n                    WHERE v.empleado_id = e.id);",
  check: { tipo: "state", tabla: "productos" }
}
];
root.EJERCICIOS = E;
})(typeof window !== "undefined" ? window : globalThis);

export default (typeof window !== "undefined" ? window : globalThis).EJERCICIOS;