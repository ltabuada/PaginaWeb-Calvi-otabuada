# Puesta en marcha

Tres pasos de consola que hay que hacer una sola vez. El código ya está listo y
esperando estos datos.

---

## 1. Cloudinary (imágenes y videos)

**Por qué:** el proyecto de Firebase está en plan **Spark**, y desde octubre de
2024 Cloud Storage requiere plan Blaze. Por eso las subidas nunca funcionaron.
Firestore y Authentication sí andan gratis en Spark, así que solo el media se
movió afuera.

1. Crear cuenta free en [cloudinary.com](https://cloudinary.com) (no pide tarjeta).
2. En el Dashboard, copiar el **Cloud name**.
3. Settings (engranaje) → **Upload** → *Upload presets* → **Add upload preset**:

   | Campo | Valor |
   |---|---|
   | Upload preset name | `calvi_web` |
   | Signing mode | **Unsigned** ← si queda en *Signed*, la subida devuelve 401 |
   | Asset folder | `calvi` |
   | Generated public ID | **Auto-generate an unguessable public ID value** |
   | Generated display name | Use the filename of the uploaded file |
   | Allowed formats | `jpg,jpeg,png,webp,gif,avif,heic,heif,mp4,mov,m4v,webm` |
   | Max file size | `104857600` (100 MB) |
   | Return delete token | **ON** |
   | Incoming transformation *(opcional)* | `c_limit,w_2560,q_auto` |

   **Lo único imprescindible es `Signing mode: Unsigned`.** El public ID
   autogenerado evita colisiones y nombres con espacios o tildes.

   Los nombres y la ubicación de los campos cambian con los rediseños de
   Cloudinary; los tres últimos suelen estar en pestañas o secciones plegadas
   del mismo formulario. **Si no los encontrás, guardá igual: no son
   bloqueantes.**

   | Si falta | Qué se pierde |
   |---|---|
   | Max file size | Nada: el plan free ya topea en 10 MB / 100 MB, y el código valida el tamaño antes de subir |
   | Allowed formats | Solo protege contra alguien que llame a la API salteándose la página; el código ya filtra formatos |
   | Return delete token | El botón ✕ saca la imagen de la propiedad igual, pero el archivo queda en Cloudinary hasta limpiarlo a mano |

4. Completar en el archivo `.env`:  ← **ya hecho** (cloud name `dvwodnvfu`, preset `calvi_web`)

   ```
   VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=calvi_web
   ```

5. **Reiniciar el dev server.** Vite lee el `.env` solo al arrancar; si no lo
   reiniciás, la URL sale con `undefined` y da 404.

6. Settings → Account → activar **alertas de uso** al 80% de la cuota.

### Lo que hay que saber del preset unsigned

Un preset unsigned es, literalmente, un endpoint de escritura público: cualquiera
que lea el código del sitio puede subir archivos a la cuenta. **No se puede cerrar
del todo sin un backend que firme las subidas**, y este proyecto no tiene backend.
Lo que sí mitiga el riesgo es la configuración de arriba: lista blanca de formatos,
tope de tamaño, carpeta dedicada y alertas de cuota. El daño máximo posible es
consumo de cuota, no exposición de datos.

### Archivos huérfanos

Al borrar una propiedad, sus imágenes quedan en Cloudinary. Borrarlas
automáticamente requiere el API Secret, que no puede estar en el navegador.

- **Sí se puede deshacer una subida recién hecha:** el botón ✕ de cada preview
  borra el archivo de Cloudinary si pasaron menos de 10 minutos.
- **Para el resto:** limpieza manual ocasional desde el Media Library de
  Cloudinary, en las carpetas `calvi/propiedades` y `calvi/emprendimientos`.
  Con el plan free hay margen de sobra.

---

> **Estado:** paso 1 completo y verificado — imágenes y videos suben correctamente.

## 2. Firebase Authentication (login del admin)

**Por qué:** hasta ahora el usuario y la contraseña estaban escritos en el código
que se descarga al navegador, y las reglas de la base tenían que estar abiertas
para que el panel funcionara. Cualquiera podía borrar todas las propiedades.

**Links directos al proyecto** (entrar con la cuenta de Google que lo creó):

| Sección | Link |
|---|---|
| Proveedores de login | [authentication/providers](https://console.firebase.google.com/project/calvinotabuadapropiedade-9ace4/authentication/providers) |
| Usuarios | [authentication/users](https://console.firebase.google.com/project/calvinotabuadapropiedade-9ace4/authentication/users) |
| Firestore (datos) | [firestore/data](https://console.firebase.google.com/project/calvinotabuadapropiedade-9ace4/firestore/data) |
| Reglas | [firestore/rules](https://console.firebase.google.com/project/calvinotabuadapropiedade-9ace4/firestore/rules) |

1. **Authentication** → si es la primera vez, aparece una pantalla de bienvenida:
   tocar *Get started* / *Comenzar*. Recién después se ve la pestaña de proveedores.
2. Pestaña **Sign-in method** → **Email/Password** → *Enable* → Save.
   (No habilitar "Email link".)
3. Pestaña **Users** → **Add user** → email real del admin + una contraseña
   fuerte de gestor de contraseñas.
4. **Copiar el User UID** de esa fila: hace falta en el paso 3.

> Si intentás entrar antes de hacer esto, el login te va a decir
> *"Falta activar Authentication en la consola de Firebase"*.

No hay formulario de registro en la app, y es a propósito: los usuarios se crean
a mano desde la consola.

---

## 3. Reglas de Firestore

> **Hacer esto último**, después de confirmar que el login nuevo funciona. Si se
> publican antes, el panel se bloquea a sí mismo. El sitio público sigue
> funcionando en todo momento.

1. Consola → [**Firestore Database** → Data](https://console.firebase.google.com/project/calvinotabuadapropiedade-9ace4/firestore/data)
   → *Start collection* → Collection ID `admins`.

   - **Document ID:** pegar el UID exacto del usuario. La consola ofrece un botón
     **Auto-ID**: ⚠️ **no usarlo**, el ID tiene que ser el UID.
   - **Agregar al menos un campo** antes de guardar, por ejemplo
     `rol` (string) = `admin`.

   ⚠️ **Un documento sin ningún campo no existe** para las reglas. Si se crea
   vacío, el admin queda afuera con un error de permisos desconcertante.

   > Este documento **solo se puede crear desde la consola**, que opera con
   > privilegios de servidor. Las reglas cierran `admins` a todos los clientes a
   > propósito: si se pudiera escribir ahí desde el navegador, cualquiera podría
   > auto-nombrarse admin.

2. Consola → Firestore Database → pestaña **Rules** → pegar el contenido de
   [`firestore.rules`](./firestore.rules) → **Publish**.

   O con la CLI:
   ```
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules
   ```

El archivo `firestore.rules` del repo es la fuente de verdad versionada.

### Qué habilitan esas reglas

| Quién | Puede |
|---|---|
| Cualquier visitante | Leer propiedades y emprendimientos; mandar el formulario de contacto |
| Nadie sin login | Crear, editar o borrar propiedades; leer las consultas recibidas |
| Admin (UID en `admins`) | Todo |

---

## Qué es secreto y qué no

**No son secretos** (van al navegador por diseño): toda la config de Firebase
—incluida la `apiKey`, que es un identificador de proyecto, no una credencial—
y el `cloud_name` / `upload_preset` de Cloudinary. La seguridad viene de
Authentication + las reglas, no de esconder esos valores.

**Sí son secretos, nunca en el repo:** el API Secret de Cloudinary, la contraseña
del admin, y cualquier service account JSON.

---

## Cómo probar que quedó bien

```bash
npm run dev
```

- **Imágenes:** subir 3-4 fotos, incluyendo una de más de 10 MB. Las válidas
  suben; la grande se rechaza al instante con un mensaje, sin llegar a la red.
- **Videos:** subir un `.MOV` del iPhone — el archivo que antes colgaba el panel
  para siempre. Ahora sube directo. En la propiedad publicada, el `src` del video
  termina en `.mp4` aunque hayas subido un `.mov`: esa es la prueba de que
  Cloudinary lo transcodificó.
- **Link de YouTube:** pegarlo y tocar "Agregar link". Al darle play, la barra de
  direcciones no cambia — se reproduce dentro de la página.
- **Sesión:** entrar al panel y apretar F5. Tiene que aparecer "Verificando
  sesión..." y quedarse adentro. Si te saca al login, algo anda mal.
- **Reglas:** deslogueado, navegar el sitio público entero sin errores en la
  consola del navegador, y mandar el formulario de contacto.
