$(function() {
  document.createElement('picture');
  /*-----------------------------------*/
  ///////////////// 變數 ////////////////
  /*-----------------------------------*/
  var _window = $(window),
    ww = _window.outerWidth(),
    wh = _window.height(),
    _body = $('body'),
    wwNormal = 1400,
    wwMedium = 992,
    wwSmall = 920,
    wwxs = 576;

  // 先放在較上方，避免後面使用到時還沒宣告
  var menu_status = false,
    _sidebar = $('.sidebar'),
    _search = $('.search'),
    _nav = $('.navigation'),
    _member = $('.left_block .member'),
    _sidebarClose = $('.sidebarClose'),
    _sidebarCtrl = $('.sidebarCtrl'),
    _overlay = $('.menu_overlay'),
    _mArea = $('.m_area');

  // 供搜尋切換狀態使用（showSidebar 會用到）
  var search_mode = false;

  var _searchSwitch = $('.searchSwitch'); // 若有桌機用的查詢按鈕
var isInnerHeader = $('header.header.innerheader').length > 0; // 是否為內頁 header

// 給桌機搜尋一個 id 供 aria-controls 使用
$('.search').attr({ id: 'desktopSearch' });
if (_searchSwitch.length) {
  _searchSwitch.attr({ 'aria-controls': 'desktopSearch' });
}

// 依「是否內頁」與目前寬度，設定初始顯示/隱藏狀態
function initDesktopSearchState(){
  ww = _window.outerWidth();
  var $d = $('.search');
  if (ww < wwSmall) {
    // 手機寬：一律關掉桌機搜尋
    $d.hide().attr('aria-hidden','true');
    if (_searchSwitch.length) _searchSwitch.attr('aria-expanded','false');
  } else {
    if (isInnerHeader) {
      // 內頁（有 innerheader）：桌機預設隱藏
      $d.hide().attr('aria-hidden','true');
      if (_searchSwitch.length) _searchSwitch.attr('aria-expanded','false');
    } else {
      // 首頁（沒有 innerheader）：桌機預設顯示
      $d.show().attr('aria-hidden','false');
      if (_searchSwitch.length) _searchSwitch.attr('aria-expanded','true');
    }
  }
}
initDesktopSearchState();


  /*-----------------------------------*/
  ////////////// A11Y helpers ///////////
  /*-----------------------------------*/
  var FOCUSABLE =
    'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

  function focusFirst($root) {
    var $f = $root.find(FOCUSABLE).filter(':visible').first();
    if ($f.length) $f[0].focus();
    else { $root.attr('tabindex','-1'); $root[0].focus(); }
  }

  function makeFocusTrap($scope) {
    function handler(e){
      if (e.key !== 'Tab') return;
      var $items = $scope.find(FOCUSABLE).filter(':visible');
      if (!$items.length) return;
      var first = $items.get(0), last = $items.get($items.length - 1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    $scope.on('keydown._trap', handler);
    return function release(){ $scope.off('keydown._trap', handler); };
  }

  var releaseSidebarTrap = null;
  var releaseSearchTrap  = null;
  var releaseMenuTrap = null;

  // === 桌機 search：最後 Tab 關閉 ===
function bindDesktopSearchBoundary($d){
  $d.off('keydown.searchBoundary').on('keydown.searchBoundary', function(e){
    if (e.key !== 'Tab') return;
    var $items = $d.find(FOCUSABLE).filter(':visible');
    if (!$items.length) return;
    var last = $items.get($items.length - 1);
    if (!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      closeDesktopSearch();
    }
    // 若也想 Shift+Tab 在第一個關閉，可加：
    // var first = $items.get(0);
    // if (e.shiftKey && document.activeElement === first){ e.preventDefault(); closeDesktopSearch(); }
  });
}
function closeDesktopSearch(){
  var $d = $('.search');
  if (!$d.is(':visible')) return;
  $d.hide().attr('aria-hidden','true').off('keydown.searchBoundary');
  if (_searchSwitch.length) _searchSwitch.attr('aria-expanded','false').trigger('focus');
}

// === 手機 m_search：最後 Tab 關閉 ===
function bindMobileSearchBoundary(){
  $mSearch.off('keydown.msearchBoundary').on('keydown.msearchBoundary', function(e){
    if (e.key !== 'Tab') return;
    var $items = $mSearch.find(FOCUSABLE).filter(':visible');
    if (!$items.length) return;
    var last = $items.get($items.length - 1);
    if (!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      $mSearch.hide().attr('aria-hidden','true').off('keydown.msearchBoundary');
      search_mode = false;
      _searchCtrl.attr('aria-expanded','false').focus();
    }
    // 若也想 Shift+Tab 在第一個關閉，可加：
    // var first = $items.get(0);
    // if (e.shiftKey && document.activeElement === first){ e.preventDefault(); ...同上關閉... }
  });
}

  /*-----------------------------------*/
  //////////// nojs 先移除////////////////
  /*-----------------------------------*/
  $('html').removeClass('no-js');
  /*-----------------------------------*/
  /////// header選單 tab及 fix設定////////
  /*-----------------------------------*/
  var _menu = $('.menu'),
    _menu1 = $('.menu1'),
    _menu2 = $('.menu2');
  _menu.find('li').has('ul').addClass('hasChild');
  var liHasChild = _menu2.find('li.hasChild');

  /*-----------------------------------*/
  ////////////// 行動版選單切換////////////
  /*-----------------------------------*/
  _body.prepend(
    '<aside class="sidebar"><div class="m_area"><button type="button" class="sidebarClose">關閉</button></div><div class="menu_overlay"></div></aside>'
  );
  $('header .container').prepend(
    '<button type="button" class="sidebarCtrl">側欄選單</button><button type="button" class="searchCtrl">查詢</button>'
  );
  // 重新抓取（因為剛剛 append/prepend 了）
  _sidebar = $('.sidebar');
  _overlay = $('.menu_overlay');
  _mArea = $('.m_area');
  _sidebarClose = $('.sidebarClose');
  _sidebarCtrl = $('.sidebarCtrl');

  _sidebarCtrl.append('<span></span><span></span><span></span>');

  // ====== 打開/關閉側欄 ======
  function showSidebar() {
    _sidebar.show();
    _mArea.show().addClass('open').attr('aria-hidden','false');
    _mArea.animate({ 'margin-left': 0 }, 400, 'easeOutQuint', function () {
      focusFirst(_mArea); // ★ 帶焦點進側欄
    });
    _body.addClass('noscroll');
    _overlay.fadeIn();
    $('.m_search').hide().attr('aria-hidden','true');
    search_mode = false;
    _sidebarCtrl.attr('aria-expanded','true');

    if (releaseSidebarTrap) releaseSidebarTrap();
    releaseSidebarTrap = makeFocusTrap(_mArea); // ★ 焦點圈
  }

  function hideSidebar() {
    _mArea.animate({ 'margin-left': _mArea.width() * -1 + 'px' }, 500, 'easeOutQuint', function () {
      _sidebar.fadeOut(200);
      _mArea.removeClass('open').hide().attr('aria-hidden','true');
      if (releaseSidebarTrap) { releaseSidebarTrap(); releaseSidebarTrap = null; }
      _sidebarCtrl.attr('aria-expanded','false').focus(); // ★ 回焦
    });
    _body.removeClass('noscroll');
    _overlay.fadeOut();
    liHasChild.children('ul').hide();
  }

  // -------------------------------------------- 打開選單動作
  _sidebarCtrl.off().click(function(e) {
    showSidebar();
    e.preventDefault();
  });

  // -------------------------------------------- overlay關閉選單
  _overlay.add(_sidebarClose).off().click(function() { hideSidebar(); });
  _overlay.off('mouseenter');

  // -------------------------------------------- 無障礙tab設定（原碼保留）
  liHasChild.children('a').keyup(function() {
    $(this).siblings('ul').fadeIn();
    $(this).parent('li').siblings().focus(function() { $(this).hide(); });
  });
  _menu2.find('li').keyup(function() { $(this).siblings().children('ul').hide(); });
  _menu2.find('li:last>a').focusout(function() { _menu2.find('li ul').hide(); });

  // 先複製過去
  _member.clone().prependTo(_mArea);
  _nav.clone().prependTo(_mArea);
  _menu.clone().prependTo(_mArea);
  _search.clone().prependTo(_body).removeClass('search').removeAttr('id').addClass('m_search');


  // ====== ARIA for dialog-like regions ======
  if (!_mArea.attr('id')) {
    _mArea.attr({ id:'mobileMenu', role:'dialog', 'aria-modal':'true', 'aria-hidden':'true', 'aria-label':'主選單' });
  }
  _sidebarCtrl.attr({ 'aria-controls':'mobileMenu', 'aria-expanded':'false' });

  var _searchCtrl = $('.searchCtrl');
  var $mSearch = $('.m_search');
  $mSearch.attr({ id:'mobileSearch', role:'dialog', 'aria-modal':'true', 'aria-hidden':'true', 'aria-label':'站內搜尋' });
  _searchCtrl.attr({ 'aria-controls':'mobileSearch', 'aria-expanded':'false' });

  var liHasChild_level1 = $('aside .menu ul').children('li.hasChild'),
    liHasChild_level2 = $('aside .menu ul ul').children('li.hasChild'),
    liHasChild_level3 = $('aside .menu ul ul ul').children('li.hasChild'),
    subMenuWidth = liHasChild.first().children('ul').outerWidth();

  // 切換PC/Mobile 選單
  function mobileMenu() {
    ww = _window.outerWidth();
    if (ww < wwSmall) {
  /*-----------------------------------*/
  /////////////// 手機版設定 /////////////
  /*-----------------------------------*/
  menu_status = false;
  _sidebar.hide();
  _overlay.hide();
  _menu1.hide();
  _mArea.css({ 'margin-left': _mArea.width() * -1 + 'px' });
  _body.off('touchmove');
  $('.m_search').hide();
  $('.peoplerole').find('ul').hide();

  // 先解除舊的「只會展開不會收合」綁定
  liHasChild_level1.off('click mouseenter mouseleave');
  liHasChild_level2.off('click');
  liHasChild_level3.off('click');
  // 也移除你原本那段把第一層 <a> 攔掉但啥也不做的 handler
  $('aside .menu li.hasChild > a').off('.acc');

  // ===== 手風琴 + 鍵盤切換（Enter/Space） =====
  function prepAria($li, idx, lvl){
    var $a = $li.children('a');
    var $sub = $li.children('ul');
    var id  = $sub.attr('id') || ('mSub_' + lvl + '_' + idx);
    $sub.attr({ id:id, hidden: !$sub.is(':visible') });
    $a.attr({ 'aria-controls': id, 'aria-expanded': $sub.is(':visible') ? 'true' : 'false' });
  }
  function toggleLi($li, closeSiblings){
    var $a = $li.children('a');
    var $sub = $li.children('ul');
    var isOpen = $sub.is(':visible');

    if (isOpen){
      $sub.stop(true,true).slideUp(600,'easeOutQuint', function(){ $sub.attr('hidden', true); });
      $a.attr('aria-expanded','false');
    } else {
      if (closeSiblings){
        $li.siblings('.hasChild').each(function(){
          var $sli = $(this), $sa = $sli.children('a'), $ssub = $sli.children('ul');
          $ssub.stop(true,true).slideUp(600,'easeOutQuint', function(){ $ssub.attr('hidden', true); });
          $sa.attr('aria-expanded','false');
        });
      }
      $sub.stop(true,true).slideDown(600,'easeOutQuint', function(){ $sub.attr('hidden', false); });
      $a.attr('aria-expanded','true');
    }
  }

  var $lvl1 = $('aside .menu > ul > li.hasChild');
  var $lvl2 = $('aside .menu ul ul > li.hasChild');
  var $lvl3 = $('aside .menu ul ul ul > li.hasChild');

  $lvl1.each(function(i){ prepAria($(this), i, 1); });
  $lvl2.each(function(i){ prepAria($(this), i, 2); });
  $lvl3.each(function(i){ prepAria($(this), i, 3); });

  // 只把事件綁在 <a> 上：click / Enter / Space 都「切換」
  $('aside .menu li.hasChild > a')
    .off('.acc')
    .on('click.acc', function(e){ e.preventDefault(); toggleLi($(this).parent(), /*closeSiblings*/ true); })
    .on('keydown.acc', function(e){
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLi($(this).parent(), /*closeSiblings*/ true);
      }
    });

} else {
  /*-----------------------------------*/
  /////////////// PC版設定 /////////////
  /*-----------------------------------*/
  hideSidebar();
  _body.removeClass('noscroll');
  $('.m_search').hide().attr('aria-hidden','true');
  search_mode = false;
  menu_mode = false;
  $('.peoplerole').find('ul').hide();

  // 移除手機用的切換事件，避免干擾桌機點擊
  $('aside .menu li.hasChild > a').off('.acc');

  // 原本的 hover/fade 行為保留
  liHasChild.on({
    mouseenter: function(){ $(this).children('ul').stop(true, false).fadeIn(); },
    mouseleave: function(){
      $(this).parent().siblings('ul').hide();
      $(this).children('ul').stop(true, false).fadeOut();
    },
  });
  liHasChild.off('click');

  if (_menu2.length > 0) {
    liHasChild.on({
      mouseenter: function(){ $(this).children('ul').stop(true, false).fadeIn(); },
      mouseleave: function(){
        $(this).parent().siblings('ul').hide();
        $(this).children('ul').stop(true, false).fadeOut();
      },
    });
  }
}

  }

  // 新增：依視窗寬度同步 .search 顯示/隱藏
  function syncSearchVisibility() {
  ww = _window.outerWidth();
  var $d = $('.search');

  if (ww < wwSmall) {
    // 手機寬：一律關掉桌機搜尋
    $d.hide().attr('aria-hidden','true');
    if (_searchSwitch.length) _searchSwitch.attr('aria-expanded','false');
  } else {
    // 桌機寬：依是否 innerheader 決定預設狀態
    if (isInnerHeader) {
      $d.hide().attr('aria-hidden','true');
      if (_searchSwitch.length) _searchSwitch.attr('aria-expanded','false');
    } else {
      $d.show().attr('aria-hidden','false');
      if (_searchSwitch.length) _searchSwitch.attr('aria-expanded','true');
    }
  }
}


  // 手機版 Tab 順序： sidebarCtrl → h1 → searchCtrl
  function orderMobileTab() {
    ww = _window.outerWidth();
    var $h1 = $('header .container > h1');
    if (ww < wwSmall) {
      _sidebarCtrl.insertBefore($h1);
      _searchCtrl.insertAfter($h1);
    } else {
      // 桌機不特別調整
    }
  }

  //行動版/電腦版切換
  var resizeTimer;
  _window.on('resize', function(event) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      $('.m_search').hide().attr('aria-hidden','true');
      mobileMenu();
      syncSearchVisibility();
      orderMobileTab();
    }, 50);
  });

  // 初始執行
  mobileMenu();
  syncSearchVisibility();
  orderMobileTab();

  var menu_mode = false;
  var _menuSwitch = $('.menuSwitch');
  _menu1.hide();
  if (!_menu1.attr('id')) {
  _menu1.attr({ id:'menuPanel', role:'dialog', 'aria-modal':'true', 'aria-hidden':'true', 'aria-label':'主選單' });
}
_menuSwitch.attr({ 'aria-controls':'menuPanel', 'aria-expanded':'false' });

  function menuToggle() {
  if (!menu_mode) {
    _menu1.stop(true, false).slideDown(400, 'easeOutQuint', function(){
      // 打開後：ARIA + 聚焦第一個可聚焦元素
      _menu1.attr('aria-hidden','false');
      focusFirst(_menu1);
      // 焦點圈
      if (releaseMenuTrap) releaseMenuTrap();
      releaseMenuTrap = makeFocusTrap(_menu1);
    });
    menu_mode = true;
    _menuSwitch.attr('aria-expanded','true');
    _body.addClass('noscroll');

    // prevent Android soft keyboard 調整（沿用你的原本邏輯）
    var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
    if (isAndroid) { _window.off('resize'); }
  } else {
    _menu1.hide().attr('aria-hidden','true');
    menu_mode = false;
    _menuSwitch.attr('aria-expanded','false').focus();  // 關閉後把焦點還給觸發鈕
    _body.removeClass('noscroll');
    if (releaseMenuTrap) { releaseMenuTrap(); releaseMenuTrap = null; }
  }
}

  _menuSwitch.off().on('click', function(e) { menuToggle(); e.preventDefault(); });
  _menuSwitch.click(function(e) { _menu1.slideDown(); e.stopPropagation(); });
  _menu1.find('.close').focusout(function(e) { _menu1.hide(); _body.removeClass('noscroll'); e.preventDefault(); });
  _menu1.find('.close').click(function(e) { _menu1.hide(); e.preventDefault(); });

