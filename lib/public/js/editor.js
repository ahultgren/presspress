"use strict";

jQuery(function ($) {
  var editor = window.ace.edit("editor"),
      preview = $('#preview'),
      converter = new window.Showdown.converter();

  editor.setTheme("ace/theme/github");
  editor.getSession().setMode("ace/mode/markdown");
  editor.setHighlightActiveLine(false);
  editor.getSession().setUseSoftTabs(true);
  editor.getSession().setTabSize(4);
  editor.renderer.setShowGutter(false);

  editor.on('change', function (data) {
    preview.html(converter.makeHtml(editor.getSession().getValue()));
  });
});
