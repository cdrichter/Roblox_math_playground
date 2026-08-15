-- GeneratePlayground.lua

local Workspace = game:GetService("Workspace")

--------------------------------------------------
-- CONFIG
--------------------------------------------------

local ISLAND_HEIGHT = 40
local ISLAND_SIZE = Vector3.new(80, 8, 80)

local TRACK_LENGTH = 20
local TILE_SIZE = Vector3.new(8, 1, 8)
local TILE_GAP = 2

local TRACK_DISTANCE = 65

--------------------------------------------------
-- CLEANUP
--------------------------------------------------

local old = Workspace:FindFirstChild("MathPlayground")

if old then
	old:Destroy()
end

local root = Instance.new("Folder")
root.Name = "MathPlayground"
root.Parent = Workspace

local islandFolder = Instance.new("Folder")
islandFolder.Name = "Island"
islandFolder.Parent = root

local tracksFolder = Instance.new("Folder")
tracksFolder.Name = "Tracks"
tracksFolder.Parent = root

--------------------------------------------------
-- HELPERS
--------------------------------------------------

local function createPart(parent, name, size, position, color)
	local part = Instance.new("Part")

	part.Name = name
	part.Size = size
	part.Position = position

	part.Anchored = true
	part.Material = Enum.Material.SmoothPlastic
	part.Color = color

	part.Parent = parent

	return part
end

local function createSign(parent, text, position)
	local sign = createPart(
		parent,
		"QuestionSign",
		Vector3.new(12, 6, 1),
		position,
		Color3.fromRGB(45, 45, 50)
	)

	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Front
	gui.Parent = sign

	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1

	label.Text = text
	label.TextColor3 = Color3.new(1, 1, 1)
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold

	label.Parent = gui

	return sign
end

--------------------------------------------------
-- CENTRAL ISLAND
--------------------------------------------------

local island = createPart(
	islandFolder,
	"MainIsland",
	ISLAND_SIZE,
	Vector3.new(0, ISLAND_HEIGHT, 0),
	Color3.fromRGB(75, 170, 75)
)

--------------------------------------------------
-- SPAWN
--------------------------------------------------

local spawn = Instance.new("SpawnLocation")

spawn.Name = "SpawnPoint"
spawn.Size = Vector3.new(8, 1, 8)

spawn.Position = Vector3.new(
	0,
	ISLAND_HEIGHT + 5,
	0
)

spawn.Anchored = true
spawn.Neutral = true

spawn.Parent = islandFolder

--------------------------------------------------
-- CENTER PLATFORM
--------------------------------------------------

local center = createPart(
	islandFolder,
	"CenterPlatform",
	Vector3.new(30, 1, 30),
	Vector3.new(0, ISLAND_HEIGHT + 4, 0),
	Color3.fromRGB(100, 200, 100)
)

--------------------------------------------------
-- TRACK GENERATOR
--------------------------------------------------

local directions = {
	Vector3.new(0, 0, -1),
	Vector3.new(1, 0, 0),
	Vector3.new(0, 0, 1),
	Vector3.new(-1, 0, 0),
}

local function createTrack(difficulty, direction)
	local folder = Instance.new("Folder")

	folder.Name = "Difficulty_" .. difficulty
	folder.Parent = tracksFolder

	local startPosition =
		direction * TRACK_DISTANCE

	for question = 1, TRACK_LENGTH do

		local forwardOffset =
			direction * ((question - 1) * (TILE_SIZE.Z + TILE_GAP))

		local position =
			Vector3.new(
				startPosition.X + forwardOffset.X,
				ISLAND_HEIGHT,
				startPosition.Z + forwardOffset.Z
			)

		--------------------------------------------------
		-- LEFT ANSWER
		--------------------------------------------------

		local leftOffset =
			Vector3.new(
				-direction.Z,
				0,
				direction.X
			) * 5

		local leftTile = createPart(
			folder,
			"Question_" .. question .. "_Answer_A",
			TILE_SIZE,
			position + leftOffset,
			Color3.fromRGB(80, 150, 230)
		)

		leftTile:SetAttribute("Difficulty", difficulty)
		leftTile:SetAttribute("QuestionIndex", question)
		leftTile:SetAttribute("AnswerIndex", 1)

		--------------------------------------------------
		-- RIGHT ANSWER
		--------------------------------------------------

		local rightTile = createPart(
			folder,
			"Question_" .. question .. "_Answer_B",
			TILE_SIZE,
			position - leftOffset,
			Color3.fromRGB(230, 100, 100)
		)

		rightTile:SetAttribute("Difficulty", difficulty)
		rightTile:SetAttribute("QuestionIndex", question)
		rightTile:SetAttribute("AnswerIndex", 2)

		--------------------------------------------------
		-- QUESTION SIGN
		--------------------------------------------------

		createSign(
			folder,
			"Aufgabe " .. question,
			position
				+ Vector3.new(0, 6, 0)
		)
	end
end

--------------------------------------------------
-- FOUR DIFFICULTIES
--------------------------------------------------

for difficulty = 1, 4 do
	createTrack(
		difficulty,
		directions[difficulty]
	)
end

print("Math Playground generated successfully!")