 //sticky sidebar
$(function() {
  if ($('.stickySidebar').length > 0) {
    var stickySidebar = new StickySidebar('.stickySidebar', {
      containerSelector: '.main',
      topSpacing: 93,
      bottomSpacing: 0,
      minWidth: 768,
      resizeSensor: true,
    });
  }
});

//marqueeBlock跑馬燈輪播
$(function () {
  // 取得元素
  var $marqueeWrap = $('.marqueeBlock');
  var $marquee = $marqueeWrap.find('ul');
  var $marqueeBtn = $('.marqueeToggle'); // 跑馬燈暫停/播放按鈕

  // ARIA：讓跑馬燈對輔助工具友善
  if (!$marquee.attr('id')) $marquee.attr('id', 'marqueeList');
  $marquee.attr({
    'aria-label': '最新消息跑馬燈',
    'aria-live': 'off'
  });

  // 初始化 Slick（垂直自動滾動）
  $marquee.slick({
    dots: false,
    infinite: true,
    arrows: true,
    vertical: true,
    verticalSwiping: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    speed: 1200,
    focusOnSelect: true,
    pauseOnHover: true
  });

  // 狀態旗標：手動暫停優先於 hover 恢復
  var isManuallyPaused = false;

  function setBtnUI(paused) {
    $marqueeBtn
      .toggleClass('is-paused', paused)
      .toggleClass('is-playing', !paused)
      .text(paused ? '播放' : '暫停')
      .attr('aria-label', paused ? '播放跑馬燈' : '暫停跑馬燈');

    // 仍保留在列表本身切換 aria-live 的做法
    $marquee.attr('aria-live', paused ? 'polite' : 'off');
  }

  // 初始為播放中
  setBtnUI(false);

  // 按鈕：手動暫停／播放
  $marqueeBtn.on('click', function () {
    var nowPaused = $marqueeBtn.hasClass('is-paused');
    if (nowPaused) {
      // 播放
      isManuallyPaused = false;
      $marquee.slick('slickPlay');
      setBtnUI(false);
    } else {
      // 暫停
      isManuallyPaused = true;
      $marquee.slick('slickPause');
      setBtnUI(true);
    }
  });

  // 移開時若為手動暫停，強制維持暫停
  $marquee.on('mouseleave', function () {
    if (isManuallyPaused) {
      $marquee.slick('slickPause');
    }
  });
});


