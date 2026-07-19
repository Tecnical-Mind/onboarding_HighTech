/**
 * Crea o reutiliza el Google Form "Conociéndonos" con su planilla de respuestas
 * y lo conecta en tiempo real con una base de datos de Notion.
 */

// ============================================================
//  CONFIGURACIÓN PRINCIPAL
// ============================================================
// Dejá estas constantes vacías ('') la primera vez. El script guardará 
// los IDs automáticamente para no duplicar archivos en las siguientes ejecuciones.
const FORM_ID_FIJO = '';
const SS_ID_FIJO = '';

// REEMPLAZÁ ESTO con el ID real de tu base de datos de Notion
const NOTION_DATABASE_ID = 'TU_NOTION_DATABASE_ID_AQUÍ';

function crearFormularioConociendonos() {
  const props = PropertiesService.getScriptProperties();
  const formId = FORM_ID_FIJO || props.getProperty('FORM_ID');
  const ssId = SS_ID_FIJO || props.getProperty('SS_ID');

  // Si ya existen los archivos, los reutilizamos sin crear nada nuevo
  if (formId && ssId) {
    const form = FormApp.openById(formId);
    const ss = SpreadsheetApp.openById(ssId);

    props.setProperty('FORM_ID', formId);
    props.setProperty('SS_ID', ssId);

    Logger.log('(Reutilizando el formulario y la planilla existentes)');
    Logger.log('Formulario (para compartir): ' + form.getPublishedUrl());
    Logger.log('Editor del formulario: ' + form.getEditUrl());
    Logger.log('Planilla de respuestas: ' + ss.getUrl());
    return;
  }

  // --- Primera vez: Creación desde cero ---
  const form = FormApp.create('Conociéndonos');

  // Control de fallos transitorios de los servidores de Google Forms
  try {
    construirFormulario_(form);
  } catch (e) {
    DriveApp.getFileById(form.getId()).setTrashed(true);
    throw new Error(
      'Google devolvió un error transitorio armando el formulario: "' + e.message + '". ' +
      'El formulario incompleto fue enviado a la papelera. Esperá un minuto y volvé a ejecutar.'
    );
  }

  // Creación de la planilla de respuestas vinculada
  const ss = SpreadsheetApp.create('Respuestas - Conociéndonos');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Guardar IDs en propiedades del script
  props.setProperty('FORM_ID', form.getId());
  props.setProperty('SS_ID', ss.getId());

  Logger.log('✅ ¡Formulario y Planilla creados con éxito!');
  Logger.log('Formulario (para compartir): ' + form.getPublishedUrl());
  Logger.log('Editor del formulario: ' + form.getEditUrl());
  Logger.log('Planilla de respuestas: ' + ss.getUrl());
}

/**
 * Agrega las preguntas, validaciones de patrones impositivos y secciones.
 */
function construirFormulario_(form) {
  form.setDescription('Formulario de presentación y vinculación comercial.');

  // 1. Nombre y apellido
  form.addTextItem()
    .setTitle('Nombre y apellido')
    .setRequired(true);

  // 2. Empresa Representada
  form.addTextItem()
    .setTitle('Empresa Representada')
    .setRequired(true);

  // 3. CUIT (Validación estándar impositivo argentino: 11 dígitos numéricos sin guiones)
  const cuitItem = form.addTextItem()
    .setTitle('CUIT')
    .setHelpText('Ingresá los 11 dígitos sin puntos ni guiones')
    .setRequired(true);
  
  cuitItem.setValidation(
    FormApp.createTextValidation()
      .requireTextMatchesPattern('^(20|23|24|27|30|33|34)[0-9]{9}$')
      .setHelpText('Ingresá un CUIT válido de 11 números, sin puntos ni guiones (Debe comenzar con 20, 23, 24, 27, 30, 33 o 34)')
      .build()
  );

  // 4. Redes (Selección múltiple simultánea con opción de completar campo libre)
  form.addCheckboxItem()
    .setTitle('Redes')
    .setHelpText('Seleccioná las redes donde tenés presencia activa')
    .setChoiceValues(['Website', 'Instagram', 'Facebook', 'LinkedIn'])
    .setHasOtherInput(true)
    .setRequired(true);

  // 5. Teléfono (Validación numérica estándar Argentina)
  const telItem = form.addTextItem()
    .setTitle('Teléfono')
    .setHelpText('Código de área + número, sin 0 y sin 15 (Ej: 2615555555)')
    .setRequired(true);
  
  telItem.setValidation(
    FormApp.createTextValidation()
      .requireTextMatchesPattern('^[0-9]{10,13}$')
      .setHelpText('Ingresá un teléfono válido (Solo números, entre 10 y 13 dígitos)')
      .build()
  );

  // 6. ¿Acepta los términos?
  form.addCheckboxItem()
    .setTitle('¿Acepta los términos?')
    .setChoiceValues(['Sí'])
    .setRequired(true);
}

