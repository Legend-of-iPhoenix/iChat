# Styling iChat
To style iChat, you should use the following CSS selectors. The list is arranged such that each CSS selector is shown like `this` and is followed by a description of what that selector selects.

- `.iChat`: Class shared by all elements "owned" by iChat, excluding the script.
- `.iChat-input`: Input box where messages are entered.
- `.iChat-messages`: Div containing messages recieved by iChat. It is recommended, but not necessary, to set `overflow: auto;` on this element. 
- `.iChat-message`: Class of all paragraph elements containing messages (including timestamps, usernames, and text data) revieved by iChat. Each message gets its own paragraph element.
- `.iChat-highlight`: Class of of all paragraph elements containing a message that includes the first four characters of the users username. Used to detect pings/mentions/highlights.
- `.iChat-username`: Selects the username of the user sending the message. (the `username` part of a message)
- `.iChat-timestamp`: Selects the timestanp that the message was sent at.
- `.iChat-text`: Selects the actual text portion of the message.
