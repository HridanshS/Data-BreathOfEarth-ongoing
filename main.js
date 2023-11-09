

let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1, 2, 3, 4],
        svgUpdate: drawAQIValuesGraph1
    },
    {
        activeVerse: 2,
        activeLines: [1, 2, 3, 4],
        svgUpdate: drawAggFreqGraph2
    },
    {
        activeVerse: 3,
        activeLines: [1, 2, 3, 4],
        svgUpdate: continentAQIGraph3
    },
    {
        activeVerse: 4,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 5,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 6,
        activeLines: [1, 2, 3, 4]
    }
]


let chart;
let chartWidth;
let chartHeight;

// Declare both scales too
let xScale;
let yScale;


const width = 600;
const height = 400;


let svg = d3.select("#svg");
let keyframeIndex = 0;

document.getElementById("forward-button").addEventListener("click", forwardClicked);
document.getElementById("backward-button").addEventListener("click", backwardClicked);



let Graph1Data;
let AggFreqData; //Graph2
var whichGraph = null;

async function loadData() {
    
    await d3.csv("pivoted_air_pollution_data.csv").then(data => { //the original dataset was pivoted to generate this dataset. It is a summarized version where each row represents one country
        Graph1Data = data;
        //console.log(Graph1Data);
        //console.log(typeof(Graph1Data[0].Num_Occurrences));
        //console.log(typeof(parseInt(Graph1Data[0].Num_Occurrences)));


        //min and max values based on data
        //console.log(d3.min(Graph1Data, d => parseFloat(d.AQI_Value)));
        const xMin = d3.min(Graph1Data, d => parseFloat(d.AQI_Value));
        const xMax = d3.max(Graph1Data, d => parseFloat(d.AQI_Value));
    
        const xSlider = document.getElementById("xAxisSlider");
        const xSliderValue = document.getElementById("xAxisSliderValue");
        //set the min and max values
        xSlider.setAttribute("min", xMin);
        xSlider.setAttribute("max", xMax);
        xSlider.value = xMax;
        xSliderValue.textContent = xMax;


        const countries = Array.from(new Set(Graph1Data.map(d => d.Country)));//["USA", "Canada", "UK", "Australia", "Germany", "France", "India"];

        const countryDropdown = document.getElementById("countryDropdown");

        // Populate the dropdown with options
        countries.forEach((country) => {
        const option = document.createElement("option");
        option.value = country;
        option.text = country;
        countryDropdown.appendChild(option);
        });

        // Event listener to handle selections
        countryDropdown.addEventListener("change", function () {
        const selectedCountries = Array.from(countryDropdown.selectedOptions).map(option => option.value);
        updateChart1(Graph1Data, selectedCountries, "Various AQI Values by No. of Occurrences of Country in Dataset")
        //updateGraph1(selectedCountries); //remove UpdateGraph1 entirely
        });
    
    });
    await d3.csv("graph2_pivoted_air_pollution_data.csv").then(data => { //the original dataset was pivoted to generate this dataset. It is a summarized version where each row represents one country
        AggFreqData = data;
        //console.log(AggFreqData);

        const variables = Array.from(new Set(AggFreqData.map(d => d.Variable)));//["AQI", "Ozone", "PM2.5", "NO2", "CO"];
        const variablesDropdown = document.getElementById("variableDropdown");

        // Populate the dropdown with options
        variables.forEach((variable) => {
        const option = document.createElement("option");
        option.value = variable;
        option.text = variable;
        variableDropdown.appendChild(option);
        });

        // Event listener to handle selections
        variableDropdown.addEventListener("change", function () {
            const selectedVar = variableDropdown.value;
            updateChart2(AggFreqData, selectedVar, "Aggregate Frequency of Selected AQI Variable in Cities");
        });
    });

    await d3.csv("graph3_continent_unhealthy_count.csv").then(data => { //the original dataset was pivoted to generate this dataset. It is a summarized version where each row represents one country
        continentAQIData = data;
        //console.log(continentAQIData);
        const options = ["AQI_Unhealthy", "CO_Unhealthy", "PM2_5_Unhealthy", "Ozone_Unhealthy", "NO2_Unhealthy"];
        const optionsDropdown = document.getElementById("unhealthyVariableDropdown");

        // Populate the dropdown with options
        options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.text = opt;
        optionsDropdown.appendChild(option);
        });

        // Event listener to handle selections
        unhealthyVariableDropdown.addEventListener("change", function () {
            const selectedOpt = unhealthyVariableDropdown.value;
            updateChart3(continentAQIData, selectedOpt, "Ozone and PM2.5 AQI Values by Continent");
        });
    });
}

