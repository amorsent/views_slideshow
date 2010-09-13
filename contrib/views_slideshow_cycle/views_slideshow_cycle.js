// $Id$

/**
 *  @file
 *  A simple jQuery Cycle Div Slideshow Rotator.
 */

/**
 * This will set our initial behavior, by starting up each individual slideshow.
 */
Drupal.behaviors.viewsSlideshowCycle = function (context) {
  $('.views_slideshow_cycle_main:not(.viewsSlideshowCycle-processed)', context).addClass('viewsSlideshowCycle-processed').each(function() {
    var fullId = '#' + $(this).attr('id');
    var settings = Drupal.settings.viewsSlideshowCycle[fullId];
    settings.targetId = '#' + $(fullId + " :first").attr('id');
    settings.paused = false;

    settings.opts = {
      speed:parseInt(settings.speed),
      timeout:parseInt(settings.timeout),
      delay:parseInt(settings.delay),
      sync:settings.sync,
      random:settings.random,
      pagerAnchorBuilder:function(idx, slide) {
        var classes = 'pager-item pager-num-' + (idx+1);
        if (idx == 0) {
          classes += ' first';
        }
        if ($(slide).siblings().length == idx) {
          classes += ' last';
        }

        if (idx % 2) {
          classes += ' odd';
        }
        else {
          classes += ' even';
        }
        
        // Call the theme function for the pager.
        var theme = 'viewsSlideshowPager' + settings.pager_type;
        return Drupal.theme.prototype[theme] ? Drupal.theme(theme, classes, idx, slide, settings) : '';
      },
      allowPagerClickBubble:(settings.pager_hover),
      prev:(settings.controls != 0)?'#views_slideshow_cycle_prev_' + settings.vss_id:null,
      next:(settings.controls != 0)?'#views_slideshow_cycle_next_' + settings.vss_id:null,
      pager:(settings.pager != 0)?'#views_slideshow_cycle_pager_' + settings.vss_id:null,
      nowrap:settings.nowrap,
      after:function(curr, next, opts) {
        // Used for Slide Counter.
        if (settings.slide_counter) {
          $('#views_slideshow_cycle_slide_counter_' + settings.vss_id + ' span.num').html(opts.currSlide + 1);
          $('#views_slideshow_cycle_slide_counter_' + settings.vss_id + ' span.total').html(opts.slideCount);
        }
      },
      before:function(curr, next, opts) {
        // Remember last slide.
        if (settings.remember_slide) {
          createCookie(settings.vss_id, opts.currSlide + 1, settings.remember_slide_days);
        }

        // Make variable height.
        if (!settings.fixed_height) {
          //get the height of the current slide
          var $ht = $(this).height();
          //set the container's height to that of the current slide
          $(this).parent().animate({height: $ht});
        }
      },
      cleartype:(settings.cleartype)? true : false,
      cleartypeNoBg:(settings.cleartypenobg)? true : false,
      activePagerClass:'active-slide'
    }
    
    // Set the starting slide if we are supposed to remember the slide
    if (settings.remember_slide) {
      var startSlide = readCookie(settings.vss_id);
      if (startSlide == null) {
        startSlide = 0;
      }
      settings.opts.startingSlide =  startSlide;
    }

    if (settings.pager_hover) {
      settings.opts.pagerEvent = 'mouseover';
      settings.opts.pauseOnPagerHover = true;
    }

    if (settings.effect == 'none') {
      settings.opts.speed = 1;
    }
    else {
      settings.opts.fx = settings.effect;
    }

    // Pause on hover.
    if (settings.pause) {
      $('#views_slideshow_cycle_teaser_section_' + settings.vss_id).hover(function() {
        $(settings.targetId).cycle('pause');
      }, function() {
        if (!settings.paused) {
          $(settings.targetId).cycle('resume');
        }
      });
    }

    // Pause on clicking of the slide.
    if (settings.pause_on_click) {
      $('#views_slideshow_cycle_teaser_section_' + settings.vss_id).click(function() { 
        viewsSlideshowCyclePause(settings);
      });
    }
    
    // Allow pagers to override settings.
    if (settings.pager != 0) {
      var pagerAlter = 'viewsSlideshowCyclePager' + settings.pager_type + 'SettingsAlter';
      if (typeof window[pagerAlter] == 'function') {
        settings = window[pagerAlter](settings);
      }
    }
    
    // Advanced Settings
    if (typeof(settings.advanced_fx) !== 'undefined') { settings.opts.fx = settings.advanced_fx; }
    if (typeof(settings.advanced_timeout) !== 'undefined') { settings.opts.timeout = settings.advanced_timeout; }
    if (typeof(settings.advanced_timeoutFn) !== 'undefined') { settings.opts.timeoutFn = settings.advanced_timeoutFn; } 
    if (typeof(settings.advanced_continuous) !== 'undefined') { settings.opts.continuous = settings.advanced_continuous; }     // true to start next transition immediately after current one completes 
    if (typeof(settings.advanced_speed) !== 'undefined') { settings.opts.speed = settings.advanced_speed; }  // speed of the transition (any valid fx speed value) 
    if (typeof(settings.advanced_speedIn) !== 'undefined') { settings.opts.speedIn = settings.advanced_speedIn; }  // speed of the 'in' transition 
    if (typeof(settings.advanced_speedOut) !== 'undefined') { settings.opts.speedOut = settings.advanced_speedOut; }  // speed of the 'out' transition 
    if (typeof(settings.advanced_next) !== 'undefined') { settings.opts.next = settings.advanced_next; }  // selector for element to use as click trigger for next slide 
    if (typeof(settings.advanced_prev) !== 'undefined') { settings.opts.prev = settings.advanced_prev; }  // selector for element to use as click trigger for previous slide 
    if (typeof(settings.advanced_prevNextClick) !== 'undefined') { settings.opts.prevNextEvent = settings.advanced_prevNextClick; }  // callback fn for prev/next clicks:   function(isNext, zeroBasedSlideIndex, slideElement) 
    if (typeof(settings.advanced_prevNextEvent) !== 'undefined') { settings.opts.prevNextEvent = settings.advanced_prevNextEvent; }// event which drives the manual transition to the previous or next slide 
    if (typeof(settings.advanced_pager) !== 'undefined') { settings.opts.pager = settings.advanced_pager; }  // selector for element to use as pager container 
    if (typeof(settings.advanced_pagerClick) !== 'undefined') { settings.opts.pagerClick = settings.advanced_pagerClick; }  // callback fn for pager clicks:    function(zeroBasedSlideIndex, slideElement) 
    if (typeof(settings.advanced_pagerEvent) !== 'undefined') { settings.opts.pagerEvent = settings.advanced_pagerEvent; } // name of event which drives the pager navigation 
    if (typeof(settings.advanced_allowPagerClickBubble) !== 'undefined') { settings.opts.allowPagerClickBubble = settings.advanced_allowPagerClickBubble; }  // allows or prevents click event on pager anchors from bubbling 
    if (typeof(settings.advanced_pagerAnchorBuilder) !== 'undefined') { settings.opts.pagerAnchorBuilder = settings.advanced_pagerAnchorBuilder; } // callback fn for building anchor links:  function(index, DOMelement) 
    if (typeof(settings.advanced_before) !== 'undefined') { settings.opts.before = settings.advanced_before; }  // transition callback (scope set to element to be shown):     function(currSlideElement, nextSlideElement, options, forwardFlag) 
    if (typeof(settings.advanced_after) !== 'undefined') { settings.opts.after = settings.advanced_after; }  // transition callback (scope set to element that was shown):  function(currSlideElement, nextSlideElement, options, forwardFlag) 
    if (typeof(settings.advanced_end) !== 'undefined') { settings.opts.end = settings.advanced_end; }  // callback invoked when the slideshow terminates (use with autostop or nowrap options): function(options) 
    if (typeof(settings.advanced_easing) !== 'undefined') { settings.opts.easing = settings.advanced_easing; }  // easing method for both in and out transitions 
    if (typeof(settings.advanced_easeIn) !== 'undefined') { settings.opts.easeIn = settings.advanced_easeIn; }  // easing for "in" transition 
    if (typeof(settings.advanced_easeOut) !== 'undefined') { settings.opts.easeOut = settings.advanced_easeOut; }  // easing for "out" transition 
    if (typeof(settings.advanced_shuffle) !== 'undefined') { settings.opts.shuffle = settings.advanced_shuffle; }  // coords for shuffle animation, ex: { top:15, left: 200 } 
    if (typeof(settings.advanced_animIn) !== 'undefined') { settings.opts.animIn = settings.advanced_animIn; }  // properties that define how the slide animates in 
    if (typeof(settings.advanced_animOut) !== 'undefined') { settings.opts.animOut = settings.advanced_animOut; }  // properties that define how the slide animates out 
    if (typeof(settings.advanced_cssBefore) !== 'undefined') { settings.opts.cssBefore = settings.advanced_cssBefore; }  // properties that define the initial state of the slide before transitioning in 
    if (typeof(settings.advanced_cssAfter) !== 'undefined') { settings.opts.cssAfter = settings.advanced_cssAfter; }  // properties that defined the state of the slide after transitioning out 
    if (typeof(settings.advanced_fxFn) !== 'undefined') { settings.opts.fxFn = settings.advanced_fxFn; }  // function used to control the transition: function(currSlideElement, nextSlideElement, options, afterCalback, forwardFlag) 
    if (typeof(settings.advanced_height) !== 'undefined') { settings.opts.height = settings.advanced_height; } // container height 
    if (typeof(settings.advanced_startingSlide) !== 'undefined') { settings.opts.startingSlide = settings.advanced_startingSlide; }     // zero-based index of the first slide to be displayed 
    if (typeof(settings.advanced_sync) !== 'undefined') { settings.opts.sync = settings.advanced_sync; }     // true if in/out transitions should occur simultaneously 
    if (typeof(settings.advanced_random) !== 'undefined') { settings.opts.random = settings.advanced_random; }     // true for random, false for sequence (not applicable to shuffle fx) 
    if (typeof(settings.advanced_fit) !== 'undefined') { settings.opts.fit = settings.advanced_fit; }     // force slides to fit container 
    if (typeof(settings.advanced_containerResize) !== 'undefined') { settings.opts.containerResize = settings.advanced_containerResize; }     // resize container to fit largest slide 
    if (typeof(settings.advanced_pause) !== 'undefined') { settings.opts.pause = settings.advanced_pause; }     // true to enable "pause on hover" 
    if (typeof(settings.advanced_pauseOnPagerHover) !== 'undefined') { settings.opts.pauseOnPagerHover = settings.advanced_pauseOnPagerHover; }   // true to pause when hovering over pager link 
    if (typeof(settings.advanced_autostop) !== 'undefined') { settings.opts.autostop = settings.advanced_autostop; }     // true to end slideshow after X transitions (where X == slide count) 
    if (typeof(settings.advanced_autostopCount) !== 'undefined') { settings.opts.autostopCount = settings.advanced_autostopCount; }     // number of transitions (optionally used with autostop to define X) 
    if (typeof(settings.advanced_delay) !== 'undefined') { settings.opts.delay = settings.advanced_delay; }     // additional delay (in ms) for first transition (hint: can be negative) 
    if (typeof(settings.advanced_slideExpr) !== 'undefined') { settings.opts.slideExpr = settings.advanced_slideExpr; }  // expression for selecting slides (if something other than all children is required) 
    if (typeof(settings.advanced_cleartype) !== 'undefined') { settings.opts.cleartype = settings.advanced_cleartype; }  // true if clearType corrections should be applied (for IE) 
    if (typeof(settings.advanced_cleartypeNoBg) !== 'undefined') { settings.opts.cleartypeNoBg = settings.advanced_cleartypeNoBg; } // set to true to disable extra cleartype fixing (leave false to force background color setting on slides) 
    if (typeof(settings.advanced_nowrap) !== 'undefined') { settings.opts.nowrap = settings.advanced_nowrap; }     // true to prevent slideshow from wrapping 
    if (typeof(settings.advanced_fastOnEvent) !== 'undefined') { settings.opts.fastOnEvent = settings.advanced_fastOnEvent; }     // force fast transitions when triggered manually (via pager or prev/next); value == time in ms 
    if (typeof(settings.advanced_randomizeEffects) !== 'undefined') { settings.opts.randomizeEffects = settings.advanced_randomizeEffects; }     // valid when multiple effects are used; true to make the effect sequence random 
    if (typeof(settings.advanced_rev) !== 'undefined') { settings.opts.rev = settings.advanced_rev; }     // causes animations to transition in reverse 
    if (typeof(settings.advanced_manualTrump) !== 'undefined') { settings.opts.manualTrump = settings.advanced_manualTrump; }  // causes manual transition to stop an active transition instead of being ignored 
    if (typeof(settings.advanced_requeueOnImageNotLoaded) !== 'undefined') { settings.opts.requeueOnImageLoaded = settings.advanced_requeueOnImageLoaded; } // requeue the slideshow if any image slides are not yet loaded 
    if (typeof(settings.advanced_requeueTimeout) !== 'undefined') { settings.opts.requeueTimeout = settings.advanced_requeueTimeout; }   // ms delay for requeue 
    if (typeof(settings.advanced_activePagerClass) !== 'undefined') { settings.opts.activePagerClass = settings.advanced_activePagerClass; } // class name used for the active pager link 
    if (typeof(settings.advanced_updateActivePagerLink) !== 'undefined') { settings.opts.updateActivePagerLink = settings.advanced_updateActivePagerLink; } // callback fn invoked to update the active pager link (adds/removes activePagerClass style) 
    
    $(settings.targetId).cycle(settings.opts);

    // Start Paused
    if (settings.start_paused) {
      viewsSlideshowCyclePause(settings);
    }
    
    // Pause if hidden.
    if (settings.pause_when_hidden) {
      var checkPause = function(settings) {
        // If the slideshow is visible and it is paused then resume.
        // otherwise if the slideshow is not visible and it is not paused then
        // pause it.
        var visible = viewsSlideshowCycleIsVisible(settings.targetId, settings.pause_when_hidden_type, settings.amount_allowed_visible);
        if (visible && settings.paused) {
          viewsSlideshowCycleResume(settings);
        }
        else if (!visible && !settings.paused) {
          viewsSlideshowCyclePause(settings);
        }
      }
     
      // Check when scrolled.
      $(window).scroll(function() {
       checkPause(settings);
      });
      
      // Check when the window is resized.
      $(window).resize(function() {
        checkPause(settings);
      });
    }

    // Show image count for people who have js enabled.
    $('#views_slideshow_cycle_image_count_' + settings.vss_id).show();

    if (settings.controls != 0) {
      // Show controls for people who have js enabled browsers.
      $('#views_slideshow_cycle_controls_' + settings.vss_id).show();
      
      $('#views_slideshow_cycle_playpause_' + settings.vss_id).click(function(e) {
      	if (settings.paused) {
      	  viewsSlideshowCycleResume(settings);
      	}
      	else {
      	  viewsSlideshowCyclePause(settings);
      	}
        e.preventDefault();
      });
    }
  });
}

