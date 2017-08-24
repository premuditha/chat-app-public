'use strict';

(function ($, window, document) {
  // Initialize socket.io
  var socket = window.io();

  // Current user reference
  var user = {
    id: '',
    username: ''
  };
  // "Enter" keycode
  var enterKeydownEvent = 13;

  // References to HTML elements
  var $loginPage = $('#login');
  var $chatUI = $('#ui');
  var $nickname = $('#nickname');
  var $message = $('#message');
  var $friendList = $('#friendList');
  var $messageList = $('#messageList');
  var $sendButton = $('#sendMessage');

  // Scroll configurations
  var scrollConfigs = {
    friendsList: {
      cursorcolor: '#696c75',
      cursorwidth: '4px',
      cursorborder: 'none'
    },
    messageList: {
      cursorcolor: '#cdd2d6',
      cursorwidth: '4px',
      cursorborder: 'none'
    }
  };

  /**
   * A page can't be manipulated safely until the document is "ready"
   * This will run once the page Document Object Model (DOM)
   * is ready for JavaScript code to execute
   */
  $(document).ready(function () {
    // Initializing styled elements
    $('.list-friends').niceScroll(scrollConfigs.friendsList);
    $('.messages').niceScroll(scrollConfigs.messageList);
  });

  /**
   * Binding a keydown event to detect "Submit" action from user
   * when joining the chat group.
   */
  $nickname.keydown(function (event) {
    // See if the user presses "Enter"
    if (event.which === enterKeydownEvent) {
      // User intends to "submit" the username
      // Prevent the default action and prceed to the chat screen
      event.preventDefault();

      user.username = $nickname.val(); // Get username
      socket.emit('add-user', user); // Emit user join event
      showChatUI(); // Display chatUI
    }
  });

  /**
   * Binding a keydown event to detect "Submit" action from user
   * when Sending message
   */
  $message.keydown(function (event) {
    // See if the user presses "Enter"
    if (event.which === enterKeydownEvent) {
      // User intends to "submit" the chat message
      // Prevent the default action and submit the message
      event.preventDefault();

      sendMessage(); // Calling send message function
    }
  });

  /**
   * Binding a click event for "Send" button
   */
  $sendButton.click(function () {
    // User pressed "Send" button.
    // Send the current chat message
    sendMessage();
  });

  /**
   * Called when a welcome event is received.
   * A welcome message is sent when a new user
   * (or the user himself) joins the chat group
   */
  socket.on('welcome', function (data) {
    // If the user object is empty, that means the welcome message is
    // for the current user join event
    // Saving user data
    if (!user.id) {
      user = data.user;
    }

    // Add user to the chat users list
    addToFriendList(data.user);
  });

  /**
   * Called when a new message is received
   */
  socket.on('new-message', function (data) {
    addMessage(data.message, data.user.username, false); // Add message to UI
  });

  /**
   * Called when a user leaves the chat room
   */
  socket.on('user-left', function (data) {
    if (data) {
      removeFriendsFromList(data);
    }
  });

  /**
   * Change the page state to show the chat UI
   */
  function showChatUI() {
    $chatUI.show(); // Show the chat UI
    $loginPage.hide(); // Hide the registration UI
    $message.focus(); // Focus the message box
  }

  /**
   * Send message to the chat group
   */
  function sendMessage() {
    var message = $message.val(); // Get current message
    addMessage(message, user.username, true); // Add the message to the chat UI
    socket.emit('new-message', message); // Emit the message to server
    $message.val(''); // Reset the input
  }

  /**
   * Refresh the chat UI page
   */
  function refresh() {
    $messageList.getNiceScroll(0).resize();
    $messageList.getNiceScroll(0).doScrollTop(999999, 999);
  }

  /**
   * Add given user to the users list
   * @param {Object} user User object to add to the chat list
   */
  function addToFriendList(user) {
    // Create HTML element to push to the DOM
    var item = '<li id="' + user.id + '"><img width="50" height="50" src="static/images/avatar.png"><div class="info"><div class="user">' + user.username + '</div><div class="status on"> online</div></div></li>';
    var infoMessage = user.username + ' just joined.';

    // Add the message to the DOM
    addInfoMessages(infoMessage);
    $friendList.prepend(item);
  }

  /**
   * Handle user leave event
   * @param  {Object} user User who left the chat group
   */
  function removeFriendsFromList(user) {
    var infoMessage = user.username + ' just left.'; // Compose the "left" message

    addInfoMessages(infoMessage); // Add the info message to chat UI
    $friendList.find('#' + user.id).remove(); // Remove the user from list
  }

  /**
   * Add "info" messages to the chat UI
   * @param {string} message Message string to add
   */
  function addInfoMessages(message) {
    // Prepare the HTML elements
    var item = '<li class="i"><center><p class="info-messages">' + message + '</p></center></li>';

    // Add the elements to the DOM
    $messageList.append(item)

    // Refresh the chat UI
    refresh();
  }

  /**
   * Add "message" to the chat UI
   * @param {string}  message  Chat message
   * @param {string}  username Sender username
   * @param {boolean} owned    Whether this is a message sent by the user himself
   */
  function addMessage(message, username, owned) {
    // Prepare the HTML elements
    var classes = !owned ? 'friend-with-a-SVAGina' : 'i';
    var item = '<li class="' + classes + '"><div class="head">&nbsp;<span class="name">' + username + '</span></div><div class="message">' + message + '</div></li>';

    // Add the elements to the DOM
    $messageList.append(item);

    // Refresh the chat UI
    refresh();
  }

})(jQuery, window, document);
