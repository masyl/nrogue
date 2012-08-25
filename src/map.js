(function () {
	var g = require("./g");// Global package
	var Block = g.Block;
	
	var boulder = "WWW-WWW-WWW";
	var rock = "W";
	var tower = "WWWW-W  W-W  W-WWWW";
	var tree = " TT -TTTT-TTTT- TT";
	var bigTree = " TTT -TTTTT-TTTTT-TTTTT- TTT";
	var bush = "TT-TT";
	var house = "WWWWWW-WFFFFW-WFFFFW-WFFFFW-WFFFFW-WWFFWW-GGGGGG";
	var bigHouse = "GGGGGGGGGG-WWFFWWWWWW-WFFFFFFFFW-WFFFFFFFFW-WFFFFFFFFW-WFFFFFFFFW-WWWWWWFFFW-WFFFFFFFFW-WFFFFFFFFW-WFFFFFFFFW-WWWWWWFFWW-GGGGGGGGGG";
	
	module.exports = function (world) {
		var grid = {};
		var block;
		for (var x = 0; x < world.width; x++) {
			for (var y = 0; y < world.height; y++) {
				block = new Block(x, y, "grass");
				grid[block.x+"-"+block.y] = block;
			}
		}
		// Save space by using types directly ?
		var materials = {W:"wall",T:"tree", F:"floor", G:"grass"};
		var stamps = [tower, house, house, bigHouse, tree, bigTree, tree, bush, bush, boulder, rock];
		var count = (g.rnd(12) + 4) * world.density;
		for (var i = 0; i < count; i++) {
			stamp(
				grid,
				g.rnd(world.width-10)+2,
				g.rnd(world.height-10)+2,
				stamps[g.rnd(stamps.length)],
				materials); // todo: randomize
		}
		console.log("World built");
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
})();
