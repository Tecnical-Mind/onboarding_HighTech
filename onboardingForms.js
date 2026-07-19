/**
 * Crea (la primera vez) o reutiliza (las siguientes veces) el Google Form
 * de onboarding para alquilar una casa, con su planilla de respuestas.
 *
 * CÓMO USARLO:
 * 1. Ir a https://script.google.com → "Nuevo proyecto"
 * 2. Borrar el código de ejemplo que aparece y pegar todo este archivo
 * 3. Guardar (Ctrl+S / Cmd+S)
 * 4. Arriba, en el desplegable de funciones, elegir "crearFormularioOnboarding"
 * 5. Click en "Ejecutar" (▶). La primera vez va a pedir autorización
 *    de tu cuenta de Google — es normal, aceptá los permisos.
 * 6. Ir a "Ver" → "Registros de ejecución" (o Ctrl+Enter) para ver
 *    los links generados: el formulario, el link de edición y la planilla.
 *
 * A partir de la 2ª ejecución, el script YA NO crea un Form ni una
 * planilla nuevos: reutiliza los mismos (guarda sus IDs en las
 * "Propiedades del script"), así que los 3 links de arriba no cambian más.
 *
 * Si en algún momento querés forzar uno completamente nuevo, corré antes
 * la función "resetFormularioOnboarding" (ver más abajo) y después volvé
 * a ejecutar "crearFormularioOnboarding".
 */
// ============================================================
//  IDs FIJOS del formulario y la planilla que YA existen.
//  Con esto el script SIEMPRE reutiliza estos dos archivos,
//  aunque lo pegues en un proyecto nuevo. Nunca crea otros.
// ============================================================
const FORM_ID_FIJO = '1qqhvPuLogA7Y70ABA2qNal2jG21wNlRfXEVH-Qbz4a8';
const SS_ID_FIJO = '1yNFJZes8Yt9W_VZ_FjDgT6XZ4gG9298dkCtpTWqmPuc';

function crearFormularioOnboarding() {

  const props = PropertiesService.getScriptProperties();
  const formId = FORM_ID_FIJO || props.getProperty('FORM_ID');
  const ssId = SS_ID_FIJO || props.getProperty('SS_ID');

  // Ya existen: los abrimos y no creamos nada nuevo.
  if (formId && ssId) {
    const form = FormApp.openById(formId);
    const ss = SpreadsheetApp.openById(ssId);

    // Guardamos los IDs en las propiedades para que el resto de las
    // funciones (ej. instalarIntegracionNotion) los encuentren.
    props.setProperty('FORM_ID', formId);
    props.setProperty('SS_ID', ssId);

    Logger.log('(Reutilizando el formulario y la planilla existentes)');
    Logger.log('Formulario (para compartir): ' + form.getPublishedUrl());
    Logger.log('Editor del formulario: ' + form.getEditUrl());
    Logger.log('Planilla de respuestas: ' + ss.getUrl());
    return;
  }

  // --- Primera vez: se crea todo desde cero ---

  const form = FormApp.create('Dueno Alquila');

  // A veces Google tira "Failed to retrieve form data. Please wait and try
  // again." mientras se arma el formulario. Es un error transitorio de
  // Google: si pasa, borramos el form a medio crear para no dejar basura
  // en Drive, y alcanza con volver a ejecutar la función.
  try {
    construirFormulario_(form);
  } catch (e) {
    DriveApp.getFileById(form.getId()).setTrashed(true);
    throw new Error(
      'Google devolvió un error transitorio armando el formulario ("' + e.message + '"). ' +
      'El formulario a medio crear ya fue enviado a la papelera. ' +
      'Esperá un minuto y volvé a ejecutar crearFormularioOnboarding.'
    );
  }

  // --- Planilla de respuestas ---

  const ss = SpreadsheetApp.create('Respuestas - Onboarding alquiler');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Guardamos los IDs para que la próxima ejecución reutilice este mismo form/planilla.
  props.setProperty('FORM_ID', form.getId());
  props.setProperty('SS_ID', ss.getId());

  Logger.log('Formulario (para compartir): ' + form.getPublishedUrl());
  Logger.log('Editor del formulario: ' + form.getEditUrl());
  Logger.log('Planilla de respuestas: ' + ss.getUrl());
}

