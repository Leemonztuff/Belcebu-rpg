// Only creates the trade receipt collection; does not alter existing stall slots or sales logs.
migrate(function (app) {
  app.save(new Collection({
    name: 'market_receipts', type: 'base',
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { name: 'request_id', type: 'text', required: true, max: 200 },
      { name: 'kind', type: 'text', required: true, max: 20 },
      { name: 'request_body', type: 'text', required: true, max: 1000000 },
      { name: 'response', type: 'json', required: true, maxSize: 2000000 }
    ],
    indexes: ['CREATE UNIQUE INDEX idx_market_receipt_request ON market_receipts (request_id)']
  }));
}, function () {
  // Deleting receipts would break refunds for undelivered trades; automatic rollback destruction is not allowed.
  throw new Error('Trade receipts must be kept; fix the market schema via forward migration');
});
