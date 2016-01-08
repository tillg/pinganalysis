
// Einlesen der CSV-Datei und Weitergabe an Rueckgabefunktion
function fnReadCsv(csvFile,fnCallback)
{
 $.ajax({ 
   type: "GET", 
   url: csvFile,
   dataType: "text", 
   contentType: "application/x-www-form-urlencoded",
   success: function(data) {  
    fnCallback(data,strSystem); },
	error: function(objXML, textStatus, errorThrown){
		$("#warning").text("ERROR \n\nCode - objXML-Status: "+objXML.status+" \n\nCode - textStatus: "+textStatus+" \n\nCode - errorThrown: "+errorThrown+" \n\nName und Verzeichnis der CSV-Datei : "+csvFile); }
 } );

}


// Prueft ob die angegeben Datei existiert. Gibt TRUE oder FALSE zurueck
// http://www.ambitionlab.com/how-to-check-if-a-file-exists-using-jquery-2010-01-06
function fnCheckFileExists(filename)
{
	$.ajax({
	    //url:"logs/"+filename,
        url:filename,
	    type:'HEAD',
		 async: false,
	    error: function()
	    	{
			checkFileExistsStatus = false;
			return false;
		},
	    success: function()
	    	{
			checkFileExistsStatus = true;
			return true;
		},	    
	});
	return  checkFileExistsStatus;
}

function fnCheckFileExistsByDate(intNumberOfDates)
{
	var arFilelist = new Array;

	for (i = 0; i <= intNumberOfDates-1; i++)
	{
		var now = new Date();
		now.setDate(now.getDate()-i);

		var filename = now.toISOString();
		var filename = filename.substr(0,10)+".txt";
		boolFileExist = fnCheckFileExists(filename)
		if (boolFileExist)
		{
			arFilelist.push(filename);
		}
	} // end for
	return arFilelist;
}

// Auslesen der Zeile und speichern der Werte in Arrays
function fnSplitLines(csvData) 
{
	var strSystem = fnReadLocationBar("strSystem",strSystem);
	var strFilename = fnReadLocationBar("strFilename",strFilename);
	var intInterval = parseInt( fnReadLocationBar("intInterval",intInterval) );

	var arPingAnswerTime = [];
	var arTimestamp = [];

	var strPositionTimestamp = "";
	var intTimestamp = 0;
	var intLastTimestamp = 0;

	var intPositionAnswerTime = 0;
	var strPositionAnswerTime = "";
	var intAnswerTime = 0;
	var strAnswerTime = "";

	var intPositionTTL = 0;

	// Split on Line break
 	var arZeilen = csvData.split("\n"); // am Zeilenumbruch aufteilen

	for(i = 0; i <= arZeilen.length-2; i++) // do not read line before last line. might not be written yet.
	{
//	 	var arWerte = arZeilen[i].split(" "); // am Leerzeichen in Zeile i aufteilen


		// Identify right column with answer time by operating system
		if (strSystem == "win")
		{
			// "Antwort von 173.194.35.191: Bytes=32 Zeit=86ms TTL=53"

			intLastTimestamp = arTimestamp[i-1];
			intPositionTTL = arZeilen[i].indexOf("TTL="); // "TTL=" is always the last entry
			if (intPositionTTL != -1) // if we found the string ...
			{
				strAnswerTime = arZeilen[i].substring(0,intPositionTTL); // cut off until "TTL="
				intPositionAnswerTime = strAnswerTime.lastIndexOf("="); // find last "=", this is the one at the ping time
				strPositionAnswerTime = strAnswerTime.substring(intPositionAnswerTime+1,255); // cut off from "=" until the end of line
				intAnswerTime = parseFloat(strPositionAnswerTime) // automatic discovery of number

				// check if there are any timestamps recorded
				if (intLastTimestamp > 0)
				{
					intLastTimestamp = intLastTimestamp-1+1+intInterval;
				}

			} 
			else
			{
				intAnswerTime = 0;

				// check if a manual timestamp was recorded. Starts with keyword "TIMESTAMP"
				var arValues = arZeilen[i].split(" "); // split on space
				// keyword found, save timestamp
				if (arValues[0] == "TIMESTAMP")
				{
					intLastTimestamp = arValues[1];
				}
				// keyword not found. Maybe start of file, error or similar.
				else
				{
					intLastTimestamp = intLastTimestamp-1+1+intInterval;
				}

			} // end if-else

			// save answer time
			arPingAnswerTime.push(intAnswerTime);
			arTimestamp.push(intLastTimestamp);

//			$("#debug").append("<br /> i: "+i+" intAT: "+intAnswerTime+" intTS: "+intLastTimestamp+" ");

/*
			if (arWerte[4])
			{ 
				var strPingAnswerTime = arWerte[4].substring(5,10) // "Zeit=12ms" -> "12ms"
				var intPositionMs = strPingAnswerTime.indexOf("ms") // "ms" on 3rd position in "12ms" 
				if (intPositionMs != -1)
				{
					var intPingAnswerTime = strPingAnswerTime.substring(0,intPositionMs) // cut off "ms"
					intPingAnswerTime = parseFloat(intPingAnswerTime);
					arPingAnswerTime.push(intPingAnswerTime); // answer time on pos. 4
				}
			}
			else 
			{ arPingAnswerTime.push(0)
			}

*/
		}
		// LINUX / UNIX / MAC
		else if (strSystem == "ix")
		{
			// position 7: "64 bytes from bk-in-f94.1e100.net (173.194.69.94): icmp_req=7 ttl=50 time=25.3 ms"
			// position 7: "[1350333849.952585] 64 bytes from 173.194.44.120: icmp_req=2669 ttl=56 time=31.1 ms"
			// position 8: "[1350750373.022535] 64 bytes from bk-in-f94.1e100.net (173.194.69.94): icmp_req=1115 ttl=50 time=25.0 ms"

			// check if a timestamp was logged 
			strPositionTimestamp = arZeilen[i].substring(0,1) 
			if (strPositionTimestamp == "[")
			{ 
				intTimestamp = arZeilen[i].substring(1,11);
//				$("#debug").text("<br /> i: "+i+" TS "+intTimestamp);
			}
			else
			{
				intTimestamp = null;
//				$("#warning").text("<br /> i: "+i);
			}
			// save timestamp
			arTimestamp.push(intTimestamp);


			// find "time=" and cut off from this position
			intPositionAnswerTime = arZeilen[i].indexOf("time=")
			if (intPositionAnswerTime != -1)
			{
				strPositionAnswerTime = arZeilen[i].substring((intPositionAnswerTime+5),256) // "time=": +5 characters
				intAnswerTime = parseFloat(strPositionAnswerTime)
			} 
			else
			{
				intAnswerTime = 0;
			}
			// save answer time
			arPingAnswerTime.push(intAnswerTime)
		}
		else
		{
			var error = true;
		}

	} // end: for arZeilen

//	$("#debug").append(arPingAnswerTime)

	if (error)
	{
		$("#warning").text("<br /> No system given in <a href='system/configuration.js'>config-file</a> or system not found in location bar! Can not interpret the log file correctly. Please <a href='index.html'>reload file</a> with default values");
	}
	else
	{
		// Show Analysis
//		fnAnalysis(arPingAnswerTime, arTimestamp, strSystem, strFilename, intNumberResults, intInterval, intBarWidth, intBarHeight)
		fnAnalysis(arPingAnswerTime, arTimestamp)
	}
}

