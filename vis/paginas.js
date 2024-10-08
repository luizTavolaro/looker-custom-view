looker.plugins.visualizations.add({
  options: {
    font_size: {
      type: "string",
      label: "Font Size",
      values: [
        {"Large": "large"},
        {"Small": "small"}
      ],
      display: "radio",
      default: "large"
    },
    custom_url: {
      type: "string",
      label: "Custom Dashboard URL",
      display: "text",
      default: "" // A URL base do dashboard do Looker
    }
  },

  create: function(element, config) {
    element.innerHTML = `
      <style>
      </style>
    `;

    var container = element.appendChild(document.createElement("div"));
    this._tableElement = container.appendChild(document.createElement("div"));
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    if (queryResponse.fields.dimensions.length == 0 && queryResponse.fields.measures.length == 0) {
      this.addError({title: "No Data", message: "This chart requires dimensions or measures."});
      return;
    }

    // Captura a URL do dashboard personalizada inserida pelo usuário
    let customUrl = config.custom_url || '';

    let htmlContent = '';

    // Itera sobre cada linha e insere o valor da célula dentro da tag <p>
    data.forEach(function(row) {
      let cellValue = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[0].name]);

      // Monta a URL com o filtro dinâmico
      let dashboardUrl = `${customUrl}?f[${queryResponse.fields.dimensions[0].name}]=${encodeURIComponent(cellValue)}`;

      // Exibe o valor da célula e o transforma em um link que direciona para o dashboard com o filtro
      htmlContent += `<p><a href="${dashboardUrl}" target="_blank">${cellValue}</a></p>`;
    });

    // Insere o HTML gerado no container
    this._tableElement.innerHTML = htmlContent;

    done();
  }
});
