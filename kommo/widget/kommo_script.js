define(['jquery'], function ($) {
  var CustomWidget = function () {
    var self = this;

    this.callbacks = {

      settings: function () { return true; },

      init: function () { return true; },

      render: function () { return true; },

      dpSettings: function () { return true; },

      advancedSettings: function () { return true; },

      destroy: function () { return true; },

      onSave: function () { return true; },

      // ------------------------------------------------------------------
      // bind_actions: escuta callbacks do salesbot para disparar notificações
      // ------------------------------------------------------------------
      bind_actions: function () {

        // Escuta o evento disparado pelo handler_notify via widget_callback
        APP.widgets.on('salesbot:callback', function (data) {
          if (data && data.action === 'notify_done') {
            var lead_id   = data.lead_id   || '';
            var lead_name = data.lead_name || ('Lead #' + lead_id);

            APP.notifications.show_message({
              header : 'Jul.IA finalizou um atendimento!',
              text   : 'Clique aqui para abrir o chat de ' + lead_name + ' (Lead #' + lead_id + ')',
              date   : Math.floor(Date.now() / 1000),
              link   : '/leads/detail/' + lead_id
            });
          }
        });

        return true;
      },

      // ------------------------------------------------------------------
      // onSalesbotDesignerSave: define o comportamento de cada handler
      // ------------------------------------------------------------------
      onSalesbotDesignerSave: function (handler_code, params) {

        // ---- Handler 1: Jul.IA — envia mensagem pro n8n ----------------
        if (handler_code === 'handler_julia') {
          var target_url = (params && params.webhook_url)
            ? params.webhook_url
            : 'https://jeab-n8n.theworkpc.com/webhook/lmresortskommo';

          var request_data = {
            message    : '{{message_text}}',
            lead_id    : '{{lead.id}}',
            contact_id : '{{contact.id}}',
            name       : '{{contact.name}}'
          };

          return JSON.stringify([
            {
              question: [
                {
                  handler: 'widget_request',
                  params: {
                    url  : target_url,
                    data : request_data
                  }
                }
              ]
            }
          ]);
        }

        // ---- Handler 2: Jul.IA — notifica atendente --------------------
        if (handler_code === 'handler_notify') {
  return JSON.stringify([
    {
      question: [
        {
          handler: 'widget_request',
          params: {
            url: 'https://jeab-n8n.theworkpc.com/webhook/lmresortskommo-notify',
            data: {
              lead_id  : '{{lead.id}}',
              lead_name: '{{lead.name}}'
            }
          }
        }
      ]
    }
  ]);
}

        // Fallback (não deve acontecer)
        return JSON.stringify([]);
      }

    };

    return this;
  };

  return CustomWidget;
});