/**
 * Agrega todas las preguntas y secciones al formulario.
 * (Separado en su propia función para poder reintentar/limpiar si Google
 * falla a mitad de camino.)
 */
function construirFormulario_(form) {

  form.setDescription(
    '¡Bienvenido.!'
  );

  // --- Sección 1: Datos de contacto (obligatorios) ---

  form.addTextItem()
    .setTitle('Nombre y apellido')
    .setRequired(true);

  form.addTextItem()
    .setTitle('Teléfono de WhatsApp')
    .setRequired(true);

  const dniItem = form.addTextItem()
    .setTitle('DNI')
    .setHelpText('Solo números, sin puntos')
    .setRequired(true);
  dniItem.setValidation(
    FormApp.createTextValidation()
      .requireTextMatchesPattern('^[0-9]{7,8}$')
      .setHelpText('Ingresá tu DNI sin puntos (7 u 8 números)')
      .build()
  );

  // --- Sección 2: Disponibilidad para la visita ---

 // ---form.addCheckboxItem()
 // ---   .setTitle('¿Qué días te quedan mejor para la visita?')
 // ---   .setChoiceValues(['Lunes a viernes', 'Sábados', 'Domingos'])
 // ---   .setRequired(true);

 // --- form.addMultipleChoiceItem()
 // ---   .setTitle('¿En qué horario?')
 // ---   .setChoiceValues([
 // ---     'Tarde (14 a 18hs)',
 // ---     'Noche (18 a 21hs)',
 // ---   ])
 // ---   .setRequired(true);
 // ---
 // --- form.addParagraphTextItem()
 // ---   .setTitle('¿Algún comentario sobre tu disponibilidad? (opcional)')
 // ---   .setRequired(false);
 // ---
  // --- Sección 3: Requisitos para alquilar ---

  form.addSectionHeaderItem()
    .setTitle('Requisitos para alquilar')
    .setHelpText(
      'Se solicitan garantías. el/los garante/s debe ser propietario ' +
      'de un inmueble) y el solitante con ingresos demostrables (recibo de sueldo, antigüedad ' +
      'laboral).'
    );

  form.addCheckboxItem()
    .setTitle('En breve coordinamos una visita a la propiedad.')
    .setChoiceValues(['Sí'])
    .setRequired(true);
}

/**
 * Borra los IDs guardados para que la próxima ejecución de
 * "crearFormularioOnboarding" cree un formulario y planilla NUEVOS.
 * Esto no borra el formulario/planilla anteriores de tu Drive, solo hace
 * que el script "se olvide" de ellos.
 */
function resetFormularioOnboarding() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('FORM_ID');
  props.deleteProperty('SS_ID');
  Logger.log(
    'IDs guardados borrados. OJO: mientras FORM_ID_FIJO y SS_ID_FIJO tengan valor ' +
    'al principio del archivo, el script va a seguir usando esos archivos. ' +
    'Para crear un formulario y planilla nuevos, dejá esas dos constantes vacías (\'\') ' +
    'y volvé a ejecutar crearFormularioOnboarding.'
  );
}


// ============================================================
//  INTEGRACIÓN CON NOTION
// ============================================================
//
// Cada respuesta nueva del formulario se agrega como una fila en la
// base de Notion "Alquilo C53 inmoclick junio 2026".
//
// CONFIGURACIÓN (una sola vez):
//
// 1. Crear una integración interna de Notion:
//    - Ir a https://www.notion.so/profile/integrations → "Nueva integración"
//    - Nombre: por ejemplo "Formulario Alquiler". Workspace: el tuyo.
//    - Copiar el "Internal Integration Secret" (empieza con "ntn_" o "secret_").
//
// 2. Darle acceso a la base de datos:
//    - Abrir la base en Notion → menú "⋯" (arriba a la derecha) →
//      "Conexiones" / "Connections" → agregar la integración que creaste.
//      (Sin este paso la API devuelve error 404.)
//
// 3. Guardar el token en este proyecto de Apps Script:
//    - Engranaje ⚙ "Configuración del proyecto" → "Propiedades del script" →
//      "Agregar propiedad": nombre NOTION_TOKEN, valor = el secret copiado.
//
// 4. En el desplegable de funciones elegir "instalarIntegracionNotion"
//    y ejecutarla (▶). Eso instala el disparador que corre en cada envío.
//
// Listo: cada persona que complete el formulario aparece automáticamente
// en la planilla de Google Y en la base de Notion.

