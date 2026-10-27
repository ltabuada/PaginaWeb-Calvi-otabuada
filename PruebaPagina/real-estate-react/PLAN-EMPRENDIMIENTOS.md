# Plan — Emprendimientos interactivos

Estado: **propuesta, nada implementado.** Documento para decidir y para compartir
con la desarrolladora.

---

## De dónde sale

La idea original fue: al entrar a un emprendimiento, ver un plano 3D del
edificio y poder tocar un departamento concreto —"el contrafrente del 2° piso"—
para ir a sus fotos.

Es viable y es un patrón conocido del rubro (se lo llama *selector de unidades*
o *stacking plan*). Pero al revisarlo aparecieron dos cosas que cambian el
orden de las prioridades:

1. **Los datos no existen.** Un emprendimiento hoy es una sola entidad con un
   solo conjunto de fotos. No hay departamentos.
2. **En pozo no hay fotos por unidad.** Un edificio sin construir no tiene fotos
   del 2° contrafrente. Si alguien toca ahí y no hay nada, la función se cae
   sola.

De ahí sale la división de este plan: **cada estado del emprendimiento muestra
lo que realmente existe**.

| Estado | Qué existe de verdad | Pieza |
|---|---|---|
| En pozo | Render, planos | Recorrido por scroll |
| En construcción | Avance de obra | Recorrido por scroll |
| A estrenar | Unidades terminadas, fotos | Selector de unidades |

Los cuatro emprendimientos cargados hoy cubren los tres estados (dos en
construcción, uno en pozo, uno a estrenar), así que ninguna de las dos piezas
quedaría sin uso.

---

## Pieza 1 — Recorrido por scroll (prioridad)

Para los emprendimientos **en pozo** y **en construcción**.

Al entrar, el visitante ve el proyecto y, a medida que baja, la estructura
avanza mientras aparece la información: ubicación y entorno, etapas de obra con
sus fechas, tipologías disponibles, condiciones de pago, entrega estimada.

### Técnicas posibles

| Técnica | Cómo es | Peso | Veredicto |
|---|---|---|---|
| Secuencia de imágenes | El scroll avanza cuadro por cuadro, estilo Apple | 3-4 MB con 30 cuadros | Lo más vistoso, pesado en celular |
| **Capas SVG reveladas** | El edificio en vector por capas: cimientos, estructura, pisos, fachada | Kilobytes | **Recomendada** |
| Scroll-driven CSS nativo | `animation-timeline: view()` | — | Firefox todavía lo tiene tras un flag; necesita respaldo |

La opción de capas SVG pesa nada, se ve nítida en cualquier pantalla y se anima
suave. El proyecto ya usa ese lenguaje: los dos blueprints de la home son
exactamente eso.

### Sobre generar las fases con IA

Se evaluó y **no se recomienda generar las fases como imágenes separadas**, por
dos razones distintas.

**Consistencia.** Pedirle a una IA cinco imágenes del mismo edificio en cinco
fases devuelve cinco edificios distintos: cambian ventanas, balcones,
proporciones. En un scroll eso se compara cuadro contra cuadro y se nota.

**Honestidad, que es lo más importante.** Quien compra en pozo pone dinero sobre
algo que todavía no existe. Imágenes del "avance de obra" generadas por IA se
leen con facilidad como el estado real de la obra. Es la clase de cosa que puede
derivar en un reclamo de un comprador.

**Qué hacer en su lugar:**

- El render oficial del proyecto, que la desarrolladora ya tiene.
- Fotos reales del avance, fechadas. Las desarrolladoras las sacan todos los
  meses, y en pozo son lo que más confianza genera: muestran que la obra avanza.
- La parte futura, dibujada como plano o estructura. Se lee claramente como
  proyección y no como fotografía.
- Si se usa IA, que sea para **una sola** pieza —el render base— y que el avance
  se resuelva revelando esa misma imagen progresivamente. Consistente por
  construcción.

### Datos que hay que cargar

Por emprendimiento, una lista de hitos:

```
hitos[]
 ├── fecha            "Marzo 2026"
 ├── titulo           "Hormigón hasta el 4° piso"
 ├── descripcion
 ├── imagen           (foto real del avance, opcional)
 └── cumplido         sí / no
```

Entre 4 y 8 filas por proyecto. Es poco y es realista de mantener, y se agrega
al panel sin rehacerlo.

---

## Pieza 2 — Selector de unidades (después)

Para los emprendimientos **a estrenar**, donde las unidades existen y se pueden
fotografiar.

El visitante ve el edificio, elige un departamento y llega a sus fotos, su
plano y su precio.

### Tres formas de resolverlo visualmente

| Forma | Qué necesita | Esfuerzo |
|---|---|---|
| **Corte esquemático** | Solo los datos. Cada piso una fila, cada depto un bloque, pintado según disponibilidad | Bajo |
| Render con zonas clickeables | Una imagen por edificio, más marcar los polígonos a mano | Medio |
| 3D navegable (Three.js) | Un modelo `.glb` por edificio, de varios MB | Alto |

Se recomienda empezar por el **corte esquemático**: se genera solo de los datos,
no depende de conseguir renders, anda bien en celular y se entiende a la
primera. Si después aparecen los renders, se evoluciona sin rehacer los datos.

El 3D navegable queda descartado por ahora: cada edificio necesitaría su propio
modelo, y en celular con datos móviles se siente. La "generación de 3D desde una
foto" no sirve acá: produce una malla aproximada, y para esto hace falta que
cada balcón sea una zona clickeable con precisión.

### Datos que hay que cargar

```
emprendimiento
 └── unidades[]
      ├── piso, letra            2° "B"
      ├── orientación            frente / contrafrente / lateral
      ├── ambientes, m², dormitorios, baños
      ├── precio
      ├── estado                 disponible / reservada / vendida
      ├── imagenes[]
      └── plano
```

**Este es el trabajo grande, y no es el 3D.** Son 20-40 filas por edificio, cada
una con fotos. Implica modelo de datos nuevo, una tabla anidada en el panel de
administración —hoy un emprendimiento se carga con un formulario simple— y que
alguien efectivamente las cargue y las mantenga actualizadas.

Un dato importante: **el modelo de unidades sirve para las tres formas
visuales**. Elijas la que elijas, ese trabajo no se pierde.

---

## Orden sugerido

1. **Recorrido por scroll**, con un solo emprendimiento de prueba. Sirve para
   tres de los cuatro proyectos cargados, pide pocos datos y no depende de
   conseguir fotos por departamento.
2. Si funciona, extenderlo al resto y agregar los hitos al panel.
3. **Selector de unidades**, recién cuando haya un edificio terminado con las
   fotos por unidad realmente cargadas.

---

## Decisiones pendientes

- **¿Hay fotos reales del avance de obra?** Define si el recorrido se alimenta
  de material real o queda solo con el render y los planos.
- **¿Quién carga y mantiene los datos?** Si las unidades no se van a actualizar,
  el selector va a mostrar un edificio medio vacío, que es peor que no tenerlo.
- **¿La desarrolladora entrega renders o modelos 3D?** Cambia qué forma visual
  conviene para la Pieza 2.
- **Para empezar la prueba:** elegir un emprendimiento y juntar el material que
  exista —render, fotos de obra, planos, listado de unidades—.

---

## Alcance que este plan no toca

Firebase, los contextos de datos y el panel de administración actual siguen como
están hasta que se decida avanzar. Las dos piezas descritas requieren cambios en
el panel, y están detallados arriba, pero no se tocó nada todavía.
