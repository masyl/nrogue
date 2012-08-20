module.exports = function(root, port) {
	var r = require, //todo: see if "require" could be renamed globaly
		t = "text/", // mimetype prefix
		fs = r("fs");

	return r("http").createServer(function (req, res) {
		var
			u = req.url, // get the url
			p = (u == "/") ? "/client.html" : u, // get the path
			f = root + p; // get the filename
		fs.lstat(f, function(err, stat) {
			res.w = res.writeHead;
			if (err || stat.blocks == 0) {
				res.w(404);
				res.end();
			} else {
				res.w(200, {'Content-Type':
					{ "html": t+"html", "js": t+"javascript", "css": t+"css" }[f.split(".").pop()]
				});
				fs.createReadStream(f).pipe(res);
			}
		});
	}).listen(port);
};