//左右圖輪播
$(function () {
  // === 選取器 ===
  const $leftUl        = $(".leftSlider ul");                 // 左側 slick 容器
  const $leftControls  = $(".leftSlider_controls");           // 左側計數器（有需要就會更新）
  const $pauseBtn      = $(".leftSlider_sliderToggle");       // 左側暫停/播放按鈕
  const $rightWrap     = $(".rightSlider");                   // 右側包著多組 <ul> 的容器

  // === 右側：把每個 <ul> 包成可切換的 block，預設隱藏 ===
  $rightWrap.find("> ul").wrap('<div class="rightSliderBlock"></div>');
  const $rightBlocks = $(".rightSliderBlock").hide();

  // === 左側：補 aria/id，初始化 Slick（關閉內建 hover/focus 暫停，改用自訂） ===
  if (!$leftUl.attr("id")) $leftUl.attr("id", "leftSlider");

  $leftUl
    .on("init", function (e, slick) {
      const total = slick.slideCount;
      const pad = n => (n < 10 ? "0" + n : "" + n);
      $leftControls.html(`<span>${pad(1)}</span> / ${pad(total)}`);
    })
    .on("reInit afterChange", function (e, slick, current) {
      const i = (typeof current === "number" ? current : 0) + 1;
      const total = slick.slideCount;
      const pad = n => (n < 10 ? "0" + n : "" + n);
      $leftControls.html(`<span>${pad(i)}</span> / ${pad(total)}`);
    })
    .slick({
      dots: false,
      autoplay: true,
      autoplaySpeed: 5000,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      speed: 500,
      arrows: true,
      prevArrow: '<button type="button" class="slick-prev" aria-label="上一張">Previous</button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="下一張">Next</button>',
      pauseOnHover: false,
      pauseOnFocus: false
    });

  // === 右側：只在可見時初始化；已初始化則 setPosition 重算 ===
  function initRightSlider($ul){
    if ($ul.hasClass('slick-initialized')) return;

    $ul.on('init', function(){
      $(this).find('.slick-dots button').each(function () {
        $(this).replaceWith(
          $('<span>' + $(this).html() + '</span>').removeAttr('tabindex')
        );
      });
    });

    $ul.slick({
      dots: true,
      autoplay: false,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      speed: 500,
      arrows: true,
      prevArrow: '<button type="button" class="slick-prev" aria-label="上一頁">Prev</button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="下一頁">Next</button>',
      responsive: [
        { breakpoint: 320,  settings: { slidesToShow: 2, slidesToScroll: 1 } },
        { breakpoint: 920,  settings: { slidesToShow: 2, slidesToScroll: 1 } },
        { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1 } }
      ]
    });
  }

  function showRightBlock(index) {
    const total = $rightBlocks.length;
    if (!total) return;

    const idx = index % total;
    $rightBlocks.hide();

    const $block = $rightBlocks.eq(idx).show();
    const $ul    = $block.children("ul");

    if ($ul.hasClass("slick-initialized")) {
      $ul.slick("setPosition");
    } else {
      initRightSlider($ul);
    }
  }

  // 初始：顯示第一組右側
  showRightBlock(0);

  // 左側切換 → 顯示對應右側組
  $leftUl.on("beforeChange", function (e, slick, currentSlide, nextSlide) {
    showRightBlock(nextSlide);
  });

  // === 左側：暫停/播放按鈕 + hover 行為 ===
  let isManuallyPaused = false;
  let isHovering       = false;
  let pendingPlay      = false;

  function setLeftPausedUI(paused) {
    $pauseBtn
      .toggleClass("is-paused", paused)
      .toggleClass("is-playing", !paused)
      .text(paused ? "播放" : "暫停")
      .attr("aria-label", paused ? "播放輪播" : "暫停輪播");
    $leftUl.attr("aria-live", paused ? "polite" : "off");
  }
  setLeftPausedUI(false);

  $pauseBtn.on("click", function () {
    const nowPaused = $pauseBtn.hasClass("is-paused");
    if (nowPaused) {
      isManuallyPaused = false;
      if (isHovering) {
        pendingPlay = true;
      } else {
        pendingPlay = false;
        $leftUl.slick("slickPlay");
      }
      setLeftPausedUI(false);
    } else {
      isManuallyPaused = true;
      pendingPlay = false;
      $leftUl.slick("slickPause");
      setLeftPausedUI(true);
    }
  });

  $leftUl.on("mouseenter", function () {
    isHovering = true;
    $leftUl.slick("slickPause");
  });

  $leftUl.on("mouseleave", function () {
    isHovering = false;
    if (isManuallyPaused) return;
    if (pendingPlay) {
      pendingPlay = false;
      $leftUl.slick("slickPlay");
      setLeftPausedUI(false);
      return;
    }
    $leftUl.slick("slickPlay");
    setLeftPausedUI(false);
  });
});


