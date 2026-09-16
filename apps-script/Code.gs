function doGet(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback;

  if (action === 'calculateDelivery') {
    var result = calculateDelivery(e.parameter.address);

    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(result) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return jsonResponse(result);
  }

  return jsonResponse({
    success: false,
    message: 'Invalid request.'
  });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  return saveOrder(data);
}

function calculateDelivery(address) {
  var properties = PropertiesService.getScriptProperties();
  var origin = properties.getProperty('DELIVERY_ORIGIN');
  var apiKey = properties.getProperty('GOOGLE_MAPS_API_KEY');

  if (!origin || !apiKey) {
    return {
      available: false,
      message: 'Delivery is not configured yet.'
    };
  }

  var response = UrlFetchApp.fetch(
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters'
      },
      payload: JSON.stringify({
        origin: { address: origin },
        destination: { address: address },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE'
      }),
      muteHttpExceptions: true
    }
  );

  var result = JSON.parse(response.getContentText());

  if (!result.routes || !result.routes.length) {
    return {
      available: false,
      message: 'We could not find that delivery address.'
    };
  }

  var distanceKm = Math.round(result.routes[0].distanceMeters / 100) / 10;
  var fee;

  if (distanceKm <= 5) {
    fee = 15;
  } else if (distanceKm <= 10) {
    fee = 25;
  } else if (distanceKm <= 15) {
    fee = 35;
  } else {
    return {
      available: false,
      distanceKm: distanceKm,
      message: 'That address is outside our delivery area.'
    };
  }

  return {
    available: true,
    distanceKm: distanceKm,
    fee: fee
  };
}

function saveOrder(data) {
  var sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName('Orders');

  sheet.appendRow([
    new Date(),
    data.id || '',
    data.name || '',
    data.items || '',
    data.total || '',
    data.payment || '',
    data.pickup || '',
    data.deliveryDistance || '',
    data.deliveryFee || '',
    data.phone || '',
    data.address || ''
  ]);

  return jsonResponse({ success: true });
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
