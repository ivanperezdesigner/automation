# site/ — la page web publique

Landing page de una sola página, **HTML + CSS + JS puros**. Sin framework, sin
compilación, sin `npm`. Se sube tal cual a cualquier hosting estático.

No es `prospection/` ni `presentation/`. Los tres coexisten:

| | `presentation/` | `prospection/` | `site/` |
|---|---|---|---|
| Formato | PDF de 13 hojas | PDF de 7 planchas | Página web |
| Para quién | Alguien que ya contestó | PyME que no te conoce | Cualquiera que llegue por un enlace |
| Cómo llega | Se adjunta a un correo | Se adjunta a un correo | El lector entra solo |

El contenido arranca del arco narrativo de `prospection/` — el mismo problema, el mismo
coste, la misma respuesta — pero **reorganizado con anatomía de landing page**, y con dos
secciones que `prospection/` no tiene y no puede tener.

Orden de la página:

| # | Sección | Qué hace |
|---|---|---|
| 1 | Hero | El gancho, dos botones y las tres garantías |
| 2 | Marquesina | Los formatos que la herramienta lee |
| 3 | `#probleme` | Tres síntomas simultáneos, sin numerar |
| 4 | Banda grafito | Lo que cuesta, y la cita de cierre |
| 5 | `#faire` | Cuatro pestañas: leer, aplicar, generar, rendir cuentas |
| 6 | **`#preuves`** | **Los tres casos con sus cifras verificadas** |
| 7 | **`.who`** (grafito) | **Quién escribe la herramienta** |
| 8 | Pilares | Vos fichiers, vos règles, votre réseau |
| 9 | `#demarche` | Las cuatro etapas |
| 10 | `#questions` | Seis preguntas |
| 11 | `#contact` | Correo directo y formulario |

Las secciones 6 y 7 se añadieron el 2026-09-09. Antes de ellas la página pedía treinta
minutos a un desconocido sin enseñar un solo trabajo hecho ni decir quién lo hacía.

## Archivos

```
site/
  index.html          la página entera
  css/styles.css      todo el estilo, con variables en :root
  js/main.js          todo el comportamiento
  img/atelier.jpg     banda ancha bajo el hero    1800 x 620
  img/documents.jpg   banda grafito, "Ce que ça coûte"  1100 x 1400
  img/code.jpg        panel de "Ce que je fais"   1100 x 1400
  img/bureau.jpg      banda ancha antes de la démarche  1800 x 560
  img/workflow.svg    la ilustración animada del hero   2500 x 2500, 501 KB
  img/workflow.json   el Lottie del que salió el SVG    no lo usa la página
  README.md           este archivo
```

## Cómo se prueba en local

Doble clic en `index.html` abre la página en el navegador. Todo funciona desde el
sistema de archivos: no hay `fetch`, ni módulos ES, ni nada que exija servidor.

Si se prefiere servidor:

```
python -m http.server 8000
```

y abrir `http://localhost:8000/site/`.

## Cómo se sube

Cualquier hosting estático sirve la carpeta tal cual: Netlify (arrastrar la carpeta),
Cloudflare Pages, GitHub Pages, o el `public_html` de un hosting clásico por FTP. **No
hay paso de build.** La única condición es subir la carpeta entera, porque las rutas de
`css/`, `js/` e `img/` son relativas.

## La versión en los enlaces de `css` y `js`

`index.html` referencia los estáticos con una marca de versión:

```html
<link rel="stylesheet" href="css/styles.css?v=2026-09-09">
<script src="js/main.js?v=2026-09-09"></script>
```

**Hay que subirla cada vez que cambie `styles.css` o `main.js`.** No es cosmética: se
pagó el 2026-09-09. Al publicar el arreglo del formulario, el navegador sirvió el
`index.html` nuevo junto con el `main.js` viejo de su caché. El HTML tenía el bloque de
respaldo pero el JS no sabía rellenarlo: la página quedó a medias, en un estado que no
existe en el repositorio y que es muy difícil de diagnosticar.

GitHub Pages sirve los estáticos con una caché corta, así que sin la marca el desajuste
se corrige solo en unos minutos — pero durante esos minutos la página está rota para
quien ya la había visitado, que es justo el que vuelve porque le interesó.

