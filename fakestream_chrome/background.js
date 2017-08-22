const getVideoRes = (itag) => {
  var videoCode = {
    '18': 360,
    '59': 480,
    '22': 720,
    '37': 1080
  }
  return videoCode[itag] || 0
}

function getStr(src, findstart, findend){
	var rs = '';
	var start = src.indexOf(findstart);
	if (start < 0) return false;
	var length = findstart.length;
	var end = src.substr(start+length).indexOf(findend);
	if(end > 0) {
		rs = src.substr(start+length, end);
	} else {
		rs = src.substr(start+length);
	}
	return rs ? rs : false;
}

var source = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.data.type===undefined) {
		request.data.type = 'source';
	};
 	axios.get('https://drive.google.com/get_video_info?docid='+request.data.url).then(function (body) {
 		var title = decodeURIComponent(getStr(body.data,'title=', '&')).replace(/(\+)/gm, '_');
 		if (!title.includes('mp4')) {
 			title = decodeURIComponent(getStr(body.data,'title=', '&')).replace(/(\+)/gm, '_')+'.mp4';
 		};
		var fmt_stream_map = getStr(body.data,'fmt_stream_map=', '&');
	 	if (fmt_stream_map !== false) {
	 		var links = decodeURIComponent(fmt_stream_map).split(',');
	 		source = links.map(itagAndUrl => {
            const [itag, url] = itagAndUrl.split('|');
            var url_dash = url.replace(/(\%2C)/gm, ',');
            const result = {
	              src: url_dash,
	              label: getVideoRes(itag),
	              type: 'video/mp4'
	            }
	            return result;
	        }).filter(video => video.label !== 0);
	        chrome.cookies.get({url:'https://drive.google.com/get_video_info?docid='+request.data.url,name:'DRIVE_STREAM'}, function(cookie){
		        for (var i = 0; i < source.length; i++) {
		        	var cookieStore = {
			        	url:source[i].src,
			        	name:'DRIVE_STREAM',
			        	value:cookie.value,
			        	domain:'.drive.google.com'
			        }
			        chrome.cookies.set(cookieStore);
		        };
		        sendResponse({data:source,title:title});
	        });	 
	 	}else{
	 		source = [];
	 		sendResponse({data:source,title:'none'});
	 	}
			
	}).catch(function (error) {
	    console.log(error);
	});
	return true
});