const TaskParams = {
	MATRIX_SIZE: 20, // the task code assumes an even number
	RED_COLORS:[
        "#FF0000",
        "#FA0000",
        "#F50000",
        "#F00000",
        "#EB0000",
        "#E60000",
        "#E10000",
        "#DC0000",
        "#D70000",
        "#D20000"
      ],
	GREEN_COLORS: [
        "#00FF00",
        "#00EF00",
        "#00DF00",
        "#00CF00",
        "#00BF00",
        "#00AF00"
      ],
  TEST_COLORS: [
        "#FF0000",
        "#F70000",
        "#EF0000",
        "#E70000",
        "#DF0000",
        "#D70000",
        "#CF0000",
        "#C70000",
        "#BF0000",
        "#B70000" 
    ],
    

	SQUARE_SIZE: 20, // pixels
	BERRIES_PROP: 0.2, // Proportion of berries out of total squares
	RIPE_PROP: 0.5, // Proportion of ripe berries out of total berries
  RIPE_COLORS: 0.3, // The proportion of ripe colors out of the available red colors
	PICK_DELAY: 100, // ms 
	// TRAVEL_TIME: 15, // seconds - should be configured in css file
	TOTAL_DURATION: 0.5, // minutes
  TASK_START_PHASE: 1 // For debugging
}