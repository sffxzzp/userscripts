// ==UserScript==
// @name         Steam Market Show More
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  Show more price listing in market page.
// @author       sffxzzp
// @match        *://steamcommunity.com/market/listings/*/*
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/marketshowmore.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/marketshowmore.user.js
// @run-at       document-start
// ==/UserScript==

(function() {
    // 需要显示的行数范围 0-100
    var num = 100;

    unsafeWindow.Market_LoadOrderSpread = function (item_nameid) {
        unsafeWindow.$J.ajax( {
            url: 'https://steamcommunity.com/market/itemordershistogram',
            type: 'GET',
            data: {
                country: unsafeWindow.g_strCountryCode,
                language: unsafeWindow.g_strLanguage,
                currency: typeof( unsafeWindow.g_rgWalletInfo ) != 'undefined' && unsafeWindow.g_rgWalletInfo.wallet_currency != 0 ? unsafeWindow.g_rgWalletInfo.wallet_currency : 1,
                item_nameid: item_nameid,
                two_factor: unsafeWindow.BIsTwoFactorEnabled() ? 1 : 0
            }
        } ).error( function ( ) {
        } ).success( function( data ) {
            if ( data.success == 1 )
            {
                var sell_order_table = `<table class="market_commodity_orders_table"><tr><th align="right">价格</th><th align="right">数量</th></tr>`;
                for (var i = 0; i <= num-1; i++) {
                    if (i == num-1) {
                        sell_order_table += `<tr><td align="right" class="">${data.price_prefix} ${data.sell_order_graph[i][0].toFixed(2)} ${data.price_suffix} 或更高</td><td align="right">${data.sell_order_graph[100][1]-data.sell_order_graph[i][1]}</td></tr>`;
                    } else {
                        sell_order_table += `<tr><td align="right" class="">${data.price_prefix} ${data.sell_order_graph[i][0].toFixed(2)} ${data.price_suffix}</td><td align="right">${data.sell_order_graph[i+1][1]-data.sell_order_graph[i][1]}</td></tr>`;
                    }
                }
                sell_order_table += `</table>`;
                var buy_order_table = `<table class="market_commodity_orders_table"><tr><th align="right">价格</th><th align="right">数量</th></tr>`;
                for (var j = 0; j <= num-1; j++) {
                    if (j == num-1) {
                        buy_order_table += `<tr><td align="right" class="">${data.price_prefix} ${data.buy_order_graph[j][0].toFixed(2)} ${data.price_suffix} 或更低</td><td align="right">${data.buy_order_graph[100][1]-data.buy_order_graph[j][1]}</td></tr>`;
                    } else {
                        buy_order_table += `<tr><td align="right" class="">${data.price_prefix} ${data.buy_order_graph[j][0].toFixed(2)} ${data.price_suffix}</td><td align="right">${data.buy_order_graph[j+1][1]-data.buy_order_graph[j][1]}</td></tr>`;
                    }
                }
                buy_order_table += `</table>`;
                unsafeWindow.$J('#market_commodity_forsale').html( data.sell_order_summary );
                unsafeWindow.$J('#market_commodity_forsale_table').html( sell_order_table );
                unsafeWindow.$J('#market_commodity_buyrequests').html( data.buy_order_summary );
                unsafeWindow.$J('#market_commodity_buyreqeusts_table').html( buy_order_table );

                // set in the purchase dialog the default price to buy things (which should almost always be the price of the cheapest listed item)
                if ( data.lowest_sell_order && data.lowest_sell_order > 0 ) {
                    unsafeWindow.CreateBuyOrderDialog.m_nBestBuyPrice = data.lowest_sell_order;
                } else if ( data.highest_buy_order && data.highest_buy_order > 0 ) {
                    unsafeWindow.CreateBuyOrderDialog.m_nBestBuyPrice = data.highest_buy_order;
                }

                // update the jplot graph
                // we do this infrequently, since it's really expensive, and makes the page feel sluggish
                var $elOrdersHistogram = unsafeWindow.$J('#orders_histogram');
                if ( unsafeWindow.Market_OrderSpreadPlotLastRefresh
                    && unsafeWindow.Market_OrderSpreadPlotLastRefresh + (60*60*1000) < unsafeWindow.$J.now()
                    && $elOrdersHistogram.length )
                {
                    $elOrdersHistogram.html('');
                    unsafeWindow.Market_OrderSpreadPlot = null;
                }

                if ( unsafeWindow.Market_OrderSpreadPlot == null && $elOrdersHistogram.length )
                {
                    unsafeWindow.Market_OrderSpreadPlotLastRefresh = unsafeWindow.$J.now();

                    $elOrdersHistogram.show();
                    var line1 = data.sell_order_graph;
                    var line2 = data.buy_order_graph;
                    var numXAxisTicks = null;
                    if ( unsafeWindow.$J(window).width() < 400 )
                    {
                        numXAxisTicks = 3;
                    }
                    else if ( unsafeWindow.$J(window).width() < 600 )
                    {
                        numXAxisTicks = 4;
                    }

                    var numYAxisTicks = 11;
                    var strFormatPrefix = data.price_prefix;
                    var strFormatSuffix = data.price_suffix;
                    var lines = [ line1, line2 ];

                    unsafeWindow.Market_OrderSpreadPlot = unsafeWindow.$J.jqplot('orders_histogram', lines, {
                        renderer: unsafeWindow.$J.jqplot.BarRenderer,
                        rendererOptions: {fillToZero: true},
                        title:{text: '订购单和销售单（累积）', textAlign: 'left' },
                        gridPadding:{left: 45, right:45, top:45},
                        axesDefaults:{ showTickMarks:false },
                        axes:{
                            xaxis:{
                                tickOptions:{formatString:strFormatPrefix + '%0.2f' + strFormatSuffix, labelPosition:'start', showMark: false},
                                numberTicks: numXAxisTicks,
                                min: data.graph_min_x,
                                max: data.graph_max_x
                            },
                            yaxis: {
                                pad: 1,
                                tickOptions:{formatString:'%d'},
                                numberTicks: numYAxisTicks,
                                min: 0,
                                max: data.graph_max_y
                            }
                        },
                        grid: {
                            gridLineColor: '#1b2939',
                            borderColor: '#1b2939',
                            background: '#101822'
                        },
                        cursor: {
                            show: true,
                            zoom: true,
                            showTooltip: false
                        },
                        highlighter: {
                            show: true,
                            lineWidthAdjust: 2.5,
                            sizeAdjust: 5,
                            showTooltip: true,
                            tooltipLocation: 'n',
                            tooltipOffset: 20,
                            fadeTooltip: true,
                            yvalues: 2,
                            formatString: "<span style=\"display: none\">%s%s</span>%s"
                        },
                        series: [{lineWidth:3, fill: true, fillAndStroke:true, fillAlpha: 0.3, markerOptions:{show: false, style:'circle'}}, {lineWidth:3, fill: true, fillAndStroke:true, fillAlpha: 0.3, color:'#6b8fc3', markerOptions:{show: false, style:'circle'}}],
                        seriesColors: [ "#688F3E" ]
                    });
                }
            }
        } );
    }
})();