/* Implementing filters:
1) Maintain two vars - Graph1Data, FilteredData
2) Function: When changes made to filter, FilteredData should be updated with Graph1Data, and then FilteredData should be filtered based on range selected
3) then plot the FilteredData
*/


function findMax(arg1, arg2, arg3) {
    return Math.max(arg1, arg2, arg3);
}

function updateVisibleFilters(whichGraph) {
    const xAxisFilter = d3.select("#xAxisSlider");
    const xAxisFilterValue = d3.select("#xAxisSliderValue");
    const xAxisFilterText = d3.select("#xAxisSliderText");

    const selectCountriesFilter = d3.select("#countryDropdown");
    const selectCountriesFilterText = d3.select("#countryDropdownText");

    const selectVariableFilter = d3.select("#variableDropdown");
    const selectVariableFilterText = d3.select("#variableDropdownText");

    const chooseVariableFilter = d3.select("#unhealthyVariableDropdown");
    const chooseVariableFilterText = d3.select("#unhealthyVariableDropdownText");
    if (whichGraph === 1) {
        //filters: x-axis filter, select countries multi-select
        xAxisFilter.style("display", "block");
        xAxisFilterValue.style("display", "block");
        xAxisFilterText.style("display", "block");

        selectCountriesFilter.style("display", "block");
        selectCountriesFilterText.style("display", "block");

        selectVariableFilter.style("display", "none");
        selectVariableFilterText.style("display", "none");

        chooseVariableFilter.style("display", "none");
        chooseVariableFilterText.style("display", "none");
    } else if (whichGraph === 2) {
        //filters: Select Variable
        xAxisFilter.style("display", "none");
        xAxisFilterValue.style("display", "none");
        xAxisFilterText.style("display", "none");

        selectCountriesFilter.style("display", "none");
        selectCountriesFilterText.style("display", "none");

        selectVariableFilter.style("display", "block");
        selectVariableFilterText.style("display", "block");

        chooseVariableFilter.style("display", "none");
        chooseVariableFilterText.style("display", "none");
    }else if (whichGraph === 3) {
        //filters: choose variable
        xAxisFilter.style("display", "none");
        xAxisFilterValue.style("display", "none");
        xAxisFilterText.style("display", "none");

        selectCountriesFilter.style("display", "none");
        selectCountriesFilterText.style("display", "none");

        selectVariableFilter.style("display", "none");
        selectVariableFilterText.style("display", "none");

        chooseVariableFilter.style("display", "block");
        chooseVariableFilterText.style("display", "block");
    }
}

function initialiseSVG(){
    svg.attr("width",width);
    svg.attr("height",height);

    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;

    chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        xScale = d3.scaleBand()
        .domain([])
        .range([0, chartWidth])
        .padding(0.1);

    yScale = d3.scaleLinear()
        .domain([])
        .nice()
        .range([chartHeight, 0]);

    // Add x-axis
    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    // Add y-axis
    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    // Add title
    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "white")
        .text("");
}


function drawAQIValuesGraph1() {
    updateChart1(Graph1Data, null, "Various AQI Values by No. of Occurrences of Country in Dataset");
}

function drawAggFreqGraph2() {
    updateChart2(AggFreqData, "AQI.Value", "Aggregate Frequency of Selected AQI Variable in Cities");
}

function continentAQIGraph3() {
    updateChart3(continentAQIData, undefined, "Ozone and PM2.5 AQI Values by Continent"); //selectedOpt
}