$(".searchSwitch").off('click').on('click', function(e){
  e.preventDefault();
  var $d = $('.search');
  var opening = !$d.is(':visible');

  if (opening){
    $d.stop(true,false).slideDown(200,'easeOutQuint', function(){
      $d.attr('aria-hidden','false');
      $d.find('input[type="text"]:visible').first().trigger('focus');
      bindDesktopSearchBoundary($d);   // ★ 新增：最後 Tab 關閉
    });
  } else {
    closeDesktopSearch();              // ★ 用統一關閉函式
  }
  if (_searchSwitch.length) _searchSwitch.attr('aria-expanded', opening ? 'true' : 'false');
});


  // ====== search 設定：打開聚焦 + 焦點圈 + ARIA ======
  $('.m_search').hide().attr('aria-hidden','true');
  function searchToggle() {
  if (!search_mode) {
    $mSearch.stop(true, false).slideDown(400, 'easeOutQuint', function(){
      var $first = $mSearch.find('input, select, textarea, button, a').filter(':visible').first();
      if ($first.length) $first[0].focus(); else { $mSearch.attr('tabindex','-1')[0].focus(); }
      bindMobileSearchBoundary();     // ★ 新增：最後 Tab 關閉
    });
    search_mode = true;
    _searchCtrl.attr('aria-expanded','true');
    $mSearch.attr('aria-hidden','false');
  } else {
    $mSearch.hide().attr('aria-hidden','true').off('keydown.msearchBoundary'); // ★ 移除監聽
    search_mode = false;
    _searchCtrl.attr('aria-expanded','false').focus();
  }
}

  _searchCtrl.off().on('click', function(e) { searchToggle(); });

  // 點外面關閉 m_search（原邏輯保留）
  $(document.body).click(function(e) {
    if (search_mode) {
      searchToggle();
      search_mode = false;
    }
  });
  $('.m_search ,.searchCtrl').click(function(e) { e.stopPropagation(); });

  // Esc 快捷關閉
