$(window).on('DOMContentLoaded load resize scroll', function () {
  var images = $("#main-wrapper img[data-src]");
  // load images that have entered the viewport
  $(images).each(function (index) {
    if (isElementInViewport(this)) {
      $(this).attr("src",$(this).attr("data-src"));
            $(this).removeAttr("data-src");
    }
  });
  // if all the images are loaded, stop calling the handler
  if (images.length == 0) {
    $(window).off('DOMContentLoaded load resize scroll');
  }
});

// source: http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $(window).height() &&
        rect.right <= $(window).width()
    );
}