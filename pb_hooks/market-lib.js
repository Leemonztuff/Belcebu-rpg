// PocketBase JS hook: market purchase and sales claiming.
// Deploy by copying this file into the PocketBase `pb_hooks` directory and restarting PocketBase.

var MARKET_TAX_RATE = 0.05;

function readJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      var parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }
  return [];
}

function abortMarket(status, code, message) {
  var err = new Error(message);
  err.status = status;
  err.code = code;
  throw err;
}

function normalizeAmount(value) {
  var amount = Number(value);
  if (!isFinite(amount)) return 0;
  return Math.max(0, Math.floor(amount));
}

function handleMarketError(e, err, fallbackCode) {
  var status = err.status || 500;
  var code = err.code || fallbackCode || "market_error";
  var message = err.message || "Market operation failed";
  return e.json(status, { ok: false, code: code, message: message });
}

// Receipts are read/written only by hooks inside transactions. request_id must have a UNIQUE index.
function receiptKey(body) {
  var key = String(body.requestId || "");
  if (key.length < 12 || key.length > 200) abortMarket(400, "invalid_request", "Missing trade request id");
  return key;
}

function receiptBody(body, kind) {
  if (kind === 'close-stall') return JSON.stringify([kind, body.sellerId, body.stallId]);
  if (kind === 'open-stall') return JSON.stringify([kind, body.sellerId, body.nickname, body.stallName,
    body.stallIndex, body.hours, body.items.map(function (s) { return [s.item.id, s.price]; })]);
  // Go map key order into JS is unstable; bind business params in a fixed field order.
  return JSON.stringify(kind === "purchase" ? [kind, body.buyerId, body.buyerName,
    body.stallId, body.itemId, body.itemIndex, body.expectedPrice, body.expectedTotal] :
    [kind, body.sellerId, body.saleIds]);
}

function readReceipt(app, body, kind) {
  var records = app.findRecordsByFilter("market_receipts", "request_id = {:id}", "", 1, 0, { id: receiptKey(body) });
  if (!records.length) return null;
  var receipt = records[0];
  if (receipt.get("kind") !== kind || receipt.get("request_body") !== receiptBody(body, kind)) {
    abortMarket(409, "receipt_mismatch", "Request id does not match the original trade");
  }
  return JSON.parse(receipt.getString("response"));
}

function saveReceipt(app, body, kind, result) {
  result.requestId = receiptKey(body);
  var receipt = new Record(app.findCollectionByNameOrId("market_receipts"));
  receipt.set("request_id", result.requestId);
  receipt.set("kind", kind);
  receipt.set("request_body", receiptBody(body, kind));
  receipt.set("response", result);
  app.save(receipt);
}

function protocol(e) {
  try {
    $app.findCollectionByNameOrId("market_receipts");
    return e.json(200, { version: 2, stallReceipts: true });
  } catch (err) { return handleMarketError(e, err, "receipts_not_installed"); }
}

function purchase(e) {
  try {
    var body = e.requestInfo().body || {};
    receiptKey(body);
    var stallId = String(body.stallId || "");
    var buyerId = String(body.buyerId || "");
    var buyerName = String(body.buyerName || "Anonymous Player").slice(0, 24);
    var expectedItemId = String(body.itemId || "");
    var expectedPrice = normalizeAmount(body.expectedPrice);
    var expectedTotal = normalizeAmount(body.expectedTotal);
    var itemIndex = parseInt(body.itemIndex, 10);

    if (!stallId || !buyerId || isNaN(itemIndex)) {
      abortMarket(400, "invalid_request", "Incomplete purchase request");
    }

    var result = null;

    $app.runInTransaction(function (txApp) {
      result = readReceipt(txApp, body, "purchase");
      if (result) return;
      var stalls = txApp.findRecordsByFilter("market_stalls", "id = {:id}", "", 1, 0, { id: stallId });
      if (!stalls.length) abortMarket(409, "sold_out", "Item already sold or stall closed");
      var stall = stalls[0];
      var sellerId = String(stall.get("user_id") || "");
      if (!sellerId) abortMarket(409, "invalid_stall", "Invalid stall data");
      if (sellerId === buyerId) abortMarket(400, "own_stall", "You cannot buy your own item");

// PocketBase JSON field get returns JSONRaw bytes; convert to string explicitly before parsing.
      var items = readJsonArray(stall.getString("items"));
      var slot = items[itemIndex];
      if (!slot || !slot.item) abortMarket(409, "sold_out", "Item already sold");

      var item = slot.item;
      var itemId = String(item.id || "");
      if (expectedItemId && itemId !== expectedItemId) {
        abortMarket(409, "sold_out", "Item already sold");
      }

      var price = normalizeAmount(slot.price);
      var totalPrice = price + Math.ceil(price * MARKET_TAX_RATE);
      if (price !== expectedPrice || totalPrice !== expectedTotal) {
        abortMarket(409, "price_changed", "Item price changed, please confirm again");
      }

      var finalItems = [];
      for (var i = 0; i < items.length; i++) {
        if (i !== itemIndex) finalItems.push(items[i]);
      }

      if (finalItems.length === 0) {
        txApp.delete(stall);
      } else {
        stall.set("items", finalItems);
        txApp.save(stall);
      }

      var salesCollection = txApp.findCollectionByNameOrId("market_sales");
      var sale = new Record(salesCollection);
      sale.set("seller_id", sellerId);
      sale.set("buyer_id", buyerId);
      sale.set("buyer_name", buyerName);
      sale.set("item_name", String(item.name || "Item"));
      sale.set("price", price);
      sale.set("claimed", false);
      txApp.save(sale);

      result = {
        ok: true,
        item: item,
        price: price,
        totalPrice: totalPrice,
        saleId: sale.id
      };
      saveReceipt(txApp, body, "purchase", result);
    });

    return e.json(200, result);
  } catch (err) {
    return handleMarketError(e, err, "purchase_failed");
  }
}

