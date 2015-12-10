var global_user_login = false;

/**
 * 点击底部导航栏`好友`动作入口
 */
function showFriendList() {
    if (global_user_login == true) {
        removeAllActiveFooterClass();
        addActiveFooterClass($('#id_friends_div'));
        hiddenAllMenuDetailInfo();
        var obj_detail_friend = $('#id_friend_lists_detail_div');
        showMenuDetailInfo(obj_detail_friend);
        showChattingPageInfo();
    }
}

function showChattingPageInfo(){
    if (global_user_login == true) {
        $('ul.demo1 li.news-item').each(function () {
            $(this).bind('click', function () {
                $('#input_hidden_send_msg').val(parseInt($(this).attr('_id')));
                hiddenAllMenuDetailInfo();
                showChattingDetail();
            });
        });
    }
}

function showChattingDetail() {
    if (global_user_login == true) {
        var obj_chat = $('#id_chatting_detail_div');
        obj_chat.removeClass('hidden');
    }
}

/**
 * 底部导航`登陆`动作入口
 */
function showLoginPage() {
    removeAllActiveFooterClass();
    addActiveFooterClass($('#id_login_div'));
    hiddenAllMenuDetailInfo();
    showMenuDetailInfo($('#id_login_detail_div'));
}

/**
 * 登陆后`查找`详情
 */
function showAddFriend() {
    if (global_user_login == true) {
        removeAllActiveFooterClass();
        addActiveFooterClass($('#id_add_friend_div'));
        hiddenAllMenuDetailInfo();
        showMenuDetailInfo($('#id_add_friend_detail_div'));
    }
}

/**
 * 登陆后`我的`详情
 */
function showAboutMe() {
    if (global_user_login == true) {
        removeAllActiveFooterClass();
        addActiveFooterClass($('#id_about_me'));
        hiddenAllMenuDetailInfo();
        showMenuDetailInfo($('#id_about_me_detail_div'));
    }
}

/**
 * 移除footer选中样式
 */
function removeAllActiveFooterClass() {
    $('#id_friends_div').removeClass('active_footer_class');
    $('#id_login_div').removeClass('active_footer_class');
    $('#id_add_friend_div').removeClass('active_footer_class');
    $('#id_about_me').removeClass('active_footer_class');
}

/**
 * 隐藏登陆、好友列表页、添加好友、关于详细页面
 */
function hiddenAllMenuDetailInfo() {
    $('#id_login_detail_div').addClass('hidden');
    $('#id_friend_lists_detail_div').addClass('hidden');
    $('#id_add_friend_detail_div').addClass('hidden');
    $('#id_about_me_detail_div').addClass('hidden');
    $('#id_chatting_detail_div').addClass('hidden');
}

/**
 * 展示一个特定的详情页
 * @param menu_detail
 */
function showMenuDetailInfo(menu_detail) {
    menu_detail.removeClass('hidden');
}

/**
 * 添加footer选中样式
 * @param footer_menu
 */
function addActiveFooterClass(footer_menu) {
    footer_menu.addClass('active_footer_class');
}

function LL_USER_INFO(){
    this.cmd_login = 10;
    this.cmd_logout = 11;
    this.cmd_chat_send = 12;
    this.cmd_chat_recv = 13;
    this.cmd_friendlist = 14;
    this.cmd_friendopt = 15;
    this.cmd_get_userinfo  = 16;
    this.cmd_set_userinfo  = 17;
}

/**
 * 主要聊天js控制流程
 * @param ws WebSocket
 * @param User Object
 */
function userService(ws, User) {

    if (ws == undefined) {
        ws = {};
    }

    if (User == undefined) {
        User = {};
    }

    var obj_const = new LL_USER_INFO();

    if ("WebSocket" in window) {
        ws = new WebSocket("ws://221.228.215.38:1081/chat");

        ws.onopen = function () {
            // todo
        };

        ws.onclose = function () {
            // todo
        };

        ws.onmessage = function (msg) {
            var obj = JSON.parse(msg.data);

            switch (obj.cmd) {
                case obj_const.cmd_login:{
                    onUserLogin(obj, User, ws);
                    break;
                }
                case obj_const.cmd_chat_recv:{
                    onUserChat(obj, User);
                    break;
                }
                case obj_const.cmd_chat_send:{
                    break;
                }
                case obj_const.cmd_friendlist:{
                    onFriendList(obj, ws, User);
                    break;
                }
                case obj_const.cmd_get_userinfo:{
                    onGetUserinfo(obj, User);
                    break;
                }
                default:
                {
                    // todo received data is wrong
                }
            }
            // todo
        };

        ws.onerror = function (msg) {
            // todo
        };

        // 发送消息
        $('#id_send_message_bth').bind('click', function () {
            var msg = $('#id_input_message').val();
            var toUserId = $('#input_hidden_send_msg').val();
            if (msg.length > 0) {
                if (msg == ":clear") {
                    // clear msg
                } else if (msg == ":help") {
                    // help
                } else {
                    // send msg
                    SendChatMessgae(parseInt(toUserId), msg, ws);
                }
                // clear input msg info
            }
        });

        // 登陆接口
        $("#id_login_button").bind('click', function () {
            var username = $("#id_input_username").val();
            var password = $("#id_input_password").val();
            User.user = username;

            if (username.length > 0 && password.length > 0) {
                var loginpacket = {};
                loginpacket.cmd = obj_const.cmd_login;
                loginpacket.ver = 111;
                loginpacket.account = username;
                loginpacket.pass = password;
                SendPacket(loginpacket, ws);
            }
        });
    } else {
        // 登陆失败
        loginFailedProcess();
    }
}

