
local GeneratePlayground = {}

function GeneratePlayground.Generate()

	print("GeneratePlayground.Generate() läuft")

-- GeneratePlayground.lua

local Workspace = game:GetService("Workspace")

--------------------------------------------------
-- CONFIG
--------------------------------------------------

local ISLAND_HEIGHT = 40
local ISLAND_SIZE = Vector3.new(380, 8, 120)

local TRACK_LENGTH = 20
local TILE_SIZE = Vector3.new(8, 1, 8)
local TILE_GAP = 2

local TRACK_DISTANCE = 65


--------------------------------------------------
-- WATER CONFIG
--------------------------------------------------

local WATER_HEIGHT = 0
local WATER_DEPTH = 20
local WATER_SIZE = 2000
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

	sign.CFrame =
	CFrame.new(position)
	* CFrame.Angles(0, math.rad(180), 0);


	label.Text = text
	label.TextColor3 = Color3.new(1, 1, 1)
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold

	label.Parent = gui

	return sign
end

--------------------------------------------------
-- WATER
--------------------------------------------------

local terrain = workspace.Terrain

terrain:FillBlock(
	CFrame.new(
		0,
		WATER_HEIGHT - WATER_DEPTH / 2,
		0
	),
	Vector3.new(
		WATER_SIZE,
		WATER_DEPTH,
		WATER_SIZE
	),
	Enum.Material.Water
)

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

-- Alle Bahnen verlaufen nach Norden (-Z)
local TRACK_DIRECTION = Vector3.new(0, 0, -1)

-- Abstand zwischen den Mittellinien der Bahnen
local TRACK_SPACING = 22

-- X-Positionen der vier Bahnen
local TRACK_X_POSITIONS = {
	-TRACK_SPACING * 3.5,
	-TRACK_SPACING * 1.5,
	 TRACK_SPACING * 1.5,
	 TRACK_SPACING * 3.5,
}

local function createTrack(difficulty)
	local folder = Instance.new("Folder")

	folder.Name = "Difficulty_" .. difficulty
	folder.Parent = tracksFolder

	-- Alle Bahnen beginnen nördlich des Spawnpunkts.
	-- Die Schwierigkeit bestimmt nur die Position auf der X-Achse.
	local startPosition = Vector3.new(
		TRACK_X_POSITIONS[difficulty],
		ISLAND_HEIGHT,
		-TRACK_DISTANCE
	)

	for question = 1, TRACK_LENGTH do

		--------------------------------------------------
		-- POSITION DER AUFGABE
		--------------------------------------------------

		local forwardOffset =
			TRACK_DIRECTION
			* ((question - 1) * (TILE_SIZE.Z + TILE_GAP))

		local position = Vector3.new(
			startPosition.X,
			ISLAND_HEIGHT,
			startPosition.Z + forwardOffset.Z
		)

		--------------------------------------------------
		-- ABSTAND ZWISCHEN DEN BEIDEN ANTWORTPLATTEN
		--------------------------------------------------

		local plateGap = 0.5

		local leftOffset = Vector3.new(
			-(TILE_SIZE.X + plateGap) / 2,
			0,
			0
		)

		--------------------------------------------------
		-- LEFT ANSWER
		--------------------------------------------------

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
			Color3.fromRGB(80, 150, 230)
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
			position + Vector3.new(0, 12, 0)
		)
	end
end

--------------------------------------------------
-- FOUR DIFFICULTIES
--------------------------------------------------

for difficulty = 1, 4 do
	createTrack(difficulty)
end



end

return GeneratePlayground