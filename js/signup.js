$(document).ready(function () {
  //報名 ajax
  var AjaxURL = "http://event.neweggbox.com/api/SingupService/signup";
  // 網站路徑
  var Urlname = "http://event.neweggbox.com/content/",
      sign_img = "/images/event_img/event_sign_1920x360.jpg";

  //暫存資料區
  var session = {
    id: window.sessionStorage["id"],
    name : window.sessionStorage["name"],
    title : window.sessionStorage["title"],
    date: window.sessionStorage["date"],
    Edit_num: window.sessionStorage["add"],
    eventCode : window.sessionStorage["eventCode"],
  };

  console.log(session.id);
  console.log(session.name);
  console.log(session.title);
  console.log(session.date);
  console.log(session.Edit_num);

   //成功送單視窗
  var success = $('#modal_success');

  //錯誤視窗
  var $alert = $('#modal_alert');
  function alert_mes(mes) {
    $alert.find('.modal_text').html(mes);
    $alert.modal("show");
  };

  /*==================================== 活動資訊 ====================================*/
  var event_infor = $('.signup_infor'),
      $name_title = event_infor.find('.signup_title'),
      $name_date = event_infor.find('.signup_time'),
      $name_add = event_infor.find('.signup_add'),
      $name_img = $('.signup_banner').find('img');

  //塞入活動資訊
  $(function () {
    $name_title.html(session.name+ " - "+session.title);
    $name_date.html(session.date);
    $name_add.html(session.Edit_num);
    $name_img.attr('src', Urlname+session.eventCode+sign_img).attr('alt', session.name);
  });


  /*==================================== 報名表單 ====================================*/
  var $form = $('.signup_form');
  var $signer = {
    "company": $("#company"),
    "contact": $("#contact"),
    "dept": $("#dept"),
    "mobile": $("#mobile"),
    "email": $("#email"),
    "tel": $("#tel")
  }

  //送出的報名資料
  var $sendValues = {
    "company": "",
    "contact": "",
    "dept": "",
    "mobile": "",
    "email": "",
    "tel": ""
  }

  //驗證規則
  var $rules = {
    val : /.+/,
    email : /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
    mobile : /^\d{10,10}$/,
    Num : /^\d*$/
  }

  var $check_form = $('input[name="check"]'); //確認同意否
  var $btn_sign = $("button.btn-submit"); //送出按鈕

  // 填寫時，欄位檢查
  $signer.company.blur(checkVal);
  $signer.contact.blur(checkVal);
  $signer.dept.blur(checkVal);
  $signer.mobile.blur(checkMobile);
  $signer.email.blur(checkMail);

  //檢查文字空白
  function checkVal () {
    var $this = $(this);
    var $val = $this.val();
    var $error = $this.prev('span');
    if( $rules.val.test($val) ) {
      $error.removeClass("active");
    } else {
      $error.addClass("active");
    }
  };
  //檢查emial格式
  function checkMail () {
    var $this = $(this);
    var $val = $this.val();
    var $error = $this.prev('span');
    if( $rules.email.test($val) ) {
      $error.removeClass("active");
    } else {
      $error.addClass("active");
    }
  };
  //檢查手機號碼格式
  function checkMobile () {
    var $this = $(this);
    var $val = $this.val();
    var $error = $this.prev('span');
    if( $rules.mobile.test($val) ) {
      $error.removeClass("active");
    } else {
      $error.addClass("active");
    }
  };


  //隱私權同意聲明
  $check_form.on("click", function () {
    var $this = $(this);
    if( !$this.prop("checked")) {
      $btn_sign.addClass("disabled");
    } else {
      $btn_sign.removeClass("disabled");
    }
  });

  //完成送出
  $btn_sign.on("click", function () {
    var $error = $("span.error");

    //獲取報名者資料
    get_signerData ();

    //有空白退回
    if( !$sendValues.company || !$sendValues.contact || !$sendValues.email || !$sendValues.mobile || !$sendValues.dept ) {
      anmation_Swing ($form);
      return false;
    }

    // 有錯誤退回
    if($error.hasClass("active")) {
      anmation_Swing ($form);
      return false;
    }

    if( $check_form.prop("checked"))
      submit_From(); //送出報名者資訊
  });

  //Ajax 送出報名者資訊
  function submit_From () {
    $.ajax ({
      url: AjaxURL,
      type: "post",
      headers: {
        "content-type": "application/json;charset=UTF-8"
      },
      dataType: "json",
      data: JSON.stringify({
        "activityId": session.id,
        "company": $sendValues.company,
        "contact": $sendValues.contact,
        "dept": $sendValues.dept,
        "email": $sendValues.email,
        "mobile": $sendValues.mobile,
        "tel": $sendValues.tel
      }),
      success: function ( data ) {
        if(data.ERROR == "Activity ends!!") {
          alert_mes("報名失敗，此報名活動已不存在!!");
          return false;
        } else if(data.ERROR == "Reached the limit!!") {
          alert_mes("抱歉，此活動名額已滿!!");
          return false;
        } else if(data.ERROR == "Non- registration time!!") {
          alert_mes("抱歉，現在非此活動的報名時間!!");
          return false;
        }

        //作業中視窗
        success.modal("show");
        //返回首頁
        setTimeout( goList, 1000);
        function goList() {
          window.location.href = "index.html";
        }
      },
      error: function ( xhr, ajaxOptions, thrownError ) {
        alert_mes("取得失敗，請刷新頁面重新嘗試");
        return false;
      }
    }) //ajax
  }

  //獲取註冊者資訊
  function get_signerData () {
    $sendValues.company = $("#company").val();
    $sendValues.contact = $("#contact").val();
    $sendValues.dept = $("#dept").val();
    $sendValues.mobile = $("#mobile").val();
    $sendValues.email = $("#email").val();
    $sendValues.tel = $("#tel").val();
  }

  //滑動至未填寫位置 animate function
  function anmation_Swing (dom) {
    var $body = $('body');
    if( !$sendValues.company)
      $signer.company.prev('span').addClass("active");
    if( !$sendValues.contact)
      $signer.contact.prev('span').addClass("active");
    if( !$sendValues.dept)
      $signer.dept.prev('span').addClass("active");
    if( !$sendValues.email)
      $signer.email.prev('span').addClass("active");
    if( !$sendValues.mobile)
      $signer.mobile.prev('span').addClass("active");
    $body.animate({
      scrollTop: dom.offset().top-50
    }, 500, "swing");
  }

})
