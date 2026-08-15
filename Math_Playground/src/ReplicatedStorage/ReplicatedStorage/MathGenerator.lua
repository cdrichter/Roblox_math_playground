local MathGenerator = {}

local rng = Random.new()

function MathGenerator.GenerateAddition(minNumber, maxNumber)
    local a = rng:NextInteger(minNumber, maxNumber)
    local b = rng:NextInteger(minNumber, maxNumber)

    return {
        Text = string.format("%d + %d = ?", a, b),
        CorrectAnswer = a + b,
    }
end

function MathGenerator.GenerateSubtraction(minNumber, maxNumber)
    local a = rng:NextInteger(minNumber, maxNumber)
    local b = rng:NextInteger(minNumber, maxNumber)

    if b > a then
        a, b = b, a
    end

    return {
        Text = string.format("%d - %d = ?", a, b),
        CorrectAnswer = a - b,
    }
end

function MathGenerator.GenerateMultiplication(minNumber, maxNumber)
    local a = rng:NextInteger(minNumber, maxNumber)
    local b = rng:NextInteger(minNumber, maxNumber)

    return {
        Text = string.format("%d × %d = ?", a, b),
        CorrectAnswer = a * b,
    }
end

function MathGenerator.GenerateWrongAnswer(correctAnswer)
    local offset

    repeat
        offset = rng:NextInteger(-3, 3)
    until offset ~= 0

    return correctAnswer + offset
end

return MathGenerator