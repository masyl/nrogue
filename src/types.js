//todo: optimize size by using arrays instead of objects
module.exports = {
	"grass": {
		symbol: '"',
		label: "Grass",
		color: {r:0, g:148, b:0},
		solid: false
	},
	"wall": {
		symbol: "W",
		label: "Wall",
		color: {r:64, g:64, b:64},
		solid: true
	},
	"floor": {
		symbol: "F",
		label: "Floor",
		color: {r:205, g:170, b:125},
		solid: false
	},
	"tree": {
		symbol: "T",
		label: "Tree",
		color: "#006600",
		bgcolor: "#005500",
		color: {r:0, g:102, b:0},
		solid: true
	},
	"soil": {
		symbol: "·",
		label: "Soil",
		color: {r:240, g:128, b:128},
		solid: false
	},
	"you": {
		symbol: "@",
		label: "You",
		color: {r:0, g:255, b:0},
		solid: false
	},
	"human": {
		symbol: "@",
		label: "Human",
		color: {r:255, g:255, b:255},
		solid: false
	},
	"zombie": {
		symbol: "@",
		label: "Zombie",
		color: {r:230, g:30, b:30},
		solid: false
	}
};
