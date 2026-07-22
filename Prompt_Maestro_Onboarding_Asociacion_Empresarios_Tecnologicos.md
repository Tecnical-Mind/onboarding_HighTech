# Prompt Maestro para Generar Google Apps Script Profesional

## Formulario de Onboarding para una Asociación de Empresarios del Sector Tecnológico

> **Objetivo:** Este documento sirve como especificación funcional para
> que una IA genere una solución profesional en Google Apps Script para
> el proceso de onboarding de nuevos asociados (empresas, empresarios,
> startups, instituciones y sponsors).

------------------------------------------------------------------------

# 1. Objetivo del sistema

-   ¿Cuál es el objetivo principal del formulario?
    -   Registrar nuevos socios
    -   Actualizar datos de socios existentes
    -   Solicitar membresías
    -   Inscripción a cámaras o comisiones
    -   Registro de empresas tecnológicas
    -   Otro
-   ¿Qué problema busca resolver?
-   ¿Qué resultados espera obtener la asociación?

------------------------------------------------------------------------

# 2. Información institucional

-   Nombre de la asociación
-   País
-   Provincia
-   Ciudad
-   Sitio web
-   Logo institucional
-   Colores institucionales
-   Responsable del proceso
-   Email institucional
-   Teléfono
-   Redes sociales

------------------------------------------------------------------------

# 3. Tipo de asociado

¿Quién completa el formulario?

-   Empresario
-   Empresa
-   Startup
-   Profesional independiente
-   Institución educativa
-   Inversor
-   Sponsor
-   Organismo público
-   Otro

------------------------------------------------------------------------

# 4. Datos generales

## Empresa

-   Razón social
-   Nombre comercial
-   CUIT
-   Fecha de constitución
-   Actividad principal
-   Rubro
-   Cantidad de empleados
-   Facturación anual (opcional)
-   Sitio web
-   LinkedIn
-   Instagram
-   Facebook
-   YouTube
-   Dirección
-   Ciudad
-   Provincia
-   País

------------------------------------------------------------------------

# 5. Representante legal

-   Nombre
-   Apellido
-   Cargo
-   DNI
-   CUIL
-   Email
-   Teléfono
-   WhatsApp
-   Fecha de nacimiento

------------------------------------------------------------------------

# 6. Perfil tecnológico

## Especialización

-   Software
-   Hardware
-   Inteligencia Artificial
-   IoT
-   Ciberseguridad
-   Cloud
-   Telecomunicaciones
-   Electrónica
-   Robótica
-   Fintech
-   Agrotech
-   Healthtech
-   Edtech
-   Govtech
-   Otro

## Capacidades

-   Productos
-   Servicios
-   Patentes
-   Certificaciones
-   Lenguajes de programación
-   Frameworks
-   Cloud Providers
-   Mercados donde opera
-   Exporta (Sí/No)
-   Países donde exporta

------------------------------------------------------------------------

# 7. Intereses dentro de la asociación

Seleccionar uno o varios:

-   Networking
-   Capacitaciones
-   Eventos
-   Misiones comerciales
-   Rondas de negocios
-   Financiamiento
-   Internacionalización
-   Innovación
-   IA
-   Vinculación universitaria
-   Proyectos colaborativos
-   Comisiones de trabajo
-   Mentorías

------------------------------------------------------------------------

# 8. Documentación requerida

-   Constancia AFIP
-   Estatuto
-   Poder del representante
-   Logo
-   Presentación institucional
-   Certificaciones
-   ISO
-   IRAM
-   CMMI
-   Otros archivos

------------------------------------------------------------------------

# 9. Membresía

-   Tipo de membresía
-   Categoría
-   Valor
-   Periodicidad
-   Forma de pago
-   Estado

------------------------------------------------------------------------

# 10. Declaraciones y consentimiento

-   Aceptación del estatuto
-   Aceptación del reglamento
-   Política de privacidad
-   Tratamiento de datos personales
-   Firma digital

------------------------------------------------------------------------

# 11. Automatizaciones requeridas

¿Qué debe hacer Apps Script al enviar el formulario?

