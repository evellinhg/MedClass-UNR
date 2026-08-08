# Simulador IAMCEST · Caso 1
## Guía de implementación en tu sitio

**Archivos del paquete**

| Archivo | Qué es |
|---|---|
| `simulador-iamcest-caso01.html` | El simulador completo. Un solo archivo, sin dependencias de build. Incluye el expediente docente embebido. |
| `CASO_01_IAM_CEST_simulador_v2_realista.md` | El caso clínico completo en texto (20 etapas, vista del jugador + clave del tutor). Para imprimir, para el instructor o para usarlo sin la app. |
| `README-INTEGRACION.md` | Este documento. |

El HTML pesa ~79 KB y **funciona abriéndolo directamente**, sin servidor. Lo único que pide a internet son las tipografías de Google Fonts; si no hay conexión, cae a fuentes del sistema y sigue funcionando.

---

## 1. Instalación mínima

Subí `simulador-iamcest-caso01.html` a tu servidor y enlazalo. Nada más.

```
/simuladores/simulador-iamcest-caso01.html
```

---

## 2. Incrustarlo dentro de una página

La forma recomendada: iframe. Aísla los estilos del simulador de los de tu sitio.

```html
<iframe
  src="/simuladores/simulador-iamcest-caso01.html"
  style="width:100%;height:900px;border:0;border-radius:6px"
  title="Simulador clínico: IAMCEST"
  allow="autoplay">
</iframe>
```

**Altura mínima recomendada: 900 px en escritorio.** Por debajo de 700 px el panel de signos vitales queda apretado. En móvil el diseño se reorganiza solo en una columna.

---

## 3. Configuración

Abrí el archivo y buscá el bloque `CONFIG` (arriba del `<script>`, línea ~285). Es lo único que necesitás tocar.

```js
const CONFIG = {
  velocidadInicial : 4,      // 1, 4 o 10 — multiplicador del reloj clínico
  sonidoInicial    : false,  // los navegadores exigen un clic antes de reproducir audio
  saltarIntro      : false,  // true = arranca directo, sin pantalla de bienvenida
  mostrarExpediente: true,   // false = oculta el botón "📄 Caso" al estudiante
  autoIniciar      : true,
  dificultad       : 1.0,    // 0.6 pregrado · 1.0 estándar · 1.5 residencia
  alFinalizar      : null,
  emitirPostMessage: true,
  origenPermitido  : '*'     // poné tu dominio en producción
};
```

**`mostrarExpediente: false` es importante.** El expediente contiene todas las respuestas. Dejalo en `true` solo en la versión del instructor.

**`dificultad`** multiplica el drenaje de puntos por tiempo. Con `0.6` el alumno de pregrado tiene margen para dudar; con `1.5` cada segundo pesa.

---

## 4. Recibir los resultados

Cuando el caso termina, el simulador emite un objeto con todo el desempeño. Tres formas de capturarlo, según cómo lo hayas montado.

### a) Callback directo (si el HTML está en tu propia página)

```js
CONFIG.alFinalizar = function (r) {
  fetch('/api/resultados', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(r)
  });
};
```

### b) postMessage (si está en un iframe)

```html
<script>
window.addEventListener('message', function (e) {
  // en producción: if (e.origin !== 'https://tusitio.com') return;
  if (e.data && e.data.tipo === 'simulador-iamcest:finalizado') {
    console.log('Resultado:', e.data.resultado);
    // guardalo, mostralo, mandalo a tu LMS
  }
});
</script>
```

### c) Evento del DOM

```js
document.addEventListener('simulador-iamcest:finalizado', e => {
  console.log(e.detail);
});
```

### Estructura del resultado

```json
{
  "caso": "IAMCEST-01",
  "version": "3.1",
  "desenlace": "CAMINO 1 · VICTORIA PERFECTA",
  "camino": 1,
  "bpFinal": 92,
  "reservaExcelencia": 248,
  "omisiones": 0,
  "iatrogenias": 0,
  "isquemiaTotalMin": 126,
  "puertaBalonMin": 76,
  "miocardioSalvable": 58,
  "vdIdentificado": true,
  "reperfundido": true,
  "soporteVentilatorio": "aire",
  "tiempoPerdidoMin": 4,
  "fallecido": false,
  "dificultad": 1,
  "registro": [ { "h": "04:02", "t": "...", "c": "evt" } ],
  "finalizadoEn": "2026-08-07T12:00:00.000Z"
}
```

