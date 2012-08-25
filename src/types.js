//todo: optimize size by using arrays instead of objects
module.exports = {
	"grass": {
		symbol: '"',
		color: {r:0, g:148, b:0},
		solid: false
	},
	"wall": {
		symbol: "W",
		color: {r:64, g:64, b:64},
		solid: true
	},
	"floor": {
		symbol: "F",
		color: {r:205, g:170, b:125},
		solid: false
	},
	"tree": {
		symbol: "T",
		color: {r:0, g:102, b:0},
		solid: true
	},
	"soil": {
		symbol: "·",
		color: {r:240, g:128, b:128},
		solid: false
	},
	"you": {
		symbol: "@",
		color: {r:0, g:255, b:0},
		solid: false
	},
	"human": {
		symbol: "@",
		color: {r:255, g:255, b:255},
		solid: false
	},
	"zombie": {
		symbol: "@",
		color: {r:0, g:0, b:0},
		solid: false
	},
	"blood": {
		symbol: "B",
		color: {r:255, g:30, b:30},
		solid: false
	}
};
