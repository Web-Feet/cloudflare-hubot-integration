// Description:
//   Purge all files on a single domain.
//
// Configuration:
//   Add your CloudFlare API key and email address to the options variable.
//
// Dependencies:
//  cloudflare4
//
// Commands:
//   purge <domain> - Purges all files on the domain.
//
// Author:
//   Web-Feet.co.uk

module.exports = function(robot) {

    robot.hear(/purge (.*)/i, function(msg) {

        var http = require('https');
        var CloudFlareAPI = require('cloudflare4');

        var cloudflare_api = 'CLOUDFLARE_API_KEY';
        var cloudflare_email = 'CLOUDFLARE_EMAIL_ADDRESS';

        var api = new CloudFlareAPI({
            email: cloudflare_email,
            key: cloudflare_api,
        });

        // Strip the domain
    	var domain = msg.match[1].replace('http://', '');
        domain = domain.replace('www.', '');

    	var options = {
    		hostname: 'api.cloudflare.com',
    		path: '/client/v4/zones?name=' + domain,
    		port: 443,
    		method: 'GET',
    		headers: {
    			'X-Auth-Email': cloudflare_email,
    			'X-Auth-Key': cloudflare_api,
    			'Content-Type': 'application/json',
    		}
    	};

    	var doRequest = function(reqOptions, after)
    	{
    		var request = http.request(reqOptions);

            request.debug = true;

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
            var purge_everything = true;
            
            api.zonePurgeCache(zoneId, purge_everything);
            msg.send("CloudFlare cache successfully purged :godmode:");
		});
    });
}