function forwardClicked() {
    // Make sure we don't let the keyframeIndex go out of range
  if (keyframeIndex < keyframes.length - 1) {
    keyframeIndex++;
    drawKeyframe(keyframeIndex);
  }
}

function backwardClicked() {

    if (keyframeIndex == keyframes.length - 1) {
        svg.selectAll("*").remove();//
        initialiseSVG();
        //updateBarChart(Graph1Data, "Distribution of Rose Colours");
      }
    if (keyframeIndex > 0) {
        keyframeIndex--;
        drawKeyframe(keyframeIndex);
      }
    
}


function drawKeyframe(kfi){
    // Get the current keyframe
    let kf = keyframes[kfi];
  
    // Reset any lines that are currently active
    resetActiveLines();
  
    // Update which verse is currently being displayed as active
    updateActiveVerse(kf.activeVerse);
  
    // Iterate over the active lines for this keyframe and update the active lines one by one
    for (line of kf.activeLines) {
          updateActiveLine(kf.activeVerse, line);
    }
    // We need to check if their is an svg update function defined or not
    if(kf.svgUpdate){
        // If there is we call it like this
        kf.svgUpdate();
    }
  }

function resetActiveLines() {
    // Reset the active-line class for all of the lines
  d3.selectAll(".line").classed("active-line", false);
}

function updateActiveVerse(id) {
    // Reset the current active verse - in some scenarios you may want to have more than one active verse, but I will leave that as an exercise for you to figure out
  d3.selectAll(".verse").classed("active-verse", false);

  // Update the class list of the desired verse so that it now includes the class "active-verse"
  d3.select("#verse" + id).classed("active-verse", true);

  // Scroll the column so the chosen verse is centred
  scrollLeftColumnToActiveVerse(id);

}

function updateActiveLine(vid, lid) {
    // Select the correct verse
  let thisVerse = d3.select("#verse" + vid);
  // Update the class list of the relevant lines
  thisVerse.select("#line" + lid).classed("active-line", true);
}


function scrollLeftColumnToActiveVerse(id) {
    // First we want to select the div that is displaying our text content
    var leftColumn = document.querySelector(".left-column-content");

    // Now we select the actual verse we would like to be centred, this will be the <ul> element containing the verse
    var activeVerse = document.getElementById("verse" + id);

    // The getBoundingClientRect() is a built in function that will return an object indicating the exact position
    // Of the relevant element relative to the current viewport.
    // To see a full breakdown of this read the documentation here: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    var verseRect = activeVerse.getBoundingClientRect();
    var leftColumnRect = leftColumn.getBoundingClientRect();

    // Now we calculate the exact location we would like to scroll to in order to centre the relevant verse
    // Take a moment to rationalise that this calculation does what you expect it to
    var desiredScrollTop = verseRect.top + leftColumn.scrollTop - leftColumnRect.top - (leftColumnRect.height - verseRect.height) / 2;

    // Finally we scroll to the right location using another built in function.
    // The 'smooth' value means that this is animated rather than happening instantly
    leftColumn.scrollTo({
        top: desiredScrollTop,
        behavior: 'smooth'
    })
}




