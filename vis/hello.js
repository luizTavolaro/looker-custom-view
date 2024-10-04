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
        .legenda {
            font-size: 14px;
            font-style: italic;
        }

        .resumo {
            font-size: 26px;
            margin: 20px;
            font-family: Helvetica, Arial, sans-serif;
        }

        .resumo header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 15px;
        }

        section {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(210, 210, 210, 0.5);
            box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
            width: 100%;
            border-radius: 10px;
        }

        section .edicao {
            width: 12%;
            padding: 0px 15px;
        }

        section * p {
            padding: 0px;
            margin: 0px;
        }

        section .valor {
            width: 13%;
        }

        section .totais {
            display: flex;
            width: 75%;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        section .totais div {
            width: 100%;
        }

        section .totais div div {
            padding: 10px 0px;
        }

        .col {
            margin: 15px 0px;
            border-left: solid 2px black;
        }
        
        .green {
            color: green;
        }

        .red {
            color: red;
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

    let totalsByProduct = {};

    // First pass: accumulate totals and store rows by product and canal
    data.forEach(function(row) {
      let produto = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[0].name]);
      let canal = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[1].name]);
      let edicao = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[2].name]);
      let sorteio = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[3].name]);
      let valor = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[4].name]);
      let totalVendas = parseFloat(row[queryResponse.fields.measures[0].name].value);
      let valorTotal = parseFloat(row[queryResponse.fields.measures[1].name].value);

      // Initialize the product key if it doesn't exist
      if (!totalsByProduct[produto]) {
        totalsByProduct[produto] = { totalVendas: 0, valorTotal: 0, canais: {}, edicao: edicao, valor: valor, sorteio:sorteio };
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
      let edicao = totalsByProduct[produto].edicao;
      let sorteio = totalsByProduct[produto].sorteio;
      let valor = totalsByProduct[produto].valor;
    
      // Verificação de divisão por zero para total do produto
      var totalVendasVar = (valorTotal == 0 || totalVendas == 0) ? 0 : ((totalVendas / valorTotal - 1) * 100);
      var totalVendasVarClass = totalVendasVar > 0 ? 'green' : 'red';
      totalVendasVar = totalVendasVar.toFixed(2).replace('.', ',');
      
      var valorTotalVar = (valorTotal == 0 || totalVendas == 0) ? 0 : ((totalVendas / valorTotal - 1) * 100);
      var valorTotalVarClass = valorTotalVar > 0 ? 'green' : 'red';
      valorTotalVar = valorTotalVar.toFixed(2).replace('.', ',');
    
      // Determina a classe CSS para cor
    
      // Construção do HTML
      htmlContent += `
        <div class="resumo">
          <header>
            <span>${produto}</span>
            <span>Data do Sorteio: ${sorteio}</span>
          </header>
    
          <section>
            <div class="edicao">
              <p class="legenda">Edição</p>
              <p>${edicao}</p>
            </div>
            <div class="valor">
              <p class="legenda">Valor</p>
              <p>${valor}</p>
            </div>
            <div class="totais">
              <!-- Div para o Total do Produto -->
              <div class="col">
                <div>
                  <p class="legenda">Total</p>
                  <p>${totalVendas}</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalTotalVendas = totalsByProduct[produto].canais[canal].totalVendas;
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p>${canalTotalVendas}</p>
                  </div>
                  `;
                }).join('')}
              </div>
    
              <div class="col">
                <div>
                  <p class="legenda">Total</p>
                  <p>${valorTotal}</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalValorTotal = totalsByProduct[produto].canais[canal].valorTotal;
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p>${canalValorTotal}</p>
                  </div>
                  `;
                }).join('')}
              </div>
    
              <div class="col">
                <div>
                  <p class="legenda">Total</p>
                  <p class="${totalVendasVarClass}">${totalVendasVar}%</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalTotalVendas = totalsByProduct[produto].canais[canal].totalVendas;
                  var canalValorTotal = totalsByProduct[produto].canais[canal].valorTotal;
    
                  // Verificação de divisão por zero para cada canal
                  var var_ = (canalValorTotal == 0 || canalTotalVendas == 0) ? 0 : (((canalTotalVendas / canalValorTotal) - 1) * 100);
                  var varClass = var_ > 0 ? 'green' : 'red';
                  var_ = var_.toFixed(2).replace('.', ',');
    
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p class="${varClass}">${var_}%</p>
                  </div>
                  `;
                }).join('')}
              </div>
    
              <div class="col">
                <div>
                  <p class="legenda">Total</p>
                  <p class="${valorTotalVarClass}">${valorTotalVar}%</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalTotalVendas = totalsByProduct[produto].canais[canal].totalVendas;
                  var canalValorTotal = totalsByProduct[produto].canais[canal].valorTotal;
    
                  // Verificação de divisão por zero para cada canal
                  var var_ = (canalValorTotal == 0 || canalTotalVendas == 0) ? 0 : (((canalTotalVendas / canalValorTotal) - 1) * 100);
                  var varClass = var_ > 0 ? 'green' : 'red';
                  var_ = var_.toFixed(2).replace('.', ',');
    
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p class="${varClass}">${var_}%</p>
                  </div>
                  `;
                }).join('')}
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
