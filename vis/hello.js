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
          /* Vertical centering */
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
          color: blue
        }
        .hello-world-text-large {
          font-size: 72px;
        }
        .hello-world-text-small {
          font-size: 18px;
        }
      </style>
    `;

    // Create a container element to let us center the text.
    var container = element.appendChild(document.createElement("div"));
    container.className = "hello-world-vis";

    // Create an element to contain the text.
    this._textElement = container.appendChild(document.createElement("div"));

  },
  // Render in response to the data or settings changing
  updateAsync: function(data, element, config, queryResponse, details, done) {

    // Clear any errors from previous updates
    this.clearErrors();

    // Check if there are no dimensions and no measures
    if (queryResponse.fields.dimensions.length == 0 && queryResponse.fields.measures.length == 0) {
      this.addError({title: "No Dimensions or Measures", message: "This chart requires dimensions or measures."});
      return;
    }

    // Accessing the first row of data
    var firstRow = data[0];

    // Accessing dimensions (similar to the previous implementation)
    var firstDimension = firstRow[queryResponse.fields.dimensions[0].name];
    firstDimension = LookerCharts.Utils.htmlForCell(firstDimension);

    // Accessing measures (NEW)
    var firstMeasure = firstRow[queryResponse.fields.measures[0].name];
    firstMeasure = LookerCharts.Utils.htmlForCell(firstMeasure);

    // Insert the data into the page (using both dimensions and measures)
    this._textElement.innerHTML = `
      <p>Dimension: ${firstDimension}</p>
      <p>Measure: ${firstMeasure}</p>
    `;

    // Set the size to the user-selected size
    if (config.font_size == "small") {
      this._textElement.className = "hello-world-text-small";
    } else {
      this._textElement.className = "hello-world-text-large";
    }

    // We are done rendering! Let Looker know.
    done()
  }
});