// Analysis
// function fnAnalysis(arPingAnswerTime,arTimestamp,strSystem,strFilename,intNumberResults,intInterval,intBarWidth,intBarHeight)
function fnAnalysis(arPingAnswerTime, arTimestamp)
{

//	$("#debug").text("<br /> arTS: "+arTimestamp);

	var strPictureFile = "";
	var strPictureTitle = "";
	var strFilename = fnReadLocationBar("strFilename",strFilename);
	var strSystem = fnReadLocationBar("strSystem",strSystem);

	var intNumberResults = parseInt( fnReadLocationBar("intNumberResults",intNumberResults) );
	var intInterval = parseInt( fnReadLocationBar("intInterval",intInterval) );
	var intRefreshRate = parseInt( fnReadLocationBar("intRefreshRate",intRefreshRate) );
	var intBarWidth = parseInt( fnReadLocationBar("intBarWidth",intBarWidth) );
	var intBarHeight = parseInt( fnReadLocationBar("intBarHeight",intBarHeight) );
	var intFileSearch = parseInt( fnReadLocationBar("intFileSearch",intFileSearch) );

	var arStatistics = [];
	var arFilelist = [];

	var intTimestamp = 0;
	var nowTime = new Date();
	var intNowTimestamp = nowTime.getTime();
	var strLocalDate = "";

	var strInputChartPing = "";
	var strInputChartStats = "";

	// start is always the latest ping
	var intStart=arPingAnswerTime.length-1;

	// stop 
	if (intNumberResults <= 0)
		{ var intNumberResults = 0; }
	else if (intNumberResults >= arPingAnswerTime.length)
		{ var intNumberResults = arPingAnswerTime.length-1; }
	var intStop = arPingAnswerTime.length-intNumberResults-1; 


	//* DRAW CHART(s) *//
	strInputChartPing += "<tr>"
	for (i = intStart; i >= intStop; i--)
	{

		// show timestamp if really higher than 01 Jan 1970 ;) => if exists and not some other value
		if (arTimestamp[i] > 1000000) 
		{
			intTimestamp = arTimestamp[i]*1000;
			var date = new Date(intTimestamp);
			var strLocalDate = date.toLocaleString(intTimestamp)
		}
		else
		{
			strLocalDate = "";
		}
//		$("#debug").append(" <br /> "+i+" "+intTimestamp+" ms Date: "+strLocalDate);

		// normal ping
		if (arPingAnswerTime[i] > 0)
		{

			strPictureFile = "bar_black-green";
			strPixelFile = "px_green";
			strPictureTitle = "No. "+i+": "+ arPingAnswerTime[i]+"ms "+strLocalDate;
			intBarHeightPixel = arPingAnswerTime[i];			
		}
		// computer restart, no connection ...
		else
		{
			strPictureFile = "bar_black-red";
			strPixelFile = "px_red";
			strPictureTitle = "No. "+i+": No value. Maybe restart, no connection, corrupt file or end of file. "+strLocalDate;
			intBarHeightPixel = 20;
//			if (arTimestamp[i] > 0)
//			{ intLastTimestamp = arTimestamp[i]; }
		}

		// CHART for ping time
/*
		$("#chart").append("<td class='chart'>");
		$("#chart").append("<img src='system/"+strPixelFile+".png' width='"+intBarWidth+"' height='1' alt='' title='' />");
		$("#chart").append("<br />");
		$("#chart").append("<img src='system/"+strPictureFile+".png' width='"+intBarWidth+"' height='"+(intBarHeightPixel*intBarHeight/100)+"' alt='"+strPictureTitle+"' title='"+strPictureTitle+"' />");
		$("#chart").append("</td>");
*/
		strInputChartPing += "<td class='chart'>";
		strInputChartPing += "<img src='system/"+strPixelFile+".png' width='"+intBarWidth+"' height='1' alt='' title='' />";
		strInputChartPing += "<br />";
		strInputChartPing += "<img src='system/"+strPictureFile+".png' width='"+intBarWidth+"' height='"+(intBarHeightPixel*intBarHeight/100)+"' alt='"+strPictureTitle+"' title='"+strPictureTitle+"' />";
		strInputChartPing += "</td>";
	} // end: for i
	strInputChartPing += "</tr>"

	// INFORMATION

	// INTERVAL between pings intInterval
	$("#infoInterval1").empty();
	$("#infoInterval2").empty();
	$("#infoInterval3").empty();

	fnCreateReloadLink("infoInterval1",strSystem,strFilename,(intInterval-1),intNumberResults,intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-1sec","-1sec");
	$("#infoInterval2").append(" <b>"+intInterval+"sec</b> ");
	fnCreateReloadLink("infoInterval3",strSystem,strFilename,(intInterval-1+2),intNumberResults,intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+1sec","+1sec");


	// automatic REFRESH RATE
	$("#infoRefresh1").empty();
	$("#infoRefresh2").empty();
	$("#infoRefresh3").empty();

	fnCreateReloadLink("infoRefresh1",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,0,"Off","Turn Refresh Off");
	$("#infoRefresh2").append(" <b>x"+intRefreshRate+"</b> ");
	$("#infoRefresh2").append(" <br /> ("+(intRefreshRate*intInterval)+"sec) ");

	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,1,"x1"," "+(1*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,2,"x2"," "+(2*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,3,"x3"," "+(3*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,4,"x4"," "+(4*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,5,"x5"," "+(5*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,10,"x10"," "+(10*intInterval)+"sec Refresh Rate ");
	$("#infoRefresh3").append(" <br /> ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,20,"x20"," "+(20*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,30,"x30"," "+(30*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,40,"x40"," "+(40*intInterval)+"sec Refresh Rate ");
	fnCreateReloadLink("infoRefresh3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,50,"x50"," "+(50*intInterval)+"sec Refresh Rate ");

	// RESULTS intNumberResults
	$("#infoResults1").empty();
	$("#infoResults2").empty();
	$("#infoResults3").empty();

	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-1),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-1","-1");
	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-5),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-5","-5");
	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-10),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-10","-10");
	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-50),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-50","-50");
	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-100),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-100","-100");
	$("#infoResults1").append("<br /> ");
	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-500),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-500","-500");
	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-1000),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-1000","-1000");
	fnCreateReloadLink("infoResults1",strSystem,strFilename,intInterval,(intNumberResults-5000),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"-5000","-5000");
	

	$("#infoResults2").append("  <b>"+intNumberResults+"</b>/"+(arPingAnswerTime.length-1)+" ");
	$("#infoResults2").append(" <br /> ("+intStart+"-"+intStop+") ");

	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+2),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+1","+1");
	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+6),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+5","+5");
	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+11),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+10","+10");
	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+51),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+50","+50");
	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+101),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+100","+100");
	$("#infoResults3").append("<br /> ");
	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+501),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+500","+500");
	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+1001),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+1000","+1000");
	fnCreateReloadLink("infoResults3",strSystem,strFilename,intInterval,(intNumberResults-1+5001),intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"+5000","+5000");

	// WIDTH of bar intBarWidth
	$("#infoBarWidth1").empty();
	$("#infoBarWidth2").empty();
	$("#infoBarWidth3").empty();

	fnCreateReloadLink("infoBarWidth1",strSystem,strFilename,intInterval,intNumberResults,(intBarWidth-1),intBarHeight,intFileSearch,intRefreshRate,"-1px","-1px");
	$("#infoBarWidth2").append(" <b>"+intBarWidth+"px</b> ");
	fnCreateReloadLink("infoBarWidth3",strSystem,strFilename,intInterval,intNumberResults,(intBarWidth-1+2),intBarHeight,intFileSearch,intRefreshRate,"+1px","+1px");

	// HEIGHT of bar intBarHeight
	$("#infoBarHeight1").empty();
	$("#infoBarHeight2").empty();
	$("#infoBarHeight3").empty();

	fnCreateReloadLink("infoBarHeight1",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,(intBarHeight-10),intFileSearch,intRefreshRate,"-10%","-10%");
	fnCreateReloadLink("infoBarHeight1",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,(intBarHeight-5),intFileSearch,intRefreshRate,"-5%","-5%");
	$("#infoBarHeight2").append(" <b>"+intBarHeight+"%</b> ");
	fnCreateReloadLink("infoBarHeight3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,(intBarHeight-1+6),intFileSearch,intRefreshRate,"+5%","+5%");
	fnCreateReloadLink("infoBarHeight3",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,(intBarHeight-1+11),intFileSearch,intRefreshRate,"+10%","+10%");

	// Operating System
	$("#infoSystem1").empty();
	$("#infoSystem2").empty();
	$("#infoSystem3").empty();

	fnCreateReloadLink("infoSystem1","ix",strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"ix","Linux Log File");
	$("#infoSystem2").append(" <b>"+strSystem+"</b> ");
	fnCreateReloadLink("infoSystem3","win",strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"win","Windows Log File");


	// STATISTICS
	$("#statsCurrent1").empty();
	$("#statsCurrent2").empty();
	$("#statsCurrent3").empty();
	$("#statsCurrent4").empty();
	$("#statsCurrent5").empty();
	$("#statsCurrent6").empty();

	// minimum, maximum, average - Current view
	arStatistics = fnGetMinMaxValues(arPingAnswerTime,intStart,intStop)
	$("#statsCurrent1").append(" <b>"+arStatistics[0]+"</b> ");
	$("#statsCurrent2").append(" <b>"+arStatistics[1]+"</b> ");
	$("#statsCurrent3").append(" <b>"+arStatistics[2]+"</b> ");
	arPingAverageTime.push(arStatistics[2]) // save average time of current view
	var intMinimumStatsCurrent = arStatistics[0];

	// calculate time passed between latest ping and last result
	var intPastTimeSec=intInterval*intNumberResults;
	var intPastTimeMin=Math.round(intPastTimeSec / 6)/10;
	var intPastTimeHrs=Math.round(intPastTimeMin / 6)/10;
	$("#statsCurrent4").append(" "+intPastTimeSec+" ") 
	$("#statsCurrent5").append(" "+intPastTimeMin +" ");
	$("#statsCurrent6").append(" "+intPastTimeHrs +" ");

	$("#statsTotal1").empty();
	$("#statsTotal2").empty();
	$("#statsTotal3").empty();
	$("#statsTotal4").empty();
	$("#statsTotal5").empty();
	$("#statsTotal6").empty();

	// minimum, maximum, average - All entries
	arStatistics = fnGetMinMaxValues(arPingAnswerTime,intStart,1)
	$("#statsTotal1").append(" <b>"+arStatistics[0]+"</b> ");
	$("#statsTotal2").append(" <b>"+arStatistics[1]+"</b> ");
	$("#statsTotal3").append(" <b>"+arStatistics[2]+"</b> ");

	var intPastTimeSec=intInterval*(arPingAnswerTime.length-1);
	var intPastTimeMin=Math.round(intPastTimeSec / 6)/10;
	var intPastTimeHrs=Math.round(intPastTimeMin / 6)/10;
	$("#statsTotal4").append(" "+intPastTimeSec+" ") 
	$("#statsTotal5").append(" "+intPastTimeMin +" ");
	$("#statsTotal6").append(" "+intPastTimeHrs +" ");


	// if automatic refresh is on, I can draw the development of the average ping time from the statistics
	if (intRefreshRate > 0)
	{
		var intTimeOfStatistic;

		// start is always the latest ping
		var intStart=arPingAverageTime.length-1;

		// stop 
		intNumberResultsAverage = intNumberResults;
		if (intNumberResults <= 0)
			{ var intNumberResultsAverage = 0; }
		else if (intNumberResults >= arPingAverageTime.length)
			{ var intNumberResultsAverage = arPingAverageTime.length-1; }
		var intStop = arPingAverageTime.length-intNumberResultsAverage-1; 

		strInputChartStats += "<tr>"
		for (i = intStart; i>=intStop; i--)
		{
			// do not use the "real" ping time as height but cut off XX pixels to save space
			// eg. current view: (40ms - 25ms)*2= 30px
			// eg. current view: (45ms - 25ms)*2= 40px
			// eg. current view: (50ms - 25ms)*2= 50px
			// eg. current view: (55ms - 25ms)*2= 60px
			// eg. current view: (700ms- 25ms)*2= 1350px
//			var intBarHeightStatsCurrent = Math.round( (arPingAverageTime[i] - intMinimumStatsCurrent)*2 );
			var intBarHeightStatsCurrent = (Math.round(arPingAverageTime[i]) - Math.round(intMinimumStatsCurrent) ) *2;

			// difference between total average and current average
			// eg. current view: (50ms - 40ms)*2= 20px
			// eg. current view: (50ms - 45ms)*2= 10px
			// eg. current view: (50ms - 50ms)*2=  0px
			// eg. current view: (50ms - 55ms)*2= -10px (current is above average)
			// eg. current view: (50ms - 700ms)*2= -1300px (current is above average)
//			var intBarHeightStatsAll = Math.round( (arStatistics[2] - arPingAverageTime[i])*2 );
			var intBarHeightStatsAll = (Math.round(arStatistics[2]) - Math.round(arPingAverageTime[i]) ) *2;

			// time of the result
//			var date = new Date();
			// 1353173315000ms - (5sec * x3 * (4-#3-1) * 1000ms) = 1353173315000 (18:18:35) 0
			// 1353173315000ms - (5sec * x3 * (4-#2-1) * 1000ms) = 1353173300000 (18:18:20) 15000
			// 1353173315000ms - (5sec * x3 * (4-#1-1) * 1000ms) = 1353173285000 (18:18:05) 30000
			// 1353173315000ms - (5sec * x3 * (4-#0-1) * 1000ms) = 1353173270000 (18:17:50) 45000
			intTimeOfStatistic = intNowTimestamp - intInterval*intRefreshRate*(arPingAverageTime.length-i-1)*1000;
			var date = new Date(intTimeOfStatistic);
			var strLocalDate = date.toLocaleString(intTimeOfStatistic);

//			$("#debug").append("<br /> i: "+i+" time: "+intTimeOfStatistic+" date: "+strLocalDate+" ");

			// do not show bars higher than 60px. It's no use
			if (intBarHeightStatsCurrent >= 60)
			{
				intBarHeightStatsCurrent = 60;
				strPictureFile = "bar_red-black";
				strPictureTitle = "Average Ping Time is really high ("+arPingAverageTime[i]+"ms) on "+strLocalDate+"."
				strInputChartStatsNormal = "";
			}
			// average ping time is "normal"
			else
			{

				if (intBarHeightStatsAll <= 0)
				{
					intBarHeightStatsAll = 0;
					intBarHeightStatsBlue = 0;
				}
				else
				{ 	intBarHeightStatsBlue = 2;
				}

				// 60 - 16px = 44px remaining
				var intBarHeightStatsRemaining = 60 - intBarHeightStatsCurrent; 
				// 10px 
				// (753-40)*2=1426
				var intBarHeightStatsDown = intBarHeightStatsAll; 
				// 60 - 16 - 10 - 2 = 32px
				// 60 - 16 - 1426 - 2 = −1384px
				var intBarHeightStatsAbove = 60 - intBarHeightStatsCurrent - intBarHeightStatsAll - 2; 

				if (intBarHeightStatsDown >= intBarHeightStatsRemaining)
				{ 
					intBarHeightStatsDown = 0;
					intBarHeightStatsAbove = intBarHeightStatsRemaining;
					intBarHeightStatsBlue = 0;
				}

				strInputChartStatsNormal = "";
				strInputChartStatsNormal += "<img src='system/px_blank.png' width='"+intBarWidth+"' height='"+intBarHeightStatsAbove+"' />";
				strInputChartStatsNormal += "<br />";
				strInputChartStatsNormal += "<img src='system/px_blue.png' width='"+intBarWidth+"' height='"+intBarHeightStatsBlue+"' alt='Average ping of all entries: "+arStatistics[2]+"' title='Average ping of all entries: "+arStatistics[2]+"ms' />";
				strInputChartStatsNormal += "<br />";
				strInputChartStatsNormal += "<img src='system/px_blank.png' width='"+intBarWidth+"' height='"+intBarHeightStatsDown+"'/>";
				strInputChartStatsNormal += "<br />";

				strPictureFile = "bar_yellow-black";
				strPictureTitle = "Average Ping Time: "+arPingAverageTime[i]+"ms on "+strLocalDate+"."

//			$("#debug").text("Current: "+intBarHeightStatsCurrent+" Remaining: "+intBarHeightStatsRemaining+" Above: "+intBarHeightStatsAbove+" Down: "+intBarHeightStatsDown+" All: "+intBarHeightStatsAll )

			}

			// CHART for average ping time
			strInputChartStats += "<td class='chartAverage'>";
			strInputChartStats += strInputChartStatsNormal;
			strInputChartStats += "<img src='system/"+strPictureFile+".png' width='"+intBarWidth+"' height='"+intBarHeightStatsCurrent+"' alt='"+strPictureTitle+"' title='"+strPictureTitle+"' />";
			strInputChartStats += "</td>";

		} // end: for
		strInputChartStats += "</tr>"

//			$("#debug").append("<br /> start: "+intStart+" / NrResults: "+intNumberResults+" Länge: "+arPingAverageTime.length+" - NrAvgResults: "+intNumberResultsAverage+" = stop: "+intStop+" intBarHeightPAT: "+intBarHeightPAT+"");
//			$("#debug").text(""+arPingAverageTime+" ");


		// if there are more entries in the array than results to show (400 entries > 300 to show)
		if ((arPingAverageTime.length-1) > intNumberResults)
		{
			var intNumberResultsTrend = intNumberResults;
		}
		// if there are fewer entries than results to show (200 entries < 300 to show)
		else
		{
			var intNumberResultsTrend = arPingAverageTime.length-1;
		}


		// define positions in array for trend analysis ***
		var intDifferenceTrendLong = intNumberResultsTrend; // 400-300 = 100
		var intDifferenceTrendMedium = Math.round(intNumberResultsTrend*0.5) // 400-300*50% = 200
		var intDifferenceTrendShort = Math.ceil(intNumberResultsTrend*0.05) // 400-300*5% = 385
		var intDifferenceTrendCompare = 0; // 400-0 = 400, last entry array with average ping times

		var intPositionTrendLong = arPingAverageTime.length - intDifferenceTrendLong - 1; // 400-100-1 = 299
		var intPositionTrendMedium = arPingAverageTime.length - intDifferenceTrendMedium - 1; // 400-200-1 = 199
		var intPositionTrendShort = arPingAverageTime.length - intDifferenceTrendShort - 1; // 400-385-1 = 14
		var intPositionTrendCompare = arPingAverageTime.length - intDifferenceTrendCompare - 1; // 400-0-1 = 399

		var intTrendLong = arPingAverageTime[intPositionTrendLong];
		var intTrendMedium = arPingAverageTime[intPositionTrendMedium];
		var intTrendShort = arPingAverageTime[intPositionTrendShort];
		var intTrendCompare = arPingAverageTime[intPositionTrendCompare];

		var arTrendLong = fnCheckTrends(intTrendCompare,intTrendLong);
		var arTrendMedium = fnCheckTrends(intTrendCompare,intTrendMedium);
		var arTrendShort = fnCheckTrends(intTrendCompare,intTrendShort);

		$("#trendGeneral").empty();
		$("#trendShort").empty();
		$("#trendMedium").empty();
		$("#trendLong").empty();

		$("#trendGeneral").append("- Trends: ");
		$("#trendShort").append("short-term: ["+arTrendShort[0]+"] ")
		$("#trendShort").css("color",arTrendShort[1])
		$("#trendMedium").append("mid-term: ["+arTrendMedium[0]+"] ")
		$("#trendMedium").css("color",arTrendMedium[1])
		$("#trendLong").append("long-term: ["+arTrendLong[0]+"] ")
		$("#trendLong").css("color",arTrendLong[1])

/*
		$("#debug").empty()
		$("#debug").append("<br /> Results: "+intNumberResultsTrend+" Länge: "+(arPingAverageTime.length-1)+" ")
		$("#debug").append("<br /> DIFF long: "+intDifferenceTrendLong+" med: "+intDifferenceTrendMedium+" short: "+intDifferenceTrendShort+" compare: "+intDifferenceTrendCompare+" ")
		$("#debug").append("<br /> POS long: "+intPositionTrendLong+" med: "+intPositionTrendMedium+" short: "+intPositionTrendShort+" compare: "+intPositionTrendCompare+" ")
		$("#debug").append("<br /> INT long: "+intTrendLong+" med: "+intTrendMedium+" short: "+intTrendShort+" compare: "+ intTrendCompare+" ")
		$("#debug").append("<br /> STR long: "+arTrendLong+" med: "+arTrendMedium+" short: "+arTrendShort+" ")
*/

	} // end if intRefreshRate > 0 / autoRefresh = On (to show development of average ping time)


	// Try to identify error
	if ( (arStatistics[0] == 10000) ) // && (arStatistics[1] == 0) )
	{
		//$("#warning").html("Statistic shows only default values! There might be an error in the <a href='logs/' target='_blank'>log file</a>. This can have different reasons, e.g. <ul> <li>no ping command started</li> <li>a different operating system (Windows - Linux/Unix/Mac)</li> <li>an error in the identification of the correct keywords</li> <li>or a different character encoding (Millisecond/ms - миллисекунда/мс)</li> </ul> It might help to change the configuration.")
        $("#warning").html("Statistic shows only default values! There might be an error in the <a href='' target='_blank'>log file</a>. This can have different reasons, e.g. <ul> <li>no ping command started</li> <li>a different operating system (Windows - Linux/Unix/Mac)</li> <li>an error in the identification of the correct keywords</li> <li>or a different character encoding (Millisecond/ms - миллисекунда/мс)</li> </ul> It might help to change the configuration.")
	}


	// FILES
	if (!intFileSearch)
	{ intFileSearch = 7; }

	$("#changeFile").empty();
	arFilelist = fnCheckFileExistsByDate(intFileSearch)
	for (i = 0; i <= arFilelist.length-1; i++)
	{
		fnCreateReloadLink("changeFile",strSystem,arFilelist[i],intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,intRefreshRate,arFilelist[i].substring(0,10),"");
	}

	$("#moreFiles").empty();

	fnCreateReloadLink("moreFiles",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch-1+8,intRefreshRate,"+1 week","Show files older than 1 week");
	fnCreateReloadLink("moreFiles",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch-1+31,intRefreshRate,"+1 month","Show files older than 1 month");
	fnCreateReloadLink("moreFiles",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch-1+183,intRefreshRate,"+6 months","Show files older than 6 months");
	fnCreateReloadLink("moreFiles",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch-1+366,intRefreshRate,"+1 year","Show files older than 1 year");

//	Reload current file (manual)
	$("#reloadFile").empty();
	fnCreateReloadLink("reloadFile",strSystem,strFilename,intInterval,intNumberResults,intBarWidth,intBarHeight,intFileSearch,intRefreshRate,"Current file with current configuration.","");
	$("#reloadFile").append(" ("+strFilename+") ");


	// FINALLY DRAW CHARTS
	// clear old chart
	$("#chart").empty();
	$("#chart").append(strInputChartStats);
	$("#chart").append(strInputChartPing);


	// free memory
	arPingAnswerTime = null;
	arFilelist = null;
	arTimestamp = null;


	// show beginning and middle of ping and average chart
//	var nowTime = new Date();
//	var intNowTimestamp = nowTime.getTime();
	var intHrsNow = checkTime( nowTime.getHours() ); 
	var intMinNow = checkTime( nowTime.getMinutes() ); 

	// middle of ping chart
	var intMiddleTimestampPing = intNowTimestamp - intNumberResults/2*intInterval*1000;
	var middleTimePing = new Date(intMiddleTimestampPing);
	var intHrsMiddlePing = checkTime( middleTimePing.getHours() ); 
	var intMinMiddlePing = checkTime( middleTimePing.getMinutes() ); 

	$("#chartPositionPings").css("width",+intNumberResults*intBarWidth+"px");
	$("#chartPositionPingsStart").text("|"+intHrsNow+":"+intMinNow+"");
	$("#chartPositionPingsMiddle").text("|"+intHrsMiddlePing+":"+intMinMiddlePing+"");


	if (intRefreshRate > 0)
	{
		// middle of average chart
		var intMiddleTimestampAverage = intNowTimestamp - intNumberResults/2*intInterval*intRefreshRate*1000;
		var middleTimeAverage = new Date(intMiddleTimestampAverage);
		var intHrsMiddleAverage = checkTime( middleTimeAverage.getHours() ); 
		var intMinMiddleAverage = checkTime( middleTimeAverage.getMinutes() ); 

		$("#chartPositionAverage").css("width",+intNumberResults*intBarWidth+"px");
		$("#chartPositionAverageStart").text("|"+intHrsNow+":"+intMinNow+"");
		$("#chartPositionAverageMiddle").text("|"+intHrsMiddleAverage+":"+intMinMiddleAverage+"");
	}
	$("#lastReloadDiv").css("width",+intNumberResults*intBarWidth+"px");


} // end function