-   Crear carpeta en Google Drive
-   Crear estructura de subcarpetas
-   Generar expediente
-   Generar número de socio
-   Generar credencial
-   Crear código QR
-   Crear PDF
-   Guardar PDF
-   Enviar email de bienvenida
-   Notificar Secretaría
-   Notificar Tesorería
-   Notificar Presidencia
-   Registrar en Google Sheets
-   Crear evento en Google Calendar
-   Crear contacto
-   Registrar auditoría
-   Enviar mensaje por WhatsApp (si aplica)

------------------------------------------------------------------------

# 12. Integraciones

-   Google Forms
-   Google Sheets
-   Google Drive
-   Google Docs
-   Gmail
-   Google Calendar
-   Google Contacts
-   Google Chat
-   Slack
-   HubSpot
-   Salesforce
-   Airtable
-   Supabase
-   Firebase
-   Stripe
-   Mercado Pago
-   Make
-   n8n
-   Zapier
-   API propia

------------------------------------------------------------------------

# 13. Reglas de negocio

Ejemplos:

-   No permitir CUIT duplicados.
-   No permitir emails duplicados.
-   Validar formato CUIT.
-   Validar dominio de correo.
-   Validar documentación obligatoria.
-   Calcular antigüedad automáticamente.
-   Asignar categoría según cantidad de empleados.
-   Calcular cuota automáticamente.
-   Derivar a revisión si faltan documentos.
-   Registrar historial de cambios.

------------------------------------------------------------------------

# 14. Requerimientos técnicos del Apps Script

El código debe:

-   Ser modular
-   Estar dividido por archivos
-   Usar arquitectura mantenible (MVC cuando aplique)
-   Usar funciones reutilizables
-   Cumplir principios SOLID cuando sea posible
-   Tener comentarios claros
-   Manejar errores correctamente
-   Registrar logs
-   Usar `PropertiesService`
-   Usar `CacheService`
-   Usar `LockService`
-   Ser compatible con V8
-   Evitar código duplicado
-   Estar documentado
-   Ser escalable
-   Ser seguro
-   Optimizar tiempos de ejecución

------------------------------------------------------------------------

# 15. Entregables esperados

La IA deberá generar:

-   `appsscript.json`
-   `Code.gs`
-   `Config.gs`
-   `Constants.gs`
-   `Validation.gs`
-   `Utils.gs`
-   `Drive.gs`
-   `Sheets.gs`
-   `PDF.gs`
-   `Gmail.gs`
-   `Calendar.gs`
-   `Triggers.gs`
-   `Security.gs`
-   `README.md`
-   Manual técnico
-   Manual funcional
-   Diagrama de arquitectura
-   Diagrama de flujo (Mermaid)
-   BPMN
-   Lista de permisos OAuth
-   Casos de prueba
-   Checklist de pruebas
-   Plan de mantenimiento

------------------------------------------------------------------------

# Prompt Final para la IA

``` text
Actúa como un Arquitecto de Software Senior especializado en Google Workspace, Google Apps Script y automatización de procesos institucionales.

Antes de escribir cualquier línea de código:

1. Analiza todos los requerimientos.
2. Detecta inconsistencias.
3. Identifica información faltante.
4. Propón mejoras funcionales.
5. Propón mejoras de seguridad.
6. Sugiere automatizaciones de alto valor.
7. Espera confirmación cuando existan ambigüedades.

Una vez aprobados los requisitos:

- Diseña la arquitectura completa.
- Explica las decisiones técnicas.
- Genera un Google Apps Script listo para producción.
- Divide el proyecto en archivos.
- Documenta cada función.
- Implementa manejo de errores.
- Agrega logs y auditoría.
- Optimiza rendimiento.
- Implementa validaciones.
- Genera la documentación técnica y funcional.
- Incluye instrucciones de instalación.
- Incluye permisos OAuth requeridos.
- Incluye plan de pruebas y mantenimiento.

El resultado debe ser profesional, escalable, seguro, mantenible y alineado con las mejores prácticas de Google Apps Script y Google Workspace.
```
