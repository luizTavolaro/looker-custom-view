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
  // Set up the initial state of the visualization
  create: function(element, config) {

    // Insert a <style> tag with some styles we'll use later.
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
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table, th, td {
          border: 1px solid black;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
      </style>
    `;

    // Create a container element to hold the visualization
    var container = element.appendChild(document.createElement("div"));
    container.className = "hello-world-vis";

    // Create an element to contain the table
    this._tableElement = container.appendChild(document.createElement("div"));
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();
  
    if (queryResponse.fields.dimensions.length == 0 && queryResponse.fields.measures.length == 0) {
      this.addError({title: "No Data", message: "This chart requires dimensions or measures."});
      return;
    }
  
    let totalsByProduct = {};
    let rowsByProduct = {};
  
    // Build the table header
    var tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Canal de Venda</th>
            <th>Total de Vendas</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    // First pass: accumulate totals and store rows by product
    data.forEach(function(row) {
      let produto = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[0].name]);
      let canal = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[1].name]);
      let totalVendas = parseFloat(row[queryResponse.fields.measures[0].name].value);
      let valorTotal = parseFloat(row[queryResponse.fields.measures[1].name].value);
  
      // Initialize the product key if it doesn't exist
      if (!totalsByProduct[produto]) {
        totalsByProduct[produto] = { totalVendas: 0, valorTotal: 0 };
        rowsByProduct[produto] = [];
      }
  
      // Accumulate the totals for the product
      totalsByProduct[produto].totalVendas += totalVendas;
      totalsByProduct[produto].valorTotal += valorTotal;
  
      // Store the row data for later use (empty product cell for detail rows)
      rowsByProduct[produto].push(`
        <tr>
          <td></td> <!-- Empty product cell -->
          <td>${canal}</td>
          <td>${totalVendas}</td>
          <td>${valorTotal}</td>
        </tr>
      `);
    });
  
    // Second pass: generate table rows with totals first, then product details
    Object.keys(totalsByProduct).forEach(function(produto) {
      // Add the total row first (with product name and centered)
      tableHTML += `
        <tr>
          <td style="text-align:center;"><strong>${produto}</strong></td>
          <td><strong>Total</strong></td>
          <td><strong>${totalsByProduct[produto].totalVendas}</strong></td>
          <td><strong>${totalsByProduct[produto].valorTotal}</strong></td>
        </tr>
      `;
  
      // Add the detailed rows for the product
      rowsByProduct[produto].forEach(function(rowHTML) {
        tableHTML += rowHTML;
      });
    });
  
    tableHTML += `</tbody></table>`;
  
    // Insert the table into the container
    this._tableElement.innerHTML = tableHTML;
  
    done();
  }
  
  
});
