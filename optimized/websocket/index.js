(function(){var e=require,t=e("./req"),n=e("./u"),r=function(r){function o(e,n,r){var s=new t(n,e,i.config);try{s.readHandshake()}catch(o){s.reject(o.httpCode||400);return}s.once("requestAccepted",u.bind(i)),s.accept(s.requestedProtocols[0],s.origin)}function u(e){var t=this;e.once("close",function(n,r){t.close(e,n,r)}),s.push(e),i.emit("connect",e)}var i=this,s=[];i.unmount=function(){i.config.httpServer.removeListener("upgrade",o.bind(i))},i.close=function(e,t,n){var r=s.indexOf(e);r!==-1&&s.splice(r,1),i.emit("close",e,t,n)},i.closeAll=function(){s.forEach(function(e){e.close()})},i.broadcast=function(e){s.forEach(function(e){e.send(utfData)})},i.shutDown=function(){i.unmount(),i.closeAll()},i.mount=function(e){i.config={httpServer:null,maxReceivedFrameSize:65536,maxReceivedMessageSize:1048576,closeTimeout:5e3},n.ex(i.config,e),i.config.httpServer.on("upgrade",o.bind(i))},r&&i.mount(r)};n.in(r,n.em),module.exports=r})()