function fnCheckTrends(current,compare)
{
	var arReturn = [];
	var quotient = current/compare;
	// 46ms/30ms ... Xms/30ms
	if (quotient > 1.5 )
	{ 
		arReturn.push("&#8679;"); // ++
		arReturn.push("#ff0000"); // red
	}
	// 45ms/30ms ... 34,5ms/30ms
	else if (quotient > 1.15 )
	{ 
		arReturn.push("&#11008;"); // +
		arReturn.push("#ff8000"); // orange
	}
	// 34,5ms/30ms ... 25,5ms/30ms
	else if (quotient > 0.85 )
	{ 
		arReturn.push("&#8680;"); // 0
		arReturn.push("#ffff00"); // yellow
	}
	// 25,5ms/30ms ... 15ms/30ms
	else if (quotient > 0.5 )
	{ 
		arReturn.push("&#11010;"); // -
		arReturn.push("#80ff00"); // turqois
	}
	// 14ms/30ms ... 1ms/30
	else
	{ 
		arReturn.push("&#8681;"); // --
		arReturn.push("#00ff00"); // green
	}
	return arReturn;
}


// writes the link with all the parameters
function fnCreateReloadLink(divName, strSystem, strFilename, intInterval, intNumberResults, intBarWidth, intBarHeight, intFileSearch, intRefreshRate, strText, strTitle)
{
	$("#"+divName).append(" <a href='index.html?strSystem="+strSystem+"&strFilename="+strFilename+"&intInterval="+intInterval+"&intNumberResults="+intNumberResults+"&intBarWidth="+intBarWidth+"&intBarHeight="+intBarHeight+"&intFileSearch="+intFileSearch+"&intRefreshRate="+intRefreshRate+"&' title='"+strTitle+"'>"+strText+"</a>");

}


