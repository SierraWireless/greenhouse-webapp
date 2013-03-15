<?xml version="1.0" encoding="UTF-8"?><app:application xmlns:app="http://www.sierrawireless.com/airvantage/application/1.0" name="greenhouse" revision="0.4" type="greenhouse">
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
            <variable default-label="Is the windows open" path="open" type="boolean"/>
            <setting default-label="Temperature alaram" path="temperatureAlarm" type="boolean" default-value="false"/>
			 <command default-label="Switch light" path="switchLight">
				<description>Command the light, true means to turn the light ON and false to turn the light OFF</description>
      			<parameter default-label="State of the light wanted" default-value="false" id="state" type="boolean"/>
    		</command>
    		<command default-label="Switch shield" path="switchShield">
				<description>Command the shield, true means openning and false closing</description>
      			<parameter default-label="State of the shield wanted" default-value="false" id="state" type="boolean"/>
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
