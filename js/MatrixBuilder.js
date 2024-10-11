///** Created by Matan Eshed 11/24 **/

class MatrixBuilder {
    constructor(taskManager) {
      this.SQUARE_SIZE = TaskParams.SQUARE_SIZE;
      this.NUM_ROWS = TaskParams.MATRIX_SIZE;
      this.NUM_COLS = TaskParams.MATRIX_SIZE;
      this.GREEN_PROPORTION = 1 - TaskParams.BERRIES_PROP;
      this.RIPE_LIMIT = TaskParams.RIPE_PROP;
      this.GREEN_COLORS = TaskParams.GREEN_COLORS;
      this.RED_COLORS = TaskParams.RED_COLORS;      
      this.RIPE_COLORS = this.RED_COLORS.slice(0, Math.floor(this.RED_COLORS.length * TaskParams.RIPE_COLORS));
      this.UNRIPE_COLORS = this.RED_COLORS.slice(Math.floor(this.RED_COLORS.length * TaskParams.RIPE_COLORS));

      this.taskManager = taskManager;
      this.canvas = document.getElementById("matrixCanvas");
      this.ctx = this.canvas.getContext("2d");
  
      this.canvasWidth = 500;
      this.canvasHeight = 500;
  
      this.canvas.width = this.canvasWidth;
      this.canvas.height = this.canvasHeight;
  
      this.squares = [];

      // Training phases
      this.consecutiveClicks = 0;
      this.firstClickY;
      this.firstClickX;

      return this;
    }

    hideMatrix(){
        this.canvas.style.display = "none";
    }

    showMatrix(){
        this.canvas.style.display = "block";
    }
  
    getRandomGreenColor() {    
        const randomIndex = Math.floor(Math.random() * this.GREEN_COLORS.length);
        return this.GREEN_COLORS[randomIndex];
    }
  
    getRandomRedColor(isRipe) {
      if (isRipe) {
        const randomIndex = Math.floor(Math.random() * this.RIPE_COLORS.length);
        return this.RIPE_COLORS[randomIndex];
      } else {
        const randomIndex = Math.floor(Math.random() * this.UNRIPE_COLORS.length);
        return this.UNRIPE_COLORS[randomIndex];   
      }        
    }

