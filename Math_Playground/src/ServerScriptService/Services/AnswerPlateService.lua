local Players = game:GetService("Players")

local AnswerPlateService = {}

local touchDebounce = {}

function AnswerPlateService:Init()
	print("AnswerPlateService initialized.")
end

function AnswerPlateService.PrepareAnswers(plateA, plateB, questionData)
	local correctAnswer = questionData.CorrectAnswer
	local wrongAnswer = questionData.WrongAnswer

	local correctOnA = math.random(1, 2) == 1

	if correctOnA then
		plateA:SetAttribute("Answer", correctAnswer)
		plateA:SetAttribute("Correct", true)

		plateB:SetAttribute("Answer", wrongAnswer)
		plateB:SetAttribute("Correct", false)
	else
		plateA:SetAttribute("Answer", wrongAnswer)
		plateA:SetAttribute("Correct", false)

		plateB:SetAttribute("Answer", correctAnswer)
		plateB:SetAttribute("Correct", true)
	end
end

function AnswerPlateService.EnablePlate(plate, callback)
	plate.Touched:Connect(function(hit)
		local character = hit:FindFirstAncestorOfClass("Model")

		if not character then
			return
		end

		local humanoid =
			character:FindFirstChildOfClass("Humanoid")

		if not humanoid or humanoid.Health <= 0 then
			return
		end

		local player =
			Players:GetPlayerFromCharacter(character)

		if not player then
			return
		end

		local debounceKey =
			tostring(player.UserId)
			.. "_"
			.. plate:GetFullName()

		if touchDebounce[debounceKey] then
			return
		end

		touchDebounce[debounceKey] = true

		local isCorrect =
			plate:GetAttribute("Correct")

		local difficulty =
			plate:GetAttribute("Difficulty")

		local questionIndex =
			plate:GetAttribute("QuestionIndex")

		callback(
			player,
			isCorrect,
			plate,
			difficulty,
			questionIndex
		)

		task.delay(1, function()
			touchDebounce[debounceKey] = nil
		end)
	end)
end

return AnswerPlateService