// get min and max values
function fnGetMinMaxValues(arrayname,searchStart,searchStop)
{
	var intMinimum = 10000;
	var intMaximum = 0;
	var intAverageSum = 0;
	var intCounter = 0;
	var arResults = new Array;
	var intPingTime = 0;

	for (i = searchStart; i >= searchStop; i--)
	{
		intPingTime = parseFloat(arrayname[i])
		if (intPingTime >= intMaximum)
		{ intMaximum = intPingTime; }

		else if ( ( intPingTime <= intMinimum) && ( intPingTime != 0) )
		{ intMinimum = arrayname[i]; }

		if ( (intPingTime != 0) && (intPingTime >= 0) )
		{
			intAverageSum = intAverageSum+intPingTime;
			intCounter++;
		}

	} // end for

	var intAverage = Math.round(intAverageSum / intCounter *100)/100;

	arResults.push(intMinimum);
	arResults.push(intMaximum);
	arResults.push(intAverage);
	return arResults;
}


// read parameters from location bar
function fnReadLocationBar(searchterm,defaultValue)
{
	// read location bar in browser
	var strLocationBar = window.location.search;
	// cut from search term (which is coincidantly the same as the value to be returned) until the next ampersand 
	var intPositionSearchterm = strLocationBar.indexOf(searchterm)
	// if term not given
	if (intPositionSearchterm == -1)
	{
		if (typeof(defaultValue) == "Number")
		{ return Math.abs(strReturnvalue); }
		else
		{ return defaultValue; }
	}
	else
	{
		// cut off from start until end of searchterm 
		var strReturnvalue = strLocationBar.substr(intPositionSearchterm+searchterm.length+1,255)
		// find "first" ampersand as separateor between values
		var intPositionSearchterm = strReturnvalue.indexOf("&")
		// cut off from value until ampersand
		var strReturnvalue = strReturnvalue.substr(0,intPositionSearchterm)
		if (typeof(strReturnvalue) == "Number")
		{ return Math.abs(strReturnvalue); }
		else
		{ return strReturnvalue; }
	}
}

