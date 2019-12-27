/** @preserve
 *  _  ____ _           _   
 * (_)/ ___| |__   __ _| |_
 * | | |   | '_ \ / _` | __|
 * | | |___| | | | (_| | |_
 * |_|\____|_| |_|\__,_|\__|
 *  _____ _____ _____ _____
 * |_____|_____|_____|_____|
 * by _iPhoenix_
 * 
 * Interested in looking
 * under the hood, or just
 * want to poke around?
 * Start here:
 * http://bit.ly/iChat-Source 
 */

class IChat {
  constructor() {
    this.version = null;
    this.releaseDate = null;
    this.releaseNotes = null;
    this.isLoaded = false;

    this.plugins = [];

    this.callbacks = [];

    if (document.readyState === "complete" || document.readyState === "loaded") {
      this.load();
    } else {
      document.addEventListener("DOMContentLoaded", () => this.load());
    }
  }

  set onload(func) {
    if (this.isLoaded) {
      func();
    } else {
      this.callbacks.push(func);
    }
  }

  /**
   * Lists the plugins to the console
   */
  listPlugins() {
    console.group("iChat Plugin Listing");
    this.plugins.forEach((plugin) => {
      console.log(plugin.name + ": " + plugin.otherInfo);
    });
    console.groupEnd();
  }

  /**
   * Registers a single plugin
   * documented in /docs/plugin-api.md
   */
  registerPlugin(plugin) {
    const parser = plugin.parser;
    const name = plugin.name;
    // assert parser is a function and it takes one param
    if ((typeof parser == 'function') && parser.length === 1) {
      // assert plugin name is unique
      if (name && !this.plugins.find((otherPlugin) => otherPlugin.name == name)) {
        if (plugin instanceof iChatPlugin) {
          this.plugins.push(plugin);
        } else {
          throw new Error('Cannot register non-plugin "' + name + '"!');
        }
      } else {
        throw new Error('Invalid plugin name "' + name + '", or plugin is a duplicate.');
      }
    } else {
      throw new Error('Plugin "' + name + '" has an invalid parser.');
    }
  }

  /**
   * Registers multiple plugins.
   * documented in /docs/plugin-api.md
   */
  registerPlugins(...plugins) {
    plugins.forEach(plugin => this.registerPlugin(plugin));
  }

  /**
   * Removes the plugin with a given name and returns the plugin if it existed.
   */
  removePlugin(name) {
    const index = this.plugins.findIndex(plugin => plugin.name == name);
    const removedPlugin = this.plugins[index];

    this.plugins.splice(index, 1);

    return removedPlugin;
  }

  /**
   * Renders a message, regardless of whether it was actually sent by a user.
   */
  renderMessage(data) {
    if (data["txt"]) {
      const message = document.createElement("p");
      message.classList.add("iChat");
      message.classList.add("iChat-message");;
      message.style.margin = "0";

      if (data["ts"]) {
        const timestamp = document.createElement("span");
        timestamp.classList.add("iChat");
        timestamp.classList.add("iChat-timestamp");;
        timestamp.innerText = new Date(data["ts"]).toLocaleTimeString();

        message.appendChild(timestamp);
      }

      if (data["u"]) {
        const username = document.createElement("span");
        username.classList.add("iChat");
        username.classList.add("iChat-username");;
        username.innerText = data["u"];

        message.appendChild(username);
      }

      const text = document.createElement("span");
      text.classList.add("iChat");
      text.classList.add("iChat-text");;
      text.innerText = data["txt"];

      message.appendChild(text);

      if (data["txt"].includes(firebase.auth().currentUser.displayName.substring(0, 4))) {
        message.classList.add("iChat-highlight");
      }

      const messagesDiv = document.getElementById("iChat-messages");
      messagesDiv.insertBefore(message, messagesDiv.firstChild);
    }
  }