// mpSlider首頁輪播
$(function () {
  // 若你的圖片是 <picture> 並使用 data-src / data-srcset，保留這段；
  // 若改為 <img data-lazy="..."> 則可刪除本函式與呼叫點，使用 slick 的 lazyLoad。
  function applyPictureLazy($ctx) {
    $ctx.find('img[data-src]').each(function () {
      this.src = this.getAttribute('data-src');
      this.removeAttribute('data-src');
    });
    $ctx.find('source[data-srcset]').each(function () {
      this.srcset = this.getAttribute('data-srcset');
      this.removeAttribute('data-srcset');
    });
  }

  var $slider = $('.mpSlider');
  var $btn    = $('.mpSlider_sliderToggle'); // 暫停/播放按鈕
  var $wrap   = $('.heroSlider');            // 外層容器（可選，用於 .is-hovering 樣式）

  // 若容器沒有 id，補一個，並加上 ARIA
  if (!$slider.attr('id')) $slider.attr('id', 'mpSlider');
  $slider.attr({
    'aria-label': '主視覺輪播',
    'aria-live': 'off'
  });

  // 初始化 slick（關閉內建 hover/focus 暫停，改用自訂行為）
  $slider
    .on('init', function (e, slick) {
      applyPictureLazy($(slick.$slides[0]));
    })
    .on('beforeChange', function (e, slick, cur, next) {
      applyPictureLazy($(slick.$slides[next]));
    })
    .slick({
      mobileFirst: true,
      dots: true,
      arrows: true,
      prevArrow:
        '<button type="button" class="slick-prev" aria-label="上一張">〈</button>',
      nextArrow:
        '<button type="button" class="slick-next" aria-label="下一張">〉</button>',
      infinite: true,
      fade: true,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
      pauseOnHover: false,   // 交由自訂 hover 邏輯
      pauseOnFocus: false,   // 交由自訂邏輯；若要聚焦即暫停可在下方加 focusin/out
      lazyLoad: 'ondemand'   // 僅對 <img data-lazy> 生效；<picture> 交給 applyPictureLazy
    });

  // ===== 狀態管理 =====
  var isManuallyPaused = false; // 使用者按下暫停鈕
  var isHovering = false;       // 滑鼠是否位於輪播

  function setPausedUI(paused) {
    // 切換按鈕樣式：.is-paused / .is-playing 供你寫 CSS
    $btn
      .toggleClass('is-paused', paused)
      .toggleClass('is-playing', !paused)
      .text(paused ? '播放' : '暫停')
      .attr('aria-label', paused ? '播放輪播' : '暫停輪播');

    // 暫停時才開啟禮貌性通報
    $slider.attr('aria-live', paused ? 'polite' : 'off');
  }

  // 初始：自動播放中 → 按鈕顯示「暫停」
  setPausedUI(false);

  // 暫停/播放按鈕：唯一能「手動暫停/恢復」的入口
  $btn.on('click', function () {
    var nowPaused = $btn.hasClass('is-paused'); // 目前是否處於暫停狀態
    if (nowPaused) {
      // 使用者按「播放」
      isManuallyPaused = false;
      if (!isHovering) {
        $slider.slick('slickPlay');
      }
      setPausedUI(false);
    } else {
      // 使用者按「暫停」
      isManuallyPaused = true;
      $slider.slick('slickPause');
      setPausedUI(true);
    }
  });

  // 滑鼠移入：一定暫停（不改按鈕狀態，避免與手動暫停混淆）
  $slider.on('mouseenter', function () {
    isHovering = true;
    if ($wrap.length) $wrap.addClass('is-hovering'); // 可用於 CSS 樣式
    $slider.slick('slickPause');
  });

  // 滑鼠移出：若未手動暫停才恢復
  $slider.on('mouseleave', function () {
    isHovering = false;
    if ($wrap.length) $wrap.removeClass('is-hovering');
    if (!isManuallyPaused) {
      $slider.slick('slickPlay');
      setPausedUI(false);
    }
  });

  // （可選）鍵盤聚焦輪播時暫停、離開恢復
  $slider.on('focusin', function () {
    $slider.slick('slickPause');
  });
  $slider.on('focusout', function () {
    if (!isManuallyPaused && !isHovering) $slider.slick('slickPlay');
  });
});


//collectVideo
$(function () {
  $('.collectVideo').slick({
    mobileFirst: true,
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    fade: true,
    lazyLoaded: true,
    lazyLoad: 'ondemand',
    ease: 'ease',
    customPaging: function(slider, i) {
      var title = $(slider.$slides[i]).find('img').attr('alt').trim();
      return $('<button type="button" aria-label="' + title + '"/>').text(title);
    },
  });
});

//eventSlider
$(function() {
  $('.eventSlider').slick({
    mobileFirst: true,
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    autoplay: false,
    fade: true,
    lazyLoaded: true,
    lazyLoad: 'ondemand',
    ease: 'ease',
    customPaging: function(slider, i) {
      var title = $(slider.$slides[i]).find('img').attr('alt').trim();
      return $('<button type="button" aria-label="' + title + '"/>').text(title);
    },
  });
})

