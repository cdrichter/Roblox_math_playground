local AnswerPlateService = {}

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

		local character = hit.Parent
		if not character then
			return
		end

		local humanoid = character:FindFirstChildOfClass("Humanoid")
		if not humanoid then
			return
		end

		local player = game.Players:GetPlayerFromCharacter(character)
		if not player then
			return
		end

		local isCorrect = plate:GetAttribute("Correct")

		callback(player, isCorrect, plate)
	end)
end

local function MakePlayerFall(player)
	local character = player.Character
	if not character then
		return
	end

	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then
		return
	end

	humanoid:ChangeState(Enum.HumanoidStateType.FallingDown)
end

return AnswerPlateService