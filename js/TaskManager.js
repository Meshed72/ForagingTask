///** Created by Matan Eshed 11/24 **/

class TaskManager{
    constructor(reporter){
        this.reporter = reporter;
        this.matrixBuilder;
        this.phase = TaskParams.TASK_START_PHASE;
        this.totalPhases = 9;
        this.TOTAL_DURATION = TaskParams.TOTAL_DURATION;
        this.subjectId = localStorage.getItem("PROLIFIC_PID");
        this.subjectUuid = localStorage.getItem("SUBJECT_UUID");
        this.startTime;
        this.currentPatchStartTime;
        this.startTimeMilli;
        this.travelDuration = 100;        
        this.numIntervals = 100;
        this.progressInterval;
        this.progressWidth = 0;
        this.clickData = [];
        this.patchData = [];
        this.currentPatch = 1;
        this.progressBar = document.querySelector(".progress-bar");
        this.progressFill =  document.getElementById("progressFill");
        this.submitColorTestButton = document.querySelector("#color-test-submit");
        this.nextPatchButton =  document.querySelector("#next-patch-button");
        this.nextPhaseButton =  document.querySelector("#next-phase-button");
        this.startTaskButton =  document.querySelector("#start-task-button");        
        this.instructionsImg =  document.querySelector("[alt='Instructions Image']");
        this.colorTest =  document.querySelector("#color-test");
        this.endText =  document.querySelector(".end-text");
        this.travelCircle =  document.querySelector(".circle");        
        this.clickDisabled = false;
        this.elapsedTime;
        this.isValid = 0;
        this.stepsCount = 0;
        this.currentFillWidth = 0;
        this.fillWidthSpeedFactor = 0.01;
        this.colorTestStartTime;

        //"Travel" animation
        const fillElement = document.querySelector('.fill');
        fillElement.addEventListener('animationend', () => {
            document.querySelector('.circle').style.display = "none";
            this.matrixBuilder.showMatrix();
            this.nextPatchButton.style.display = "block";
            this.currentPatchStartTime = Date.now();
        });
    
        return this;
    }

    init(){ 
        this.matrixBuilder = new MatrixBuilder(this);
        this.updatePhaseElementsVisibility();        
    }

    startTask(){
        this.phase = 10; // The actual task
        this.currentPatch = 1;
        this.startTime = this.reporter.getCurrentDateTime();        
        this.startTimeMilli = Date.now();
        this.currentPatchStartTime = this.startTimeMilli;
        this.updatePhaseElementsVisibility();
        this.setProgressBar();
        // Set full screen
        document.getElementsByTagName("body")[0].requestFullscreen();
    }

    clickNextPhase(){
        this.phase++;
        this.updatePhaseElementsVisibility();        
    }
    
    clickNextPatch(){
        this.updatePatchData();
        document.querySelector('.circle').style.display = "block";
        this.matrixBuilder.hideMatrix();
        this.nextPatchButton.style.display = "none";
        this.matrixBuilder.resetSquaresColor();
        this.currentPatch++;    
    }

    endTask(){       
        this.updatePatchData();
        this.reportTaskData();
    }

    showInstructionsText(textToShow){
        for(let i = 1; i <= this.totalPhases; i++){
            if(i == textToShow){
                document.querySelector("#instructions-text" + i).style.display = "block";
            } else {
                document.querySelector("#instructions-text" + i).style.display = "none";
            }            
        }
    }

