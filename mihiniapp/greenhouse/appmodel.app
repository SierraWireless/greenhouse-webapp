<?xml version="1.0" encoding="UTF-8"?>
<app:application xmlns:app="http://www.sierrawireless.com/airvantage/application/1.0" name="greenhouse" revision="0.3" type="greenhouse">
  <capabilities>
	<communication>
		<protocol comm-id="SERIAL" type="M3DA">
          	<parameter name="authentication" value="none"/>
          	<parameter name="cipher" value="none"/>
          </protocol>
	</communication>
    <data>
      <encoding type="M3DA">
        <asset default-label="greenhouse" id="greenhouse">
          <node default-label="Data" path="data">
            <variable default-label="Luminosity (Lux)" path="luminosity" type="double"/>
            <variable default-label="Humidity (%)" path="humidity" type="double"/>
            <variable default-label="Temperature (°C)" path="temperature" type="double"/>
            <variable default-label="Is the light on" path="light" type="boolean"/>
            <variable default-label="Is the window open" path="open" type="boolean"/>
            <variable default-label="Temperature alarm" path="temperatureAlarm" type="boolean"/>
			<command default-label="Switch light" path="switchLight">
				<description>Command the light, true to switch light ON and false to turn it OFF.</description>
      			<parameter default-label="Requested state of light bulb." default-value="false" id="state" type="boolean"/>
    		</command>
    		<command default-label="Switch shield" path="switchShield">
				<description>Command the shield, true for opening and false  for closing.</description>
      			<parameter default-label="Requested state of shield." default-value="false" id="state" type="boolean"/>
    		</command>
          </node>
        </asset>
      </encoding>
    </data>
  </capabilities>
  <application-manager use="MIHINI_APPCON"/>
  <binaries>
    <binary file="bin.tar"/>
  </binaries>
</app:application>
