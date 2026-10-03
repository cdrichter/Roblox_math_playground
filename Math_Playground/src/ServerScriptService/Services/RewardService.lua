local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local DifficultyConfig =
	require(
		ReplicatedStorage
			:WaitForChild("Shared")
			:WaitForChild("DifficultyConfig")
	)

local RewardService = {}

local function setupPlayer(player)
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

function RewardService:Init()
	for _, player in Players:GetPlayers() do
		setupPlayer(player)
	end

	Players.PlayerAdded:Connect(setupPlayer)

	print("RewardService initialized.")
end

function RewardService:GiveCompletionReward(player, difficulty)
	local config = DifficultyConfig[difficulty]

	if not config then
		warn("Unknown difficulty:", difficulty)
		return false
	end

	local leaderstats = player:FindFirstChild("leaderstats")
	if not leaderstats then
		return false
	end

	local points = leaderstats:FindFirstChild("Points")
	if not points then
		return false
	end

	local reward = config.CompletionPoints or 0

	points.Value += reward

	print(
		player.Name,
		"received",
		reward,
		"points for",
		config.Name
	)

	return true
end

return RewardService