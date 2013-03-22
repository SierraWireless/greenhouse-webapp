-------------------------------------------------------------------------------
-- Copyright (c) 2012, 2013 Sierra Wireless and others.
-- All rights reserved. This program and the accompanying materials
-- are made available under the terms of the Eclipse Public License v1.0
-- which accompanies this distribution, and is available at
-- http://www.eclipse.org/legal/epl-v10.html
--
-- Contributors:
--     Gaëtan Morice, Sierra Wireless - initial API and implementation
-------------------------------------------------------------------------------
--
-- @module utils
-- 
local t = {}

-------------------------------------------------------------------------------
-- @function [parent=#utils] split
-- @param #string path 
-- @param #string sep 
-- @return #table
function t.split(path,sep)
	local t = {}
	for w in string.gfind(path, "[^"..sep.."]+")do
		table.insert(t, w)
	end
	return t
end

-------------------------------------------------------------------------------
-- @function [parent=#utils] convertRegister
-- @param #number value
-- @param #number address
-- @return #number
function t.convertRegister(value, address)
	local low = string.byte(value,2*(address + 1) - 1)
	local high = string.byte(value,2*(address + 1))
	local f = function() end
	local endianness = string.byte(string.dump(f),7)
	if(endianness == 1) then 
  	  return high*256+low
  	else
  	  return low*256+high
  	end
end

-------------------------------------------------------------------------------
-- @function [parent=#utils] processTemperature
-- @param #number value
-- @return #number
function t.processTemperature(value)
	local rsensor = (1023-value)*10000/value
	return 1/(math.log(rsensor/10000)/3975 + 1/298.15)-273.15
end

-------------------------------------------------------------------------------
-- @function [parent=#utils] processHumidity
-- @param #number value
-- @return #number
function t.processHumidity(value)
	if (value < 400) then
		return 0
	else
		return (value - 300) / 450 * 100
	end
end 

-------------------------------------------------------------------------------
-- @function [parent=#utils] processHumidity_old
-- @param #number value
-- @return #number
function t.processHumidity_old(value)
	if (value < 150) then
		return 100
	else
		return 0
	end
end 

-------------------------------------------------------------------------------
-- @function [parent=#utils] processLuminosity
-- @param #number value
-- @return #number
function t.processLuminosity(value)
	local vsensor = value * 0.0048828125
	return 500 / ( 10 * ( (5.0 - vsensor) / vsensor ) )
end

-------------------------------------------------------------------------------
-- @function [parent=#utils] identity
-- @param  i
function t.identity(i) return i end

return t