  async load() {
    if (!this.isLoaded) {
      fetch("https://legend-of-iphoenix.github.io/iChat/version.json").then((response) => {
        return response.json();
      }).then((json) => {
        this.version = json["version"];
        this.releaseDate = json["releaseDate"];
        this.releaseNotes = json["releaseNotes"];

        setTimeout(() => {
          this.isLoaded = true;
          // modifying, blocking, or changing this notice is strictly prohibited.
          console.log("iChat loaded.\n© _iPhoenix_.\n\nVersion " + this.version + ", released on " +
              this.releaseDate + ". \nRelease notes: \n"+ this.releaseNotes +
              "\nInterested in looking under the hood, or just want to poke around? Start here: " +
              "http://bit.ly/iChat-Source");

          this.callbacks.forEach((callback) => callback());

          firebase.database().ref('iChat').orderByChild('ts').limitToLast(15).on('child_added', (snapshot) => {
            let data = snapshot.val();
            data["txt"] = this.cleanse(data["txt"]);
            data["u"] = this.cleanse(data["u"]);

            this.plugins.forEach((plugin) => {
              data = plugin.parser(data);
            });

            this.renderMessage(data);
          });
        }, 500);
      });

      const input = document.getElementById("iChat-input");
      input.onkeydown = (event) => {
        let value = input.value;
        if (event.key == "Enter" || event.keyCode == 13 || event.which == 13) {
          if (value.length < 128 && value.length >= 2) {
            firebase.database().ref('iChat').push({
              "u": firebase.auth().currentUser.displayName,
              "ts": firebase.database.ServerValue.TIMESTAMP,
              "txt": value
            });
            input.value = "";
          }
        }
      }
    }
  }

  cleanse(text) {
    const element = document.createElement('p');
    element.innerText = text;
    const result = element.innerHTML;
    return result;
  }
}

const iChat = new IChat();
window["iChat"] = iChat;
window["iChat"]["registerPlugin"] = iChat.registerPlugin;
window["iChat"]["registerPlugins"] = iChat.registerPlugins;
window["iChat"]["onload"] = iChat.onload;
window["iChat"]["listPlugins"] = iChat.listPlugins;

class iChatPlugin {
  constructor(name, parser, ...otherInfo) {
    this.name = name;
    this.parser = parser;
    this.otherInfo = otherInfo;
  }
}

window["iChatPlugin"] = iChatPlugin;

// load default plugins: links, italics, bold.
(() => {
  const desc = "Written by _iPhoenix_, using code from UniChat."
  // renders links.
  const links = new iChatPlugin("default/links", (data) => {
    let result = "";
    if (data["txt"] !== undefined && data["txt"] !== null) {
      let n = "";
      // RegEx shamelessly ripped from SAX, an unrelated chatting script used by the Cemetech programming community at https://cemetech.net
      let pattern = new RegExp('https?:\\/\\/[A-Za-z0-9\\.\\-\\/?&+=;:%#_~]+', 'g');
      let match = data["txt"].match(pattern);
      if (match) {
        for (let i = 0; i < match.length; i++) {
          const link = '<a href="' + match[i] + '">' + match[i] + '</a>';
          const start = data["txt"].indexOf(match[i]);
          const header = data["txt"].substring(n.length, start);
          n += header + match[i];
          result = result.concat(header);
          result = result.concat(link);
        }
        result += data["txt"].substring(n.length, data["txt"].length);
      } else {
        result = data["txt"];
      }
    } else {
      result = "";
    }
    data["txt"] = result;
    return data;
  }, desc);
  // renders italicized text
  const italics = new iChatPlugin("default/italics", (data) => {
    data["txt"] = data["txt"].replace(/\~([^\~]*)\~/g, '<em style="display: inline-block;">$1</em>');
    return data;
  }, desc);
  // renders bolded text
  const bold = new iChatPlugin("default/bold", (data) => {
    data["txt"] = data["txt"].replace(/\*([^\~]*)\*/g, '<strong style="display: inline-block;">$1</strong>');
    return data;
  }, desc);

  window["iChat"]["onload"] = function () {
    window["iChat"]["registerPlugins"](links, italics, bold);
  }
})();