/**
 * Resetea los IDs de las propiedades del script si se necesita generar un set nuevo.
 */
function resetFormularioConociendonos() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('FORM_ID');
  props.deleteProperty('SS_ID');
  Logger.log('IDs borrados de las propiedades del script. Asegurate de que FORM_ID_FIJO y SS_ID_FIJO estén vacíos para generar nuevos archivos.');
}

// ============================================================
//  INTEGRACIÓN CON NOTION
// ============================================================

function instalarIntegracionNotion() {
  const props = PropertiesService.getScriptProperties();
  const formId = FORM_ID_FIJO || props.getProperty('FORM_ID');
  
  if (!formId) {
    throw new Error('Primero ejecutá crearFormularioConociendonos para crear el formulario.');
  }
  if (!props.getProperty('NOTION_TOKEN')) {
    throw new Error('Falta el token de Notion en las Propiedades del Script (NOTION_TOKEN).');
  }

  // Limpiar disparadores anteriores para evitar duplicaciones absurdas
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'enviarRespuestaANotion') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Crear el nuevo disparador en tiempo real
  ScriptApp.newTrigger('enviarRespuestaANotion')
    .forForm(formId)
    .onFormSubmit()
    .create();

  Logger.log('🚀 Integración activa. Cada respuesta se enviará automáticamente a Notion.');
}

/**
 * Captura la respuesta del formulario y construye el JSON con el mapeo correcto para Notion.
 */
function enviarRespuestaANotion(e) {
  const token = PropertiesService.getScriptProperties().getProperty('NOTION_TOKEN');
  if (!token) {
    Logger.log('NOTION_TOKEN no configurado; se cancela el envío.');
    return;
  }

  // Mapear respuestas basándose exactamente en el Título de la pregunta
  const respuestas = {};
  e.response.getItemResponses().forEach(function (ir) {
    respuestas[ir.getItem().getTitle()] = ir.getResponse();
  });

  const nombre = String(respuestas['Nombre y apellido'] || 'Sin nombre');
  const empresa = String(respuestas['Empresa Representada'] || '');
  const cuitNum = Number(respuestas['CUIT']) || null;
  const whatsapp = String(respuestas['Teléfono'] || '');
  
  // Manejo de la selección múltiple (Redes)
  const redesSeleccionadas = respuestas['Redes'];
  const redesArray = Array.isArray(redesSeleccionadas) ? redesSeleccionadas : (redesSeleccionadas ? [redesSeleccionadas] : []);
  const redesMultiSelect = redesArray.map(function(item) {
    return { name: item.trim() };
  });

  // Manejo del checkbox de términos
  const terminos = respuestas['¿Acepta los términos?'];
  const confirmoTerminos = Array.isArray(terminos) ? terminos.length > 0 : Boolean(terminos);

  // Estructura del Payload respetando los tipos nativos de la API de Notion
  const payload = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      'Name': {
        title: [{ text: { content: nombre } }]
      },
      'Empresa': {
        rich_text: [{ text: { content: empresa } }]
      },
      'cuit': {
        number: cuitNum
      },
      'Redes': {
        multi_select: redesMultiSelect
      },
      'WhatsApp': {
        phone_number: whatsapp || null
      },
      'Confirmó': {
        checkbox: confirmoTerminos
      },
      'Fecha de respuesta': {
        date: { start: e.response.getTimestamp().toISOString() }
      }
    }
  };

  // Petición HTTP POST a la API de Notion
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
    Logger.log('Error al enviar a Notion (HTTP ' + codigo + '): ' + resp.getContentText());
  }
}

/**
 * Función de prueba manual rápida para validar la conexión y tokens antes del despliegue.
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
        'Name': { title: [{ text: { content: 'PRUEBA - Conexión Exitosa' } }] },
        'Empresa': { rich_text: [{ text: { content: 'Empresa Prueba S.A.' } }] },
        'cuit': { number: 20123456789 },
        'Redes': { multi_select: [{ name: 'LinkedIn' }] },
        'Fecha de respuesta': { date: { start: new Date().toISOString() } }
      }
    }),
    muteHttpExceptions: true
  });

  const codigo = resp.getResponseCode();
  if (codigo >= 200 && codigo < 300) {
    Logger.log('✅ Conexión Exitosa: Se creó una fila de prueba en tu base de datos de Notion. Ya podés borrarla del tablero.');
  } else {
    Logger.log('❌ Error de conexión (HTTP ' + codigo + '): ' + resp.getContentText());
    Logger.log('Por favor revisá que el ID de la base sea correcto y que la integración tenga accesos permitidos dentro de la página de Notion.');
  }
}