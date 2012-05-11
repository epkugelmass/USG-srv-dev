// Module for managing the queue panel

var ExternAjax = function(url, type, data, onSuccess, onFail) {
    console.log('in externajax');
    // xhr = $.ajax({
    //     url: REAL_TIME_ADDR + url,
    //     success: function(data) {
    //         alert('hello')
    //     },
    //     data: data,
    //     type: type,
    //     xhrFields: {
    //         withCredentials: true
    //     }
    // });
    xhr = $.ajax({
//        url:'trigger/',
        url: REAL_TIME_ADDR + url,
        type: 'POST',
        data: data,
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {console.log(data);onSuccess(JSON.parse(data))},
        error: onFail
    });
    console.log(xhr);
    return xhr;
}
var QueueModule = (function($) {
    
    // The current ordered list of room ids
    var idlist = new Array();
    // The prefix for room ids in the queue elements
    var prefix = 'queue-';
    // URL for saving updates
    var saveurl = REAL_TIME_ADDR + '/update_queue/';
    
    // Last update for this draw
    var update_timestamp = 0;
    // Currently waiting request
    var update_xhr = 0;
    // Are we sending queue
    var update_lock = false;
    
    // Update the idlist (i.e. after deletion, reordering)
    var update_idlist = function() {
        idlist = new Array();
        var stringarr = $('#room_queue').sortable('toArray');
        for (var i = 0; i < stringarr.length; i++)
            idlist[i] = parseInt(stringarr[i].substring(prefix.length));
    }

    // Add a room to the queue
    var add = function(e, roominfo) {
        // Check not already in list
        if (idlist.indexOf(roominfo['id']) != -1)
            return;
        idlist.push(roominfo['id']);
        var tag ='<li id="'+prefix+roominfo['id']+'" class="queued_room">';
        tag += roominfo['number'] + ' ' + roominfo['building'] + '</li>';
        $('#room_queue').append(tag);
        $('#room_queue').sortable('refresh');
        save();

        $.publish('mark_as_neg', roominfo['id']);
    }

    // Remove a room from the queue
    var remove = function(e, roomid) {

        if (idlist.indexOf(roomid) == -1)
            return;
        $('#'+prefix+roomid).remove();
        $('#room_queue').sortable('refresh');
        update_idlist();
        save();

        console.log('markaspos - '+roomid);
        // console.log(idlist);
        $.publish('mark_as_pos', roomid);
        console.log('markaspos2 - '+roomid);
    }
    
    var mark_as_neg = function(e, roomid) {
        $('#add'+roomid).hide();
        $('#remove'+roomid).show();
    }

    var mark_as_pos = function(e, roomid) {
        $('#add'+roomid).show();
        $('#remove'+roomid).hide();
    }

    // Respond to reordering
    var reorder = function() {
        update_idlist();
        // console.log(idlist);
        save();
    }

    // Save the current list to the server
    save = function() {
        //alert(current_draw);
        // if (update_xhr && update_xhr.readystate != 4)
        //     update_xhr.abort();
        ExternAjax('/update_queue/'+current_draw, 'POST', {'queue':JSON.stringify(idlist)},
               function(data) {
                   console.log(data);
               });

        // $.post(saveurl+current_draw, {'queue':JSON.stringify(idlist)},
        //        function(data) {
        //            console.log(data);
        //        });
    }

    // Pull up the queue for a new draw
    // var switchhelper = function(data) {
    //     idlist = new Array();
    //     $('#room_queue').sortable('refresh');
    //     update_idlist();
    //     //console.log(idlist);
    // }
    var switchdraw = function(e, drawid) {
        //$('#room_queue').load('/get_queue/'+drawid, switchhelper);
        get_queue(drawid, 0);
	    $('#queuehead').html(drawdata[drawid-1]['name'] + ' Queue'); // needs to be more secure?
    }

    var handler = function(data) {
        console.log('got queue');
        idlist = new Array();
        console.log(data)
        update_timestamp = data.timestamp;
        var intohtml = '';
        for (i in data.rooms)
        {
            console.log(data.rooms[i]);
            room = data.rooms[i];
            intohtml += '<li id="queue-'+room.id+'" class="queued_room">';
            intohtml  += '<a class="fancyroom link_in_queue" title="Room Overview" data-fancybox-type="iframe" href="/get_room/'+room.id+'">'+room.number+' '+room.building+'</a>'
            intohtml += '<div onclick="$.publish(\'queue/remove\','+room.id+')" title="Remove from queue" class="removeRoom removeInQueue" ></div> </li>';
        }
        // Put into list - formatting goes here
        $('#room_queue').html(intohtml); //JSON.stringify(data.rooms));
        $('#room_queue').sortable('refresh');
        if (data.kind == 'EDIT')
            $('#queue_note').html(data.netid + ' edited queue');
        else
            $('#queue_note').html('queue merged');
        update_idlist();
        setTimeout(get_update, 100);
    }

    var get_queue = function(drawid, timestamp) {
        if (update_xhr && update_xhr.readystate != 4)
            update_xhr.abort();
        console.log('Getting queue');
        update_xhr = ExternAjax('/get_queue/'+drawid+'/'+timestamp,
                                'json', null, handler);
                                //function(){setTimeout(get_update, 1000)});
    }

    get_update = function() {
        console.log('get_update called');
        get_queue(current_draw, update_timestamp);
    }

        
    // Subscribe to relevant events
    $.subscribe('queue/add', add);
    $.subscribe('queue/remove', remove);
    $.subscribe("draw", switchdraw);
    $.subscribe('mark_as_neg', mark_as_neg);
    $.subscribe('mark_as_pos', mark_as_pos);
    
    // Set up the draggable queue
    $(function() {
        $('#room_queue').sortable({
            revert:true,
            stop:reorder
        });
        $('#list_queues').accordion();
        $("ul, li").disableSelection();
    });

}(jQuery));


var avail_handler = function(data) {
    console.log('In avail_handler');
    console.log(data);
    setTimeout(function() {check_avail(data.timestamp)}, 100);
}
var check_avail = function(timestamp) {
    ExternAjax('/check_availability/'+timestamp, 'GET', null, avail_handler)
}

check_avail(0);
