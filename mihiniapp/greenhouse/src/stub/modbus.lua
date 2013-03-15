-------------------------------------------------------------------------------
-- Copyright (c) 2012, 2013 Sierra Wireless and others.
-- All rights reserved. This program and the accompanying materials
-- are made available under the terms of the Eclipse Public License v1.0
-- which accompanies this distribution, and is available at
-- http://www.eclipse.org/legal/epl-v10.html
--
-------------------------------------------------------------------------------

local log = require "log"
local math = require "math"

-------------------------------------------------------------------------------
-- This module aim to simulate modbus behavior.
--
-- @module stub.modbus
-- @return modbus#modbus
local M = {}

-- -----------------------------------------------------------------------------
-- utils function.
-- -------------------------------------------------------------------------------
-- calcul endianness
local endianness = string.byte(string.dump(function() end),7)

-- convert number value to bytes (string)
local function numbertobytes(value)
	-- extract byte values
	local low,high
	if(endianness == 1) then
		high = math.floor(value/256)
		low =  math.fmod(value, 256)
	else
		low = math.floor(value/256)
		high = math.fmod(value, 256)
	end

	-- convert to string bytes
	return string.char(low,high)
end

local function linearchange(val, step, min,max)
	return ((val + step - min) % (max-min) + min)
end

-- inital value of registries
local registries = {
	0,
	250, -- temperature
	300, -- luminosity
	600, -- humidity
	0,
	0,
	0,
	0, -- switch
	0,
	0
}

local changeregistries = {
	0,
	function(val) return linearchange(val,15,100,600) end, -- temperature (change from 100 to 600 by step of 15)
	function(val) return linearchange(val,75,0,800) end, -- luminosity (change from 0 to 800 by step of 75)
	function(val) return linearchange(val,2,400,750) end, -- humidity (change from 400 to 750 by step of 2)
	0,
	0,
	0,
	0, -- switch
	0,
	0
}


-- -----------------------------------------------------------------------------
-- simulated modbus client function.
-- -------------------------------------------------------------------------------
local function readHoldingRegisters ()
	-- convert number value to string
	local res = {}
	for i, val in ipairs(registries) do
		res[i] = numbertobytes(val)
	end
	
	-- change registries values
	for i, val in ipairs(registries) do
		local f = changeregistries[i]
		if type(f)=='function' then  registries[i] = f(val) end
	end
	
	return table.concat(res)
end

local function writeMultipleRegisters(self, sid, address, values)
	log ("MODBUS STUB", "INFO", "write multiple resgisters")
end


-- -----------------------------------------------------------------------------
-- create a simulate modbus client
function M.new(port, cfg, mode)
	return {
		readHoldingRegisters = readHoldingRegisters,
		writeMultipleRegisters = writeMultipleRegisters
	}
end

return M