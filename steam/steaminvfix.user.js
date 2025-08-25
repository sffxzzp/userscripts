// ==UserScript==
// @name         Steam Inventory Temp Fix
// @namespace    https://github.com/sffxzzp
// @version      0.02
// @description  nothing.
// @author       sffxzzp
// @match        *://steamcommunity.com/*/inventory
// @icon         https://store.steampowered.com/favicon.ico
// @grant        unsafeWindow
// @updateURL    https://github.com/sffxzzp/userscripts/raw/master/steam/steaminvfix.user.js
// @downloadURL  https://github.com/sffxzzp/userscripts/raw/master/steam/steaminvfix.user.js
// ==/UserScript==

(function() {
    unsafeWindow.CInventory.prototype.LoadCompleteInventory = function()
    {
        if ( this.m_bFullyLoaded ) {
            return unsafeWindow.$J.Deferred().resolve();
        }

        if ( !this.m_promiseLoadCompleteInventory )
        {
            var _this = this;
            this.m_promiseLoadCompleteInventory = this.LoadUntilConditionMet( function() { return _this.m_bFullyLoaded; }, 1000 /* a lot at a time */ );
        }

        return this.m_promiseLoadCompleteInventory;
    };
    unsafeWindow.CInventory.prototype.LoadMoreAssets = function( count )
    {
        if ( this.m_ActivePromise ) {
            return this.m_ActivePromise;
        }

        if ( this.m_bFullyLoaded ) {
            return unsafeWindow.$J.Deferred().resolve().promise();
        }

        // we won't re-request for 5 seconds after a failure
        if ( this.m_tsLastError && unsafeWindow.$J.now() - this.m_tsLastError < 5000 ) {
            return unsafeWindow.$J.Deferred().reject().promise();
        }

        this.m_$Inventory.addClass('loading');
        var _this = this;

        // force it to be 1000 max
        count = this.m_bPerformedInitialLoad ? 1000 : 75;

        var params = {
            'l': 'schinese',
            'count': count
        };

        if ( typeof(unsafeWindow.g_bIsInMarketplace) != 'undefined' && unsafeWindow.g_bIsInMarketplace ) {
            params.market = 1;
        }

        if ( this.m_ulLastAssetID ) {
            params.start_assetid = this.m_ulLastAssetID;
        }

        this.m_owner.ShowLoadingIndicator();

        return this.SetActivePromise( unsafeWindow.$J.get( this.GetInventoryLoadURL(), params ).done( function( data ) {
            _this.m_bPerformedInitialLoad = true;
            _this.m_$Inventory.removeClass('loading');
            _this.AddInventoryData( data );
            _this.m_tsLastError = 0;
            _this.HideInventoryLoadError();
            _this.m_SingleResponsivePage.EnsurePageItemsCreated();

            if ( _this.m_parentInventory ) {
                _this.m_parentInventory.m_SingleResponsivePage.EnsurePageItemsCreated();
            }

        }).fail( function() {
            _this.m_tsLastError = unsafeWindow.$J.now();
            _this.ShowInventoryLoadError();
        }).always( function() {
            _this.m_owner.HideLoadingIndicator();
        }) ).done( function() {
            // intentionally done outside SetActivePromise so active promise will bset.
            for ( var i = 0; i < _this.m_rgOnItemsLoadedCallbacks.length; i++ ) {
                _this.m_rgOnItemsLoadedCallbacks[i]();
            }
        }).promise();
    };
})();
