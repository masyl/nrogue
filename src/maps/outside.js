var g = require("../g");// Global package
var Block = g.Block;

var tower = "WWWW-W  W-W  W-WWWW";
var tree = " TT -TTTT-TTTT- TT";
var bush = "TT-TT";
var house = "WWWWWW-W    W-W    W-W    W-W    W-WW  WW";

module.exports = function (width, height) {
	var grid = {};
	var block;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			block = new Block(x, y, "grass");
			grid[block.x+"-"+block.y] = block;
		}
	}
	var materials = {W:"wall",T:"tree"};
	var stamps = [tower, house, tree, bush];
	for (var i = 0; i < g.rnd(16) + 8; i++) {
		stamp(
			grid,
			g.rnd(width-10)+2,
			g.rnd(height-10)+2,
			stamps[g.rnd(stamps.length)],
			materials); // todo: randomize
	}
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
