local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared =
	ReplicatedStorage:WaitForChild("Shared")

local MathGenerator =
	require(Shared:WaitForChild("MathGenerator"))

local DifficultyConfig =
	require(Shared:WaitForChild("DifficultyConfig"))

local AnswerPlateService =
	require(script.Parent:WaitForChild("AnswerPlateService"))

local ProgressService =
	require(script.Parent:WaitForChild("ProgressService"))

local MathGameService = {}

--------------------------------------------------
-- TEXT HELPER
--------------------------------------------------

local function findTextLabel(part)
	if not part then
		return nil
	end

	for _, object in part:GetDescendants() do
		if object:IsA("TextLabel") then
			return object
		end
	end

	return nil
end

local function setPartText(part, text)
	local label = findTextLabel(part)

	if label then
		label.Text = tostring(text)
	end
end

--------------------------------------------------
-- WRONG ANSWER
--------------------------------------------------

local function createWrongAnswer(correctAnswer)
	local offset

	repeat
		offset = math.random(-5, 5)
	until offset ~= 0

	return correctAnswer + offset
end

--------------------------------------------------
-- QUESTION
--------------------------------------------------

local function generateQuestion(difficulty)
	local config = DifficultyConfig[difficulty]

	if not config then
		warn("Keine DifficultyConfig für:", difficulty)
		return nil
	end

	-- Passt diesen Aufruf ggf. nur an den exakten Namen
	-- deines MathGenerator an.
	local question =
		MathGenerator.Generate(difficulty)

	if not question then
		warn(
			"MathGenerator konnte keine Aufgabe erzeugen:",
			difficulty
		)

		return nil
	end

	if question.WrongAnswer == nil then
		question.WrongAnswer =
			createWrongAnswer(question.CorrectAnswer)
	end

	return question
end

--------------------------------------------------
-- PREPARE ONE QUESTION
--------------------------------------------------

local function prepareQuestion(questionFolder, difficulty)
	local plateA =
		questionFolder:FindFirstChild("AnswerA")

	local plateB =
		questionFolder:FindFirstChild("AnswerB")

	local sign =
		questionFolder:FindFirstChild("QuestionSign")

	if not plateA or not plateB then
		warn(
			"Antwortplatten fehlen:",
			questionFolder:GetFullName()
		)

		return
	end

	local question =
		generateQuestion(difficulty)

	if not question then
		return
	end

	--------------------------------------------------
	-- RANDOM CORRECT SIDE
	--------------------------------------------------

	local correctOnA =
		math.random(1, 2) == 1

	local answerA
	local answerB

	if correctOnA then
		answerA = question.CorrectAnswer
		answerB = question.WrongAnswer

		plateA:SetAttribute("Correct", true)
		plateB:SetAttribute("Correct", false)
	else
		answerA = question.WrongAnswer
		answerB = question.CorrectAnswer

		plateA:SetAttribute("Correct", false)
		plateB:SetAttribute("Correct", true)
	end

	plateA:SetAttribute("Answer", answerA)
	plateB:SetAttribute("Answer", answerB)

	--------------------------------------------------
	-- DISPLAY
	--------------------------------------------------

	setPartText(
		sign,
		question.Text
	)

	setPartText(
		plateA,
		answerA
	)

	setPartText(
		plateB,
		answerB
	)

	--------------------------------------------------
	-- TOUCH
	--------------------------------------------------

	local function connectPlate(plate)
		AnswerPlateService.EnablePlate(
			plate,

			function(
				player,
				isCorrect,
				touchedPlate,
				plateDifficulty,
				questionIndex
			)

				if isCorrect then
					print(
						player.Name,
						"RICHTIG:",
						plateDifficulty,
						questionIndex
					)

					ProgressService:CompleteQuestion(
						player,
						plateDifficulty,
						questionIndex
					)
				else
					print(
						player.Name,
						"FALSCH:",
						plateDifficulty,
						questionIndex
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
							humanoid.Health = 0
						end
					end
				end
			end
		)
	end

	connectPlate(plateA)
	connectPlate(plateB)
end

--------------------------------------------------
-- INIT
--------------------------------------------------

function MathGameService:Init()
	local playground =
		workspace:WaitForChild("MathPlayground")

	local tracks =
		playground:WaitForChild("Tracks")

	for difficulty = 1, 4 do
		local track =
			tracks:FindFirstChild(
				"Track_" .. difficulty
			)

		if not track then
			continue
		end

		for questionIndex = 1, 20 do
			local questionFolder =
				track:FindFirstChild(
					"Question_" .. questionIndex
				)

			if questionFolder then
				prepareQuestion(
					questionFolder,
					difficulty
				)
			end
		end
	end

	print("MathGameService initialized.")
end

return MathGameService