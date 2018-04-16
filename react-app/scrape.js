const pSettle = require('p-settle');
const promisify = require('pify');
const fs = promisify(require('fs'));
let cheerio = require('cheerio');
let request = require('request');

const base_url = "http://www.turf-fr.com";
const headers = { 
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
			'Content-Type' : 'application/x-www-form-urlencoded' 
		};

test();

async function test(){

	//const array_years = await generate_years("http://www.turf-fr.com/archives-pmu.shtml");
	//console.log(array_years);
	
	//const array_months = await generate_all_months_urls(array_years);
		
	//console.log(array_months);
	//console.log("Number of months scrapped");
	//console.log(array_months.length);
	
	//var little_array = [];
	//little_array.push(array_months[0]);
	//const array_reunions = await generate_all_reunions_url(little_array);
	//console.log(array_reunions);

	const array_races_urls = await generate_races_urls_for_a_reunion("http://www.turf-fr.com/arrivees-pmu/23888_lundi-1-janvier-2018-vincennes.html");

}

function generate_years(url) {
	return new Promise((resolve, reject) => {
		var array = [];
		request({url:url,headers:headers}, function(error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);
				
				const temp_array = $('.turf-info-professionnel_page').children('div[id=contenu]').children('div[id=centre]').children().last().children('table').children('tbody').children('tr').each(function(i, element) {
				  array.push(base_url + $(this).children('td').children('a').first().attr('href'));
				});
				
				
				resolve(array);
			} else {
				reject(null);
			}
		});
	});
}

function generate_months(url) {
	return new Promise((resolve, reject) => {
		var array = [];
		request({url:url,headers:headers}, function(error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);
				
				$('.turf-info-professionnel_page').children('div[id=contenu]').children('div[id=centre]').children().last().children('table').children('tbody').children('tr').each(function(i, element) {
				  $(this).children('td').each(function(j,elem) {
				    array.push(base_url + $(this).children('a').first().attr('href'))
				  });
				});
				
				
				resolve(array);
			} else {
				reject(null);
			}
		});
	});
}

function generate_all_months_urls(array_years) {
  return new Promise((resolve, reject) => {
    const obj = array_years.map(year => generate_months(year));
    var array = [];
    
    pSettle(obj).then(result => {
			var compt = 0;
			result.forEach(function(elem){
				if(elem.isFulfilled)
				{
				  elem.value.forEach(function(element){
				    array.push(element);
				    compt++;
				  })
				}
			})
			resolve(array);
		});
    
  });
}

function generate_all_reunions_url(array_months) {
  return new Promise((resolve, reject) => {
    const obj = array_months.map(month => generate_reunions_urls_for_a_month(month));
    var array = [];
    
    pSettle(obj).then(result => {
			var compt = 0;
			result.forEach(function(elem){
				if(elem.isFulfilled)
				{
				  elem.value.forEach(function(element){
				    array.push(element);
				    compt++;
				  })
				}
			})
			resolve(array);
		});
    
  });
}

function generate_reunions_urls_for_a_month(month_url) {
  return new Promise((resolve, reject) => {
		var array = [];
		request({url:month_url,headers:headers}, function(error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);

				var object = {}
				
				$('.turf-info-professionnel_page').children('div[id=contenu]').children('div[id=centre]').children().last().children('table').children('tbody').children('tr').each(function(i, element) {
				  array.push(base_url + $(this).children('td').last().children('a').first().attr('href'));
				});
				
				
				resolve(array);
			} else {
				reject(null);
			}
		});
	});
}

function generate_races_urls_for_a_reunion(reunion_url) {
  return new Promise((resolve, reject) => {
		var array = [];
		request({url:reunion_url,headers:headers}, function(error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);

				var object = {nom:"",url:"",arrivee:""};

				//console.log($('.turf-info-professionnel_page').children('div[id=contenu]').children('div[id=centre]').find('div:nth-child(2)').children('center').children('table').children('tbody').children('tr').text());
				
				$('.turf-info-professionnel_page').children('div[id=contenu]').children('div[id=centre]').find('div:nth-child(2)').children('center').children('table[class=pts]').children('tbody').children('tr').each(function(i, element) {

				  object.url = base_url + $(this).children('td[align=left]').first().children('a').last().attr('href');
				  object.nom = $(this).children('td[align=left]').first().children('a').last().text();
				  object.arrivee = $(this).find('td:nth-child(3)').text();

				  console.log("OBJECT");
				  console.log(object);

				  array.push(object);
				});
				
				
				resolve(array);
			} else {
				reject(null);
			}
		});
	});
}


module.exports = {
	test : test,
};

