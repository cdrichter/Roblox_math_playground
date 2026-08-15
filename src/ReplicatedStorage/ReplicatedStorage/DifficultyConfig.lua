local DifficultyConfig = {
	[1] = {
		Name = "Einfach",
		Questions = 20,
		CompletionPoints = 100,

		Operations = {
			"Addition",
			"Subtraction",
		},

		MinNumber = 1,
		MaxNumber = 20,

		Reward = "Aura_Easy",
	},

	[2] = {
		Name = "Normal",
		Questions = 20,
		CompletionPoints = 250,

		Operations = {
			"Addition",
			"Subtraction",
			"Multiplication",
		},

		MinNumber = 1,
		MaxNumber = 50,

		Reward = "Aura_Normal",
	},

	[3] = {
		Name = "Schwer",
		Questions = 20,
		CompletionPoints = 500,

		Operations = {
			"Addition",
			"Subtraction",
			"Multiplication",
			"Division",
		},

		MinNumber = 10,
		MaxNumber = 200,

		Reward = "Aura_Hard",
	},

	[4] = {
		Name = "Experte",
		Questions = 20,
		CompletionPoints = 1000,

		Operations = {
			"Addition",
			"Subtraction",
			"Multiplication",
			"Division",
		},

		MinNumber = 50,
		MaxNumber = 1000,

		Reward = "Aura_Expert",
	},
}

return DifficultyConfig