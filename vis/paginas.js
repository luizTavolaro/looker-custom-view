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
  
      let htmlContent = '';
  
      // Itera sobre cada linha e insere o valor dentro da tag <p>
      data.forEach(function(row) {
        let cellValue = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[0].value]);
        htmlContent += `<p>${cellValue}</p>`;
      });
  
      // Insere o HTML gerado no container
      this._tableElement.innerHTML = htmlContent;
  
      done();
    }
  });
  