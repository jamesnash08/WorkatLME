  // When DOM is loaded we boot strap our app
  (function(app) {
    var InfiniteRotator = {
      init: function()
      {
  //initial fade-in time (in milliseconds)
  var initialFadeIn = 0;
  //interval between items (in milliseconds)
  var itemInterval = 10000;
  //cross-fade time (in milliseconds)
  var fadeTime = 2500;
  //count number of items
  var numberOfItems = 2;
  //set current item
  var currentItem = 0;
  //show first item
  $('.slide').eq(currentItem).fadeIn(initialFadeIn);
  //loop through the items
  var infiniteLoop = setInterval(function(){
    $('.slide').eq(currentItem).fadeOut(fadeTime);
    if(currentItem == numberOfItems - 1){
      currentItem = 0;
    }else{
      currentItem++;
    }
    $('.slide').eq(currentItem).fadeIn(fadeTime);
  }, itemInterval);
}
};
InfiniteRotator.init();
})(window.app || (window.app = {}));
