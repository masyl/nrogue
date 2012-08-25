//todo: optimize size by using arrays instead of objects
module.exports = {
	"empty": {
		symbol: ' ',
		color: {r:128, g:128, b:128},
		solid: true
	},
	"grass": {
		symbol: '"',
		color: {r:0, g:158, b:0},
		solid: false
	},
	"wall": {
		symbol: "#",
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
		color: {r:0, g:112, b:0},
		solid: false
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
	},
	"water": {
		symbol: "w",
		color: {r:40, g:40, b:220},
		solid: false
	},
	"deepWater": {
		symbol: "W",
		color: {r:25, g:25, b:180},
		solid: false
	}
};