function fnToggleDiv(divname)
{
	$("#"+divname).fadeToggle("slow", "linear");
//	$("#configDiv").fadeToggle("slow", "linear");
}


// START
function fnStart()
{
	$("#configDiv").fadeOut("fast", "linear");

	var now = new Date();
	var intNowTimestamp = now.getTime();

	// read most recent file
	var strFilename = now.toISOString();
	var strFilenameNow = strFilename.substr(0,10)+".txt";

	// read default values from location bar
	strFilename = fnReadLocationBar("strFilename",strFilenameNow);
	intRefreshRate = fnReadLocationBar("intRefreshRate",intRefreshRate);
	intInterval = fnReadLocationBar("intInterval",intInterval);

	// check for filename
	if ( (strFilename == "undefined") || (strFilename == "") )
	{
		strFilename = strFilenameNow;
	}

	boolFileExist = fnCheckFileExists(strFilename)
	if (boolFileExist)
	{
	 	//fnReadCsv("logs/"+strFilename,fnSplitLines)
        fnReadCsv(""+strFilename,fnSplitLines)
	}
	else
	{
		$("#warning").empty();
		$("#warning").append(" Requested logfile <b>"+strFilename+" </b> not found! Trying to find some other files ... See below for results. ");

		arFilelist = fnCheckFileExistsByDate(183) // 183 days = half a year
		$("#changeFile").empty();
		for (i = 0; i <= arFilelist.length-1; i++)
		{
			fnCreateReloadLink("changeFile", strSystem, arFilelist[i], intInterval, intNumberResults, intBarWidth, intBarHeight, intFileSearch, intRefreshRate, arFilelist[i], arFilelist[i])
		}
	}

	// if a refresh rate is given, reload file every XX seconds
	if (intRefreshRate > 0)
	{
		intRefreshMilliseconds = 1000 * intRefreshRate * intInterval; // i.e. multiplier of 2 x 5 seconds interval
		objTimeOutRefresh = setTimeout('fnStart()',intRefreshMilliseconds);
	}
	else
	{
		// start counting the difference between reload and now
		fnCalculateTimeDifference(intNowTimestamp)
	}
	// show current time as last reload time
	$("#lastReloadTime").text(now)

}


