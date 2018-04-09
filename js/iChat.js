var iChat = new function () {
  this.callbacks = [];
  this.isLoaded = false;
  Object.defineProperty(this, 'onload', {
    set(f) {
      iChat.callbacks.push(f);
    }
  });
};
document.addEventListener("DOMContentLoaded", x => {
  if (!iChat.isLoaded) {
    var callbacks = iChat.callbacks;
    iChat = new function () {
      this.version = null;
      this.isLoaded = false;
      this.plugins = [];
      this.registerPlugin = function(plugin) {
        var parser = plugin.parser;
        if ((typeof parser == 'function') && parser.length === 1 && !iChat.plugins.find(plugin => plugin.name === parser.name) && plugin.constructor === iChatPlugin) {
          iChat.plugins.push(plugin)
        }
      }
      this.registerPlugins = function(...plugins) {
        plugins.forEach(function(plugin) {
          var parser = plugin.parser;
          if ((typeof parser == 'function') && parser.length === 1 && !iChat.plugins.find(plugin => plugin.name === parser.name) && plugin.constructor === iChatPlugin) {
            iChat.plugins.push(plugin)
          }
        });
      }
      this.renderMessage = function(data) {
        if (data.txt) {
          var message = document.createElement('p');
          message.classList = "iChat iChat-message";
          message.style.margin = "0";
          message.innerHTML = (data.ts ? "[<span class='iChat iChat-timestamp'>" + new Date(data.ts).toLocaleTimeString() + '</span>] ' : '') + (data.u ? '<span class="iChat iChat-username">' + data.u + '</span>:': '') + '  <span class="iChat iChat-text">' + data.txt + "</span>";
          if (data.txt.indexOf(firebase.auth().currentUser.displayName.substring(0, 4)) !== -1) {
            message.classList += " iChat-highlight";
          }
          document.getElementById("iChat-messages").insertBefore(message, document.getElementById("iChat-messages").childNodes[0]);
        }
      }
      Object.defineProperty(this, 'onload', {
        set(f) {
          if (iChat.isLoaded) {
            f();
          } else {
            iChat.callbacks.push(f);
          }
        }
      });
      fetch("https://legend-of-iphoenix.github.io/iChat/README.md").then(function (response) {
        return response.text();
      }).then(function (text) {
        iChat.version = text.match(/N: ([^)]*)\)/)[0].substring(3).slice(0, -1)
        iChat.releaseDate = text.match(/E: ([^)]*)\)/)[0].substring(3).slice(0, -1)
        // This lets me see what sites are using iChat.
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
          callbacks.forEach(callback => callback());
          // Parse new messages. Most of this code was shamelessly ripped from UniChat.
          firebase.database().ref('iChat').orderByChild('ts').limitToLast(15).on('child_added', function (snapshot) {
            var data = snapshot.val();
            data.txt = cleanse(data.txt);
            data.u = cleanse(data.u);
            iChat.plugins.forEach(function(plugin) {
              data = plugin.parser(data);
            });
            iChat.renderMessage(data);
            // Cleanses user input, so that HTML tags and whatnot cannot be injected.
            function cleanse(text) {
              var element = document.createElement('p');
              element.innerText = text;
              return element.innerHTML
            }
          });
        }, 1000);
      });
    }
    // Submit when enter is pressed.
    document.getElementById('iChat-input').onkeydown = function (event) {
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
  }
});

// include a basic way to create iChat plugins.
function iChatPlugin(name, parser, ...otherInfo) {
  this.name = name;
  this.parser = parser;
  this.otherInfo = otherInfo;
}

// load default plugins: links, italics, bold.
(function () {
  var desc = "Written by _iPhoenix_, using code from UniChat."
  var links = new iChatPlugin("default/links", function(data) {
    if (data.txt !== undefined && data.txt !== null) {
      var result = "";
      var n = "";
      var url_pattern = 'https?:\\/\\/[A-Za-z0-9\\.\\-\\/?&+=;:%#_~]+';
      var pattern = new RegExp(url_pattern, 'g');
      var match = data.txt.match(pattern);
      if (match) {
        for (var i = 0; i < match.length; i++) {
          var link = '<a href="' + match[i] + '">' + match[i] + '</a>';
          var start = data.txt.indexOf(match[i]);
          var header = data.txt.substring(n.length, start);
          n += header;
          n += match[i];
          result = result.concat(header);
          result = result.concat(link);
        }
        result += data.txt.substring(n.length, data.txt.length);
      } else {
        result = data.txt;
      }
    } else {
      result = "";
    }
    data.txt = result;
    return data;
  }, desc);
  var italics = new iChatPlugin("default/italics", function(data) {
    data.txt = data.txt.replace(/\~([^\~]*)\~/g, '<em style="display: inline-block;">$1</em>');
    return data;
  }, desc);
  var bold = new iChatPlugin("default/bold", function(data) {
    data.txt = data.txt.replace(/\*([^\~]*)\*/g, '<strong style="display: inline-block;">$1</strong>');
    return data;
  }, desc);
  iChat.onload = function() {
    iChat.registerPlugins(links, italics, bold);
  }
})();