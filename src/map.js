(function () {
	var g = require("./g");// Global package
	var Block = g.Block;
	
	var boulder = "-###-###";
	var rock = "#";
	var tower = "GGGGGG-G####G-G#FF#G-G#FF#G-G####G-GGGGGG";
	var tree = " TT -TTTT-TTTT- TT";
	var bigTree = " TTT -TTTTT-TTTTT-TTTTT- TTT";
	var pond = " www -wWWWw-wWWWw-wWWWw- www";
	var bigPond = " www -wwwww-wWWWw-wWWw-wWWw-wWWWw-wwWww- www";
	var hugeTree = "  TTT  - TTTTT -TTTTTTT-TTTTTTT-TTTTTTT- TTTTT - TTT";
	var bush = "TT-TT";
	var house = "######-#FFFF#-#FFFF#-#FFFF#-#FFFF#-##FF##-GGGGGG-GGGGGG";
	var bigHouse = "GGGGGGGGGG-##FF######-#FFFFFFFF#-#FFFFFFFF#-#FFFFFFFF#-#FFFFFFFF#-######FFF#-#FFFFFFFF#-#FFFFFFFF#-#FFFFFFFF#-######FF##-GGGGGGGGGG- GGGGGG ";
	
	module.exports = function (world) {
		var map = {
			g: {}, // ground level (soil, grass)
			v: {}, // high vegetation
			f: {} // floor level (buildings)
		};
		var block;
		// Save space by using types directly ?
		var materials = {w:"water", W:"deepWater", "#":"wall",T:"tree", F:"floor", G:"grass"};

		map.layers = [map.g, map.f, map.v]; // Ordered layer array

		function randomQuantity(range, min) {
			return (g.rnd(range) + min) * world.density
		}

		// fill groud layer with grass
		fill(map.g, 0, 0, world.width, world.height, "grass");
		// Place trees
		placeRandom(map.v, [tree, hugeTree, bigTree, bush], materials, randomQuantity(12, 7));
		// Place rocks
		placeRandom(map.f, [rock, boulder], materials, randomQuantity(7, 4));
		// Place buildings
		placeRandom(map.f, [tower, house, bigHouse], materials, randomQuantity(5, 3));
		// Place ponds
		placeRandom(map.g, [pond, bigPond], materials, randomQuantity(3, 1));

		console.log("World!");
		return map;

		function fill(layer, x1, y1, x2, y2, material) {
			var x, y;
			for (x = x1; x < x2; x++) {
				for (y = y1; y < y2; y++) {
					layer[x + "-" + y] = new Block(x, y, material);
				}
			}
		}

		function placeRandom(layer, stamps, materials, count) {
			var i, x, y, model;
			for (i = 0; i < count; i++) {
				x = g.rnd(world.width - 10) + 5;
				y = g.rnd(world.width - 10) + 5;
				model = stamps[g.rnd(stamps.length)];
				stamp(layer, x, y, model, materials);
			}
		}

		/* modify a map using a stamp-approach */
		function stamp(layer, x, y, shape, materials) {
			var rows = shape.split("-");
			var material, x2, y2;
			for (var row =0; row < rows.length; row++) {
				// todo: make sure the stamp doesnt go beyond the world size
				for (var i = 0; i < rows[row].length; i++) {
					x2 = i + x;
					y2 = row + y;
					material = materials[rows[row][i]];
					if (material) {
						layer[x2 + "-" + y2] = new Block(x2, y2, material);
					}
				}
			}
		}

	};

})();
