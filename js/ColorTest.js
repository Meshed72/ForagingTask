///** Created by Matan Eshed 11/24 **/

// Phase 5
var colors = TaskParams.TEST_COLORS;

var selectedValues = {};
var disabledValues = {};
var truthValues = {};

for (let i = 1; i <= TaskParams.TEST_COLORS.length; i++) {
    truthValues[TaskParams.TEST_COLORS[i - 1]] = i;
}

// Change colors order
let temp = colors[2]
colors[2] = colors[5]
colors[5] = temp
temp = colors[3]
colors[3] = colors[8]
colors[8] = temp
temp = colors[7]
colors[7] = colors[6]
colors[6] = temp

var currentSelectValue;

var row1 = document.getElementById("row1");
var row2 = document.getElementById("row2");

// Create colored squares and dropdowns
var colorIndex = 1;
colors.forEach(function(color) {
    var squareCell = document.createElement("td");
    var square = document.createElement("div");
    square.className = "color-square";
    square.style.backgroundColor = color;
    squareCell.appendChild(square);
    row1.appendChild(squareCell);

    var selectCell = document.createElement("td");
    var select = document.createElement("select");
    select.id = color;
    var defaultOption = document.createElement("option");
    if(colorIndex == 1){
        defaultOption.value = 1;
        defaultOption.text = 1;
        select.appendChild(defaultOption);
    } else if (colorIndex == 10){
        defaultOption.value = 10;
        defaultOption.text = 10;
        select.appendChild(defaultOption);
    } else {
        defaultOption.value = "";
        defaultOption.text = "";
        select.appendChild(defaultOption);
        for (var i = 2; i <= 9; i++) {
            var option = document.createElement("option");
            option.value = i;
            option.text = i;
            select.appendChild(option);
        }
    }    
    selectCell.appendChild(select);
    row2.appendChild(selectCell);
    colorIndex++;
});

// Set first and last square with fixed values
document.querySelectorAll("select")[0].value = 1
document.querySelectorAll("select")[colors.length - 1].value = 10
document.querySelectorAll("select")[0].disabled = true
document.querySelectorAll("select")[colors.length - 1].disabled = true

function submitValues(taskManager) {
    var dropdowns = document.querySelectorAll("select");
    var isValid = true;
    var totalDifference = 0;

    dropdowns.forEach(function(dropdown) {
        var color = dropdown.id;
        var value = dropdown.value;

        if (value === "") {
            isValid = false;
        }

        selectedValues[color] = value;
    });
    
    if (!isValid) {
        alert("Please select values for all dropdowns.");
        return;
    } else {
        // Submit
        // Calculate the total difference
        Object.keys(selectedValues).forEach(function(color) {
            var selectedValue = parseInt(selectedValues[color]);
            var truthValue = truthValues[color];
            totalDifference += Math.abs(selectedValue - truthValue);
        });

        console.log("Total Difference:", totalDifference);

        var subjectData = {
            "subject_id" : localStorage.getItem("PROLIFIC_PID"), 
            "color_test_score" : totalDifference,
            "color_test_length": (Date.now() - taskManager.colorTestStartTime)/1000/60
        }; 

        taskManager.reporter.reportData({"subject_data" : subjectData});
        taskManager.phase = 6; // Practice step 2
        taskManager.init();
    }    
}

document.querySelectorAll('select').forEach(function(select) {
    select.addEventListener('click', function() {
        currentSelectValue = this.value;
    });
});

document.querySelectorAll('select').forEach(function(select) {
    select.addEventListener('change', function() {
        var selectedValue = this.value;

        // Add selected value to disabled values
        if (selectedValue !== "") {
            disabledValues[selectedValue] = true;
        }
        
        // Remove selected value from disabled values when deselected
        if (this.value != currentSelectValue) {
            delete disabledValues[currentSelectValue];
        }
                        
        // Update other dropdowns according to accumulated values
        document.querySelectorAll('select').forEach(function(select) {
            var options = select.querySelectorAll('option');
            options.forEach(function(option) {
                if (disabledValues[option.value]) {
                    option.disabled = true;
                } else {
                    option.disabled = false;
                }
            });
        });
    });
});