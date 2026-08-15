local QuestionService = {}

local rng = Random.new()

function QuestionService.PrepareQuestion()
	local a = rng:NextInteger(1, 20)
	local b = rng:NextInteger(1, 20)

	local operation = rng:NextInteger(1, 2)

	local question
	local correctAnswer

	if operation == 1 then
		question = string.format("%d + %d", a, b)
		correctAnswer = a + b
	else
		if b > a then
			a, b = b, a
		end

		question = string.format("%d - %d", a, b)
		correctAnswer = a - b
	end

	local wrongAnswer = GenerateWrongAnswer(correctAnswer)

	return {
		Question = question,
		CorrectAnswer = correctAnswer,
		WrongAnswer = wrongAnswer,
	}
end

local function GenerateWrongAnswer(correctAnswer)
	local wrongAnswer

	repeat
		wrongAnswer = correctAnswer + rng:NextInteger(-5, 5)
	until wrongAnswer ~= correctAnswer

	return wrongAnswer
end

return QuestionService