Basta la fecha del cambio. No hace falta un hash ni un paso de build.

## Lo que hace el JavaScript

Todo está en `js/main.js`, en una IIFE, sin dependencias:

| Efecto | Dónde |
|---|---|
| Cambio de idioma FR/EN, una lengua a la vez | `#langToggle` + `setLang()` |
| Cabecera pegajosa que se compacta al bajar | `.nav.is-stuck` |
| Menú hamburguesa a partir de 860 px, se cierra al elegir o con Escape | `#navToggle` |
| Barra de progreso de lectura arriba | `#progressBar` |
| Entrada escalonada de cada bloque al aparecer en pantalla | `IntersectionObserver` sobre `[data-reveal]` |
| Barrido de izquierda a derecha de cada titular | `[data-wipe]` + `clip-path` |
| Las cuatro cifras de `#preuves` cuentan desde cero | `[data-count]` + `runCount()` |
| Filete verde que crece bajo el enlace activo del menú | `.nav__menu a::after` |
| Paralaje suave en la foto del hero | `[data-parallax]` |
| Enlace del menú marcado según la sección visible | segundo `IntersectionObserver` |
| Pestañas de *Ce que je fais* (clic y flechas del teclado) | `wirePanels(".tab", …)` |
| Selector de etapa de *La démarche* | `wirePanels(".step", …)` |
| Acordeón de preguntas, una abierta a la vez | `.faq__item` |
| Botón «Copier» del correo | `#copyMail` |
| Botón de volver arriba | `#toTop` |
| Año del pie | `#year` |

## El botón de idioma

**Las dos lenguas están en el HTML**, cada bloque duplicado con `lang="fr"` y `lang="en"`.
El CSS enseña una sola:

```css
html[data-lang="fr"] [lang="en"] { display: none !important; }
html[data-lang="en"] [lang="fr"] { display: none !important; }
```

`setLang()` cambia ese atributo en `<html>`, ajusta también `<html lang>` para los
lectores de pantalla, y guarda la elección en `localStorage` con la clave `ip-lang`.
**El francés es el idioma por defecto para todos**; el idioma del navegador no decide
nada. Los mensajes que genera el JS (validación del formulario, «Copié», el asunto del
correo) viven en el objeto `STRINGS` al principio del archivo, con una entrada por lengua.

Ventaja de hacerlo así: sin JS, la página se ve entera en francés y no queda vacía.

## Los iconos

Son de **Lucide** (licencia ISC), copiados a mano como un `<svg class="sprite">` al
principio del `index.html` y usados con `<use href="#i-...">`. No hay librería, ni CDN, ni
paquete: solo los seis que hacen falta — `check`, `arrow-right`, `arrow-up`, `languages`,
`mail` y `copy`. Todos heredan el color con `stroke: currentColor`.

## La ilustración del hero

A la derecha del titular va **`img/workflow.svg`**, el archivo que trajo Ivan: una escena
de línea en blanco y negro — tres personas alrededor de una mesa con portátiles, engranajes
y un panel de datos — **que se anima sola**. La animación está dentro del propio SVG, en
etiquetas `<animateTransform>` (SMIL): no hace falta ninguna librería, ningún JS y ninguna
petición extra más allá del archivo.

Va montada como `<object>`, no como `<img>`:

```html
<object class="art__svg" type="image/svg+xml" data="img/workflow.svg">
  <img src="img/workflow.svg" alt="" width="900" height="900">
</object>
```

`<object>` carga el SVG como documento y garantiza que su SMIL corra; el `<img>` de dentro
es el plan B si el navegador no puede con el `object`. Lleva `pointer-events: none` para
que no capture clics, y `aria-hidden` porque es decorativa.

**Dos consecuencias de usar el archivo tal cual.** La primera: la escena es blanco y negro
puro, así que el verde de la marca ya no aparece en el hero — el acento sigue en la regla,
los números y los botones. La segunda: una animación SMIL dentro de un `<object>` **no
respeta `prefers-reduced-motion`**, porque esa preferencia se aplica desde el CSS de la
página y no llega dentro del archivo. Si eso importa, hay que editar el SVG y envolver sus
`<animateTransform>` en una media query propia.

