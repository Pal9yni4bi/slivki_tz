function overrideInitMap() {
/*    L.SmallPopup = L.Class.extend({
        includes : L.Mixin.Events,
        options : {
            minWidth : 50,
            maxWidth : 300,
            autoPan : true,
            closeButton : true,
            offset : new L.Point(0, 2),
            autoPanPadding : new L.Point(5, 5),
            className : "-small"
        },
        initialize : function(a, b) {
            L.Util.setOptions(this, a);
            this.setLatLng(a);
            this.setContent(a.content);
            this._source = b
        },
        onAdd : function(a) {
            this._map = a;
            if (!this._container) {
                this._initLayout()
            }
            this._updateContent();
            this._container.style.opacity = "0";
            this._map._panes.popupPane.appendChild(this._container);
            this._map.on("viewreset", this._updatePosition, this);
            if (this._map.options.closePopupOnClick) {
                this._map.on("preclick", this._close, this)
            }
            this._update();
            this._container.style.opacity = "1";
            this._opened = true;
            this._expanded = false;
        },
        onRemove : function(a) {
            a._panes.popupPane.removeChild(this._container);
            L.Util.falseFn(this._container.offsetWidth);
            a.off("viewreset", this._updatePosition, this);
            a.off("click", this._close, this);
            this._container.style.opacity = "0";
            this._opened = false;
            this._expanded = false;
        },
        setLatLng : function(a) {

            this._latlng = new L.LatLng(a.lat, a.lon);
            if (this._opened) {
                this._update()
            }
            return this
        },
        setContent : function(a) {
            this._content = a;
            return this
        },
        _close : function() {
            this._container.style.cursor = "pointer";
            this._container.style.zIndex = "";
            this._closeButton.style.visibility = "hidden";
            this.setContent(this.annotation);
            this._update();
            this._expanded = false;
        },
        _initLayout : function() {
            this._container = L.DomUtil.create("div", "leaflet-popup " + this.options.className);
            if (this.options.closeButton) {
                this._closeButton = L.DomUtil.create("a", "leaflet-popup-close-button", this._container);
                this._closeButton.href = "#close";
                this._closeButton.style.visibility = "hidden";
                this._container.style.cursor = "pointer";
                L.DomEvent.addListener(this._closeButton, "click", this._onCloseButtonClick, this)
            }

            this._wrapper = L.DomUtil.create("div", "leaflet-popup-content-wrapper", this._container);
            L.DomEvent.addListener(this._wrapper, "click", this._onWrapperClick, this)
            L.DomEvent.disableClickPropagation(this._wrapper);
            this._contentNode = L.DomUtil.create("div", "leaflet-popup-content", this._wrapper);
            this._contentNode.style.margin = "8px 10px";
            this._tipContainer = L.DomUtil.create("div", "leaflet-popup-tip-container", this._container);
            this._tip = L.DomUtil.create("div", "leaflet-popup-tip", this._tipContainer)
        },
        _update : function() {
            this._container.style.visibility = "hidden";
            this._updateContent();
            this._updateLayout();
            this._updatePosition();
            this._container.style.visibility = "";
            this._adjustPan()
        },
        _updateContent : function() {
            if (!this._content) {
                return
            }
            if ( typeof this._content === "string") {
                this._contentNode.innerHTML = this._content
            } else {
                this._contentNode.innerHTML = "";
                this._contentNode.appendChild(this._content)
            }
        },
        _updateLayout : function() {
            this._container.style.width = "";
            this._container.style.whiteSpace = "nowrap";
            var a = this._container.offsetWidth;
            this._container.style.width = (a > this.options.maxWidth ? this.options.maxWidth : a < this.options.minWidth ? this.options.minWidth : a) + "px";
            this._container.style.whiteSpace = "";
            this._containerWidth = this._container.offsetWidth
        },
        _updatePosition : function() {
            var a = this._map.latLngToLayerPoint(this._latlng);
            this._containerBottom = -a.y - this.options.offset.y;
            this._containerLeft = a.x - Math.round(this._containerWidth / 2) + this.options.offset.x;
            this._container.style.bottom = this._containerBottom + "px";
            this._container.style.left = this._containerLeft + "px"
        },
        _adjustPan : function() {
            if (!this.options.autoPan) {
                return
            }
            var a = this._container.offsetHeight, b = new L.Point(this._containerLeft, -a - this._containerBottom), c = this._map.layerPointToContainerPoint(b), d = new L.Point(0, 0), e = this.options.autoPanPadding, f = this._map.getSize();
            if (c.x < 0) {
                d.x = c.x - e.x
            }
            if (c.x + this._containerWidth > f.x) {
                d.x = c.x + this._containerWidth - f.x + e.x
            }
            if (c.y < 0) {
                d.y = c.y - e.y
            }
            if (c.y + a > f.y) {
                d.y = c.y + a - f.y + e.y
            }
            if (d.x || d.y) {
                this._map.panBy(d)
            }
        },
        _openPopup: function() {
            this._container.style.cursor = "auto";
            this._expanded = true;
            this._closeButton.style.visibility = "visible";
            this._container.style.zIndex = "100";
            this.setContent(this.description);
            this._update();
        },
        _onCloseButtonClick : function(a) {
            if(this._opened)
                this._close();
            L.DomEvent.stop(a)
        },
        _onWrapperClick : function(a) {
            if(!this._expanded)
            {
                this._openPopup();
                L.DomEvent.stop(a);
            }
        }
    });*/

    L.Map.ScrollWheelZoom=L.Handler.extend({
        addHooks:function() {
            L.DomEvent.addListener(this._map._container,"mousewheel",this._onWheelScroll,this);
            this._delta=0;
        },
        removeHooks:function() {
            L.DomEvent.removeListener(this._map._container,"mousewheel",this._onWheelScroll);
        },
        //We do nothing in method _onWheelScroll for disable mouse scroll zoom
        _onWheelScroll:function(a){
            /*var b=L.DomEvent.getWheelDelta(a);
            this._delta+=b;
            this._lastMousePos=this._map.mouseEventToContainerPoint(a);
            clearTimeout(this._timer);
            this._timer=setTimeout(L.Util.bind(this._performZoom,this),50);
            L.DomEvent.preventDefault(a)*/
        },
        _performZoom:function() {
            var a=this._map,b=Math.round(this._delta),c=a.getZoom();
            b=Math.max(Math.min(b,4),-4);
            b=a._limitZoom(c+b)-c;
            this._delta=0;
            if(!b) {
                return
            }
            var d=this._getCenterForScrollWheelZoom(this._lastMousePos,b),e=c+b;a.setView(d,e);
        },
        _getCenterForScrollWheelZoom:function(a,b) {
            var c=this._map,d=c.getPixelBounds().getCenter(),e=c.getSize().divideBy(2),f=a.subtract(e).multiplyBy(1-Math.pow(2,-b)),g=d.add(f);
            return c.unproject(g,c._zoom,true);
        }
    });
}