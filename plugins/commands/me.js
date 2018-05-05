/*
 * Adds /me command, which shows the user doing an action
 * ex. "/me runs" --> "*_iPhoenix_ runs"
 */
var me = new iChatPlugin("action/me", function (data) {
  if (data.txt.startsWith("/me ")) {
    data.txt = "*" + data.u + " " + data.txt.substring(4);
    data.u = false;
  }
  return data;
}, "Written by jcgter777, using code from _iPhoenix_.");

iChat.onload = function () {
  iChat.registerPlugin(me);
}