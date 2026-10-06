local ServerStorage =
	game:GetService("ServerStorage")

print("Main.server.lua gestartet")

--------------------------------------------------
-- GENERATE WORLD
--------------------------------------------------

local GeneratePlayground =
	require(
		ServerStorage
			:WaitForChild("Tools")
			:WaitForChild("GeneratePlayground")
	)

GeneratePlayground.Generate()

print("Playground wurde generiert")

--------------------------------------------------
-- SERVICES
--------------------------------------------------

local Services =
	script.Parent:WaitForChild("Services")

local ProgressService =
	require(Services:WaitForChild("ProgressService"))

local RewardService =
	require(Services:WaitForChild("RewardService"))

local AnswerPlateService =
	require(Services:WaitForChild("AnswerPlateService"))

local MathGameService =
	require(Services:WaitForChild("MathGameService"))

local FinishService =
	require(Services:WaitForChild("FinishService"))

local LeaderboardService =
	require(Services:WaitForChild("LeaderboardService"))
--------------------------------------------------
-- INIT
--------------------------------------------------

ProgressService:Init()
RewardService:Init()
AnswerPlateService:Init()

MathGameService:Init()
FinishService:Init()
LeaderboardService:Init()

print("Math Playground server initialized.")