window.addEventListener("message", function(event) {
    if (event.source != window)
        return;
    if (event.data.key && event.data.key==='herudi') {
        browser.runtime.sendMessage({data: event.data.data}, function(res){
            event.source.postMessage({
                data:res,
                keyStream:'herudi'
            }, "*");
        });
    }
}, false);