**`workflow.json` es el Lottie de origen** (450 KB, exportado de After Effects). La página
no lo usa: el SVG hace lo mismo sin `lottie-web`. Se puede dejar en la carpeta como fuente
o no subirlo, y ahorrar esos 450 KB.

Todos los efectos respetan `prefers-reduced-motion`. Si el JS no carga, la página se lee
entera: los bloques no quedan invisibles y los paneles ocultos siguen siendo accesibles.

## Los puntos de ruptura

Revisados y medidos el 2026-09-09. No son redondos por gusto: cada uno sale de un ancho
que se midio en el navegador.

| Desde | Hasta | Qué cambia |
|---|---|---|
| 1320 px | — | Menú completo en una línea |
| — | 1319 px | **Hamburguesa.** El menú se convierte en panel desplegable |
| — | 1180 px | Todo pasa a una columna **menos el hero**, que conserva dos |
| — | 860 px | El hero también se apila. Gutter de 24 px, pestañas en vertical |

**Por qué 1320.** Se midió lo que ocupa el menú de verdad, a 1600 px y sin que nada se
parta: **863 px** los seis elementos con el botón, **130 px** la marca, **109 px** el
selector de idioma, más dos separaciones de 28 px y 160 px de gutter. Total **1318 px**.
Por debajo de eso los elementos se partían en dos y tres líneas cada uno.

**Por eso la cabecera ya no lleva el subtítulo « Automatisation sur mesure ».** Sumaba
126 px y el conjunto pedía 1444 px, pero el contenido está topado a `--maxw: 1440`, así que
el ancho útil de la cabecera nunca pasa de 1280 px por mucho que crezca la pantalla: **no
cabía a ningún ancho**. La alternativa era acortar « Ce que nous avons construit », y se
prefirió no tocar el texto.

**Los objetivos táctiles no dependen solo del ancho.** La regla es
`@media (max-width: 1319px), (pointer: coarse)`, porque una tableta de 1368 px es una
pantalla táctil aunque sea ancha. La mitad de `pointer` no se puede comprobar en un
navegador sin cabeza; está ahí porque el ancho por sí solo no identifica una pantalla
táctil.

**El hero mantiene dos columnas hasta 860 px.** Antes se apilaba a 1180 y en una tableta
de 1024 la mitad derecha de la primera pantalla quedaba vacía, con la ilustración suelta
debajo. Ahora la ilustración sigue al lado del titular, más pequeña.

**Objetivos táctiles.** Por debajo de 1280 px cada enlace y cada botón mide al menos 44 px
de alto. Los enlaces del pie medían 21 px, el correo 26 y el botón « Copier » 34.

## Cómo se comprueba el responsive

**Chrome sin cabeza miente por debajo de unos 500 px de ancho**: no reduce el viewport,
renderiza más ancho y recorta la imagen. Una captura con `--window-size=390` enseña un
titular cortado que en un teléfono real no está cortado. Costó una vuelta entera
diagnosticar un desbordamiento que no existía.

La forma fiable es cargar `index.html` dentro de un `<iframe>` del ancho que se quiere
probar, servido por HTTP (con `file://` el navegador bloquea el acceso al DOM del iframe):

```
python -m http.server 8731
```

y una página de un solo uso con `<iframe width="390" src="index.html">`. Desde ella se
miden `document.documentElement.scrollWidth` contra `clientWidth` para detectar
desbordamientos, y la altura de cada `a` y `button` para los objetivos táctiles. Esos
archivos son de un solo uso y **no se guardan en el repositorio**.

Medido así, a 375, 415, 753 y 1009 px el `scrollWidth` es idéntico al ancho de la
ventana: no hay desbordamiento horizontal en ninguno.

**Un detalle que confunde al medir:** las *media queries* se evalúan **incluyendo** la
barra de desplazamiento, mientras `document.documentElement.clientWidth` la **excluye**.
Un iframe de 1320 px informa `clientWidth = 1305` pero sus media queries ven 1320, así que
`max-width: 1319px` no entra. No es un fallo, pero explica por qué la medición y la regla
CSS parecen contradecirse justo en el umbral.

## El barrido de los titulares

Es el único movimiento con autor de la página. Cada `<h1>` y `<h2>` lleva `data-wipe` y
entra descubriéndose de izquierda a derecha con `clip-path: inset(0 100% -0.3em 0)`, en
900 ms. Todo lo demás — `[data-reveal]` — se mueve menos a propósito: 16 px y 640 ms, para
acompañar y no competir.