    updatePhaseElementsVisibility(){
        if(this.phase < 5){
            this.showInstructionsText(this.phase);            
            this.colorTest.style.display = "none";
            this.matrixBuilder.canvas.style.display = "none";            
            this.submitColorTestButton.style.display = "none";
            this.nextPhaseButton.style.display = "block";
            this.stepsCount++;  
            return;          
        }        
        if(this.phase == 5){ // Practice step 1
            this.showInstructionsText(this.phase);            
            this.nextPhaseButton.style.display = "none";                             
            this.colorTest.style.display = "block";
            this.submitColorTestButton.style.display = "block";
            this.colorTestStartTime = Date.now();
            this.stepsCount++;
            return;
        }
        if(this.phase == 6){ // Practice step 2
            this.matrixBuilder.drawMatrix(true);
            this.showInstructionsText(this.phase);                  
            this.matrixBuilder.canvas.style.display = "block";                                  
            this.colorTest.style.display = "none";
            this.submitColorTestButton.style.display = "none";         
            return;                     
        }
        if(this.phase == 7){ // Practice step 3
            this.showInstructionsText(this.phase);                                                     
            this.matrixBuilder.resetSquaresColor();
            return;                     
        }
        if(this.phase == 8){
            this.showInstructionsText(this.phase);                                                     
            this.matrixBuilder.canvas.style.display = "none";
            this.nextPhaseButton.style.display = "block";
            this.stepsCount++;  
            return;                
        }
        if(this.phase == 9){
            this.showInstructionsText(this.phase);       
            this.nextPhaseButton.style.display = "none";                                                          
            this.startTaskButton.style.display = "block";
            this.stepsCount++;  
            return;                
        }
        if(this.phase == 10){ // The actual task
            this.showInstructionsText(-1);         
            this.startTaskButton.style.display = "none";
            this.nextPatchButton.style.display = "block";         
            this.matrixBuilder.resetSquaresColor();            
            this.taskRelatedElementsVisibility("block");            
            this.matrixBuilder.canvas.style.display = "block";                                          
            this.stepsCount++;
            return;
        }
        // if(this.phase == 11){
        //     this.taskRelatedElementsVisibility("none");
        //     this.endText.style.display = "block";
        //     this.travelCircle.style.display = "none";
        //     return;
        // }        
    }

    taskRelatedElementsVisibility(visibility){
        if(visibility == "block"){
            this.matrixBuilder.showMatrix();
        } else {
            this.matrixBuilder.hideMatrix();
        }
        this.progressBar.style.display = visibility;
        // this.stopTaskButton.style.display = visibility; 
        this.nextPatchButton.style.display = visibility;        
    }

    setProgressBar() {        
        let tm = this; // Create a clone of the object to allow its reference
        const progressBarEl = document.querySelector(".progress-fill");
        
        let remainingTime = 60 * TaskParams.TOTAL_DURATION; // seconds
        const totalTime = remainingTime;
        
        function countdown() {
            if (remainingTime > 0) {                        
                // update progress bar
                const progress = ((totalTime - remainingTime) / totalTime) * 100;
                progressBarEl.style.width = `${progress}%`;
            
                remainingTime--;
                setTimeout(countdown, 1000);
            } else {
                // countdown finished
                progressBarEl.style.width = "100%";
                tm.stepsCount++;            
                tm.endTask();
            }
        }
        
        countdown();
    }

    updateClickData(data) {
        console.log(data);
        this.clickData.push(data);
    }

    updatePatchData() {
        var currentTime = Date.now();
        var patchStartTime = this.currentPatchStartTime;
        
        var data = {
            subjectId : this.subjectId,
            patchNumber : this.currentPatch,
            patchStartTime : patchStartTime,
            patchEndTime : currentTime,
            patchLength : (currentTime - patchStartTime) / 1000,
            subjectUuid : this.subjectUuid
        };

        console.log(data);
        this.patchData.push(data);
    }

    reportTaskData(){        
        var endTime = this.reporter.getCurrentDateTime();
        var taskDuration = (Date.now() - this.startTimeMilli)/1000/60;

        if(Math.floor(taskDuration) > this.TOTAL_DURATION 
            || this.stepsCount != 5
            || localStorage.getItem("STUDY_ID") == "null"
            || localStorage.getItem("SESSION_ID") == "null"
            || this.subjectId == "null"
            || this.subjectUuid == "null"
        ){ 
            this.isValid = 0;
        } else {
            this.isValid = 1;
        }

        var subjectData = {
            "subject_id" : this.subjectId, 
            "subject_uuid" : this.subjectUuid,
            "end_time" : endTime,             
            "start_time" : this.startTime,             
            "is_valid" : this.isValid, 
            "task_length" : taskDuration
        };

        var data = {"click_data" : this.clickData, 
                    "patch_data" : this.patchData,
                    "subject_data" : subjectData, 
                    "subject_id" : this.subjectId,
                    "subject_uuid" : this.subjectUuid};
        
//        this.reporter.reportData(data, "/foraging_task/oci_questionnaire"); //todo use this url to proceed to questionnaires
        this.reporter.reportData(data, "https://app.prolific.co/submissions/complete?cc=C1MZ7WQJ");
    }
}