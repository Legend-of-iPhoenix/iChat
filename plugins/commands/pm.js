/*
 * Adds /pm command, which lets user send semi-private messages to eachother.
 * Syntax: /pm <user> <message>, where <user> is the recipient of the PM.
 */
const pm = new iChatPlugin("action/pm", function (data) {
  if (data.txt.startsWith("/pm ")) {
    let recipient = data.txt.match(/(\S+)/g)[1];
    if (data.u === firebase.auth().currentUser.displayName) {
      data.u = "[ You => " + recipient + "]";
      data.txt = data.txt.substring(4 + recipient.length);
    } else {
      if (firebase.auth().currentUser.displayName === recipient) {
        data.u = "[ " + data.u + " => You ]";
        data.txt = data.txt.substring(4 + recipient.length);
      } else {
        data.txt = "";
      }
    }
  }
  return data;
}, "Written by _iPhoenix_");

iChat.onload = function () {
  iChat.registerPlugin(pm);
}