function updateChart1(data, selectedCountries=null, title = "") { //3 different columns shown on same graph
    //xScale.domain(data.map(d => d.colour));
    //yScale.domain([0, d3.max(data, d => d.count)]).nice();
    //console.log(selectedCountries);

    var xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseFloat(d.AQI_Value))])//findMax(d3.max(data, d => d.Ozone_AQI_Value), d3.max(data, d => d.AQI_Value), d3.max(data, d => d.PM2_5_AQI_Value))])//[0,200])//[d3.min(data, d => d.AQI_Value), d3.max(data, d => d.Ozone_AQI_Value)])
    .range([0, width-80]);

    var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseInt(d.Num_Occurrences))]) //2872 is Num_Occurrences for USA //2872])
    .range([height-80, 0]);

    const symbolType = {
        AQI_Value: d3.symbolSquare,
        Ozone_AQI_Value: d3.symbolTriangle,
        PM2_5_AQI_Value: d3.symbolCircle
    };
    // Store the selected country
    let selectedCountry = null;




    // const bars = chart.selectAll(".bar")
    //     .data(data, d => d.colour);

    svg.selectAll(".data-line").remove();
    svg.selectAll(".data-point").remove();
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();
    svg.selectAll(".legend").remove();
    svg.selectAll(".dot").remove();
    svg.select("#x-axis-title").remove();
    svg.select("#y-axis-title").remove();
    svg.select("#chart-title").remove();

    //console.log(selectedCountries);
    if (selectedCountries) {
        //console.log(data);
        data = data.filter(d => selectedCountries.includes(d.Country));
        //console.log(data);
    }

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "data-point")
        .attr("y", function (d) { return yScale(d["Num_Occurrences"]); } ) //not sure why I had to go from cy -> y
        .attr("x", function (d) { return xScale(d["AQI_Value"]); } ) //not sure why I had to go from cx -> x
        //.attr("r", 2) //for circle
        .attr("width", 4) 
        .attr("height", 4) 
        .attr("transform",  "translate(" + 50 + "," + 26 + ")")//"translate(" + -10 + "," + 30 + ")")
        //how to automate this? Why put manual values
        .style("fill", "#CC0000");

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("polygon")
        .attr("class", "data-point")
        //.attr("cy", function (d) { return yScale(d["Num_Occurrences"]); } )
        //.attr("cx", function (d) { return xScale(d["Ozone_AQI_Value"]); } ) 
        .attr("points", "0,-4 2,4 -2,4") //coordinates for triangle
        .attr("transform",  "translate(" + 50 + "," + 26 + ")")//"translate(" + -10 + "," + 30 + ")")
        .attr("transform", function(d) {
            const x = xScale(parseFloat(d["Ozone_AQI_Value"])) + 50;
            const y = yScale(parseInt(d["Num_Occurrences"])) + 26;
            return "translate(" + x + "," + y + ")";
        })
        //how to automate this? Why put manual values
        .style("fill", "#000000")

    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cy", function (d) { return yScale(d["Num_Occurrences"]); } )
        .attr("cx", function (d) { return xScale(d["PM2_5_AQI_Value"]); } )
        .attr("r", 2)
        .attr("transform",  "translate(" + 50 + "," + 26 + ")")//"translate(" + -10 + "," + 30 + ")")
        //how to automate this? Why put manual values
        .style("fill", "#FFFFFF");

    //shapes: AQI value (Square); Ozone AQI (Triangle); PM2.5 AQI (Circle)
    
    // Add x-axis
    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    // Add y-axis
    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    // Add title
    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "black")
        .text("Various AQI Values by No. of Occurrences of Country in Dataset");
    
    svg.append("text")
        .attr("id", "y-axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height/2)+10)//width / 2)
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text("No. of Occurrences of Country in Dataset");

    svg.append("text")
        .attr("id", "x-axis-title")
        .attr("x", width / 2)
        .attr("y", 385)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text("Average Value");

    /*chart.select(".x-axis")
        .call(d3.axisBottom(xScale));

    chart.select(".y-axis")
        .call(d3.axisLeft(yScale));*/
    
    //legend
    /*const colors = ["#FFFFFF", "#000000", "#CC0000"];
    const dots = ["PM2_5_AQI_Value", "Ozone_AQI_Value", "AQI_Value"];
    const legend = svg.selectAll(".legend")
        .data(dots)
        .enter()
        .append("g")
        .attr("class", "legend")
        //.attr("transform",  "translate(" + 50 + "," + 26 + ")");
        .attr("transform", (d, i) => `translate(-5,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colors[d]);
    
    // legend.append("polygon")
    //     .attr("points", "0,-4 2,4 -2,4")
    //     .style("fill", "#000000");

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);*/

        const colors = ["#FFFFFF", "#000000", "#CC0000"];
        const dots = ["PM2_5_AQI_Value", "Ozone_AQI_Value", "AQI_Value"];
        const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 150},${height - 250})`); //change height - 250 to move legend up
        
            // Add a background box for the legend
            const boxWidth = 140;
            const boxHeight = 100;
            legend.append("rect")
                .attr("width", boxWidth)
                .attr("height", boxHeight)
                .style("fill", "orange")
                .style("stroke", "black");
        
            // Add a heading to the legend inside the box
            legend.append("text")
                .attr("x", boxWidth / 2)
                .attr("y", 15)
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .text("Legend:");
        
            // Create individual legend items
            const legendItems = legend.selectAll(".legend-item")
                .data(dots)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(0,${i * 20 + 30})`); // Adjust vertical position
        
            // Add colored rectangles
            legendItems.append("rect")
                .attr("x", 5)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", (d, i) => colors[i]);
        
            // Add text labels
            legendItems.append("text")
                .attr("x", 30)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("font-size", "12px")
                .text(d => d);
    
    // Handle click on a data point
    svg.selectAll(".data-point")
        .on("click", (event, d) => {
            //console.log("hello");
            const clickedCountry = d.Country;
            //console.log(selectedCountry);

            // If it's the same country as the previous click, clear the selection
            if (clickedCountry === selectedCountry) {
                selectedCountry = null;
                svg.selectAll(".data-point").style("opacity", 0.6);
            } else {
                selectedCountry = clickedCountry;
                svg.selectAll(".data-point")
                    .style("opacity", (d) => (d.Country === selectedCountry) ? 1 : 0.1);
            }

            // // Update point opacity based on the selected country
            // svg.selectAll(".data-point")
            //     .style("opacity", (d) => (selectedCountry && d.Country === selectedCountry) ? 1 : 0.3);

            // You can also add code to draw a line connecting the selected points here
        });

    // Modify the opacity for initial rendering
    svg.selectAll(".data-point")
        .style("opacity", 0.6); // Initial opacity

    
    if (selectedCountry) {
        data = data.filter(d => d.Country === selectedCountry);
    }

    if (title.length > 0) {
        svg.select("#chart-title")
            .text(title);
    }
    whichGraph = 1;
    updateVisibleFilters(whichGraph);
}





