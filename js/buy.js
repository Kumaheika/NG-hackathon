$(document).ready(function () {
  $(function () {
    var read = $('.read'),
        txt = $('.txt');
    read.click(function (e) {
      e.preventDefault();
      $(this).hide();
      txt.addClass('active');
    })
  });
});
