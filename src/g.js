/**
 * Global Utilities
 */
(function () {
	var g = (typeof module !== "undefined") ? module.exports : window;

	g.Block = function (x, y, type) {
		var block = this;
		block.x = x;
		block.y = y;
		block.type = type || "empty";
	};

	// Static server
	g.s = function(root, port) {
		var r = require,
			t = "text/", // mimetype prefix
			fs = r("fs");

		return r("http").createServer(function (req, res) {
			var
				u = req.url, // get the url
				p = (u == "/") ? "/c.html" : u, // get the path
				f = root + p; // get the filename
			fs.lstat(f, function(err, stat) {
				res.w = res.writeHead;
				if (err || stat.blocks == 0) {
					res.w(404);
					res.end();
				} else {
					res.w(200, {'Content-Type':
						{ "html": t+"html", "js": t+"javascript"}[f.split(".").pop()]
					});
					fs.createReadStream(f).pipe(res);
				}
			});
		}).listen(port);
	};

	//todo: GET RID OF GLOBAL DUPLICATION BETWEEN FRONT AND BACKEND
	g.dist = function (point1, point2) {
		return Math.sqrt( Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2) );
	};

	g.ang = function (point1, point2) {
		var angle = Math.atan2(point1.x - point2.x, point1.y - point2.y) * (180 / Math.PI);
		if(angle < 0) angle = Math.abs(angle);
		else angle = 360 - angle;
		return angle;
	};

	g.rnd = function (i) {
		return Math.floor(Math.random() * i)
	};

})();