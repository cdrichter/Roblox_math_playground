local Players = game:GetService("Players")

local ProgressService = {}

local TRACK_LENGTH = 20

-- progress[player][difficulty] = höchste korrekt abgeschlossene Aufgabe
local progress = {}

function ProgressService:Init()
	Players.PlayerAdded:Connect(function(player)
		progress[player] = {}
	end)

	Players.PlayerRemoving:Connect(function(player)
		progress[player] = nil
	end)

	for _, player in Players:GetPlayers() do
		progress[player] = {}
	end

	print("ProgressService initialized.")
end

function ProgressService:CompleteQuestion(player, difficulty, questionIndex)
	if not progress[player] then
		progress[player] = {}
	end

	local currentProgress = progress[player][difficulty] or 0

	-- Nur die nächste reguläre Aufgabe zählt.
	if questionIndex == currentProgress + 1 then
		progress[player][difficulty] = questionIndex

		print(
			player.Name,
			"Difficulty",
			difficulty,
			"Progress:",
			questionIndex .. "/" .. TRACK_LENGTH
		)

		return true
	end

	return false
end

function ProgressService:GetProgress(player, difficulty)
	if not progress[player] then
		return 0
	end

	return progress[player][difficulty] or 0
end

function ProgressService:IsTrackCompleted(player, difficulty)
	return self:GetProgress(player, difficulty) >= TRACK_LENGTH
end

function ProgressService:ResetTrack(player, difficulty)
	if not progress[player] then
		return
	end

	progress[player][difficulty] = 0
end

return ProgressService