    shuffleArray(array){
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    drawMatrix(setEventListeners) {
      const totalSquares = this.NUM_ROWS * this.NUM_COLS;
      const numGreenSquares = Math.floor(totalSquares * this.GREEN_PROPORTION);
      const numRedSquares = Math.floor(totalSquares - numGreenSquares);
    
      // Create an array of indices representing all squares
      // Then shuffle the indices array randomly
      var squareIndices = Array.from({ length: totalSquares }, (_, index) => index);        
      squareIndices = this.shuffleArray(squareIndices);      

      var redIndices = Array.from({ length: numRedSquares}, (_, index) => index);  
      var redIndices = this.shuffleArray(redIndices);      

      // Set the threshold of shuffled array according to the ripe proportion
      var ripeIndex = (redIndices.length - 1) * TaskParams.RIPE_PROP;     

      this.squares = [];
       // This is only for debugging purposes
       var greenCount = 0;
       var redCount = 0;
       var ripeCount = 0;
    
      // Assign colors to squares based on shuffled indices
      for (let i = 0; i < totalSquares; i++) {
        const row = Math.floor(i / this.NUM_COLS);
        const col = i % this.NUM_COLS;
        const x = (this.canvasWidth - (this.SQUARE_SIZE * this.NUM_COLS)) / 2 + col * this.SQUARE_SIZE;
        const y = (this.canvasHeight - (this.SQUARE_SIZE * this.NUM_ROWS)) / 2 + row * this.SQUARE_SIZE;          
        var color;
        var colorType;
    
        if(squareIndices[i] < numGreenSquares){
          color = this.getRandomGreenColor();  
          colorType = "green";
          greenCount++;          
        } else {     
          if(redIndices[redCount] >= ripeIndex){
            color = this.getRandomRedColor(true);            
            ripeCount++;
          } else {
            color = this.getRandomRedColor(false);
          }     
          colorType = "red";          
          redCount++;          
        }
    
        const square = {
          x: x,
          y: y,
          size: this.SQUARE_SIZE,
          color: color,
          colorType : colorType
        };
    
        this.squares.push(square);
        this.ctx.fillStyle = square.color;
        this.ctx.fillRect(square.x, square.y, square.size, square.size);
      }
    
      if(setEventListeners){
          this.setSquaresEventListeners();
      }    

      console.log("number of greens: " + greenCount);
      console.log("number of reds: " + redCount);
      console.log("number of ripes: " + ripeCount);
    }
      
  
    resetSquaresColor() {     
        // Remove existing event listeners   
        let canvasElement = document.getElementById("matrixCanvas");        
        var newCanvasElement = canvasElement.cloneNode(true);
        canvasElement.parentNode.replaceChild(newCanvasElement, canvasElement);
        this.canvas = newCanvasElement;
        this.ctx = this.canvas.getContext("2d");
        this.drawMatrix(true);
    }
  
    setSquaresEventListeners() {
      var canvas = this.canvas;
      var ctx = this.ctx;
      var taskManager = this.taskManager;
      var squares = this.squares;
      var matrixBuilder = this;
      const ripeColors = this.RIPE_COLORS;
  
      canvas.addEventListener("click", function (event) {
        if(taskManager.clickDisabled){
          return;
        }

        // Set delay to avoid too many clicks in a short time
        taskManager.clickDisabled = true;
        setTimeout(function(){taskManager.clickDisabled = false;}, TaskParams.PICK_DELAY);

        var rect = canvas.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        var clickY = event.clientY - rect.top;
        var isRipe = false;
        var isGreen = false;
        var squareColor;
  
        squares.forEach((square) => {
          if (
            clickX >= square.x &&
            clickX < square.x + square.size &&
            clickY >= square.y &&
            clickY < square.y + square.size
          ) {

            isRipe = ripeColors.includes(square.color);
            isGreen = matrixBuilder.GREEN_COLORS.includes(square.color);
            
            squareColor = square.color.valueOf();                            
            if(matrixBuilder.RED_COLORS.includes(squareColor)){
              square.color = matrixBuilder.getRandomGreenColor();        
            }
            
            ctx.fillStyle = square.color;
            ctx.fillRect(square.x, square.y, square.size, square.size);         

            if(taskManager.phase == 6){ // Practice step 2      
              // Click X squares in the same row       
              if(matrixBuilder.firstClickY == null){
                matrixBuilder.firstClickY = square.y;
                matrixBuilder.firstClickX = square.x;
              } else {                
                // If needed to be in  a row (one direction)
                // (Math.abs(square.x - (matrixBuilder.firstClickX + (matrixBuilder.consecutiveClicks * TaskParams.SQUARE_SIZE))) == TaskParams.SQUARE_SIZE)
                if(square.y == matrixBuilder.firstClickY && square.x != matrixBuilder.firstClickX){
                  matrixBuilder.consecutiveClicks++;
                  if(matrixBuilder.consecutiveClicks == 4){
                    taskManager.phase++;  // Practice step 3
                    taskManager.updatePhaseElementsVisibility();
                  }
                } else {                  
                  matrixBuilder.consecutiveClicks = 0;
                }
                matrixBuilder.firstClickY = square.y;
                matrixBuilder.firstClickX = square.x;
              }                            
            }

            if(taskManager.phase == 7){ // Practice step 3
              // Click consecutive ripe berries          
              // Update click data - learning phase
              taskManager.updateClickData({ subjectId : taskManager.subjectId, 
                subjectUuid : taskManager.subjectUuid, 
                clickTime : Date.now(), 
                patchNumber : taskManager.currentPatch, 
                x: square.x, 
                y: square.y, 
                color: squareColor,
                isRipe : isRipe,
                isTraining : true,
                isGreen: isGreen});

              if(isRipe){
                matrixBuilder.consecutiveClicks++;
                if(matrixBuilder.consecutiveClicks == 10){
                  taskManager.phase++; // The task preview
                  taskManager.updatePhaseElementsVisibility();
                }
              } else {
                matrixBuilder.consecutiveClicks = 0;
                taskManager.currentPatch++;
                matrixBuilder.resetSquaresColor();
              }
            }

            if(taskManager.phase == 10){ // The task
              // Update click data
              taskManager.updateClickData({ subjectId : taskManager.subjectId, 
              subjectUuid : taskManager.subjectUuid, 
              clickTime : Date.now(), 
              patchNumber : taskManager.currentPatch, 
              x: square.x, 
              y: square.y, 
              color: squareColor,
              isRipe : isRipe,
              isTraining : false,
              isGreen: isGreen});
            }   
          }           
        });
  
        // Play sound
        if(isRipe && matrixBuilder.RED_COLORS.includes(squareColor)){
          document.getElementById("correctSound").play();        
        } else if(!isRipe && matrixBuilder.RED_COLORS.includes(squareColor)) {
          document.getElementById("errorSound").play();
        } else {
          document.getElementById("neutralSound").play();
        }                
      });
    }
  }
  