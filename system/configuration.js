// CONFIGURATION

// The ping logfile is from Linux/Unix/Mac ("ix") or Windows ("win")
// To identify the difference in the position of the answer time.
var strSystem = "ix"; 

// The default number of (most recent) results shown in visualization.
var intNumberResults = 1400;

// The interval between the ping requests (for statistics)
// Linux command: ping [destination] -i 5
// Windows: does not support this command, default might be 1 sec?
var intInterval = 1; 

// The pixel size (width) of bars in visualization chart.
var intBarWidth = 1;

// The percentage size (height) of bars in chart.
// A ping reply of 25ms equals a 25 pixel bar height (=100%)
var intBarHeight = 100;

// The default value of days to look back for older files.
var intFileSearch = 7;

// automatic refresh of page 
// off (0) or a multiplier to intInterval (see above)
var intRefreshRate = 1;


// current version number (no need to adjust this :) )
var version = "0.1.20121202"
