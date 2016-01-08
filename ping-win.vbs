' <%@LANGUAGE=VBSCRIPT LCID=1033%>
' select US date format (1033)

Dim intTimestamp
Dim strFilename 
Dim strCommandTime
Dim strCommandPing 

intTimestamp = DateDiff("s", "01.01.1970 00:00:00", Now())


' http://sogeeky.blogspot.de/2006/08/vbscript-add-leading-zero-to-date.html
strFilename = DatePart("yyyy",Date) &"-" _
        & Right("0" & DatePart("m",Date), 2) &"-" _
        & Right("0" & DatePart("d",Date), 2) 

' -n [number] : number of pings
' -t : constant ping

' strCommandTime = "echo TIMESTAMP "&intTimestamp&" >> logs\"&strFilename&".txt"
' strCommandPing = "ping www.google.com -t >> logs\"&strFilename&".txt"

' Set WshShellTime = WScript.CreateObject("WScript.Shell")
' intReturnTime = WshShellTime.Run("cmd /K "&strCommandTime, 0, TRUE)
' WshShell.Popup "Time" 

' Set WshShellPing = WScript.CreateObject("WScript.Shell")
' intReturnPing = WshShellPing.Run("cmd /K "&strCommandPing, 0, TRUE)
' WshShell.Popup "Ping" 

strCommand = "echo TIMESTAMP "&intTimestamp&" >> logs\"&strFilename&".txt | ping www.google.com -t >> logs\"&strFilename&".txt"

Set WshShellPing = WScript.CreateObject("WScript.Shell")
intReturn = WshShellPing.Run("cmd /K "&strCommand, 0, TRUE)

