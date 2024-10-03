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
        .hello-world-vis {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          color: blue;
        }
        .hello-world-text-large {
          font-size: 24px;
        }
        .hello-world-text-small {
          font-size: 14px;
        }
        .resumo {
          margin: 20px;
        }

        .resumo header {
          display: flex;
          justify-content: space-around;
        }

        section {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: gray;
          width: 100%;
        }

        section * {
        }

        section .edicao {
          width: 12%;
        }

        section .valor {
          width: 13%;
        }

        section .totais {
          display: flex;
          width: 75%;
        }

        section .totais div {
          width: 100%;
        }
      </style>
    `;

    var container = element.appendChild(document.createElement("div"));
    container.className = "hello-world-vis";
    this._tableElement = container.appendChild(document.createElement("div"));
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    if (queryResponse.fields.dimensions.length == 0 && queryResponse.fields.measures.length == 0) {
      this.addError({title: "No Data", message: "This chart requires dimensions or measures."});
      return;
    }

    let totalsByProduct = {};

    // First pass: accumulate totals and store rows by product and canal
    data.forEach(function(row) {
      let produto = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[0].name]);
      let canal = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[1].name]);
      let totalVendas = parseFloat(row[queryResponse.fields.measures[0].name].value);
      let valorTotal = parseFloat(row[queryResponse.fields.measures[1].name].value);

      // Initialize the product key if it doesn't exist
      if (!totalsByProduct[produto]) {
        totalsByProduct[produto] = { totalVendas: 0, valorTotal: 0, canais: {} };
      }

      // Accumulate the totals for the product
      totalsByProduct[produto].totalVendas += totalVendas;
      totalsByProduct[produto].valorTotal += valorTotal;

      // Store data for each canal
      if (!totalsByProduct[produto].canais[canal]) {
        totalsByProduct[produto].canais[canal] = { totalVendas: 0, valorTotal: 0 };
      }

      totalsByProduct[produto].canais[canal].totalVendas += totalVendas;
      totalsByProduct[produto].canais[canal].valorTotal += valorTotal;
    });

    // Build the HTML for each product
    let htmlContent = '';

    Object.keys(totalsByProduct).forEach(function(produto) {
      var totalVendas = totalsByProduct[produto].totalVendas;
      var valorTotal = totalsByProduct[produto].valorTotal;

      // For each product, create the HTML block
      htmlContent += `
        <div class="resumo">
          <header>
            <span>${produto}</span>
            <span>"Data Sorteio"</span>
          </header>

          <section>
            <div class="edicao">
              "Edição"
            </div>
            <div class="valor">
              "Valor"
            </div>
            <div class="totais">
              <div>
                <div>${totalVendas}</div>
                <div>${totalVendas}</div>
                <div>${totalVendas}</div>
                <div>${totalVendas}</div>
                <div>${totalVendas}</div>
              </div>
              <div>
                <div>${valorTotal}</div>
                <div>${valorTotal}</div>
                <div>${valorTotal}</div>
                <div>${valorTotal}</div>
                <div>${valorTotal}</div>
              </div>
            </div>
          </section>
        </div>
      `;
    });

    // Insert the generated HTML into the container
    this._tableElement.innerHTML = htmlContent;

    done();
  }

});