**Detalle que costó un ciclo de depuración:** un elemento recortado a cero ancho no tiene
área de intersección, así que el `IntersectionObserver` nunca lo daba por visible y el
titular se quedaba invisible para siempre. Por eso el observador de los barridos **vigila
el contenedor del titular, no el titular**, y al entrar descubre todos los `[data-wipe]`
que hay dentro. Está comentado en `js/main.js`, junto a `wipeWatch`.

## Las cifras de `#preuves`

Los cuatro números — 70, 140, 210, 3 — están escritos en el HTML. El JS los pone a cero y
los cuenta en 1,1 s la primera vez que entran en pantalla. Si el navegador no tiene
`IntersectionObserver`, o el lector pidió menos movimiento, se ven directamente los
valores finales: no hay ningún estado en el que la cifra quede mal.

Vienen del repositorio, contados el 2026-09-09, no de la memoria:

| Cifra | De dónde sale |
|---|---|
| 70 variantes | `fam_param/pdf/*.pdf` y `fam_param/thumbnails/` |
| 140 DXF | `fam_param/dxf/` (70) + `fam_param/dxf_bend/` (70) |
| 210 fichas | `datasheets/out/{fr,en,es}/` — 70 fichas por idioma, más 1 catálogo cada uno |
| 3 idiomas | FR, EN, ES |

## El formulario

`index.html` lleva un formulario de cuatro campos. **No hay servidor detrás.** Al enviar,
el JS valida y construye un `mailto:` con el asunto y el cuerpo ya redactados: se abre el
cliente de correo del visitante y el mensaje **no sale hasta que él lo envía**. Eso está
dicho debajo del botón.

### El `mailto:` no basta solo

**Un navegador sin cliente de correo asociado descarta un `mailto:` en silencio**: ni
error, ni diálogo, ni nada. El botón se lee como roto. Es lo normal en Windows 11 cuando
se usa Gmail en el navegador y nunca se instaló Outlook. Ivan lo reportó el 2026-09-09 y
se reprodujo en la página publicada.

El arreglo no cambia el mecanismo, le añade una salida:

1. Se dispara el `mailto:` como antes.
2. **Perder el foco de la ventana es la única señal** de que un cliente abrió de verdad.
   A los 1500 ms se comprueba, contando también `document.visibilityState`.
3. **El mensaje aparece en la página en los dos casos**, en un `<textarea>` de solo
   lectura con un botón de copiar. Lo único que cambia es la entradilla: *« Si rien ne
   s'est ouvert… »* cuando sí abrió, *« Ce navigateur n'a pas de logiciel de courriel »*
   cuando no.

Así el visitante que estaba listo para escribir nunca se queda sin camino, que en una
página de puerta fría es justo el que no se puede perder.

### Los avisos guardan su idioma

`showNote` escribía en `note.textContent`, lo que **borraba los dos `<span lang>`** de
`#formNote`. Tras el primer envío la nota quedaba en un solo idioma y el selector ya no
la alcanzaba. Ahora escribe dentro de cada span, uno por idioma. Los `.error` de cada
campo sí son de un solo idioma por construcción: llevan un `data-error-key` y
`refreshErrors()` los repinta cuando se cambia de idioma.

### Si algún día se quiere recepción directa

Sin servidor detrás no hay más opciones que esta sin dar de alta un servicio ni exponer
una clave. Si se quiere, se cambia una sola línea:

- **Formspree** — `<form action="https://formspree.io/f/XXXX" method="POST">` y quitar el
  `event.preventDefault()` del envío.
- **Netlify Forms** — añadir `netlify` al `<form>` si el hosting es Netlify.

Ambas requieren cuenta en un tercero, y por eso no están puestas.

## Decisiones tomadas

- **Montserrat se carga desde Google Fonts.** La regla de «nada de CDN» del repositorio
  existe por las intranets industriales sin salida a Internet; una página pública no está
  en ese caso. Si se prefiere autoalojar la tipografía, hay que descargar los `.woff2` a
  `css/fonts/` y sustituir el `<link>` por `@font-face`. La pila de reserva
  (`Segoe UI`, `Arial`) ya está puesta.
