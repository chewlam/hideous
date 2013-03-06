$(document).ready(function() {
  $('#library .showcard').click(function(e) {
    var ph = $(this).closest('.row').find('.image-placeholder');

    if (ph.find('img').length === 0) {
        var path = "/img/" + $(this).attr('data-set') + "/" + $(this).attr('data-card-name') + ".full.jpg";
        ph.html('<img src="' + path +'"></img> ');
    }

    if (ph.is(":visible")) {
        ph.slideUp('fast', function () {ph.hide();});
    }
    else
        ph.slideDown('fast');
    
    e.preventDefault ();
  });
});