function claimSales(e) {
  try {
    var body = e.requestInfo().body || {};
    receiptKey(body);
    var sellerId = String(body.sellerId || "");
    var saleIds = Array.isArray(body.saleIds) ? body.saleIds : [];

    if (!sellerId || saleIds.length === 0) {
      abortMarket(400, "invalid_request", "Incomplete claim request");
    }

    var result = { ok: true, totalGold: 0, claimedCount: 0 };

    $app.runInTransaction(function (txApp) {
      var existing = readReceipt(txApp, body, "claim-sales");
      if (existing) { result = existing; return; }
      for (var i = 0; i < saleIds.length; i++) {
        var sale = txApp.findRecordById("market_sales", String(saleIds[i]));
        if (String(sale.get("seller_id") || "") !== sellerId) {
          abortMarket(403, "forbidden", "You can only claim your own stall earnings");
        }
        if (sale.get("claimed") === true) continue;

        result.totalGold += normalizeAmount(sale.get("price"));
        result.claimedCount++;
        sale.set("claimed", true);
        txApp.save(sale);
      }
      saveReceipt(txApp, body, "claim-sales", result);
    });

    return e.json(200, result);
  } catch (err) {
    return handleMarketError(e, err, "claim_failed");
  }
}

function closeStall(e) {
  try {
    var body = e.requestInfo().body || {};
    if (!body.sellerId || !body.stallId) abortMarket(400, 'invalid_request', 'Incomplete stall-close parameters');
    var result;
    $app.runInTransaction(function (app) {
      result = readReceipt(app, body, 'close-stall');
      if (result) return;
      var stalls = app.findRecordsByFilter('market_stalls', 'id = {:id}', '', 1, 0, { id: body.stallId });
      result = { ok: true, items: [] };
      if (stalls.length) {
        var stall = stalls[0];
        if (stall.get('user_id') !== body.sellerId) abortMarket(403, 'forbidden', 'You can only close your own stall');
        result.items = readJsonArray(stall.getString('items')).filter(function (s) { return s && s.item; }).map(function (s) { return s.item; });
        app.delete(stall);
      }
      saveReceipt(app, body, 'close-stall', result);
    });
    return e.json(200, result);
  } catch (err) { return handleMarketError(e, err, 'close_failed'); }
}

function openStall(e) {
  try {
    var body = e.requestInfo().body || {};
    if (!body.sellerId || !Array.isArray(body.items) || !body.items.length || body.items.length > 10 ||
        !Number.isInteger(body.hours) || body.hours < 1 || body.hours > 10 ||
        !Number.isInteger(body.stallIndex) || body.stallIndex < 0 || body.stallIndex > 4) {
      abortMarket(400, 'invalid_request', 'Invalid listing parameters');
    }
    var ids = {};
    body.items.forEach(function (s) {
      if (!s.item || !s.item.id || ids[s.item.id] || !Number.isSafeInteger(s.price) || s.price < 1 || s.price > 999999999)
        abortMarket(400, 'invalid_request', 'Invalid item parameters');
      ids[s.item.id] = true;
    });
    var result;
    $app.runInTransaction(function (app) {
      result = readReceipt(app, body, 'open-stall');
      if (result) return;
      var occupied = app.findRecordsByFilter('market_stalls', '(stall_index = {:index} && expires_at > {:now}) || user_id = {:owner}', '', 1, 0,
        { index: body.stallIndex, owner: body.sellerId, now: new Date().toISOString().replace('T', ' ') });
      if (occupied.length) abortMarket(409, 'invalid_stall', 'Slot occupied or you already run an active stall');
      var stall = new Record(app.findCollectionByNameOrId('market_stalls'));
      stall.set('user_id', body.sellerId);
      stall.set('nickname', String(body.nickname || 'Anonymous').slice(0, 24));
      stall.set('stall_name', String(body.stallName || 'Stall').slice(0, 10));
      stall.set('stall_index', body.stallIndex);
      stall.set('items', body.items);
      stall.set('expires_at', new Date(Date.now() + body.hours * 3600000).toISOString().replace('T', ' '));
      app.save(stall);
      result = { ok: true, stallId: stall.id };
      saveReceipt(app, body, 'open-stall', result);
    });
    return e.json(200, result);
  } catch (err) { return handleMarketError(e, err, 'open_failed'); }
}

module.exports = { protocol: protocol, purchase: purchase, claimSales: claimSales, closeStall: closeStall, openStall: openStall };
