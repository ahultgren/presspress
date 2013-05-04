jQuery(function ($) {
  $('pre').each(function(){
    var that = $(this);
    that.height(that.height());
    hljs.highlightBlock(that.children('code').get(0));
  });
});