//Event listener to the slider input element
//document.getElementById("xAxisSlider").addEventListener("input", updateChart1WithFilter);

//are the following lines redundant because it is done on line 72
const xSlider = document.getElementById("xAxisSlider"); 
const xSliderValue = document.getElementById("xAxisSliderValue");

//set the initial label text
const label = document.querySelector("label[for='xAxisSlider']");
label.textContent = "X-Axis Filter: ";

xSlider.addEventListener("input", function() {
  // Update the value in the span
  xSliderValue.textContent = xSlider.value;
  updateChart1WithFilter();
});

function updateChart1WithFilter() { //function to update the chart with the selected range
    //console.log(document.getElementById("xAxisSlider").value);
    const selectedRange = parseInt(document.getElementById("xAxisSlider").value); //Get the selected range from the slider
    const filteredData = Graph1Data.filter(d => parseFloat(d.AQI_Value) <= selectedRange); //Filter the data based on the selected range

    xScale.domain([0, selectedRange]); //update the xScale and redraw the chart
    updateChart1(filteredData, null, "Various AQI Values by No. of Occurrences of Country in Dataset");
}




function updateChart2(data, selectedVar="AQI.Value", title = "") { //3 different columns shown on same graph
    const ogData = data;
    data = data.filter(d => d.Variable === selectedVar);
    var xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseFloat(d.Value))])//findMax(d3.max(Graph1Data, d => d.Ozone_AQI_Value), d3.max(Graph1Data, d => d.AQI_Value), d3.max(Graph1Data, d => d.PM2_5_AQI_Value))])//[0,200])//[d3.min(Graph1Data, d => d.AQI_Value), d3.max(Graph1Data, d => d.Ozone_AQI_Value)])
    .range([0, width-80]);

    var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseInt(d.NumOccurrences))]) //2872 is Num_Occurrences for USA //2872])
    .range([height-80, 0]);

    svg.selectAll(".data-point").remove();
    svg.selectAll(".data-line").remove();
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();
    svg.selectAll(".legend").remove();
    svg.selectAll(".dot").remove();
    svg.select("#x-axis-title").remove();
    svg.select("#y-axis-title").remove();
    svg.select("#chart-title").remove();

    // Create a line generator function
    var lineGenerator = d3.line()
        .x(function (d) { return xScale(parseFloat(d.Value)); })
        .y(function (d) { return yScale(parseInt(d.NumOccurrences)); });


    var dictionary = {
        "AQI.Value": "Overall Air Quality Index Value",
        "CO.AQI.Value": "Carbon Monoxide Air Quality Index Value",
        "NO2.AQI.Value": "Nitrogen Dioxide Air Quality Index Value",
        "Ozone.AQI.Value": "Ozone Air Quality Index Value",
        "PM2.5.AQI.Value": "PM2.5 particles Air Quality Index Value"
    };
    // Create the line graph
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#CC0000")
        .attr("stroke-width", 2)
        .attr("class", "data-line")
        .attr("d", lineGenerator)
        .attr("transform",  "translate(" + 52 + "," + 29 + ")");//+30 is perfect for the y value but it covers the x-axis hence keeping it slightly above
    
    // Add x-axis
    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    // Add y-axis
    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    // Add title
    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "black");
    
    svg.append("text")
        .attr("id", "y-axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height/2)+10)//width / 2)
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text("Occurrence Frequency");

    svg.append("text")
        .attr("id", "x-axis-title")
        .attr("x", width / 2)
        .attr("y", 385)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text(dictionary[selectedVar]);
        //.text("AQI Value");

    /*chart.select(".x-axis")
        .call(d3.axisBottom(xScale));

    chart.select(".y-axis")
        .call(d3.axisLeft(yScale));*/

    if (title.length > 0) {
        svg.select("#chart-title")
            .text(title);
    }

    const tooltip = d3.select("#line-tooltip");


    svg.selectAll(".data-line")
    .on("mouseover", (event) => {
        // Calculate the x-value based on the cursor's position
        //const xValue = xScale.invert(event.offsetX);
        const xValue = xScale.invert(d3.pointer(event)[0]);

        // Find the closest data point based on the x-value
        const closestDataPoint = findClosestDataPoint(data, xValue);

        // Show the tooltip and position it next to the cursor
        tooltip.style("display", "block")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px")
            .html(`${closestDataPoint.Variable}: ${closestDataPoint.Value}<br>Occurrence Frequency: ${closestDataPoint.NumOccurrences}`);
    })
    .on("mouseout", () => {
        // Hide the tooltip on mouseout
        tooltip.style("display", "none");
    });
    whichGraph = 2;
    updateVisibleFilters(whichGraph);
}



