local QuestionService = require(script.Parent.QuestionService)
local AnswerPlateService = require(script.Parent.AnswerPlateService)

local MathGameService = {}

function MathGameService.PrepareQuestion(plateA, plateB)

	local questionData = QuestionService.PrepareQuestion()

	AnswerPlateService.PrepareAnswers(
		plateA,
		plateB,
		questionData
	)

	return questionData
end

return MathGameService