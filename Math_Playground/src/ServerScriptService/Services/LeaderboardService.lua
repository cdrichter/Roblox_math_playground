local Players = game:GetService("Players")

local LeaderboardService = {}

local board
local textLabel

--------------------------------------------------
-- CREATE BOARD
--------------------------------------------------

local function createBoard()
	local playground = workspace:WaitForChild("MathPlayground")
	local island = playground:WaitForChild("Island")

	board = Instance.new("Part")
	board.Name = "Leaderboard"

	board.Size = Vector3.new(20, 14, 1)

	board.Position = Vector3.new(
		25,
		120,
		0
	)

	board.Anchored = true
	board.Color = Color3.fromRGB(40, 40, 45)
	board.Parent = island

	--------------------------------------------------
	-- GUI
	--------------------------------------------------

	local surfaceGui = Instance.new("SurfaceGui")

	surfaceGui.Face = Enum.NormalId.Front
	surfaceGui.Parent = board

	textLabel = Instance.new("TextLabel")

	textLabel.Size = UDim2.fromScale(1, 1)
	textLabel.BackgroundTransparency = 1

	textLabel.TextColor3 = Color3.new(1, 1, 1)
	textLabel.TextScaled = false
	textLabel.TextSize = 32

	textLabel.Font = Enum.Font.GothamBold

	textLabel.TextXAlignment =
		Enum.TextXAlignment.Left

	textLabel.TextYAlignment =
		Enum.TextYAlignment.Top

	textLabel.Parent = surfaceGui
end

--------------------------------------------------
-- GET POINTS
--------------------------------------------------

local function getPoints(player)
	local leaderstats =
		player:FindFirstChild("leaderstats")

	if not leaderstats then
		return 0
	end

	local points =
		leaderstats:FindFirstChild("Points")

	if not points then
		return 0
	end

	return points.Value
end

--------------------------------------------------
-- UPDATE BOARD
--------------------------------------------------

local function updateBoard()
	if not textLabel then
		return
	end

	local ranking = Players:GetPlayers()

	table.sort(ranking, function(a, b)
		return getPoints(a) > getPoints(b)
	end)

	local text = "🏆  RANKING\n\n"

	for position, player in ipairs(ranking) do

		if position > 10 then
			break
		end

		text ..=
			position
			.. ".  "
			.. player.DisplayName
			.. "     "
			.. getPoints(player)
			.. "\n"
	end

	textLabel.Text = text
end

--------------------------------------------------
-- WATCH PLAYER
--------------------------------------------------

local function watchPlayer(player)
	task.spawn(function()

		local leaderstats =
			player:WaitForChild("leaderstats")

		local points =
			leaderstats:WaitForChild("Points")

		points:GetPropertyChangedSignal("Value"):Connect(
			updateBoard
		)

		updateBoard()
	end)
end

--------------------------------------------------
-- INIT
--------------------------------------------------

function LeaderboardService:Init()

	createBoard()

	for _, player in Players:GetPlayers() do
		watchPlayer(player)
	end

	Players.PlayerAdded:Connect(watchPlayer)

	Players.PlayerRemoving:Connect(function()
		task.defer(updateBoard)
	end)

	updateBoard()

	print("LeaderboardService initialized.")
end

return LeaderboardService