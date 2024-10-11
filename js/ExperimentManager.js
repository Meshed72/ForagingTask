isChrome;
clickDisabled = false;

// In order to avoid multiple clicks on the submit button
if(document.querySelector("#submit-questionnaire") !== null){
    document.querySelector("#submit-questionnaire").addEventListener("click", function(){
        clickDisabled = true;
        // document.querySelector("#submit-questionnaire").style.visibility = 'hidden';
        setTimeout(function(){
            clickDisabled = false;            

        }, TaskParams.PICK_DELAY * 200);
    });
}

function initExperiment(){        
    isChrome = isChrome();
    const urlParams = new URLSearchParams(window.location.search);
    let rand =  + Math.floor(Math.random() * 10000);
    // Remove exiting Ids
    localStorage.removeItem("PROLIFIC_PID");
    localStorage.removeItem("STUDY_ID");
    localStorage.removeItem("SESSION_ID");
    // Insert new Ids
    localStorage.setItem("PROLIFIC_PID", urlParams.get('PROLIFIC_PID') === null ? "test_subject_" + rand : urlParams.get('PROLIFIC_PID'));
    localStorage.setItem("STUDY_ID", urlParams.get('STUDY_ID') === null ? "test_study_" + rand : urlParams.get('STUDY_ID'));
    localStorage.setItem("SESSION_ID", urlParams.get('SESSION_ID') === null ? "test_session_" + rand : urlParams.get('SESSION_ID'));      
    localStorage.setItem("SUBJECT_UUID", crypto.randomUUID());  
    
    //Set initial report event listener    
    document.querySelector("#start-button").addEventListener("click", function(){
        reporter = new Reporter();
        var subjectData = {
            "subject_id" : localStorage.getItem("PROLIFIC_PID"), 
            // "start_time" : reporter.getCurrentDateTime(),             
            "study_id" : localStorage.getItem("STUDY_ID"), 
            "session_id" : localStorage.getItem("SESSION_ID"), 
            "subject_uuid" : localStorage.getItem("SUBJECT_UUID")
        };    
        reporter.reportData({"subject_data" : subjectData});
    });        
}

function initTask(){
    document.querySelector('.circle').style.display = "none";
    taskManager = new TaskManager(new Reporter())
    taskManager.init();    
}

class Reporter{    
    getCurrentDateTime(){
        let yourDate = new Date()
        const offset = yourDate.getTimezoneOffset()
        yourDate = new Date(yourDate.getTime() - (offset*60*1000))
        return yourDate.toISOString().split('T')[0] + " " + yourDate.toISOString().split('T')[1]
    }

    reportData(data, href){
        var xhr = new XMLHttpRequest();
        var url = "/foraging_task/report_task_data";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {                
                console.log("Data sent");
                if(href !== undefined){
                    window.location.href = href;
                }
            }
        };
            
        xhr.send(JSON.stringify(data)); 
    }
}

function navigateTo(page){
    if(isChrome){
        window.location.href = "/" + page
    } else {
        alert("This task can only run on a Chrome browser. Please copy the URL and paste it in a Chrome browser if you wish to proceed.");
    }    
}

function initQuiestionnaire(name){
    document.querySelector("[name=subject_id]").value = localStorage.getItem("PROLIFIC_PID");
    document.querySelector("[name=subject_uuid]").value = localStorage.getItem("SUBJECT_UUID");

    // Set all radio boxes to have no value selected
    const radioBoxes = document.querySelectorAll('input[type="radio"]');
    radioBoxes.forEach(radio => {
        radio.checked = false;
        radio.addEventListener('click', (event) => {
            const item = event.target.name;
            const value = event.target.value;    
            // Update the value of the clicked radio button
            document.querySelector(`input[name="${item}"][value="${value}"]`).checked = true;            
        });
    });

    document.getElementById("oci_instructions").style.display = "none";
    document.getElementById("dass_instructions").style.display = "none";
    document.getElementById("aaq_instructions").style.display = "none";

    if(name == 'oci'){
        document.getElementById("oci_instructions").style.display = "block";                
    } else if(name == 'dass'){
        document.getElementById("dass_instructions").style.display = "block";
    } else if(name == 'aaq'){
        document.getElementById("aaq_instructions").style.display = "block";
    }
}

function isChrome(){
    var isChrome;

    // Method 1
    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edg") > -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
        isChrome = true;
    } else if(
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isOpera === false &&
        isIEedge === false
    ) {
        isChrome = true;
    } else { 
        isChrome = false;
    }

    // Method 2
    var ua = navigator.userAgent.toLowerCase(); 
    if (ua.indexOf('safari') != -1) { 
        if (ua.indexOf('chrome') > -1) {
            isChrome = true;
        } else {
            isChrome = false;
        }
    }

    // Method 3
    isChrome = window.safari === undefined;
    
    return isChrome;
}