//taxSlider
$(function(){
  $('.taxSlider ul').slick({
    mobileFirst: true,
    dots: true,
    speed: 300,
    arrow: true,
    infinite: true,
    slidesToShow: 1,
    autoplay: false,
    lazyLoaded: true,
    lazyLoad: 'ondemand',
    ease: 'ease',
    responsive: [{
      breakpoint: 920,
      settings: {
        centerMode: true,
        centerPadding: '165px'
      },
    }, ],
  });
});

//dummiesBlock
$(function(){
  const $dummiesBlock         = $('.dummiesBlock');
  const $dummiesBlockUl       = $dummiesBlock.find('ul');
  const $dummiesBlockControls = $dummiesBlock.find('.dummiesBlock_controls');
  const $dummiesBlockToggle   = $dummiesBlock.find('.dummiesBlock_sliderToggle'); // 無障礙暫停鈕
  // const $dummiesBlockStatus   = $('#dummiesSliderStatus'); // ← 已移除

  // 可存取屬性
  if (!$dummiesBlockUl.attr('id')) $dummiesBlockUl.attr('id', 'dummiesSlider');
  $dummiesBlockUl.attr({
    'aria-label': '節稅懶人包輪播',
    'aria-live': 'off'
  });

  // 計數器：補零
  function dummiesPad(n, total){
    const needPad = total < 10;
    return needPad && n < 10 ? '0' + n : '' + n;
  }

  $dummiesBlockUl.on('init reInit afterChange', function(event, slick, currentSlide){
    const i = (typeof currentSlide === 'number' ? currentSlide : 0) + 1;
    $dummiesBlockControls.html(
      `<span>${dummiesPad(i, slick.slideCount)}</span> / ${dummiesPad(slick.slideCount, slick.slideCount)}`
    );
  });

  // Slick 初始化
  $dummiesBlockUl.slick({
    mobileFirst: true,
    dots: false,
    arrows: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    lazyLoad: 'ondemand',
    cssEase: 'ease',
    pauseOnHover: true,
    pauseOnFocus: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [{
      breakpoint: 920,
      settings: {
        centerMode: true,
        centerPadding: '165px',
        slidesToShow: 3
      }
    }]
  });

  // ===== 無障礙暫停/播放按鈕 =====
  let dummiesManuallyPaused = false; // 是否手動暫停

  function dummiesSetToggleUI(paused){
    $dummiesBlockToggle
      .toggleClass('is-paused',  paused)
      .toggleClass('is-playing', !paused)
      .text(paused ? '播放' : '暫停')
      .attr('aria-label', paused ? '播放輪播' : '暫停輪播');

    $dummiesBlockUl.attr('aria-live', paused ? 'polite' : 'off');
    // if ($dummiesBlockStatus.length) $dummiesBlockStatus.text(paused ? '輪播已暫停' : '輪播已播放'); // ← 已移除
  }
  dummiesSetToggleUI(false); // 初始播放中

  // 點擊切換：手動暫停優先於自動恢復
  $dummiesBlockToggle.on('click', function(){
    if (dummiesManuallyPaused){
      dummiesManuallyPaused = false;
      $dummiesBlockUl.slick('slickPlay');
      dummiesSetToggleUI(false);
    } else {
      dummiesManuallyPaused = true;
      $dummiesBlockUl.slick('slickPause');
      dummiesSetToggleUI(true);
    }
  });

  // 防止 Slick 在 mouseleave/focusout 自動恢復時蓋掉手動暫停
  $dummiesBlockUl.on('mouseleave focusout', function(){
    if (dummiesManuallyPaused) $dummiesBlockUl.slick('slickPause');
  });
});


// adSlider廣告輪播
$(function(){
  $('.adSlider').slick({
    mobileFirst: true,
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: false,
    arrow: true,
    lazyLoaded: true,
    lazyLoad: 'ondemand',
    ease: 'ease',
    responsive: [{
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 575,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
        },
      },
    ],
  });
});