const NOTION_DATABASE_ID = '3a108b20ed678037a117e85869103b3e';

/**
 * Instala el disparador "al enviar el formulario" que manda cada
 * respuesta a Notion. Ejecutar UNA vez (después de configurar el token).
 */
function instalarIntegracionNotion() {
  const props = PropertiesService.getScriptProperties();

  const formId = FORM_ID_FIJO || props.getProperty('FORM_ID');
  if (!formId) {
    throw new Error('Primero ejecutá crearFormularioOnboarding para crear el formulario.');
  }
  if (!props.getProperty('NOTION_TOKEN')) {
    throw new Error(
      'Falta el token de Notion. Andá a ⚙ Configuración del proyecto → ' +
      'Propiedades del script y agregá NOTION_TOKEN con el secret de tu integración.'
    );
  }

  // Evitar disparadores duplicados si se ejecuta más de una vez.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'enviarRespuestaANotion') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('enviarRespuestaANotion')
    .forForm(formId)
    .onFormSubmit()
    .create();

  Logger.log('Integración con Notion instalada. Cada respuesta nueva se enviará a la base de Notion.');
}

/**
 * Se ejecuta automáticamente en cada envío del formulario (disparador).
 * Crea una página nueva en la base de Notion con los datos de la respuesta.
 */
function enviarRespuestaANotion(e) {
  const token = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  if (!token) {
    Logger.log('NOTION_TOKEN no configurado; se omite el envío a Notion.');
    return;
  }

  // Juntar las respuestas por título de pregunta.
  const respuestas = {};
  e.response.getItemResponses().forEach(function (ir) {
    respuestas[ir.getItem().getTitle()] = ir.getResponse();
  });

  const nombre = String(respuestas['Nombre y apellido'] || 'Sin nombre');
  const whatsapp = String(respuestas['Teléfono de WhatsApp'] || '');
  const dni = String(respuestas['DNI'] || '');
  // La pregunta de confirmación es un checkbox: llega como array (ej. ['Sí']).
  const confirmo = respuestas['En breve coordinamos una visita a la propiedad.'];
  const confirmoVisita = Array.isArray(confirmo) ? confirmo.length > 0 : Boolean(confirmo);

  const payload = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      'Name': {
        title: [{ text: { content: nombre } }]
      },
      'WhatsApp': {
        phone_number: whatsapp || null
      },
      'DNI': {
        rich_text: dni ? [{ text: { content: dni } }] : []
      },
      'Confirmó visita': {
        checkbox: confirmoVisita
      },
      'Fecha de respuesta': {
        date: { start: e.response.getTimestamp().toISOString() }
      }
    }
  };

  const resp = UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const codigo = resp.getResponseCode();
  if (codigo >= 200 && codigo < 300) {
    Logger.log('Respuesta de "' + nombre + '" enviada a Notion correctamente.');
  } else {
    // No lanzamos error para no interferir con el guardado en la planilla:
    // la respuesta ya quedó en Google Sheets aunque Notion falle.
    Logger.log('Error al enviar a Notion (HTTP ' + codigo + '): ' + resp.getContentText());
  }
}

/**
 * Prueba manual de la conexión con Notion (sin enviar un formulario real).
 * Ejecutala después de configurar el token para verificar que todo funciona:
 * crea una fila de prueba "PRUEBA - conexión OK" en la base de Notion.
 */
function probarConexionNotion() {
  const token = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  if (!token) {
    throw new Error('Falta configurar NOTION_TOKEN en las Propiedades del script.');
  }

  const resp = UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Name': { title: [{ text: { content: 'PRUEBA - conexión OK' } }] },
        'Fecha de respuesta': { date: { start: new Date().toISOString() } }
      }
    }),
    muteHttpExceptions: true
  });

  const codigo = resp.getResponseCode();
  if (codigo >= 200 && codigo < 300) {
    Logger.log('✅ Conexión OK: se creó una fila "PRUEBA - conexión OK" en la base de Notion. Podés borrarla.');
  } else {
    Logger.log('❌ Error HTTP ' + codigo + ': ' + resp.getContentText());
    Logger.log('Revisá: 1) que el token sea correcto, 2) que la integración esté agregada en "Conexiones" de la base de Notion.');
  }
}