function loginFailedProcess() {
    global_user_login = false;
    $('.login_status_msg').removeClass('hidden');
    $('.login_status_msg button')
        .removeClass('btn-success')
        .addClass('btn-danger')
        .html('Sorry, login failed!');
    $('.login_main_content').each(function () {
        $(this).hide();
    });
}

function loginSuccessProcess(User) {
    global_user_login = true;
    $('.login_status_msg').removeClass('hidden');
    $('.login_status_msg button')
        .removeClass('btn-danger')
        .addClass('btn-success')
        .html('Success! Welcome ' + User.user + '!');
    $('.login_main_content').each(function () {
        $(this).hide();
    });
}


function SendPacket(packet, ws) {
    console.log("send:" + JSON.stringify(packet));
    ws.send(JSON.stringify(packet));
}

function GetFriendList(User, ws) {
    if (global_user_login) {
        var obj_const = new LL_USER_INFO();
        var getfriendspacket = {};
        getfriendspacket.cmd = obj_const.cmd_friendlist;
        getfriendspacket.ver = 111;
        getfriendspacket.userid = User.userid;
        SendPacket(getfriendspacket, ws);
    }
}

function FriendOperation(type, friendid) {
    var friendoptpacket = {};
    friendoptpacket.cmd = cmd_friendopt;
    friendoptpacket.ver = 111;
    friendoptpacket.userid = User.userid;
    friendoptpacket.type = type;
    friendoptpacket.friendid = friendid;
    SendPacket(friendoptpacket);
}

function SendChatMessgae(toUid, msg, ws) {
    if (global_user_login) {
        var obj_const = new LL_USER_INFO();
        var chatpacket = {};
        chatpacket.cmd = obj_const.cmd_chat_send;
        chatpacket.ver = 111;
        chatpacket.userid = User.userid;
        chatpacket.msgfrom = User.userid;
        //chatpacket.msgto = 2222;
        chatpacket.msgto = toUid;
        chatpacket.msg = msg;
        SendPacket(chatpacket, ws);
    }
}

function onUserLogin(loginpacket, User, ws) {
    if (loginpacket.result == 1) {
        User.userid = loginpacket.userid;
        // login success
        loginSuccessProcess(User);
        // 获取好友列表
        GetFriendList(User, ws);
    } else {
        // login failed
        loginFailedProcess();
    }
}

function onUserChat(chatpacket, User) {
    if (global_user_login == true) {
        // todo 聊天信息展示
        console.log(chatpacket);
    }
}

function onFriendList(friendlistPacket, ws, User) {
    if (global_user_login) {
        var fList = friendlistPacket.friends;
        fList.push(User.userid);
        SendGetUserinfo(fList, ws);
    }
}

function getRandomIconUrl(){
    var i = Math.random();
    var index = Math.round(i * 0.7 * 10);
    index = index == 0 ? 1 : (index > 7 ? 7 : index);
    return 'list/images/' + index + '.png';
}

/**
 * @param idList
 * @param ws
 */
function SendGetUserinfo(idList, ws) {
    if (global_user_login == true) {
        var obj_const = new LL_USER_INFO();
        var chatpacket = {};
        chatpacket.cmd = obj_const.cmd_get_userinfo;
        chatpacket.ver = 111;
        chatpacket.userid = User.userid;
        chatpacket.type = 0; // 0 基本信息 1 详细信息
        chatpacket.friendlist = idList;
        SendPacket(chatpacket, ws);
    }
}

/**
 *
 * @param Packet
 * @param User
 */
function onGetUserinfo(Packet, User) {
    if (global_user_login) {
        var fList = Packet.infolist;
        var single = '';
        var demo1 = $('ul.demo1');
        demo1.html('<li  class="news-item">Friend list is empty!</li>');

        for (var i in fList) {
            var obj = fList[i];
            if (obj.userid == User.userid) {
                continue;
            }
            var icon = obj.avatar ? obj.avatar : getRandomIconUrl();
            var introduce = obj.signature;
            single += '<li class="news-item" _src="' + icon + '" _id="' + obj.userid + '"><table cellpadding="4"><tr>'+
                '<td title="' + obj.userid + '"><img src="' + icon + '" width="45" class="img-circle pointer_style"/></td>'+
                '<td><div class="margin_left_10px">' + introduce + '</div></td>'+
                '</tr>'+
                '</table>'+
                '</li>';
            demo1.html(single);
        }
    }
}