local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- Spieler gilt unterhalb dieser Höhe als im Wasser.
local DEATH_HEIGHT = 2

local CHECK_INTERVAL = 0.2
local elapsed = 0

RunService.Heartbeat:Connect(function(deltaTime)
	elapsed += deltaTime

	if elapsed < CHECK_INTERVAL then
		return
	end

	elapsed = 0

	for _, player in Players:GetPlayers() do
		local character = player.Character

		if not character then
			continue
		end

		local humanoid = character:FindFirstChildOfClass("Humanoid")
		local rootPart = character:FindFirstChild("HumanoidRootPart")

		if not humanoid or not rootPart then
			continue
		end

		if humanoid.Health <= 0 then
			continue
		end

		if rootPart.Position.Y <= DEATH_HEIGHT then
			humanoid.Health = 0
		end
	end
end)