// Pause the slideshow 
viewsSlideshowCyclePause = function (settings) {
  // Make Resume translatable
  var resume = Drupal.t('Resume');
  
  $(settings.targetId).cycle('pause');
  if (settings.controls != 0) {
    $('#views_slideshow_cycle_playpause_' + settings.vss_id)
      .addClass('views_slideshow_cycle_play')
      .addClass('views_slideshow_play')
      .removeClass('views_slideshow_cycle_pause')
      .removeClass('views_slideshow_pause')
      .text(resume);
  }
  settings.paused = true;
}

// Resume the slideshow
viewsSlideshowCycleResume = function (settings) {
  // Make Pause translatable
  var pause = Drupal.t('Pause');
  
  $(settings.targetId).cycle('resume');
  if (settings.controls != 0) {
    $('#views_slideshow_cycle_playpause_' + settings.vss_id)
      .addClass('views_slideshow_cycle_pause')
      .addClass('views_slideshow_pause')
      .removeClass('views_slideshow_cycle_play')
      .removeClass('views_slideshow_play')
      .text(pause);
  }
  settings.paused = false;
}

// Theme the thumbnails type pager.
Drupal.theme.prototype.viewsSlideshowPagerthumbnails = function (classes, idx, slide, settings) {
  var href = '#';
  if (settings.thumbnails_pager_click_to_page) {
    href = $(slide).find('a').attr('href');
  }
  var img = $(slide).find('img')
  return '<div class="' + classes + '"><a href="' + href + '"><img src="' + $(img).attr('src') + '" alt="' + $(img).attr('alt') + '" title="' + $(img).attr('title') + '"/></a></div>';
}