El campo `registro` es la traza completa de decisiones en orden cronológico. Sirve para el debriefing: podés reconstruir exactamente qué hizo el alumno y cuándo.

---

## 5. Controlarlo desde tu sitio

```js
const sim = window.SimuladorIAMCEST;   // dentro del iframe: iframe.contentWindow.SimuladorIAMCEST

sim.iniciar(4);        // arranca a velocidad ×4
sim.pausar();
sim.reanudar();
sim.estado();          // { bp, pe, minuto, reperfundido, ritmo, omisiones, iatrogenias }
sim.verExpediente();   // abre el documento docente
sim.finalizar();       // fuerza el desenlace
sim.reiniciar();
sim.resultado;         // null hasta que termine
```

Con `sim.estado()` podés hacer un panel de seguimiento en vivo si estás corriendo una sesión con varios alumnos en simultáneo.

---

## 6. Ajustar la fisiología

Todo el motor está en la función `physics()` (línea ~840), con los comentarios en español. Los coeficientes que más vas a querer mover:

| Qué controla | Dónde | Valor actual |
|---|---|---|
| Velocidad de pérdida de miocardio | `S.salv -= (S.simT<7200?0.55:0.30)` | 0,55 %/min las primeras 2 h |
| Momento del bloqueo AV | `S.avAt` | T+96 min |
| Retardo de la FV de reperfusión | `S.vfPending = S.simT+70` | 70 s post-ICP |
| Hipotensión tardía por VD | `S.vdHypoAt = S.simT+6*3600` | 6 h post-ICP |
| Espera del hemodinamista | `S.cathCalled+28*60` | 28 min |
| Magnitud del colapso por nitrato | `mg = VD?68:14` | −68 mmHg |

Y en `MENU` está el catálogo completo de acciones. Cada ítem tiene esta forma:

```js
{ l:'Nombre visible', m:3, f(){ sc(10,'texto del feedback'); } }
```

`l` es la etiqueta, `m` los minutos que consume, `f` lo que ocurre. `sc(puntos, texto)` ajusta el score y escribe en el registro. Agregar un fármaco nuevo son tres líneas.

**Para dejar una sección vacía** (como Antibióticos o Hemoderivados), poné `i: []`. El simulador la muestra con el mensaje "Sin opciones para este paciente" en lugar de ocultarla — que es justamente lo que enseña.

---

## 7. Crear un caso nuevo con el mismo motor

La arquitectura separa motor de contenido. Para un caso distinto:

1. Duplicá el archivo.
2. Cambiá `VD = true` por la variable de tu patología.
3. Reescribí el objeto `MENU` con el catálogo que corresponda.
4. Ajustá los eventos programados en `physics()`.
5. Reescribí el expediente en `#ovCase` y los cuatro desenlaces en `finish()`.

Los generadores de onda (`ecgAt`, `plethAt`, `ch4At`), el barrido del canvas, el sistema de alarmas y el scoring se reutilizan sin tocar nada.

---

## 8. Compatibilidad

Funciona en Chrome, Firefox, Safari y Edge actuales, escritorio y móvil. Usa Canvas 2D y Web Audio, ambos soportados desde hace años. No usa `localStorage` ni almacenamiento del navegador, así que no hay banner de cookies que gestionar.

El audio no suena hasta que el usuario hace clic en algún lugar de la página: es una política de los navegadores, no un error. Por eso el botón 🔊 arranca apagado.

---

## 9. Antes de publicar

- Cambiá `origenPermitido` de `'*'` a tu dominio.
- Poné `mostrarExpediente: false` en la versión del estudiante.
- Mantené visible el aviso de uso educativo que ya viene en la pantalla inicial y al pie del expediente.
- Si vas a registrar resultados con nombre del alumno, revisá tu política de datos: el objeto `registro` contiene la traza completa de decisiones, que es información sensible en un contexto evaluativo.

---

**Aviso.** Material educativo y de simulación. Paciente y escenario ficticios. Las conductas siguen el consenso general de las guías de manejo del IAMCEST, pero no sustituyen los protocolos institucionales vigentes, el vademécum local ni el juicio clínico.
