jQuery(function ($) {
  "use strict";

  var editor = window.ace.edit("editor"),
      preview = $('#preview'),
      converter = new window.Showdown.converter(),
      save = $('input[name="markdown"]');

  editor.setTheme("ace/theme/github");
  editor.getSession().setMode("ace/mode/markdown");
  editor.setHighlightActiveLine(false);
  editor.getSession().setUseSoftTabs(true);
  editor.getSession().setTabSize(4);
  editor.renderer.setShowGutter(false);

  editor.on('change', function (data) {
    var markdown = editor.getSession().getValue();

    preview.html(converter.makeHtml(markdown));
    save.val(markdown);
  });

  editor.getSession().setValue(save.val());
});
