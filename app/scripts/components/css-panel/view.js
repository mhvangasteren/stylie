define([

  'underscore'
  ,'lateralus'

  ,'text!./template.mustache'

], function (

  _
  ,Lateralus

  ,template

) {
  'use strict';

  var Base = Lateralus.Component.View;
  var baseProto = Base.prototype;

  var VENDORS = [
    { id: 'mozilla', label: 'Mozilla' }
    ,{ id: 'microsoft', label: 'Microsoft' }
    ,{ id: 'opera', label: 'Opera' }
    ,{ id: 'webkit', label: 'WebKit' }
    ,{ id: 'w3', label: 'W3C' }
  ];

  var CssPanelComponentView = Base.extend({
    template: template

    ,lateralusEvents: {
      timelineModified: function () {
        if (this.$el.is(':visible')) {
          this.renderCss();
        }
      }

      /**
       * @param {jQuery} $shownContent
       */
      ,tabShown: function ($shownContent) {
        if ($shownContent.is(this.$el)) {
          this.renderCss();
        }
      }
    }

    ,events: {
      /**
       * @param {jQuery.Event} evt
       */
      'submit form': function (evt) {
        evt.preventDefault();
      }

      ,'keyup .update-on-keyup': function () {
        this.renderCss();
      }

      ,'change .update-on-change': function () {
        this.renderCss();
      }

      ,'change .orientation-form': function () {
        var orientation = _.findWhere(
            this.$orientationForm.serializeArray()
            ,{ name: 'orientation' }
          ).value;

        this.setUserSelectedOrientation(orientation);
      }
    }

    /**
     * @param {Object} [options] See http://backbonejs.org/#View-constructor
     */
    ,initialize: function () {
      baseProto.initialize.apply(this, arguments);

      this.$w3Checkbox.prop('checked', true);
    }

    ,deferredInitialize: function () {
      this.renderCss();
    }

    ,getTemplateRenderData: function () {
      var renderData = baseProto.getTemplateRenderData.apply(this, arguments);
      var orientToFirstKeyframe =
        this.lateralus.getUi('cssOrientation') === 'first-keyframe';

      _.extend(renderData, {
        vendors: VENDORS
        ,orientToFirstKeyframe: orientToFirstKeyframe
      });

      return renderData;
    }

    /**
     * @param {string} orientation "first-keyframe" or "top-left"
     */
    ,setUserSelectedOrientation: function (orientation) {
      this.lateralus.setUi('cssOrientation', orientation);
      this.renderCss();
    }

    ,renderCss: function () {
      var cssOpts = this.lateralus.getCssConfigObject();

      var css = this.lateralus.rekapiComponent.getCssString(cssOpts);
      this.$generatedCss.val(css);
    }

    /**
     * @return {Array.<string>}
     */
    ,getSelectedVendorList: function () {
      var accumulator = [];

      VENDORS.forEach(function (vendor) {
        var id = vendor.id;

        if (this['$' + id + 'Checkbox'].is(':checked')) {
          accumulator.push(id);
        }
      }, this);

      return accumulator;
    }

    /**
     * @return {{
     *   name: string,
     *   fps: number,
     *   vendors: Array.<string>
     * }}
     */
    ,toJSON: function () {
      return {
        name: this.$className.val()
        ,fps: +this.$cssSizeOutput.val()
        ,vendors: this.getSelectedVendorList()
      };
    }
  });

  return CssPanelComponentView;
});
