local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local DifficultyConfig = require(Shared:WaitForChild("DifficultyConfig"))

local FinishService = {}

local initialized = false
local touchDebounce = {}

--------------------------------------------------
-- PLAYER POINTS
--------------------------------------------------

local function setupPlayerPoints(player)
	local leaderstats = player:FindFirstChild("leaderstats")

	if not leaderstats then
		leaderstats = Instance.new("Folder")
		leaderstats.Name = "leaderstats"
		leaderstats.Parent = player
	end

	local points = leaderstats:FindFirstChild("Points")

	if not points then
		points = Instance.new("IntValue")
		points.Name = "Points"
		points.Value = 0
		points.Parent = leaderstats
	end
end

--------------------------------------------------
-- GET PLAYER
--------------------------------------------------

local function getPlayerFromHit(hit)
	if not hit then
		return nil
	end

	local character = hit:FindFirstAncestorOfClass("Model")

	if not character then
		return nil
	end

	local humanoid = character:FindFirstChildOfClass("Humanoid")

	if not humanoid then
		return nil
	end

	return Players:GetPlayerFromCharacter(character)
end

--------------------------------------------------
-- REWARD
--------------------------------------------------

local function rewardPlayer(player, difficulty)
	local difficultyData = DifficultyConfig[difficulty]

	if not difficultyData then
		warn("Unknown difficulty:", difficulty)
		return false
	end

	local reward = difficultyData.CompletionPoints

	if not reward then
		warn(
			"No CompletionPoints configured for difficulty:",
			difficulty
		)
		return false
	end

	local leaderstats = player:FindFirstChild("leaderstats")

	if not leaderstats then
		warn("No leaderstats found for:", player.Name)
		return false
	end

	local points = leaderstats:FindFirstChild("Points")

	if not points then
		warn("No Points value found for:", player.Name)
		return false
	end

	points.Value += reward

	print(
		player.Name
			.. " completed "
			.. difficultyData.Name
			.. " and received "
			.. reward
			.. " points."
	)

	return true
end

--------------------------------------------------
-- FIND SPAWN
--------------------------------------------------

local function findSpawnPoint()
	-- First look specifically for SpawnPoint
	local spawnPoint = workspace:FindFirstChild("SpawnPoint", true)

	if spawnPoint and spawnPoint:IsA("BasePart") then
		return spawnPoint
	end

	-- Fallback: use any Roblox SpawnLocation
	local spawnLocation =
		workspace:FindFirstChildWhichIsA(
			"SpawnLocation",
			true
		)

	return spawnLocation
end

--------------------------------------------------
-- TELEPORT PLAYER
--------------------------------------------------

local function teleportPlayerToSpawn(player)
	local character = player.Character

	if not character then
		return false
	end

	local spawnPoint = findSpawnPoint()

	if not spawnPoint then
		warn("No SpawnPoint or SpawnLocation found in Workspace.")
		return false
	end

	character:PivotTo(
		spawnPoint.CFrame
			* CFrame.new(0, 5, 0)
	)

	print(player.Name .. " returned to SpawnPoint.")

	return true
end

--------------------------------------------------
-- FINISH
--------------------------------------------------

local function finishTrack(returnPad, player)
	local difficulty =
		returnPad:GetAttribute("Difficulty")

	if not difficulty then
		warn(
			"ReturnPad has no Difficulty attribute:",
			returnPad:GetFullName()
		)
		return
	end

	print(
		player.Name,
		"reached finish for difficulty",
		difficulty
	)

	--------------------------------------------------
	-- GIVE REWARD
	--------------------------------------------------

	rewardPlayer(player, difficulty)

	--------------------------------------------------
	-- RETURN TO SPAWN
	--------------------------------------------------

	teleportPlayerToSpawn(player)
end

--------------------------------------------------
-- PAD TOUCHED
--------------------------------------------------

local function onFinishTouched(returnPad, hit)
	local player = getPlayerFromHit(hit)

	if not player then
		return
	end

	if touchDebounce[player] then
		return
	end

	touchDebounce[player] = true

	finishTrack(returnPad, player)

	task.delay(2, function()
		touchDebounce[player] = nil
	end)
end

--------------------------------------------------
-- CONNECT PAD
--------------------------------------------------

local function connectReturnPad(returnPad)
	if not returnPad:IsA("BasePart") then
		return
	end

	if returnPad:GetAttribute("IsFinishPad") ~= true then
		return
	end

	returnPad.Touched:Connect(function(hit)
		onFinishTouched(returnPad, hit)
	end)

	print(
		"Finish pad connected:",
		returnPad:GetFullName()
	)
end

--------------------------------------------------
-- INIT
--------------------------------------------------

function FinishService:Init()
	if initialized then
		return
	end

	initialized = true

	--------------------------------------------------
	-- PLAYER POINTS
	--------------------------------------------------

	for _, player in Players:GetPlayers() do
		setupPlayerPoints(player)
	end

	Players.PlayerAdded:Connect(setupPlayerPoints)

	--------------------------------------------------
	-- PLAYGROUND
	--------------------------------------------------

	local playground =
		workspace:WaitForChild("MathPlayground")

	--------------------------------------------------
	-- EXISTING PADS
	--------------------------------------------------

	for _, object in playground:GetDescendants() do
		if object:IsA("BasePart")
			and object:GetAttribute("IsFinishPad") == true then

			connectReturnPad(object)
		end
	end

	--------------------------------------------------
	-- NEW PADS
	--------------------------------------------------

	playground.DescendantAdded:Connect(function(object)
		task.defer(function()
			if object:IsA("BasePart")
				and object:GetAttribute("IsFinishPad") == true then

				connectReturnPad(object)
			end
		end)
	end)

	print("FinishService initialized.")
end

return FinishService