[//]: # (Below are information headers used by iChat. Please do not change them.)
[//]: # (LATEST-VERSION: 0.3.0)
[//]: # (RELEASE: 3/31/18)
[//]: # (End automated headers.)
# iChat
## About
iChat is a customizable chatting service based off of Google Firebase. All you have to do is embed the line of HTML (found in `embed.html`) into your HTML file, add the Firebase rules snippet (`database-rules.json`), and (optionally) provide some styling.
## Usage
You need to have authentication set up with Firebase in order for this to work. The username displayed by iChat is the user's `displayName`.
More information in setting it up can be found [here](https://codewalr.us/index.php?topic=2333.msg60803#msg60803).

## Styling
---
Messages are of the format `[timestamp] username: text`.
### Format
- `CSS selector`: description
---
- `.iChat`: Class shared by all elements "owned" by iChat, excluding the script.
- `.iChat-input`: Input box where messages are entered.
- `.iChat-messages`: Div containing messages recieved by iChat. It is recommended, but not necessary, to set `overflow: auto;` on this element. 
- `.iChat-message`: Class of all paragraph elements containing messages (including timestamps, usernames, and text data) revieved by iChat. Each message gets its own paragraph element.
- `.iChat-highlight`: Class of of all paragraph elements containing a message that includes the first four characters of the users username. Used to detect pings/mentions/highlights.
- `.iChat-username`: Selects the username of the user sending the message. (the `username` part of a message)
- `.iChat-timestamp`: Selects the timestanp that the message was sent at.
- `.iChat-text`: Selects the actual text portion of the message.