- **Sin precios.** La pregunta «Combien ça coûte&nbsp;?» del FAQ responde que la cifra se
  fija después del diagnóstico. El rango del PILOTE que está en el plan de negocio no se
  publica.
- **Sin testimonios, sin logos de clientes, sin estadísticas.** La plantilla de referencia
  los lleva; aquí no, porque no existen y no se inventan.
- **El párrafo de la OIQ** está en el pie y también como última pregunta del FAQ.
- **Ninguna mención de Montréal.** Decisión de Ivan del 2026-09-08. No queda ni en el
  título, ni en la cabecera, ni en el pie, ni en las etiquetas Open Graph.
- **Las cuatro fotos son de Unsplash** (licencia libre para uso comercial), pasadas a
  escala de grises y recortadas con `PIL`, a 1800 px de ancho las bandas y 1100 px las
  verticales. Las primeras versiones venían de `prospection/` y medían 520-760 px: por eso
  se veían pixeladas. **`code.jpg` cambió de archivo**, no solo de tamaño: la original de la
  presentación no existe en alta resolución.
- **Equilibrio de las fotos.** Decisión de Ivan del 2026-09-08: solo la primera muestra
  maquinaria. Las otras tres son papel, código y un escritorio con planos e instrumentos,
  porque el servicio no se limita a automatizar máquinas. Las versiones de torno y de
  taller que hubo antes (`usinage.jpg`, `matiere.jpg`) se retiraron por eso.
- **La página sí enseña los casos del portafolio.** Decisión de Ivan del 2026-09-09.
  `prospection/` es puerta fría y por eso no lleva ninguno; la web es distinta, porque
  quien llega eligió venir y su siguiente pregunta es «¿y tú qué has hecho?». La sección
  `#preuves` lleva las cifras reales.
- **Sin la mención *« Démonstration — géométrie fictive »*.** Decisión de Ivan del
  2026-09-09, que extiende a la web la que ya tomó el 2026-09-01 para `presentation/`: esa
  nota al pie es justo lo que impide que un lector tome una familia inventada por un
  trabajo real. **El hecho no se pierde**, porque la entradilla de la sección lo dice en
  voz más firme: *« des outils complets, passés de bout en bout sur une géométrie inventée
  pour la démonstration »*. Se fue la nota, no la honestidad. El dossier del portafolio y
  las páginas de cada caso **sí la conservan**.
- **`#preuves` no lleva ninguna imagen de los casos 2 y 3.** Los planos, los DXF y las
  miniaturas salen de SOLIDWORKS Maker, y el `CLAUDE.md` de la raíz prohíbe usar material
  de Maker para promoción comercial. Recortar la marca de agua no es una opción. La
  sección se sostiene sobre cifras y entregables descritos, que además pesan más que una
  miniatura. **Si algún día se resuelve la licencia, aquí es donde entrarían las
  imágenes.**
- **Ivan aparece como persona**, en la sección `.who`: que dibuja en CAO a diario, que
  conoce chapa, tolerancias y planos de taller, y que escribe él mismo las herramientas.
  Sin nombrar ningún empleador y sin ninguna cifra de años. Decisión del 2026-09-09.
- **Fuera las etiquetas en versalitas sobre cada titular.** Eran ocho y no decían nada que
  el titular de debajo no dijera más fuerte. La clase `.eyebrow` sobrevive solo donde
  rotula algo que no es un titular: las dos columnas del pie.
- **Las tres tarjetas del problema dejaron de ser tarjetas**, y perdieron sus `01 02 03`:
  recopier, revérifier y recommencer son simultáneos, no una secuencia. Ahora son tres
  columnas con un filete negro encima que crece al entrar. En `#preuves` los números sí se
  conservan, porque ahí sí hay tres casos distintos que enumerar.
