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

    // Clear any errors from previous updates
    this.clearErrors();

    // Check if there are no dimensions or measures
    if (queryResponse.fields.dimensions.length == 0 && queryResponse.fields.measures.length == 0) {
      this.addError({title: "No Data", message: "This chart requires dimensions or measures."});
      return;
    }

    // Build a table header
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

    // Iterate over the data and build the rows for the table
    data.forEach(function(row) {
      var produto = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[0].name]); // Produto
      var canal = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.dimensions[1].name]);   // Canal de Venda
      var totalVendas = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.measures[0].name]); // Total de Vendas
      var valorTotal = LookerCharts.Utils.htmlForCell(row[queryResponse.fields.measures[1].name]); // Valor Total

      // Build the table row with the data
      tableHTML += `
        <tr>
          <td>${produto}</td>
          <td>${canal}</td>
          <td>${totalVendas}</td>
          <td>${valorTotal}</td>
        </tr>
      `;
    });

    // Close the table tag
    tableHTML += `
        </tbody>
      </table>
    `;

    // Insert the table into the container
    this._tableElement.innerHTML = tableHTML;

    // Set the size to the user-selected size
    if (config.font_size == "small") {
      this._tableElement.className = "hello-world-text-small";
    } else {
      this._tableElement.className = "hello-world-text-large";
    }

    // Let Looker know rendering is complete
    done();
  }
});