// http://stackoverflow.com/questions/338269/display-current-time-each-minute-with-prototypes-ajax-periodicalupdater
function fnCalculateTimeDifference(intNowTimestamp)
{
//	objTimeoutDifference = null // unset other timeout or it continues to count.

	var lastReload = new Date(intNowTimestamp);
	var currentTime = new Date();

	var intDifferenceMSec = currentTime - lastReload;
	var intDifferenceSec = Math.round(intDifferenceMSec / 1000);
	var intDifferenceMin = 0;
	var intDifferenceHrs = 0;

	if (intDifferenceSec >= 60)
	{
		intDifferenceMin = Math.floor(intDifferenceSec / 60);
		intDifferenceSec = intDifferenceSec - intDifferenceMin * 60;
	}

	if (intDifferenceMin >= 60)
	{
		intDifferenceHrs = Math.floor(intDifferenceMin / 60);
		intDifferenceMin = intDifferenceMin - intDifferenceHrs * 60;
	}

	// add a zero in front of numbers<10
	intDifferenceMin = checkTime(intDifferenceMin);
	intDifferenceSec = checkTime(intDifferenceSec);

//	document.getElementById('endtime').value=h+":"+m;
	$("#lastReloadDifference").text(+intDifferenceHrs+":"+intDifferenceMin+":"+intDifferenceSec+" ago")
	objTimeoutDifference=setTimeout('fnCalculateTimeDifference('+intNowTimestamp+')',750);
}

// add a zero in front of numbers<10
function checkTime(i)
{
	if (i<10)
	{
		i="0" + i;
	}
	return i;
}

// global
var arPingAverageTime = new Array; // only in use with automatic refresh
