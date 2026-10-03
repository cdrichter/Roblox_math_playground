local Services = script.Parent:WaitForChild("Services")

local AnswerPlateService = require(Services:WaitForChild("AnswerPlateService"))
local MathGameService = require(Services:WaitForChild("MathGameService"))
local ProgressService = require(Services:WaitForChild("ProgressService"))
local RewardService = require(Services:WaitForChild("RewardService"))

ProgressService:Init()
RewardService:Init()
AnswerPlateService:Init()
MathGameService:Init()

print("Math Playground server initialized.")