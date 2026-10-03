local ServerStorage = game:GetService("ServerStorage")

print("Main.server.lua gestartet")

local GeneratePlayground =
	require(ServerStorage:WaitForChild("Tools"):WaitForChild("GeneratePlayground"))

print("GeneratePlayground geladen")

GeneratePlayground.Generate()

print("Playground wurde generiert")


local Services = script.Parent:WaitForChild("Services")

local AnswerPlateService = require(Services:WaitForChild("AnswerPlateService"))
local MathGameService = require(Services:WaitForChild("MathGameService"))
local ProgressService = require(Services:WaitForChild("ProgressService"))
local RewardService = require(Services:WaitForChild("RewardService"))
local FinishService =require(Services:WaitForChild("FinishService"))
local LeaderboardService = require(Services:WaitForChild("LeaderboardService"))	

FinishService:Init()
ProgressService:Init()
RewardService:Init()
AnswerPlateService:Init()
MathGameService:Init()
LeaderboardService:Init()

print("Math Playground server initialized.")
