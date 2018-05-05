# Basics
iChat is a bare-bones chatting service. This means that it only comes with basic functionality. You have to style iChat itself, as shown in `styling.md`.

## Message Format
iChat messages are split into 3 parts: the timestamp, the username, and the text. These parts are organized as follows: `[timestamp] username: text`.

## Sending a Message
To send a message, you type the message into the input bar. Pressing enter sends the message, if the message meets certain requirements. (i.e. not too long, not too short, user is not banned, etc)

## Banning Users
If you are using the default firebase rules, you can ban a user by adding their username to the keys in `/iChat/banned/`.

## Disabling iChat Tracking
iChat uses Google Analytics to see which sites are using it. We understand that this is a feature that many site owners will want to disable. To disable this, change `<script src="https://legend-of-iphoenix.github.io/iChat/js/iChat.min.js"></script>` in the HTML embed to `<script src="https://legend-of-iphoenix.github.io/iChat/js/iChat.min.js?notracking"></script>`.