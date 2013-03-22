--------------------------------------------------------------------------------
-- Copyright (c) 2013 Sierra Wireless and others.
-- All rights reserved. This program and the accompanying materials
-- are made available under the terms of the Eclipse Public License v1.0
-- which accompanies this distribution, and is available at
-- http://www.eclipse.org/legal/epl-v10.html
--
-- Contributors: Sierra Wireless - initial API and implementation
--------------------------------------------------------------------------------

--[[-
@module alarms
]]
local M = {}

--[[-
@function [parent=#alarms] temperature
@param #number new Value to check
@param #number old Former value to check
@return #string, #boolean Alarm data key, alarm status true to raise alarm.
@return #nil When there is nothing to do
]]
function M.temperature(new, old)

	if not old then
		return
	end

	-- Condition to raise alarm
	local raise = function(x) return x > 40 end

	-- Change alarm status if it just changed
	local currentstatus = raise(new)
	local oldstatus = raise(old)
	if currentstatus ~= oldstatus then
		return "temperatureAlarm", currentstatus
	end
end

return M