// Make some adjustments for thumbnails pagers.
function viewsSlideshowCyclePagerthumbnailsSettingsAlter(settings) {
  if (settings.thumbnails_pager_click_to_page) {
    settings.opts.allowPagerClickBubble = true;
    settings.opts.pagerEvent = "mouseover";
  }
  return settings;
}

// Theme the numbered type pager.
Drupal.theme.prototype.viewsSlideshowPagernumbered = function (classes, idx, slide, settings) {
  var href = '#';
  if (settings.numbered_pager_click_to_page) {
    href = $(slide).find('a').attr('href');
  }
  return '<div class="' + classes + '"><a href="' + href + '">' + (idx+1) + '</a></div>';
}

// Make some adjustments for numbered pagers.
function viewsSlideshowCyclePagernumberedSettingsAlter(settings) {
  if (settings.numbered_pager_click_to_page) {
    settings.opts.allowPagerClickBubble = true;
    settings.opts.pagerEvent = "mouseover";
  }
  return settings;
}

// Theme the fields type pager.
Drupal.theme.prototype.viewsSlideshowPagerfields = function (classes, idx, slide, settings) {
  return '#views_slideshow_cycle_div_pager_item_' + settings.vss_id + '_' + idx;
}

// Verify that the value is a number.
function IsNumeric(sText) {
  var ValidChars = "0123456789";
  var IsNumber=true;
  var Char;

  for (var i=0; i < sText.length && IsNumber == true; i++) { 
    Char = sText.charAt(i); 
    if (ValidChars.indexOf(Char) == -1) {
      IsNumber = false;
    }
  }
  return IsNumber;
}

