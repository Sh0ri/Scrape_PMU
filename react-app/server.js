const express = require('express');
const pSettle = require('p-settle');
var elasticsearch = require('elasticsearch');
let cheerio = require('cheerio');
let request = require('request');

const scrape = require("./scrape.js");

//ELASTICSEARCH CLIENT
var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});
//END

const app = express();
const port = 9292;

app.listen(port, () => console.log(`Listening on port ${port}`));

//API scrape
app.get('/api/suv', (req, res) => {
	console.log("API CALL SUV");

	var req_query = req.query;
	console.log(req_query);

	get_stored_models(res,req_query);
});




async function get_stored_models(res,req_query){

	//{ brand: 'BOLLORE', name: 'tamer' }

	//DEFAULT QUERY
	var query = {match_all:{}};
	var must = [];
	var filter = [];

	if(req_query!=={}){

		//		{ "match": { "title":  "War and Peace" }},
		//		{ "match": { "author": "Leo Tolstoy"   }}

		for(x in req_query){

			if(x==="volumemin"){
				var str = '{"volume":'+ '{"gte":' +req_query[x]+'}}';
				var jsonobj = JSON.parse(str);
				console.log("FILTER GTE DONE");
				filter.push({"range": jsonobj})
			}
			else if(x==="volumemax"){
				var str = '{"volume":'+ '{"lte":' +req_query[x]+'}}';
				var jsonobj = JSON.parse(str);
				console.log("FILTER GTE DONE");
				filter.push({"range": jsonobj})
			}
			else{
				var str = '{"'+x+'":"'+req_query[x]+'"}';
				var jsonobj = JSON.parse(str);
				console.log(jsonobj);
				must.push({"match":jsonobj})
			}

		}

		query = {
			"bool": {
				"must": must,
				"filter":filter
			}
		}
	}

	client.search({
		index: 'data',
		type: 'model_brand',
		size: 200,
		body: {
			query: query
		}
	}).then(function (body) {
		if(body.hits.total>0){
			var source_array = [];
			body.hits.hits.forEach(function(object){
				source_array.push(object._source);
			})
			res.send(source_array);
		}
		else{
			res.send(body.hits.hits);
		}
		
	}, function (err) {
		res.send(err.message);
	});
}