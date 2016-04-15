// Description:
//   Purge all files on a single domain.
//
// Configuration:
//   Add your CloudFlare API key and email address to the options variable.
//
// Commands:
//   purge <domain> - Purges all files on the domain.
//
// Author:
//   Web-Feet.co.uk

module.exports = function(robot) {

    robot.hear(/purge (.*)/i, function(msg) {

    	var domain = msg.match[1].replace('http://', '');
    	var http = require('https');

    	var options = {
    		hostname: 'api.cloudflare.com',
    		path: '/client/v4/zones?name=' + domain,
    		port: 443,
    		method: 'GET',
    		headers: {
    			'X-Auth-Email': 'YOUR_EMAIL_ADDRESS',
    			'X-Auth-Key': 'YOUR_API_KEY',
    			'Content-Type': 'application/json'
    		}
    	};

    	var doRequest = function(reqOptions, after)
    	{
    		var request = http.request(reqOptions);

    		request.on('response', function(response) {
    		var body = '';
    		response.on('data', function(chunk) {
    			body += chunk;
    		});
    		response.on('end', function() {
    			try {
    				// parse returned respone data
    				var parsed = JSON.parse(body);
    				after(parsed);			
    			} catch (err) {
    				console.error('Unable to parse response as JSON', err);
    			}

    		});
	    	}).on('error', function(err) {
	    		// return error if request unsuccessful
	    		console.error('Error with the request:', err.message);
	    	});
	    	request.end();
    	}

    	doRequest(options, function(data)
		{
			var zoneId = data.result[0].id;
			var purge_options = options;
			purge_options.path = '/client/v4/zones/' + zoneId + '/purge_cache';
			purge_options.method = 'DELETE';
			purge_options.qs = {"purge_everything":true};
			doRequest(purge_options, function(afterData)
			{
				msg.send("CloudFlare cache successfully purged :godmode:");
			});
		});
    });
}