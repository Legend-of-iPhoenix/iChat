var iChat;
document.addEventListener("DOMContentLoaded",x => {
  if (iChat === 'undefined') {
    iChat = new function() {
      this.version = null;
      this.isLoaded = false;
      this.plugins = [];
      this.registerPlugin(plugin) {
        if ((typeof parser == 'function') && parser.length === 1 && !iChat.plugins.find(plugin => plugin.name === parser.name)) {
          iChat.plugins.push(this)
        }
      }
      fetch("https://legend-of-iphoenix.github.io/iChat/README.md").then(function(response) {
        return response.text();
      }).then(function(text) {
        iChat.version = text.match(/N: ([^)]*)\)/)[0].substring(3).slice(0, -1)
        iChat.releaseDate = text.match(/E: ([^)]*)\)/)[0].substring(3).slice(0, -1) 
        // This lets me see what sites are using iChat. ()
        setTimeout(x => {
          var iframe = document.createElement("iframe");
          iframe.src = "https://legend-of-iphoenix.github.io/iChat/test.html?" + location.href;
          iframe.width = "1px";
          iframe.height = "1px";
          // For some reason, you cannot just call this method in a setTimeout, so we create a dummy function to call it instead.
          var remove = x => iframe.remove();
          document.body.appendChild(iframe);
          setTimeout(remove, 1000);
          iChat.isLoaded = true;
          // modifying, blocking, or changing this notice is strictly prohibited.
          console.log("iChat loaded.\n© _iPhoenix_.\n\nVersion " + iChat.version + ", released on " + iChat.releaseDate + ". \nInterested in looking under the hood, or just want to poke around? Start here: http://bit.ly/iChat-Source");
        },1000);
      });
    }
    // Submit when enter is pressed.
    document.getElementById('iChat-input').onkeydown = function(event) {
      if (event.key == "Enter" || event.keyCode == 13 || event.which == 13) {
        if (document.getElementById('iChat-input').value.length < 128 && document.getElementById('iChat-input').value.length >= 2) {
          firebase.database().ref('iChat').push({
            u: firebase.auth().currentUser.displayName,
            ts: firebase.database.ServerValue.TIMESTAMP,
            txt: document.getElementById('iChat-input').value
          });
          document.getElementById('iChat-input').value = "";
        }
      }
    }
    // Parse new messages. Most of this code was shamelessly ripped from UniChat.
    firebase.database().ref('iChat').orderByChild('ts').limitToLast(15).on('child_added', function(snapshot) {
      var data = snapshot.val();
      var prettyTimestamp = (new Date(data.ts)).toLocaleTimeString();
      var message = document.createElement('p');
      message.classList = "iChat iChat-message";
      message.style.margin = "0";
      var text = (text => {
        text = text.replace(/\*([^\*]*)\*/g, '<strong style="display: inline-block;">$1</strong>');
        text = text.replace(/\~([^\~]*)\~/g, '<em style="display: inline-block;">$1</em>');
        if (text !== undefined && text !== null) {
          var result = "";
          var n = "";
          var url_pattern = 'https?:\\/\\/[A-Za-z0-9\\.\\-\\/?&+=;:%#_~]+';
          var pattern = new RegExp(url_pattern, 'g');
          var match = text.match(pattern);
          if (match) {
            for (var i = 0; i < match.length; i++) {
              var link = '<a href="' + match[i] + '">' + match[i] + '</a>';
              var start = text.indexOf(match[i]);
              var header = text.substring(n.length, start);
              n += header;
              n += match[i];
              result = result.concat(header);
              result = result.concat(link);
            }
            result += text.substring(n.length, text.length);
          } else {
            result = text;
          }
        } else {
          result = "";
        }
        return result
      })(cleanse(data.txt));
      message.innerHTML = "[<span class='iChat iChat-timestamp'>" + prettyTimestamp + '</span>] <span class="iChat iChat-username">' + cleanse(data.u) + '</span>: <span class="iChat iChat-text">' + text + "</span>";
      if (data.txt.indexOf(firebase.auth().currentUser.displayName.substring(0, 4)) !== -1) {
        message.classList += " iChat-highlight";
      }
      document.getElementById("iChat-messages").insertBefore(message, document.getElementById("iChat-messages").childNodes[0]);
    });
    // Cleanses user input, so that HTML tags and whatnot cannot be injected.
    function cleanse(text) {
      var element = document.createElement('p');
      element.innerText = text;
      return element.innerHTML
    }
  }
});

// include a basic way to create iChat plugins.
// Name = name of plugin, parser = name of 
function iChatPlugin(name, parser, ...otherInfo) {
  this.name = name;
  this.parser = parser;
  this.otherInfo = otherInfo;
}