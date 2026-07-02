# Configuración necesaria en Firebase (hacer ANTES de publicar)

La app ahora requiere inicio de sesión con correo y contraseña. Sin estos pasos,
**nadie podrá entrar**. Todo se hace en <https://console.firebase.google.com>
→ proyecto **formulario-operativo-luna-gi**.

## 1. Habilitar el inicio de sesión por correo

1. En el menú izquierdo: **Compilación → Authentication**.
2. Pestaña **Sign-in method** (Método de acceso).
3. Habilita **Correo electrónico/contraseña** (solo el primer switch; el de
   "vínculo de correo" no es necesario) y guarda.

## 2. Crear las cuentas del personal

1. En **Authentication → Users → Agregar usuario**.
2. Crea un usuario por persona (correo + contraseña).
   Sugerencia: usa correos reales para poder restablecer contraseñas después.
3. Cualquier usuario creado aquí puede entrar tanto a los formularios
   (`index.html`) como al panel administrativo (`bitacora.html`).

## 3. Publicar las reglas de seguridad de Firestore

1. En **Compilación → Firestore Database → Reglas**.
2. Borra las reglas actuales y pega el contenido completo del archivo
   [`firestore.rules`](firestore.rules) de este repo.
3. Pulsa **Publicar**.

Con esto, solo usuarios autenticados pueden leer/escribir. Antes las
colecciones quedaban abiertas a cualquiera que tuviera la URL.

**Excepción**: la colección `bitacora` permite *crear* registros sin login,
para que el Cotizador (<https://lunagrupoinmobiliario.github.io/Cotizador_LUNAGI/>)
pueda registrar accesos/usos sin implementar login. Ojo: el Cotizador publicado
hoy NO tiene código de Firebase, así que actualmente no registra nada; si
quieres ese rastreo, hay que agregarle el snippet de bitácora.

## 4. (Opcional pero recomendado) Restringir la API key

1. En <https://console.cloud.google.com/apis/credentials> (mismo proyecto).
2. Edita la API key del proyecto → **Restricciones de aplicaciones** →
   "Referentes HTTP" → agrega:
   - `https://lunagrupoinmobiliario.github.io/*`
   - `http://localhost:*` (para pruebas)

## 5. Publicar el sitio

Sube `index.html`, `bitacora.html`, `sw.js` y `firestore.rules` al repo
`lunagrupoinmobiliario/OPERATIVOS_FORMULARIO` (rama `main`). GitHub Pages se
actualiza solo en 1-2 minutos.

## Notas de esta versión

- **Se corrigió un bug crítico**: los scripts de Firebase estaban dentro del
  bloque `<style>`, por lo que en producción Firebase nunca cargaba (el módulo
  de Vehículos no podía guardar y la bitácora quedaba vacía).
- Los botones **Excel** de Maquinaria y Gastos estaban rotos; ya funcionan.
- El **PDF** ahora es un archivo real descargable (con tablas, totales y las
  fotos de tickets en páginas anexas), ya no la vista de impresión.
- **Guardar en la Nube**: Maquinaria y Gastos ahora pueden guardarse en
  Firestore; se consultan y exportan desde `bitacora.html` (pestañas
  Maquinaria / Gastos / Vehículos). Las fotos NO se suben (viajan solo en el
  PDF) para mantener el plan gratuito.
- **Borrador automático**: lo capturado se guarda localmente en el teléfono;
  si se cierra el navegador, al volver se restaura (fotos incluidas).
- El acceso por PIN de `bitacora.html` fue reemplazado por el login real.
  El PIN del historial de vehículos dentro de la app sigue siendo `12345`
  (es un candado suave para el personal; el acceso real ya lo protege el login).
