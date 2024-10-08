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
        label: "Custom URL (Looker Dashboard)",
        display: "text",
        default: "" // URL padrão vazia
      },
      filter_name: {
        type: "string",
        label: "Filter Name",
        display: "text",
        default: "" // Nome do filtro a ser usado na URL
      }
    },
  
    create: function(element, config) {
      element.innerHTML = `
        <style>
          .links {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
          }
  
          p {
              padding: 10px;
              margin: 10px;
              box-shadow: rgb(220, 220, 220) 0px 7px 29px 0px;
              border-radius: 16px;
              border: 1px solid rgba(0, 0, 0, 0.5);
          }
  
          a {
              font-size: 20px;
              text-decoration: none;
              font-family: Helvetica, Arial, sans-serif;
              color: black;
          }
          
          @media (max-width: 768px) {
              a {
                font-size: 10px;
              }
          }
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
  
      // Captura a URL personalizada e o nome do filtro inserido pelo usuário
      let customUrl = config.custom_url || '';
      let filterName = config.filter_name || ''; // Nome do filtro na URL
  
      let htmlContent = '';
      htmlContent += `
      <div class="links">
      <p><a href="${customUrl}" target="_blank">Início</a></p>
      `
  
      // Verifica se a URL do dashboard e o nome do filtro estão configurados
      if (!customUrl || !filterName) {
        this.addError({title: "Configuration Error", message: "You must provide a dashboard URL and filter name."});
        return;
      }
  
      // Itera sobre cada linha e insere o valor da célula como link com filtro na URL
      data.forEach(function(row) {
        let cellValue = LookerCharts.Utils.textForCell(row[queryResponse.fields.dimensions[0].name]);
  
        // Monta a URL com o filtro baseado no valor da célula
        let filteredUrl = `${customUrl}?${filterName}=${encodeURIComponent(cellValue)}`;
  
        // Exibe o valor da célula como um link que aplica o filtro ao clicar
        htmlContent += `<p><a href="${filteredUrl}" target="_blank">${cellValue}</a></p>`;
      });
      htmlContent += `</div>`
  
      // Insere o HTML gerado no container
      this._tableElement.innerHTML = htmlContent;
  
      done();
    }
  });
  