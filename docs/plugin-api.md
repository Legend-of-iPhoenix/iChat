# Plugin API

## About
The Plugin API gives you the ability to add features to iChat.

## Installing plugins
Plugins are just bits of Javascript, so plugins can be added directly into a JS file or loaded like any other JS plugin, like JQuery or Materialize.

## How it works
You can imagine plugins as being a filter between what iChat recieves from the database and what the end user sees.

iChat messages are handled like this:

1) Firebase tells iChat that there is a new message, and sends the data of this new message to iChat.
2) iChat cleanses the message, preventing code injections.
3) iChat passes the messages through all of the plugins and the plugins can perform arbitrary operations on it.
4) iChat displays the message to the user.

## Creating a plugin
You can create a new plugin by creating a new iChatPlugin object:

`var myPlugin = new iChatPlugin(name, parser[, other information]);`

You need to provide some basic data for your plugin: a unique plugin name (plugins cannot share names), a parser, which is the function called by iChat, and (optionally) other information about your plugin.

## The parser
The parser is a function. It recieves some JSON data about the message, and it returns some JSON data about the message, with or without modifications.

The data passed to the parser contains three keys:
- `ts`: Contains the raw, unformatted timestamp representing when the message was sent.
- `u`: Contains the username of the user who sent the message.
- `txt`: Contains the text of the message itself.

## Registering your plugin
Plugins will not be run by themselves. iChat has to know that they exist.

To register your plugin, run the function `iChat.registerPlugin(pluginObj);`, where `pluginObj` is the plugin object itself.
- If you are registering multiple plugins, you can use `iChat.registerPlugins(pluginObj1[, pluginObj2[, pluginObj3...]]);`.

Note that these functions will only be available after iChat loads. You can schedule the function to run after iChat loads by executing `iChat.onload = function() {...}`.

Also note that the order functions are registered in matters. If `plugin1` was registered before `plugin2`, then the output of `plugin1` is chained into the input of `plugin2`. If `plugin2` is registered first, then its output is then passed into `plugin1`.

## Example plugin
This plugin, `default/bold`, is one of the default plugins that "ships" with iChat. It is very easy to see what is going on.
```
var bold = new iChatPlugin("default/bold", function(data) {
    data.txt = data.txt.replace(/\*(.*)\*/g, '<strong style="display: inline-block;">$1</strong>');
    return data;
}, "Written by _iPhoenix_, using code from UniChat.");

iChat.onload = function() {
    iChat.registerPlugin(bold);
}
```

In the first section of code, we are creating the actual plugin itself.
We initialize a new iChatPlugin object. The name of the plugin is "default/bold", and the parser function does a simple replace action. It replaces things encapsulated by asterisks (\*), and makes them **bold**

The second section takes this plugin and tells iChat to register it as soon as it is loaded. If iChat has already loaded by the time the iChat.onload function was set, then the callback will be executed immediately.

## Naming a plugin
If multiple plugins are being created together, it may make sense to group them together.

It is recommended to name plugins in the format `group_name/plugin_name`.

- Plugin names should be short. Try not to create absurdly long names.
- If your plugin does not come in a group, the name of the plugin should just be `plugin_name`.
- Plugin names must be unique.

## Removing plugins
The Plugin API has a built-in way to remove plugins. You call `iChat.removePlugin(plugin_name)` to remove the plugin named `plugin_name`. The function returns the plugin that was removed.

## Sending (fake) messages
Plugins can send messages directly to the iChat user.

The function `iChat.renderMessage(data)` accepts a JSON Object containing message data. The format for message data is described under the subheading "The parser". The message is **not** sent to the database. It will be shown like any other iChat message, except it will not be parsed by any other plugins. 