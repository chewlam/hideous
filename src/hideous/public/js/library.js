$(document).ready(function() {

  var toggleCardDisplay = function(e) {
    var row_el = $(e.target).closest(".row");
    var ph = row_el.find('.image-placeholder');
    
    console.log (e.target, ph);
    if (ph.find('img').length === 0) {
        var path = "/img/" + row_el.attr('data-set') + "/" + row_el.attr('data-card-name') + ".full.jpg";
        ph.html('<img src="' + path +'"></img> ');
    }

    if (ph.is(":visible")) {
        ph.slideUp('fast', function () {ph.hide();});
    }
    else
        ph.slideDown('fast');
    
    e.preventDefault ();
  };


  $('#library .image-placeholder').click(toggleCardDisplay);

  $('#library .row').click(toggleCardDisplay);
});
