/**
 * Google Apps Script — Aeroparking Email Webhook
 *
 * Cuenta: reservas@nrauditores.com.ar
 * Busca emails de AA2000 con pedidos nuevos y los envía al webhook.
 * Trigger: cada 5 minutos (time-driven)
 *
 * SETUP:
 * 1. Abrir https://script.google.com desde la cuenta reservas@nrauditores.com.ar
 * 2. Crear proyecto nuevo "Aeroparking Webhook"
 * 3. Pegar este código
 * 4. Ejecutar checkAeroparqueEmails() manualmente 1 vez (para autorizar permisos Gmail)
 * 5. Ir a Triggers (reloj) → Add Trigger:
 *    - Function: checkAeroparqueEmails
 *    - Event source: Time-driven
 *    - Type: Minutes timer
 *    - Interval: Every 5 minutes
 */

var WEBHOOK_URL = "https://aeroparking.vercel.app/api/integraciones/aeroparque/email";
var TOKEN = "ap-webhook-2026-secret";
var LABEL_NAME = "aeroparque-procesado";

function checkAeroparqueEmails() {
  // Buscar emails de AA2000 no procesados
  var query = 'from:no-responder@tiendaaeropuertos.com.ar subject:"Nuevo pedido" -label:' + LABEL_NAME;
  var threads = GmailApp.search(query, 0, 10);

  if (threads.length === 0) {
    Logger.log("No hay emails nuevos para procesar");
    return;
  }

  // Obtener o crear el label
  var label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) {
    label = GmailApp.createLabel(LABEL_NAME);
    Logger.log("Label '" + LABEL_NAME + "' creado");
  }

  var processed = 0;
  var errors = 0;

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();
    var msg = messages[0]; // primer mensaje del thread

    try {
      var payload = {
        subject: msg.getSubject(),
        body: msg.getPlainBody(),
        from: msg.getFrom(),
        date: msg.getDate().toISOString()
      };

      var options = {
        method: "post",
        contentType: "application/json",
        headers: {
          "Authorization": "Bearer " + TOKEN
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
      var code = response.getResponseCode();
      var body = response.getContentText();

      if (code < 400) {
        // 201 = creado, 200 = ya existía — ambos OK
        thread.addLabel(label);
        processed++;
        Logger.log("OK [" + code + "] " + msg.getSubject() + " → " + body);
      } else {
        errors++;
        Logger.log("ERROR [" + code + "] " + msg.getSubject() + " → " + body);
      }
    } catch (e) {
      errors++;
      Logger.log("EXCEPTION: " + msg.getSubject() + " → " + e.message);
    }
  }

  Logger.log("Procesados: " + processed + ", Errores: " + errors);
}

/**
 * Test manual — envía un email de prueba al webhook
 * Útil para verificar que el endpoint funciona antes de activar el trigger
 */
function testWebhook() {
  var testPayload = {
    subject: "[Aeroparque - Tienda online Aeropuertos Argentina] Nuevo pedido de cliente (999999) - 07/04/2026",
    body: "Has recibido un pedido de Test User.\n\n[Pedido #999999]\n\nEstacionamiento Drop & Go\n\n*\tPatente n°:\n\n\n\tAA000BB\n\n*\tMarca:\n\n\n\tToyota Corolla\n\n*\tModelo:\n\n\n\t2024\n\n*\tCantidad de pasajeros:\n\n\n\t2\n\n*\tReservado desde:\n\n\n\t10/04/2026\n\n*\tReservado hasta:\n\n\n\t15/04/2026\n\nTotal:\t $ 250.000\n\nTipo de Documento: DNI\n\nNúmero de documento: 12345678",
    from: "test@test.com",
    date: new Date().toISOString()
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + TOKEN
    },
    payload: JSON.stringify(testPayload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  Logger.log("Status: " + response.getResponseCode());
  Logger.log("Body: " + response.getContentText());
}
