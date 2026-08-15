local MathGenerator = {}

local rng = Random.new()

local function randomNumber(min, max)
	return rng:NextInteger(min, max)
end

local function generateAddition(min, max)
	local a = randomNumber(min, max)
	local b = randomNumber(min, max)

	return string.format("%d + %d", a, b), a + b
end

local function generateSubtraction(min, max)
	local a = randomNumber(min, max)
	local b = randomNumber(min, max)

	if b > a then
		a, b = b, a
	end

	return string.format("%d - %d", a, b), a - b
end

local function generateMultiplication(min, max)
	local a = randomNumber(min, math.min(max, 20))
	local b = randomNumber(min, math.min(max, 20))

	return string.format("%d × %d", a, b), a * b
end

local function generateDivision(min, max)
	local divisor = randomNumber(2, 12)
	local result = randomNumber(2, math.max(2, math.floor(max / divisor)))

	local dividend = divisor * result

	return string.format("%d ÷ %d", dividend, divisor), result
end

function MathGenerator.Generate(config)
	local operation = config.Operations[
		rng:NextInteger(1, #config.Operations)
	]

	local text
	local answer

	if operation == "Addition" then
		text, answer = generateAddition(
			config.MinNumber,
			config.MaxNumber
		)

	elseif operation == "Subtraction" then
		text, answer = generateSubtraction(
			config.MinNumber,
			config.MaxNumber
		)

	elseif operation == "Multiplication" then
		text, answer = generateMultiplication(
			config.MinNumber,
			config.MaxNumber
		)

	elseif operation == "Division" then
		text, answer = generateDivision(
			config.MinNumber,
			config.MaxNumber
		)
	end

	local offset = rng:NextInteger(1, 5)

	if rng:NextInteger(0, 1) == 0 then
		offset = -offset
	end

	local wrongAnswer = answer + offset

	if wrongAnswer == answer then
		wrongAnswer += 1
	end

	return {
		Text = text,
		Answer = answer,
		WrongAnswer = wrongAnswer,
	}
end

return MathGenerator