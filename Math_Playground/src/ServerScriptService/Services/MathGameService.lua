local AnswerPlateService =
	require(script.Parent.AnswerPlateService)

local ProgressService =
	require(script.Parent.ProgressService)

local MathGameService = {}

function MathGameService:Init()
	local playground =
		workspace:WaitForChild("MathPlayground")

	local tracks =
		playground:WaitForChild("Tracks")

	for _, track in tracks:GetChildren() do
		for _, object in track:GetChildren() do
			if not object:IsA("BasePart") then
				continue
			end

			local questionIndex =
				object:GetAttribute("QuestionIndex")

			local difficulty =
				object:GetAttribute("Difficulty")

			if questionIndex and difficulty then
				AnswerPlateService.EnablePlate(
					object,

					function(
						player,
						isCorrect,
						plate,
						plateDifficulty,
						plateQuestionIndex
					)
						if isCorrect then
							local counted =
								ProgressService:CompleteQuestion(
									player,
									plateDifficulty,
									plateQuestionIndex
								)

							if counted then
								print(
									player.Name,
									"correct:",
									plateQuestionIndex
								)
							end
						else
							print(
								player.Name,
								"wrong:",
								plateQuestionIndex
							)

							local character =
								player.Character

							if character then
								local humanoid =
									character:
									FindFirstChildOfClass(
										"Humanoid"
									)

								if humanoid then
									humanoid:ChangeState(
										Enum.HumanoidStateType.FallingDown
									)
								end
							end
						end
					end
				)
			end
		end
	end

	print("MathGameService initialized.")
end

return MathGameService