// Esc 快捷關閉
$(document).on('keydown._escToClose', function(e){
  if (e.key === 'Escape') {
    // 1) 側欄
    if (_mArea.hasClass('open')) hideSidebar();

    // 2) 行動版搜尋
    if (search_mode) searchToggle();

    // 3) menuSwitch 打開的 menu1
    if (menu_mode && _menu1.is(':visible')) {
      _menu1.hide().attr('aria-hidden','true');
      menu_mode = false;
      _menuSwitch.attr('aria-expanded','false').focus();
      _body.removeClass('noscroll');
      if (releaseMenuTrap) { releaseMenuTrap(); releaseMenuTrap = null; }
    }

    // 4) 桌機版 header 的 .search
    if ($('.search').is(':visible')) {
      $('.search').hide().attr('aria-hidden','true');
      if ($('.searchSwitch').length) {
        $('.searchSwitch').attr('aria-expanded','false').trigger('focus');
      }
    }
  }
});


  /*-----------------------------------*/
  //////////// notice訊息區塊 ////////////
  /*-----------------------------------*/
  $('[class*="notice"] a.close').click(function(e) {
    $(this).parent('[class*="notice"]').hide();
    e.preventDefault();
  });

  /*-----------------------------------*/
  //////////// Accordion設定 ////////////
  /*-----------------------------------*/
  $('.accordion').each(function() {
    $(this).find('.accordion-content').hide();
    var _accordionItem = $(this).children('ul').children('li').children('a');
    _accordionItem.each(function() {
      function accordion(e) {
        $(this).parent('li').siblings().children('a').removeClass('active');
        $(this).toggleClass('active');
        $(this).parent('li').siblings().children('.accordion-content').slideUp();
        $(this).next('.accordion-content').slideToggle();
        e.preventDefault();
      }
      $(this).click(accordion);
      $(this).keyup(accordion);
    });
  });

  /*-----------------------------------*/
  /////////////fatfooter開關/////////////
  /*-----------------------------------*/
  $('.btn-fatfooter').click(function(e) {
    $(this).parent('.container').find('nav>ul>li>ul').stop(true, true).slideToggle(function() {
      if ($(this).is(':visible')) {
        $('.btn-fatfooter').html('收合/CLOSE').attr('name', '收合選單/CLOSE');
      } else {
        $('.btn-fatfooter').html('展開/OPEN').attr('name', '展開選單/OPEN');
      }
    });
    $(this).stop(true, true).toggleClass('close');
  });

  /*-----------------------------------*/
  ////////////////多組Tab////////////////
  /*-----------------------------------*/
  var tab_headerHeight = Math.floor($('.header').outerHeight(true));
  var resizeTimer1;
  _window.resize(function() {
    clearTimeout(resizeTimer1);
    resizeTimer1 = setTimeout(function() {
      ww = _window.outerWidth();
      tabSet();
    }, 50);
  });

  function tabSet() {
    $('.tabs').each(function() {
      var _tab = $(this),
        _tabItem = _tab.find('.tabItem'),
        _tabContent = _tab.find('.tabContent'),
        tabwidth = _tab.width(),
        tabItemHeight = _tabItem.outerHeight(),
        tabContentHeight = _tab.find('.active').next().innerHeight(),
        tiGap = 0,
        tabItemLength = _tabItem.length,
        tabItemWidth;
      _tab.find('.active').next('.tabContent').show();
      if (ww >= wwSmall) {
        _tabContent.css('top', tabItemHeight);
        _tab.height(tabContentHeight + tabItemHeight);
        _tabItem.first().css('margin-left', 0);
      } else {
        _tab.css('height', 'auto');
      }
      _tabItem.focus(tabs);
      _tabItem.click(tabs);
      function tabs(e) {
        var _tabItemNow = $(this),
          tvp = _tab.offset().top,
          tabIndex = _tabItemNow.index() / 2,
          scollDistance = tvp + tabItemHeight * tabIndex - tab_headerHeight;
        _tabItem.removeClass('active');
        _tabItemNow.addClass('active');
        if (ww <= wwSmall) {
          _tabItem.not('.active').next().slideUp();
          _tabItemNow.next().slideDown();
          $('html,body').stop(true, false).animate({ scrollTop: scollDistance });
        } else {
          _tabItem.not('.active').next().hide();
          _tabItemNow.next().show();
          tabContentHeight = _tabItemNow.next().innerHeight();
          _tab.height(tabContentHeight + tabItemHeight);
        }
        e.preventDefault();
      }
    });
  }
  $('.tabs>.tabItem:first-child>a').trigger('click');
  tabSet();

  /*-----------------------------------*/
  ///////////////置頂go to top////////////
  /*-----------------------------------*/
  $(window).on('scroll', function() {
    if ($(this).scrollTop() > 200) $('.scrollToTop').fadeIn();
    else $('.scrollToTop').fadeOut();
  });
  $('.scrollToTop').off().click(function(e) {
    $('html, body').stop().animate({ scrollTop: 0 }, 400, 'linear');
    e.preventDefault();
  });
  $('.scrollToTop').keydown(function(e) {
    $('html, body').stop().animate({ scrollTop: 0 }, 400, 'linear');
    _body.find('a.goCenter').focus();
    e.preventDefault();
  });

  /*--------------------------------------------------------*/
  /////設定img 在IE9+ SAFARI FIREFOX CHROME 可以object-fit/////
  /*--------------------------------------------------------*/
  var userAgent = window.navigator.userAgent;
  var ieReg = /msie|Trident.*rv[ :]*11\./gi;
  var ie = ieReg.test(userAgent);
  if (ie) {
    $('.img-container').each(function() {
      var imgUrl = $(this).find('img').attr('data-src');
      var $container = $(this);
      $container.has('.none').addClass('ie-object-none').css('backgroundImage', 'url(' + imgUrl + ')');
      $container.has('.cover').addClass('ie-object-cover').css('backgroundImage', 'url(' + imgUrl + ')');
      $container.has('.fill').addClass('ie-object-fill').css('backgroundImage', 'url(' + imgUrl + ')');
      $container.has('.contain').addClass('ie-object-contain').css('backgroundImage', 'url(' + imgUrl + ')');
    });
  }

  /*-----------------------------*/
  /////form表單 placeholder隱藏/////
  /*-----------------------------*/
  $('input[type="checkbox"]').off().click(function(e) { $(this).blur(); });

  /*------------------------------------*/
  /////form表單 單個檔案上傳+多個檔案上傳/////
  /*------------------------------------*/
  $(document).on('change', '.check_file', function() {
    var names = [];
    var length = $(this).get(0).files.length;
    for (var i = 0; i < length; ++i) { names.push($(this).get(0).files[i].name); }
    if (length > 2) {
      $(this).closest('.upload_grp').find('.upload_file').attr('value', length + ' files selected');
    } else {
      $(this).closest('.upload_grp').find('.upload_file').attr('value', names);
    }
  });

  /*------------------------------------*/
  //////////分享按鈕 share dropdwon////////
  /*------------------------------------*/
  $('.share').children('ul').hide();
  $('.share').prepend('<a href="#" class="shareButton">share分享按鈕</a>');
  var _shareButton = $('.shareButton');
  _shareButton.off().click(function(e) { $(this).siblings('ul').stop(true, true).slideToggle(); e.preventDefault(); });
  _shareButton.keyup(function(event) { $(this).siblings('ul').stop(true, true).slideDown(); });
  $('.share').find('li:last>a').focusout(function(event) { $(this).parent().parent('ul').hide(); });
  $(document).on('touchend click', function(e) {
    var container = $('.share');
    if (!container.is(e.target) && container.has(e.target).length === 0) { $('.share ul').hide(); }
  });

  /*------------------------------------*/
  /////////////字型大小 font-size//////////
  /*------------------------------------*/
  $('.font_size').find('.small').click(function(e) {
    $(this).parent('li').siblings('li').find('a').removeClass('active');
    $('body').removeClass('large_size').addClass('small_size');
    $(this).blur().addClass('active');
    e.preventDefault();
    createCookie('FontSize', 'small', 356);
  });
  $('.font_size').find('.medium').click(function(e) {
    $(this).parent('li').siblings('li').find('a').removeClass('active');
    $('body').removeClass('large_size small_size');
    $(this).blur().addClass('active');
    e.preventDefault();
    createCookie('FontSize', 'medium', 356);
  });
  $('.font_size').find('.large').click(function(e) {
    $(this).parent('li').siblings('li').find('a').removeClass('active');
    $('body').removeClass('small_size').addClass('large_size');
    $(this).blur().addClass('active');
    e.preventDefault();
    createCookie('FontSize', 'large', 356);
  });

  function createCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toGMTString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
  }
  function readCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  window.onload = function(e) {
    var cookie = readCookie('FontSize');
    if (cookie == 'small') {
      $('body').removeClass('large_size medium_size').addClass('small_size');
      $('.font_size').find('.small').addClass('active');
      e && e.preventDefault && e.preventDefault();
    } else if (cookie == 'large') {
      $('body').removeClass('small_size medium_size').addClass('large_size');
      $('.font_size').find('.large').addClass('active');
      e && e.preventDefault && e.preventDefault();
    } else {
      $('body').removeClass('large_size small_size');
      $('.font_size').find('.medium').addClass('active');
      e && e.preventDefault && e.preventDefault();
    }
  };

  /*-----------------------------------*/
  /////////// category active  //////////
  /*-----------------------------------*/
  $('.category').find('a').off().click(function(event) {
    $(this).parent('li').siblings().find('a').removeClass('active');
    $(this).addClass('active').blur();
  });

  /*-----------------------------------*/
  /////////// 無障礙快捷鍵盤組合  //////////
  /*-----------------------------------*/
  $(document).on('keydown', function(e) {
    if (e.altKey && e.keyCode == 83) { // alt+S 查詢
      $('html, body').animate({ scrollTop: 0 }, 200, 'easeOutExpo');
      $('.search').find('input[type="text"]').focus();
    }
    if (e.altKey && e.keyCode == 85) { // alt+U header
      $('html, body').animate({ scrollTop: 0 }, 200, 'easeOutExpo');
      $('header').find('.accesskey').focus();
    }
    if (e.altKey && e.keyCode == 67) { // alt+C 主要內容區
      $('html, body').stop(true, true).animate({ scrollTop: $('.main').find('.accesskey').offset().top - 70 }, 800, 'easeOutExpo');
      $('.main').find('.accesskey').focus();
    }
    if (e.altKey && e.keyCode == 90) { // alt+Z footer
      $('html, body').stop(true, true).animate({ scrollTop: $('footer').find('.accesskey').offset().top }, 800, 'easeOutExpo');
      $('footer').find('.accesskey').focus();
    }
  });

  // slick 箭頭語系
  if ($('html')[0].hasAttribute('lang')) {
    var weblang = $('html').attr('lang');
    if (weblang.substring(0, 2) == 'zh') {
      $('.slick-prev').attr('title', '上一筆');
      $('.slick-next').attr('title', '下一筆');
    } else {
      $('.slick-prev').attr('title', 'previous');
      $('.slick-next').attr('title', 'next');
    }
  }
  // accesskey title 語系
  var weblang = $('html').attr('lang');
  if (weblang.substring(0, 2) == 'zh') {
    $('header').find('.accesskey').attr('title', '上方功能區塊');
    $('.main').find('.accesskey').attr('title', '中央內容區塊');
    $('footer').find('.accesskey').attr('title', '下方功能區塊');
    $('.search').find('.accesskey').attr('title', '關鍵字搜尋：文章關鍵字搜尋');
  } else {
    $('header').find('.accesskey').attr('title', 'header');
    $('.main').find('.accesskey').attr('title', 'content');
    $('footer').find('.accesskey').attr('title', 'footer');
    $('.search').find('.accesskey').attr('title', 'search');
  }

  /*------------------------------------*/
  /////gotoCenter on focus跳到 content/////
  /*------------------------------------*/
  $('a.goCenter').keydown(function(e) {
    if (e.which == 13) {
      $('#aC').focus();
      $('html, body').stop(true, true).animate({ scrollTop: $('.main').find('.accesskey').offset().top }, 800, 'easeOutExpo');
    }
  });

  /*-----------------------------------*/
  //////// 分眾模組 無障礙遊走設定  ////////
  /*-----------------------------------*/
  $('.peoplerole').find('ul').hide();
  var openLang = $('.peoplerole').children('a');
  openLang.off().click(function(e) { $(this).next('ul').stop(true, true).slideToggle(); e.preventDefault(); });
  openLang.keyup(function() { $(this).next('ul').stop(true, true).slideDown(); });
  $('.peoplerole').find('ul li:last>a').focusout(function() { $('.peoplerole').find('ul').hide(); });
  $(document).on('touchend click', function(e) {
    var target = e.target;
    if (!$(target).is('.peoplerole a')) { $('.peoplerole').find('ul').hide(); }
  });

  /*------------------------------------*/
  // ///////table 加上響應式 scroltable-wrapper/////
  /*------------------------------------*/
  $('table').each(function(index, el) {
    if (
      $(this).parents('.table_list').length == 0 &&
      $(this).parents('.fix_th_table').length == 0 &&
      $(this).parent('form').length == 0
    ) {
      $(this).scroltable();
    }
  });
  $('.scroltable-nav-left').append('<div class="tablearrow_left" style="display:none;"></div>');
  $('.scroltable-nav-right').append('<div class="tablearrow_right"  style="display:none;"></div>');

  function table_Arrow() {
    if (
      $('table').parents('.table_list').length == 0 &&
      $('table').parents('.fix_th_table').length == 0 &&
      $(this).parent('form').length == 0
    ) {
      if ($('.scroltable-wrapper').length > 0) {
        var stickyArrowTop = Math.floor($('.scroltable-wrapper').offset().top),
          thisScroll = Math.floor($(this).scrollTop());
        if (thisScroll > stickyArrowTop - 230) {
          $('.scroltable-wrapper .tablearrow_left').css('display', 'block').css({ top: thisScroll - stickyArrowTop + 220 }, 100, 'easeOutQuint');
          $('.scroltable-wrapper .tablearrow_right').css('display', 'block').css({ top: thisScroll - stickyArrowTop + 220 }, 100, 'easeOutQuint');
        } else {
          $('.scroltable-wrapper .tablearrow_left').css({ top: '10px', display: 'none' });
          $('.scroltable-wrapper .tablearrow_right').css({ top: '10px', display: 'none' });
        }
      }
    }
  }
  $(window).scroll(function(event) { table_Arrow(); });
  var scrollTimer;
  _window.scroll(function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() { table_Arrow(); }, 50);
  });

  /*------------------------------------*/
  // //////////table 加上 data-title//////////
  /*------------------------------------*/
  function rwdTable() {
    $('.table_list').find('table').each(function() {
      var $row = $(this).find('tr');
      rowCount = $row.length;
      for (var n = 1; n <= rowCount; n++) {
        $(this).find('th').each(function(index) {
          var thText = $(this).text();
          $row.eq(n).find('td').eq(index).attr('data-title', thText);
        });
      }
    });
  }
  rwdTable();

  /*-----------------------------------*/
  ////////////// lazy load //////////////
  /*-----------------------------------*/
  var lazyLoadInstance = new LazyLoad({
    elements_selector: 'img.lazy',
    placeholder: '/images/basic/placeholder.gif',
    effect: 'fadeIn',
    fadeTime: 600,
    threshold: 0,
  });
});
