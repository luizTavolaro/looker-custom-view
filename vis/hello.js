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

        .logo {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .logo img {
            width: 250px;
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

        p {
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

      let totalTitulosPromoAtual = parseFloat(row[queryResponse.fields.measures[0].name].value);
      let totalTitulosDiaAtualPromoAtual = parseFloat(row[queryResponse.fields.measures[1].name].value);

      let totalTitulosPromoAnterior = parseFloat(row[queryResponse.fields.measures[2].name].value);
      let totalTitulosDiaAtualPromoAnterior = parseFloat(row[queryResponse.fields.measures[3].name].value);

      // Initialize the product key if it doesn't exist
      if (!totalsByProduct[produto]) {
        totalsByProduct[produto] = { 
          totalTitulosPromoAtual: 0, 
          totalTitulosDiaAtualPromoAtual: 0, 
          totalTitulosPromoAnterior: 0, 
          totalTitulosDiaAtualPromoAnterior: 0, 
          canais: {}, 
          edicao: edicao, 
          valor: valor, 
          sorteio:sorteio };
      }

      // Accumulate the totals for the product
      totalsByProduct[produto].totalTitulosPromoAtual += totalTitulosPromoAtual;
      totalsByProduct[produto].totalTitulosDiaAtualPromoAtual += totalTitulosDiaAtualPromoAtual;
      totalsByProduct[produto].totalTitulosPromoAnterior += totalTitulosPromoAnterior;
      totalsByProduct[produto].totalTitulosDiaAtualPromoAnterior += totalTitulosDiaAtualPromoAnterior;

      // Store data for each canal
      if (!totalsByProduct[produto].canais[canal]) {
        totalsByProduct[produto].canais[canal] = { 
          totalTitulosPromoAtual: 0, 
          totalTitulosDiaAtualPromoAtual: 0,
          totalTitulosPromoAnterior: 0, 
          totalTitulosDiaAtualPromoAnterior: 0, 
        };
      }

      totalsByProduct[produto].canais[canal].totalTitulosPromoAtual += totalTitulosPromoAtual;
      totalsByProduct[produto].canais[canal].totalTitulosDiaAtualPromoAtual += totalTitulosDiaAtualPromoAtual;
      totalsByProduct[produto].canais[canal].totalTitulosPromoAnterior += totalTitulosPromoAnterior;
      totalsByProduct[produto].canais[canal].totalTitulosDiaAtualPromoAnterior += totalTitulosDiaAtualPromoAnterior;
    });

    // Build the HTML for each product
    let htmlContent = '';

    Object.keys(totalsByProduct).forEach(function(produto) {
      var totalTitulosPromoAtual = totalsByProduct[produto].totalTitulosPromoAtual;
      var totalTitulosDiaAtualPromoAtual = totalsByProduct[produto].totalTitulosDiaAtualPromoAtual;
      var totalTitulosPromoAnterior = totalsByProduct[produto].totalTitulosPromoAnterior;
      var totalTitulosDiaAtualPromoAnterior = totalsByProduct[produto].totalTitulosDiaAtualPromoAnterior;

      let edicao = totalsByProduct[produto].edicao;
      let sorteio = totalsByProduct[produto].sorteio;
      let valor = totalsByProduct[produto].valor;
    
      // Verificação de divisão por zero para total do produto
      var totalTitulosPromoAtualVar = (totalTitulosPromoAtual == 0 || totalTitulosPromoAnterior == 0) 
        ? 0 
        : ((totalTitulosPromoAtual / totalTitulosPromoAnterior - 1) * 100);
      var totalTitulosPromoAtualVarClass = totalTitulosPromoAtualVar > 0 ? 'green' : 'red';
      totalTitulosPromoAtualVar = totalTitulosPromoAtualVar.toFixed(2).replace('.', ',');

      var totalTitulosDiaAtualPromoAtualVar = (totalTitulosDiaAtualPromoAtual == 0 || totalTitulosDiaAtualPromoAnterior == 0) 
        ? 0 
        : ((totalTitulosDiaAtualPromoAtual / totalTitulosDiaAtualPromoAnterior - 1) * 100);
      var totalTitulosDiaAtualPromoAtualVarClass = totalTitulosDiaAtualPromoAtualVar > 0 ? 'green' : 'red';
      totalTitulosDiaAtualPromoAtualVar = totalTitulosDiaAtualPromoAtualVar.toFixed(2).replace('.', ',');
    
      // Determina a classe CSS para cor
    
      // Construção do HTML
      htmlContent += `
        <div class="resumo">
          <header>
            <div class="logo">
                <img src="https://hipercapbrasil.com.br/wp-content/uploads/2021/02/hc_brasil_branco.png"/>
                <p>${produto}</p>
            </div>
            <div>
              <p class="legenda">Data do Sorteio</p>
              <p>${sorteio}</p>
            </div>
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
                  <p>${totalTitulosPromoAtual}</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalTotalTitulosPromoAtual = totalsByProduct[produto].canais[canal].totalTitulosPromoAtual;
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p>${canalTotalTitulosPromoAtual}</p>
                  </div>
                  `;
                }).join('')}
              </div>
    
              <div class="col">
                <div>
                  <p class="legenda">Total</p>
                  <p>${totalTitulosDiaAtualPromoAtual}</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalTotalTitulosDiaAtualPromoAtual = totalsByProduct[produto].canais[canal].totalTitulosDiaAtualPromoAtual;
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p>${canalTotalTitulosDiaAtualPromoAtual}</p>
                  </div>
                  `;
                }).join('')}
              </div>
    
              <div class="col">
                <div>
                  <p class="legenda">Total</p>
                  <p class="${totalTitulosPromoAtualVarClass}">${totalTitulosPromoAtualVar}%</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalTotalTitulosPromoAtual = totalsByProduct[produto].canais[canal].totalTitulosPromoAtual;
                  var canalTotalTitulosPromoAnterior = totalsByProduct[produto].canais[canal].totalTitulosPromoAnterior;
    
                  // Verificação de divisão por zero para cada canal
                  var canalTotalTitulosPromoAtualVar = (canalTotalTitulosPromoAtual == 0 || canalTotalTitulosPromoAnterior == 0) ? 0 : (((canalTotalTitulosPromoAtual / canalTotalTitulosPromoAnterior) - 1) * 100);
                  var canalTotalTitulosPromoAtualVarClass = canalTotalTitulosPromoAtualVar > 0 ? 'green' : 'red';
                  canalTotalTitulosPromoAtualVar = canalTotalTitulosPromoAtualVar.toFixed(2).replace('.', ',');
    
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p class="${canalTotalTitulosPromoAtualVarClass}">${canalTotalTitulosPromoAtualVar}%</p>
                  </div>
                  `;
                }).join('')}
              </div>
    
              <div class="col">
                <div>
                  <p class="legenda">Total</p>
                  <p class="${totalTitulosDiaAtualPromoAtualVarClass}">${totalTitulosDiaAtualPromoAtualVar}%</p>
                </div>
    
                <!-- Divs para Cada Canal -->
                ${Object.keys(totalsByProduct[produto].canais).map(canal => {
                  var canalTotalTitulosDiaAtualPromoAtual = totalsByProduct[produto].canais[canal].totalTitulosDiaAtualPromoAtual;
                  var canalTotalTitulosDiaAtualPromoAnterior = totalsByProduct[produto].canais[canal].totalTitulosDiaAtualPromoAnterior;
    
                  // Verificação de divisão por zero para cada canal
                  var canalTotalTitulosPromoAtualVar = (canalTotalTitulosDiaAtualPromoAtual == 0 || canalTotalTitulosDiaAtualPromoAnterior == 0) ? 0 : (((canalTotalTitulosDiaAtualPromoAtual / canalTotalTitulosDiaAtualPromoAnterior) - 1) * 100);
                  var canalTotalTitulosPromoAtualVarClass = canalTotalTitulosPromoAtualVar > 0 ? 'green' : 'red';
                  canalTotalTitulosPromoAtualVar = canalTotalTitulosPromoAtualVar.toFixed(2).replace('.', ',');
    
                  return `
                  <div>
                    <p class="legenda">${canal}</p>
                    <p class="${canalTotalTitulosPromoAtualVarClass}">${canalTotalTitulosPromoAtualVar}%</p>
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
