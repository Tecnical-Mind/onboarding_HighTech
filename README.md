Actúa como un experto en Google Apps Script y la API de Notion. Necesito que crees un script que automatice la creación de un Google Form, su correspondiente Google Sheet de respuestas, y que envíe los datos en tiempo real a una base de datos de Notion cuando un usuario responda.

Quiero que sigas exactamente la estructura robusta del siguiente diseño:
1. Reutilización de archivos: Definir constantes al inicio para FORM_ID_FIJO y SS_ID_FIJO. Si tienen valores, el script debe reutilizarlos mediante FormApp.openById() y SpreadsheetApp.openById(). Si están vacías (''), debe crearlos desde cero la primera vez y guardar los IDs en PropertiesService.getScriptProperties().
2. Tolerancia a fallos: Al construir el formulario, usa un bloque try/catch. Si Google falla a mitad de camino, envía el formulario incompleto a la papelera (DriveApp.getFileById().setTrashed(true)) y lanza un error explicativo.
3. Integración con Notion:
   - Usa un disparador (trigger) onFormSubmit vinculado a una función llamada 'enviarRespuestaANotion'.
   - Evita disparadores duplicados borrando los existentes antes de crear uno nuevo.
   - Extrae el Token de Notion de manera segura usando PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN').
   - Mapea las respuestas del formulario a los tipos de datos correctos de la API de Notion (versión '2022-06-28').
4. Función de prueba: Incluye una función 'probarConexionNotion' para verificar la conexión enviando una fila de prueba antes de activar el formulario real.

Aquí están los datos específicos para este caso:

- Nombre del Formulario: "[Escribí acá el nombre del formulario, ej: Registro de Clientes]"
- ID de la Base de Datos de Notion: "[Pegá acá el ID largo de la base de Notion]"
- Descripción del Formulario: "[Escribí la descripción del formulario]"

Preguntas del Formulario y Mapeo a Notion:
[Listá acá tus preguntas y cómo se llaman las columnas en Notion. Por ejemplo:]
1. Pregunta: "Nombre y apellido" (Texto, Obligatorio) -> Propiedad Notion: "Name" (tipo title)
2. Pregunta: "Teléfono" (Texto, Obligatorio, validar que sean solo números) -> Propiedad Notion: "WhatsApp" (tipo phone_number)
3. Pregunta: "¿Acepta los términos?" (Checkbox con opción 'Sí', Obligatorio) -> Propiedad Notion: "Confirmó" (tipo checkbox)

Además del mapeo de preguntas, la API de Notion debe recibir la "Fecha de respuesta" en una propiedad de tipo date usando el timestamp de la respuesta en formato ISO.

Por favor, escribe el código completo en español, bien comentado y con las instrucciones de uso al principio, tal como en el modelo de referencia.
