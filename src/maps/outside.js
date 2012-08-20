var Block = require("../block");

var towerStamp = "AAAA-" +
	"A  A-" +
	"A  A-" +
	"AAAA";
var bigTowerStamp = "AAAAAA-" +
	"A    A-" +
	"A    A-" +
	"A    A-" +
	"A    A-" +
	"AAAAAA";

module.exports = function (width, height) {
	var grid = {};
	var block;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			block = new Block(x, y, "grass");
			grid[block.x+"-"+block.y] = block;
		}
	}
	stamp(grid, 10, 10, towerStamp, {A:"wall"}); // todo: randomize
	stamp(grid, 20, 15, towerStamp, {A:"wall"}); // todo: randomize
	stamp(grid, 60, 12, bigTowerStamp, {A:"wall"}); // todo: randomize
	stamp(grid, 50, 4, bigTowerStamp, {A:"wall"}); // todo: randomize
	stamp(grid, 40, 23, bigTowerStamp, {A:"wall"}); // todo: randomize
	return grid;
};

/* modify a map using a stamp-approach */
function stamp(grid, x, y, shape, materials) {
	var rows = shape.split("-");
	var material, x2, y2;
	for (var row =0; row < rows.length; row++) {
		// todo: make sure the stamp doesnt go beyond the world size
		for (var i = 0; i < rows[row].length; i++) {
			x2 = i + x;
			y2 = row + y;
			material = materials[rows[row][i]];
			if (material) {
				grid[x2 + "-" + y2] = new Block(x2, y2, material);
			}
		}
	}
}
