local MathGenerator = {}

local rng = Random.new()

--------------------------------------------------
-- ADDITION
--------------------------------------------------

local function addition(minValue, maxValue)
	local a =
		rng:NextInteger(minValue, maxValue)

	local b =
		rng:NextInteger(minValue, maxValue)

	return {
		Text =
			string.format(
				"%d + %d = ?",
				a,
				b
			),

		CorrectAnswer = a + b,
	}
end

--------------------------------------------------
-- SUBTRACTION
--------------------------------------------------

local function subtraction(minValue, maxValue)
	local a =
		rng:NextInteger(minValue, maxValue)

	local b =
		rng:NextInteger(minValue, maxValue)

	if b > a then
		a, b = b, a
	end

	return {
		Text =
			string.format(
				"%d - %d = ?",
				a,
				b
			),

		CorrectAnswer = a - b,
	}
end

--------------------------------------------------
-- MULTIPLICATION
--------------------------------------------------

local function multiplication(minValue, maxValue)
	local a =
		rng:NextInteger(minValue, maxValue)

	local b =
		rng:NextInteger(minValue, maxValue)

	return {
		Text =
			string.format(
				"%d × %d = ?",
				a,
				b
			),

		CorrectAnswer = a * b,
	}
end

--------------------------------------------------
-- WRONG ANSWER
--------------------------------------------------

local function createWrongAnswer(correct)
	local offset

	repeat
		offset = rng:NextInteger(-5, 5)
	until offset ~= 0

	return correct + offset
end

--------------------------------------------------
-- GENERATE
--------------------------------------------------

function MathGenerator.Generate(difficulty)
	local question

	if difficulty == 1 then

		question =
			addition(1, 20)

	elseif difficulty == 2 then

		if rng:NextInteger(1, 2) == 1 then
			question =
				addition(1, 50)
		else
			question =
				subtraction(1, 50)
		end

	elseif difficulty == 3 then

		local operation =
			rng:NextInteger(1, 3)

		if operation == 1 then
			question =
				addition(10, 100)

		elseif operation == 2 then
			question =
				subtraction(10, 100)

		else
			question =
				multiplication(2, 12)
		end

	else

		local operation =
			rng:NextInteger(1, 3)

		if operation == 1 then
			question =
				addition(50, 250)

		elseif operation == 2 then
			question =
				subtraction(50, 250)

		else
			question =
				multiplication(5, 20)
		end
	end

	question.WrongAnswer =
		createWrongAnswer(
			question.CorrectAnswer
		)

	return question
end

return MathGenerator