//跟cp有關的輪播
$(function(){
  //燈箱slick+lightBox組合
  $('.cp_slider').slick({
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 1500,
    pauseOnHover: true,
    pauseOnFocus: true,
    focusOnSelect: true,
    accessibility: true,
    lazyLoad: 'ondemand',
    ease: 'ease',
    responsive: [{
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 545,
        settings: {
          arrows: true,
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  });
  $('.cp_slider').slickLightbox({
    caption: 'caption',
    lazyLoad: 'ondemand',
    useHistoryApi: 'true',
    ease: 'ease',
    lazy: true,
  });
  //
  $('.cppic_slider').slick({
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 1500,
    // pauseOnHover: true,
    // pauseOnFocus: true,
    // focusOnSelect: true,
    // accessibility: true,
    // lazyLoad: 'ondemand',
    // ease: 'ease',
    responsive: [{
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 545,
        settings: {
          arrows: true,
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  });
  // cp_photo
  $('.Slider-for').on('init reInit afterChange', function(event, slick, currentSlide) {
    var i = (currentSlide ? currentSlide : 0) + 1;
    $('.controls').html(i + '/' + slick.slideCount);
  });
  $('.Slider-for').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    swipe: false,
    swipeToSlide: false,
    lazyLoad: 'ondemand',
    asNavFor: '.Slider-nav',
    infinite: true,
  });
  $('.Slider-nav').slick({
    slidesToShow: 2,
    slidesToScroll: 1,
    asNavFor: '.Slider-for',
    dots: true,
    arrows: true,
    lazyLoad: 'ondemand',
    focusOnSelect: true,
    infinite: true,
  });
})


jQuery('img.svg').each(function() {
  var $img = jQuery(this);
  var imgID = $img.attr('id');
  var imgClass = $img.attr('class');
  var imgURL = $img.attr('src');

  jQuery.get(imgURL, function(data) {
    // Get the SVG tag, ignore the rest
    var $svg = jQuery(data).find('svg');

    // Add replaced image's ID to the new SVG
    if (typeof imgID !== 'undefined') {
      $svg = $svg.attr('id', imgID);
    }
    // Add replaced image's classes to the new SVG
    if (typeof imgClass !== 'undefined') {
      $svg = $svg.attr('class', imgClass + ' replaced-svg');
    }

    // Remove any invalid XML tags as per http://validator.w3.org
    $svg = $svg.removeAttr('xmlns:a');

    // Check if the viewport is set, if the viewport is not set the SVG wont't scale.
    if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
      $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
    }

    // Replace image with new SVG
    $img.replaceWith($svg);

  }, 'xml');

});

//adSearch
$(function(){
  $(".adSearch_btn").click(function(e) {
    $(".adSearch_form").slideToggle();
    e.preventDefault();
  });
  $(".adSearch_form .btn_grp button:last-child").focusout(function(e) {
    $(".adSearch_form").slideUp();
  });
})


//list_qa
$(function(){
  $(".list_qa li").each(function() {
    var _qq = $(this).children('.list_q');
    var _question = $(this).children('.list_q').children('a');
    var _switch = _question.children('.switch');
    var _answer = $(this).children('.list_a');
    _answer.hide();

    function accordion(e) {
      if (_answer.is(':visible')) {
        _answer.slideUp();
        _switch.text('展開').removeClass('close');
        _qq.removeClass('active');
      } else {
        _answer.slideDown();
        _switch.text('收合').addClass('close');
        _qq.addClass('active');
      }
      e.preventDefault();
    }
    _question.click(accordion);
  });
})

$(function() {
  $('.left_block ul>li>a').each(function() {
    $(".left_block ul ul").hide();
    $(".left_block ul ul li a.active").parent('li').parent('ul').show();

    function leftnav(e) {
      $(this).parent('li').siblings().children('a').removeClass('active');
      $(this).toggleClass('active');
      $(this).parent('li').siblings().children('ul').slideUp();
      $(this).next('ul').slideToggle();
      if ($(this).parent().find('ul').length > 0)
        e.preventDefault();
    }
    $(this).click(leftnav);
    $(this).keyup(leftnav);
  });
});
$(function() {
  var ww = $(window).outerWidth();
  if (ww <= 768) {
    $(".left_block .left_title").click(function(e) {
      $(this).next("ul").slideToggle();
    });
  } else {}
});

// $(function() {
// const passwordInput = document.querySelector(".password");
//   const eye = document.querySelector(".eyeclose");
//   eye.addEventListener("click", function() {
//     this.classList.toggle("eye")
//     const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
//     passwordInput.setAttribute("type", type)
//   });
// });


