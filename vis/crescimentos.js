looker.plugins.visualizations.add({
  options: {
    produto_field: {
      type: "field",
      label: "Campo Produto",
      section: "Campos",
      display: "select",
      placeholder: "Escolha o campo de produto",
    },
    canal_field: {
      type: "field",
      label: "Campo Canal",
      section: "Campos",
      display: "select",
      placeholder: "Escolha o campo de canal",
    },
    edicao_field: {
      type: "field",
      label: "Campo Edição",
      section: "Campos",
      display: "select",
      placeholder: "Escolha o campo de edição",
    },
    sorteio_field: {
      type: "field",
      label: "Campo Sorteio",
      section: "Campos",
      display: "select",
      placeholder: "Escolha o campo de sorteio",
    },
    valor_field: {
      type: "field",
      label: "Campo Valor",
      section: "Campos",
      display: "select",
      placeholder: "Escolha o campo de valor",
    },
    totalTitulosPromoAtual_field: {
      type: "field",
      label: "Total Títulos Promo Atual",
      section: "Títulos",
      display: "select",
      placeholder: "Escolha a medida de total promo atual",
    },
    totalTitulosDiaAtualPromoAtual_field: {
      type: "field",
      label: "Total Títulos Dia Atual Promo Atual",
      section: "Títulos",
      display: "select",
      placeholder: "Escolha a medida de total dia atual promo",
    },
    totalTitulosPromoAnterior_field: {
      type: "field",
      label: "Total Títulos Promo Anterior",
      section: "Títulos",
      display: "select",
      placeholder: "Escolha a medida de total promo anterior",
    },
    totalTitulosDiaAtualPromoAnterior_field: {
      type: "field",
      label: "Total Títulos Dia Atual Promo Anterior",
      section: "Títulos",
      display: "select",
      placeholder: "Escolha a medida de total dia atual promo anterior",
    }
  },

  create: function(element, config) {
    element.innerHTML = `
      <style>
        .dash{
            display: flex;
            justify-content: center;
        }

        .legenda {
            font-size: 14px;
            font-style: italic;
        }

        .logo {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .logo img {
            height: 100px;
            padding: 10px;
        }

        .resumo {
            font-size: 26px;
            margin: 20px;
            font-family: Helvetica, Arial, sans-serif;
            width: 780px;
            border-radius: 10px;
            box-shadow: rgb(220, 220, 220) 0px 7px 29px 0px;
        }

        .resumo header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 5px 15px;
        }

        section {
            display: flex;
            justify-content: space-around;
            align-items: center;
            background-color: rgba(210, 210, 210, 0.5);
            border-radius: 0px 0px 10px 10px;
            width: 100%;
        }

        .edicao {
            width: 12%;
            padding: 10px 0px;
        }

        p {
            padding: 0px;
            margin: 0px;
        }

        .valor {
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

        @media (max-width: 768px) {
            .legenda {
                font-size: 6px;
                font-style: italic;
            }

            .logo img {
                height: 50px;
            }

            .resumo {
              font-size: 12px;
              width: 100%;
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

    // Verifica se os campos foram selecionados
    let produtoField = config.produto_field;
    let canalField = config.canal_field;
    let edicaoField = config.edicao_field;
    let sorteioField = config.sorteio_field;
    let valorField = config.valor_field;

    let totalTitulosPromoAtualField = config.totalTitulosPromoAtual_field;
    let totalTitulosDiaAtualPromoAtualField = config.totalTitulosDiaAtualPromoAtual_field;
    let totalTitulosPromoAnteriorField = config.totalTitulosPromoAnterior_field;
    let totalTitulosDiaAtualPromoAnteriorField = config.totalTitulosDiaAtualPromoAnterior_field;

    let totalsByProduct = {};

    var produto;
    var codigoProduto;
    var canal;
    var edicao;
    var sorteio;
    var valor;

    var totalTitulosPromoAtual;
    var totalTitulosDiaAtualPromoAtual;
    var totalTitulosPromoAnterior;
    var totalTitulosDiaAtualPromoAnterior;

    // First pass: accumulate totals and store rows by product and canal
    data.forEach(function(row) {
      // Verifica se os campos obrigatórios foram escolhidos
      if (!produtoField || !canalField || !edicaoField || !sorteioField || !valorField ||
        !totalTitulosPromoAtualField || !totalTitulosDiaAtualPromoAtualField ||
        !totalTitulosPromoAnteriorField || !totalTitulosDiaAtualPromoAnteriorField) {
          produto = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[0].name]);
          codigoProduto = row[queryResponse.fields.dimensions[1].name].value;
          canal = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[2].name]);
          edicao = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[3].name]);
          sorteio = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[4].name]);
          valor = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[5].name]);
    
          totalTitulosPromoAtual = parseFloat(row[queryResponse.fields.measures[0].name].value);
          totalTitulosDiaAtualPromoAtual = parseFloat(row[queryResponse.fields.measures[1].name].value);
    
          totalTitulosPromoAnterior = parseFloat(row[queryResponse.fields.measures[2].name].value);
          totalTitulosDiaAtualPromoAnterior = parseFloat(row[queryResponse.fields.measures[3].name].value);
        return;
      }
      else {
        produto = LookerCharts.Utils.htmlForCell(row[produtoField.name]);  // Use field.name para pegar o valor
        canal = LookerCharts.Utils.htmlForCell(row[canalField.name]);
        edicao = LookerCharts.Utils.htmlForCell(row[edicaoField.name]);
        sorteio = LookerCharts.Utils.htmlForCell(row[sorteioField.name]);
        valor = LookerCharts.Utils.htmlForCell(row[valorField.name]);
  
        totalTitulosPromoAtual = parseFloat(row[totalTitulosPromoAtualField.name].value);
        totalTitulosDiaAtualPromoAtual = parseFloat(row[totalTitulosDiaAtualPromoAtualField.name].value);
        totalTitulosPromoAnterior = parseFloat(row[totalTitulosPromoAnteriorField.name].value);
        totalTitulosDiaAtualPromoAnterior = parseFloat(row[totalTitulosDiaAtualPromoAnteriorField.name].value);
      }

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
          sorteio: sorteio,
          codigoProduto: codigoProduto
        };
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
      let codigoProduto = totalsByProduct[produto].codigoProduto;

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
      <div class="dash">
        <div class="resumo">
          <header>
            <div class="logo">
                <img src="https://storage.googleapis.com/idea-data-homol-looker-artifacty/logo/${codigoProduto}.png" />
                <p>${produto}</p>
            </div>
            <div>
              <p class="legenda">Data do Sorteio</p>
              <p>${sorteio}</p>
            </div>
          </header>

          <section>
            <div class="promocao">
                <div class="edicao">
                    <p class="legenda">Edição</p>
                    <p>${edicao}</p>
                </div>
                <div class="valor">
                    <p class="legenda">Valor</p>
                    <p>${valor}</p>
                </div>
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
                  <p class="legenda">Dia</p>
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
                  <p class="legenda">ΔTotal</p>
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
                    <p class="legenda">ΔTotal</p>
                    <p class="${canalTotalTitulosPromoAtualVarClass}">${canalTotalTitulosPromoAtualVar}%</p>
                  </div>
                  `;
                }).join('')}
              </div>

              <div class="col">
                <div>
                  <p class="legenda">ΔDia</p>
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
                    <p class="legenda">ΔDia</p>
                    <p class="${canalTotalTitulosPromoAtualVarClass}">${canalTotalTitulosPromoAtualVar}%</p>
                  </div>
                  `;
                }).join('')}
              </div>

            </div>
          </section>
        </div>
      </div>
      `;
    });


    // Insert the generated HTML into the container
    this._tableElement.innerHTML = htmlContent;

    done();
  }


});