// Function to find the closest data point based on x-value
function findClosestDataPoint(data, xValue) {
    //console.log(xValue); //xValue of first point of the line is exactly how much it is off by
    let closestPoint = data[0];
    let closestDistance = Math.abs(xValue - closestPoint.Value);

    for (let i = 1; i < data.length; i++) {
        const distance = Math.abs(xValue - data[i].Value);
        if (distance < closestDistance) {
            closestPoint = data[i];
            closestDistance = distance;
        }
    }

    return closestPoint;
}

function updateChart3(data, selectedOpt="AQI_Unhealthy", title = "") {
    //console.log(data);
    var xScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseFloat(d.PM2_5_AQI_Value))])
    .range([0, width-80]);

    var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => parseInt(d.Ozone_AQI_Value))]) //2872 is Num_Occurrences for USA //2872])
    .range([height-80, 0]);

    svg.selectAll(".data-point").remove();
    svg.selectAll(".data-line").remove();
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();
    svg.selectAll(".legend").remove();
    svg.selectAll(".dot").remove();
    svg.select("#x-axis-title").remove();
    svg.select("#y-axis-title").remove();
    svg.select("#chart-title").remove();

    var dict = {
        "AQI_Unhealthy": "Overall AQI",
        "CO_Unhealthy": "Carbon Monoxide",
        "PM2_5_Unhealthy": "PM2.5 particles",
        "Ozone_Unhealthy": "Ozone",
        "NO2_Unhealthy": "Nitrogen Dioxide"
    };

    //.text(dict[selectedOpt])

    // svg.append("path")
    //     .datum(data)
    //     .attr("fill", "none")
    //     .attr("stroke", "#CC0000")
    //     .attr("stroke-width", 2)
    //     .attr("class", "data-line")
    //     .attr("d", lineGenerator)
    //     .attr("transform",  "translate(" + 52 + "," + 29 + ")");
    
    //color scale for continents
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    //size scale based on "PM2.5_Unhealthy" values
    // const sizeScale = d3.scaleSqrt()
    //     .domain([0, d3.max(data, d => parseFloat(d[selectedOpt]))])
    //     .range([2, 10]);
    const minimumSize = 5; // Define the minimum size for the dots
    const maxSize = 15; // Define the maximum size for the dots
    const maxDataValue = d3.max(data, d => parseFloat(d[selectedOpt]));

    const sizeScale = d3.scaleSqrt()
        .domain([0, maxDataValue])
        .range([minimumSize, maxSize]);

    //circles for each data point
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(parseFloat(d["PM2_5_AQI_Value"])))
        .attr("cy", d => yScale(parseFloat(d["Ozone_AQI_Value"])))
        .attr("r", d => sizeScale(parseFloat(d["PM2_5_Unhealthy"])))
        .style("fill", d => colorScale(d["Continent"]))
        .attr("transform",  "translate(" + 52 + "," + 29 + ")");
    
    // Add x-axis
    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    // Add y-axis
    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    // Add title
    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "black");
    
    svg.append("text")
        .attr("id", "y-axis-title")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height/2)+10)//width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text("Avg. Ozone AQI Value");

    svg.append("text")
        .attr("id", "x-axis-title")
        .attr("x", width / 2)
        .attr("y", 385)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text("Avg. PM2.5 AQI Value");

    if (title.length > 0) {
        svg.select("#chart-title")
            .text(title);
    }

    //legend    
    const continents = Array.from(new Set(data.map(d => d["Continent"])));
    const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 150},${height - 250})`); //change height - 250 to move legend up
    
        // Add a background box for the legend
        const boxWidth = 140;
        const boxHeight = 150;
        legend.append("rect")
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .style("fill", "white")
            .style("stroke", "black");
    
        // Add a heading to the legend inside the box
        legend.append("text")
            .attr("x", boxWidth / 2)
            .attr("y", 15)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Legend:");
    
        // Create individual legend items
        const legendItems = legend.selectAll(".legend-item")
            .data(continents)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0,${i * 20 + 30})`); // Adjust vertical position
    
        // Add colored rectangles
        legendItems.append("rect")
            .attr("x", 5)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => colorScale(d));
    
        // Add text labels
        legendItems.append("text")
            .attr("x", 30)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .text(d => d);


    const tooltip = d3.select("#dot-tooltip");

    svg.selectAll(".dot")
    .on("mouseover", (event, d) => {
        // Show the tooltip and position it next to the cursor
        tooltip.style("display", "block")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px")
            .html(`Continent: ${d["Continent"]}<br># of ${dict[selectedOpt]} Unhealthy in Continent: ${d[selectedOpt]}<br>Avg. PM2.5 AQI Value: ${d["PM2_5_AQI_Value"]}<br>Avg. Ozone AQI Value: ${d["Ozone_AQI_Value"]}`);
    })
    .on("mouseout", () => {
        // Hide the tooltip on mouseout
        tooltip.style("display", "none");
    });
    whichGraph = 3;
    updateVisibleFilters(whichGraph);
}







async function initialise() {
// Now that we are calling an asynchronous function in our initialise function this function also now becomes async
    await loadData();
        //drawAQIValuesGraph1();
        initialiseSVG();
        /*Plot.dot(Graph1Data, {x: "AQI_Value", y: "Num_Occurrences", fill: "Country", symbol: "Country"})
        .plot({nice: true, grid: true, symbol: {legend: true}})*/
        
        //updateVisibleFilters(whichGraph);
    drawKeyframe(keyframeIndex);

}

initialise();
