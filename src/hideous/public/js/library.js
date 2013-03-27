$(document).ready(function() {

    var toggleCardDisplay = function(e) {
        var row_el = $(e.target).closest(".row");
        var ph = row_el.find('.image-placeholder');

        console.log (e.target, ph);
        if (ph.find('img').length === 0) {
            var path = "/img/" + row_el.attr('data-set') + "/" + row_el.attr('data-card-name') + ".full.jpg";
            ph.html('<img class="card-container" src="' + path +'"></img> ');
        }

        if (ph.is(":visible")) 
            ph.slideUp('fast', function () {ph.hide();});
        else
            ph.slideDown('fast');

        e.preventDefault ();
    };

    var openBoosterPack = function(e) {
        $b = $(e.target).closest('.booster-pack');

        $b.animate( {height: '900px'}, 1000, function() { });
        $(e.target).fadeOut(300, function() {
            $b.find('.cards div').each(function(i) {
                $(this).delay(i*400).fadeIn('fast');
            });
        });
    };

    $('#library .image-placeholder').click(toggleCardDisplay);

    $('#library .row').click(toggleCardDisplay);

    $('.booster-wrapper').click(openBoosterPack);

});
