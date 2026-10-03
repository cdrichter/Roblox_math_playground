local Players = game:GetService("Players")

local ProgressService =
	require(script.Parent.ProgressService)

local RewardService =
	require(script.Parent.RewardService)

local FinishService = {}

local debounce = {}

local function getPlayer(hit)
	local character =
		hit:FindFirstAncestorOfClass("Model")

	if not character then
		return nil
	end

	local humanoid =
		character:FindFirstChildOfClass("Humanoid")

	if not humanoid then
		return nil
	end

	return Players:GetPlayerFromCharacter(character)
end

local function teleportToSpawn(player)
	local playground =
		workspace:FindFirstChild("MathPlayground")

	if not playground then
		warn("MathPlayground not found")
		return
	end

	local spawnPoint =
		playground:FindFirstChild(
			"SpawnPoint",
			true
		)

	if not spawnPoint then
		warn("SpawnPoint not found")
		return
	end

	local character = player.Character

	if not character then
		return
	end

	character:PivotTo(
		spawnPoint.CFrame
			* CFrame.new(0, 5, 0)
	)

	print(
		player.Name,
		"teleported to SpawnPoint."
	)
end

local function connectFinishPad(pad)
	pad.Touched:Connect(function(hit)
		local player = getPlayer(hit)

		if not player then
			return
		end

		if debounce[player] then
			return
		end

		debounce[player] = true

		local difficulty =
			pad:GetAttribute("Difficulty")

		if not difficulty then
			warn(
				"Finish pad has no Difficulty:",
				pad:GetFullName()
			)

			debounce[player] = nil
			return
		end

		if not ProgressService:IsTrackCompleted(
			player,
			difficulty
		) then

			print(
				player.Name,
				"has not completed difficulty",
				difficulty,
				"yet. Progress:",
				ProgressService:GetProgress(
					player,
					difficulty
				)
			)

			task.delay(1, function()
				debounce[player] = nil
			end)

			return
		end

		RewardService:GiveCompletionReward(
			player,
			difficulty
		)

		-- Track zurücksetzen, damit ein neuer
		-- vollständiger Durchlauf wieder Punkte geben kann.
		ProgressService:ResetTrack(
			player,
			difficulty
		)

		teleportToSpawn(player)

		task.delay(2, function()
			debounce[player] = nil
		end)
	end)
end

function FinishService:Init()
	local playground =
		workspace:WaitForChild("MathPlayground")

	for _, object in playground:GetDescendants() do
		if object:IsA("BasePart")
			and object:GetAttribute("IsFinishPad") == true then

			connectFinishPad(object)
		end
	end

	print("FinishService initialized.")
end

return FinishService