- **La página habla en primera persona del plural.** Decisión de Ivan del 2026-09-09:
  « nous écrivons », « nous lisons », « Décrivez-nous la tâche ». Antes hablaba en
  singular, a nombre propio.
  - **El motivo, y es lo que hace que el plural sea honesto:** Ivan puede incorporar a
    otras personas de otras disciplinas durante un encargo. « Nous » deja ese sitio
    abierto en vez de prometer un equipo permanente. No inventa ninguna empresa ni ningún
    nombre comercial, así que no choca con la regla de no inventar una empresa; matiza
    « Ivan opera a nombre propio » de `fam_param/CLAUDE.md`, que sigue siendo cierto
    para la facturación y la responsabilidad profesional.
  - **Las preguntas del FAQ siguen en singular**, porque ahí quien habla es el visitante:
    « Est-ce que **je** dois changer de logiciel ? », « Est-ce que **mes** fichiers sortent
    de l'entreprise ? ». Cambiarlas habría hecho que el lector se preguntara por los
    archivos de otro.
  - El párrafo legal del pie **conserva el nombre en tercera persona** (« Ivan Perez
    n'exerce aucune activité réservée »): es una declaración formal y nombrar a la persona
    responsable es deseable, no un descuido.
  - La sección `.who` perdió « Je m'appelle Ivan Perez » y su titular pasó de « Celui qui
    lit votre plan est celui qui écrit l'outil » a « Nous lisons votre plan, et nous
    écrivons l'outil ». **Es donde más se pierde**: el argumento original era justamente
    que se trata de una sola persona. El nombre sigue en la cabecera, el pie y el contacto.
- La marca **IP** en cuadrado es la misma propuesta que en `prospection/`, y sigue
  pendiente de la decisión de Ivan.

## Dónde está alojada

**GitHub Pages, en <https://ivanperezdesigner.github.io/automation/>**, servida desde el
repositorio `ivanperezdesigner/automation`. La carpeta `site/` **es** ese repositorio, así
que **cada `git push` a `main` publica**. No hay build ni paso intermedio.

El intento anterior en Cloudflare Workers (`automat.joseivanperezdiaz1.workers.dev`)
**devuelve 404** y quedó abandonado. Si no se va a usar, conviene borrarlo para que no
quede un enlace muerto circulando.

### Alternativas, si alguna vez se cambia

Recomendación anterior: **Cloudflare Pages**. Gratis sin caducidad, sin tarjeta, HTTPS y CDN
incluidos, y da un subdominio del tipo `ivan-perez.pages.dev`. Se sube arrastrando la
carpeta `site/` en el panel, o conectando un repositorio. Cuando exista un dominio propio,
se apunta desde el mismo panel sin rehacer nada.

Alternativas equivalentes: **Netlify** (`.netlify.app`, arrastrar y soltar, límite de
100 GB al mes) y **GitHub Pages** (`.github.io`, exige repositorio público). Las tres
sirven archivos estáticos y ninguna necesita build para esta página.

## Puntos abiertos

- **Falta el dominio.** El `<meta property="og:url">` y un `favicon.ico` se añaden cuando
  se sepa la dirección.
- **Sin analítica.** No hay ningún script de seguimiento, ni banner de cookies, porque no
  hace falta ninguno mientras no se añada.
- **Una sola URL para las dos lenguas.** El botón cambia el idioma en la misma página, sin
  recargar y sin `/en/`. Si algún día hace falta que Google indexe la versión inglesa por
  separado, habría que generar dos archivos: es otro trabajo.
- El acento verde y las bandas grafito contradicen la escala de grises sin color de
  `ballonnage/DESIGN.md`, la misma contradicción ya abierta en `presentation/` y
  `prospection/`.
- **El detector de `/impeccable` deja seis avisos, los seis descartados a conciencia.**
  Dos por Montserrat («fuente sobreexpuesta»): es la tipografía de marca del proyecto, y
  la marca manda. Uno por el filete de 3 px a la izquierda de `.step`: ahí es el indicador
  de pestaña activa de una lista vertical, no un adorno de tarjeta. Tres por transiciones
  de `padding` y `max-height`: la cabecera que se compacta cambia de estado una vez, no en
  cada fotograma, y el acordeón necesita `max-height`. La barra de progreso sí se
  corrigió: ahora escala con `transform` en vez de cambiar de ancho, porque esa sí se
  repintaba en cada fotograma de scroll.
- **El caso 4 (anidado) no aparece.** Sigue abierto y no tiene resultados que enseñar.
  Cuando los tenga, entra como cuarto bloque de `#preuves` y las cifras de arriba suben a
  cinco columnas o se reagrupan.
