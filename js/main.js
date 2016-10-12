$(document).ready(function () {
  var $body = $('body'),
      nav = $('.header'),
      logo = $('.logo'),
      active = "active",
      toggleBtn = $('.navbar-toggle'); //RWD 按鈕

  //錯誤視窗
  var $alert = $('#modal_alert');
  function alert_mes(mes) {
    $alert.find('.modal_text').html(mes);
    $alert.modal("show");
  };

  //暫存資料區
  var session = {
    id: window.sessionStorage["id"],
    name : window.sessionStorage["name"],
    title : window.sessionStorage["title"],
    date: window.sessionStorage["date"],
    Edit_num: window.sessionStorage["add"],
    eventCode : window.sessionStorage["eventCode"],
  };

  //Ajax API路徑
  var AjaxUrl = {
    getYearTab : "http://event.neweggbox.com/api/ActivityService/get_activities_annual_list", //有活動的年份
    getYearList : "http://event.neweggbox.com/api/ActivityService/get_activities", //依據 token&年分 得到列表
  };

  //得到今天日期原始值 (目前不用前台日期)
  var Today = new Date().valueOf();

  //上方 nav 滾動縮小
  $(window).scroll( function () {
    nav.removeClass("toggle");
    var scrollVal = $(this).scrollTop();
    if( $(this).scrollTop() > 200 ) {
      nav.addClass(active);
      logo.addClass(active);
    } else {
      nav.removeClass(active);
      logo.removeClass(active);
    }
  });

  //按下 RWD 按鈕
  toggleBtn.click( function () {
    nav.toggleClass("toggle");
  });



  /*================================== 活動搜尋比對 ==================================*/

  var $serach = $('#event_serach');
  // var $serach_btn = $('button[name="btn-search"]');
  $serach.on('blur', searchEvent); //自動搜尋
  // $serach_btn.on('click', searchEvent); //按鈕點按搜尋
  $serach.keypress(function(e) {
    searchEvent();
  });
  function searchEvent () {
    var val = $serach.val();
    var match = $('.template_cardin').find('.template_card');
    match.each(function () {
      $(this).hide();
      $(this).has('.card_infor_title:contains('+val+')').show();
    });
  }


  //下拉選單功能
  var $select = $('select[name="year"]'),
      $content_box = $('#content_box'); //年份列表 進入點
  $select.on('change', function () {
    var $this = $(this),
        $val = $this.val(),
        $session = $content_box.find('.template_section');

    $session.each(function () {
      if($(this).attr('id') == $val ||  $val == 'all') {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  })



  /*================================== 日期格式化 fun ==================================*/

  function formatDate(date, fmt)
  {
      date = date == undefined ? new Date() : date;
      date = typeof date == 'number' ? new Date(date) : date;
      fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
      var obj =
      {
          'y': date.getFullYear(), // 年份，注意必须用getFullYear
          'M': date.getMonth() + 1, // 月份，注意是从0-11
          'd': date.getDate(), // 日期
          'q': Math.floor((date.getMonth() + 3) / 3), // 季度
          'w': date.getDay(), // 星期，注意是0-6
          'H': date.getHours(), // 24小时制
          'h': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, // 12小时制
          'm': date.getMinutes(), // 分钟
          's': date.getSeconds(), // 秒
          'S': date.getMilliseconds() // 毫秒
      };
      var week = ['日', '一', '二', '三', '四', '五', '六'];
      for(var i in obj)
      {
          fmt = fmt.replace(new RegExp(i+'+', 'g'), function(m)
          {
              var val = obj[i] + '';
              if(i == 'w') return (m.length > 2 ? '星期' : '周') + week[val];
              for(var j = 0, len = val.length; j < m.length - len; j++) val = '0' + val;
              return m.length == 1 ? val : val.substring(val.length - m.length);
          });
      }
      return fmt;
  }


  /*================================== 取得活動、塞入 ==================================*/

  // 活動列表進入
  // var $content_box = $('#content_box'); //年份列表 進入點
  //複製 JS 套入的樣板
  var $tem = {
    cards : $content_box.find('.template_card'),
    section : $content_box.find('.template_section').clone(),
    card : $content_box.find('.template_card').clone(),
  };


  //獲取有資料年份
  function Event_tabs () {
    var events = [];
    //ajax獲取有資料年分
    $.ajax({
      url: AjaxUrl.getYearTab,
      type: "post",
      headers: {
        "content-type": "application/json;charset=UTF-8"
      },
      async: false, //啟用同步請求
      dataType: "json",
      data: JSON.stringify({
      }),
      success: function ( data ) {
        //錯誤立即停止
        if(data.ERROR) {
          alert_mes("報名活動取得失敗，請刷新頁面重新嘗試");
          return false;
        }
        events =  data;
      },
      error: function ( xhr, ajaxOptions, thrownError ) {
        alert_mes("報名活動取得失敗，請刷新頁面重新嘗試");
        return false;
      }
    });
    return events; //返回活動 (內容)
  }; // EventList


  // 依照年分取得活動 (數量、內容)
  function getEvents (year) {
    var events = [];
    $.ajax ({
      url: AjaxUrl.getYearList,
      type: "post",
      async: false, //啟用同步請求
      headers: {
        "content-type": "application/json;charset=UTF-8"
      },
      dataType: "json",
      data: JSON.stringify({
        "annual": year
      }),
      success: function ( data ) {
        if(data.ERROR) {
          alert_mes("報名活動取得失敗，請刷新頁面重新嘗試");
          return false;
        }
        events =  data;
      },
      error: function ( xhr, ajaxOptions, thrownError ) {
        alert_mes("報名活動取得失敗，請刷新頁面重新嘗試");
        return false;
      }
    }) //ajax
    return events; //返回活動 (內容)
  }; // getEvents


  //塞入活動列表 ( 重點!!!!!!!!!!!!!!!!!!!!!!!!!!!!! )
  set_Events();
  function set_Events () {
    //清空舊資料
    $content_box.html("");

    //取得年分陣列
    var years = Event_tabs();

    // 依據陣列塞入內容
    for( var i =0; i<years.annual.length; i++ ) {
      //塞入下拉選單
      var $option = $select.find('option:first').clone(); //複製 select 裡面的 option
      // $option.html(years.annual[i]);
      $option.html(years.annual[i]).attr('value', "y"+years.annual[i] );
      $select.append($option);

      //塞入活動
      var $section = $tem.section.clone(),
          $cardin = $section.find('.template_cardin'); //card 進入點
      var events_list = getEvents ( years.annual[i] ); //得到每年度活動 內容

      $section.attr('id', "y" + years.annual[i]); //給予年分 id
      $section.find('.year-title').html( years.annual[i] + "<small>" + events_list.length + " Events</small>");  //年份標籤
      $cardin.html(""); //清空假資料

      //產生列表開始
      for( var s in events_list ) {
        var $card = $tem.card.clone(),
            $link = $card.find('.card_landingGo'),
            $img = $card.find('.card_img_infor'),
            $title = $card.find('.card_infor_title'),
            $date = $card.find('.card_infor_time'),
            $add = $card.find('.card_infor_add'),
            $signup = $card.find('.signup_Go');

        //活動日期格式化
        // var $activityDate = new Date(events_list[s].activityDate).Format("yyyy/MM/dd/EEEE hh:mm");
        var $activityDate = formatDate(events_list[s].activityDate, 'yyyy/MM/dd (www) hh:mm');
        // 網站路徑
        var Urlname = "http://event.neweggbox.com/content/",
            images = "/images/event_img/event_title_400x211.jpg";

        $link.attr("href", Urlname + events_list[s].eventCode);
        $img.attr("src", Urlname + events_list[s].eventCode + images); //圖片的路徑
        // $img.attr("src", Urlname + events_list[s].eventCode + "/images/event_img/event_sign_1920x360.jpg"); //圖片的路徑
        $img.attr("alt", events_list[s].name);
        $title.html(events_list[s].name + " - " + events_list[s].title);
        $date.html( $activityDate );
        $add.html(events_list[s].address);

        //判斷報名時間是否超過
        check_Event_Time( events_list[s].toDate )
        function check_Event_Time(time) {
          if( time < Today ) {
            $signup.html("報名結束").addClass('unSign');
          } else {
            $signup.attr("data-id", events_list[s].activityId)
                   .attr("data-name", events_list[s].name)
                   .attr("data-title", events_list[s].title)
                   .attr("data-date", $activityDate)
                   .attr("data-add", events_list[s].address)
                   .attr("data-eventCode", events_list[s].eventCode);
          }
        }

        //card塞回進入點
        $cardin.append($card);
      }
      //年分塞回進入點
      $content_box.append($section);
    } //依據陣列塞入內容 - 結束

    //賦予 點我報名去 ! 功能
    var cards = $content_box.find('.template_card');
    cards.on("click", 'a.signup_Go', signup_go);
  }

  //點按 "點我報名去 !"
  function signup_go (e) {
    e.preventDefault();
    // alert("GO");
    var $this = $(this),
        id = $this.attr('data-id'), //獲取目前活動 id
        name = $this.attr('data-name'), //獲取目前活動 id
        title = $this.attr('data-title'), //獲取目前活動 id
        date = $this.attr('data-date'), //獲取目前活動 id
        add = $this.attr('data-add'), //獲取目前活動 id
        eventCode = $this.attr('data-eventCode'); //獲取目前活動 id
    // 紀錄id
    window.sessionStorage["id"] = id;
    window.sessionStorage["name"] = name;
    window.sessionStorage["title"] = title;
    window.sessionStorage["date"] = date;
    window.sessionStorage["add"] = add;
    window.sessionStorage["eventCode"] = eventCode;

    //確認該活動是否存在
    if(!id) {
      alert_mes("活動報名已結束!");
      return false;
    }

    //跳轉網頁
    window.location.href = "signup.html";
  }


})
