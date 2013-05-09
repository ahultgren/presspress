(function ($) {
  "use strict";

  $(document).on('click', '[data-method="post"]', function (e) {
    var that = $(this);

    e.preventDefault();

    $.ajax({
      url: that.attr('href'),
      type: 'POST'
    });
  });
}(jQuery));
