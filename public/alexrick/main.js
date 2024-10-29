$(document).ready(function(){
  var subpage = function ($subpage) {
    var subpage =  $subpage.children('li').first();
    return {
      width: parseInt($(subpage).width()),
      margin: parseInt($(subpage).css('margin-right')),
      width_margin: parseInt($(subpage).width()) + parseInt($(subpage).css('margin-right'))
    };
  },
    find_overhangs = function ($subpage) {
      var overhang = ($subpage.children('li').length) * subpage($subpage).width_margin - subpage($subpage).margin - $subpage.width();
      
      $subpage.unbind('webkitTransitionEnd');
      $subpage.unbind('transitionend');
      
      overhang_left = parseInt($subpage.css('left'), 10);
      overhang_right = overhang + parseInt($subpage.css('left'), 10);
  
      if (overhang_left < 0) {
        $subpage.parent().prev('a[rel=previous]').attr({'data-disabled': 'false', 'href': '#'});
      } else {
        $subpage.parent().prev('a[rel=previous]').attr({'data-disabled': 'true', 'href': ''});
      }
  
      if (overhang_right > 0 ) {
        $subpage.parent().next('a[rel=next]').attr({'data-disabled': 'false', 'href': '#'});
      } else {
        $subpage.parent().next('a[rel=next]').attr({'data-disabled': 'true', 'href': ''});
      }
      return { 
        left: overhang_left, 
        right: overhang_right, 
        total: overhang
      
      };
    },
    scale_header = function () {
      "use strict";
      var ratio, ph = $('.page-header .title, .page-header time').width(),
        ww = $(window).width();
      if (ph > ww) {
        ratio = parseFloat((4 * ww / 5) / ph);
        $('.page-header > .title, .page-header > time').css({
          'display': 'block',
          '-webkit-transform-origin': 'left center',
          '-webkit-transform': 'scale(' + ratio +')',
          '-moz-transform-origin': 'left center',
          '-moz-transform': 'scale(' + ratio + ')',
          'transform-origin': 'left center',
          'transform': 'scale(' + ratio + ')',
          'margin-left': '10%'
        });
      }
    };
  
  $(window).on('resize', function(e) {
    scale_header();

    $('.subpages').each(function (i, e){
      var overhangs;
      $(e).css('left', -(parseInt($(e).attr('data-first-slide')) * subpage($(e)).width_margin));
      overhangs = find_overhangs($(e));
      if (overhangs.total <= 0) {
        $(e).closest('.page-grouping-wrapper').addClass('no-arrows');
      } else {
        $(e).closest('.page-grouping-wrapper').removeClass('no-arrows');
      }
    });
    
  });
  
  $('.page-grouping-wrapper > a').on('click', function(e) {
    var $subpage = $(e.target).parent().find('.subpages'),
      overhangs = find_overhangs($subpage),
      css_left = 0;
    e.preventDefault();
    e.stopPropagation();
    if ($(e.target).attr('data-disabled') === 'true'){
      return false;
    }
    
    $subpage.one('webkitTransitionEnd', function () { find_overhangs($subpage); });
    $subpage.one('transitionend', function () { find_overhangs($subpage); });
    
    if (e.target.getAttribute('rel') === "next"){
      $subpage.attr('data-first-slide', parseInt($subpage.attr('data-first-slide')) + 1)
      if (overhangs.right >= subpage($subpage).width_margin ) {
        css_left = ["-", subpage($subpage).width_margin].join('=');
      } else {
        css_left = ["-", overhangs.right].join('=');
      }
    } else {
      $subpage.attr('data-first-slide',  parseInt($subpage.attr('data-first-slide')) - 1)
      if (overhangs.left <= -(subpage($subpage).width_margin)) {
        css_left = ["+", subpage($subpage).width_margin].join('=');
      } else {
        css_left = ["-", overhangs.left].join('=');
      }
    }
    $subpage.css("left", css_left);
  
  });
  $('.navigation-toggle').click(function(e){
    e.preventDefault();
    $(e.target.attributes.href.value).toggleClass('navigation-wrapper--is-open');
  });
  
  $(window).trigger('resize');
});