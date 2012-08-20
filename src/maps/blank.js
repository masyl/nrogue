var Block = require("../block");
module.exports = function (width, height) {
	var grid = {};
	var block;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			block = new Block(x, y, "soil");
			grid[block.x+"-"+block.y] = block;
		}
	}
	return grid;
};