/**
 * Cookie Handling Functions
 */
function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else {
    var expires = "";
  }
  document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name,"",-1);
}

/**
 * Checks to see if the slide is visible enough.
 * elem = element to check.
 * type = The way to calculate how much is visible.
 * amountVisible = amount that should be visible. Either in percent or px. If
 *                it's not defined then all of the slide must be visible.
 *
 * Returns true or false
 */
function viewsSlideshowCycleIsVisible(elem, type, amountVisible) {
  // Get the top and bottom of the window;
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();
  var docViewLeft = $(window).scrollLeft();
  var docViewRight = docViewLeft + $(window).width();

  // Get the top, bottom, and height of the slide;
  var elemTop = $(elem).offset().top;
  var elemHeight = $(elem).height();
  var elemBottom = elemTop + elemHeight;
  var elemLeft = $(elem).offset().left;
  var elemWidth = $(elem).width();
  var elemRight = elemLeft + elemWidth;
  var elemArea = elemHeight * elemWidth;
  
  // Calculate what's hiding in the slide.
  var missingLeft = 0;
  var missingRight = 0;
  var missingTop = 0;
  var missingBottom = 0;
  
  // Find out how much of the slide is missing from the left.
  if (elemLeft < docViewLeft) {
    missingLeft = docViewLeft - elemLeft;
  }

  // Find out how much of the slide is missing from the right.
  if (elemRight > docViewRight) {
    missingRight = elemRight - docViewRight;
  }
  
  // Find out how much of the slide is missing from the top.
  if (elemTop < docViewTop) {
    missingTop = docViewTop - elemTop;
  }

  // Find out how much of the slide is missing from the bottom.
  if (elemBottom > docViewBottom) {
    missingBottom = elemBottom - docViewBottom;
  }
  
  // If there is no amountVisible defined then check to see if the whole slide
  // is visible.
  if (type == 'full') {
    return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
    && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop)
    && (elemLeft >= docViewLeft) && (elemRight <= docViewRight)
    && (elemLeft <= docViewRight) && (elemRight >= docViewLeft));
  }
  else if(type == 'vertical') {
    var verticalShowing = elemHeight - missingTop - missingBottom;
    
    // If user specified a percentage then find out if the current shown percent
    // is larger than the allowed percent.
    // Otherwise check to see if the amount of px shown is larger than the
    // allotted amount.
    if (amountVisible.indexOf('%')) {
      return (((verticalShowing/elemHeight)*100) >= parseInt(amountVisible));
    }
    else {
      return (verticalShowing >= parseInt(amountVisible));
    }
  }
  else if(type == 'horizontal') {
    var horizontalShowing = elemWidth - missingLeft - missingRight;
    
    // If user specified a percentage then find out if the current shown percent
    // is larger than the allowed percent.
    // Otherwise check to see if the amount of px shown is larger than the
    // allotted amount.
    if (amountVisible.indexOf('%')) {
      return (((horizontalShowing/elemWidth)*100) >= parseInt(amountVisible));
    }
    else {
      return (horizontalShowing >= parseInt(amountVisible));
    }
  }
  else if(type == 'area') {
    var areaShowing = (elemWidth - missingLeft - missingRight) * (elemHeight - missingTop - missingBottom);
    
    // If user specified a percentage then find out if the current shown percent
    // is larger than the allowed percent.
    // Otherwise check to see if the amount of px shown is larger than the
    // allotted amount.
    if (amountVisible.indexOf('%')) {
      return (((areaShowing/elemArea)*100) >= parseInt(amountVisible));
    }
    else {
      return (areaShowing >= parseInt(amountVisible));
    }
  }
}

