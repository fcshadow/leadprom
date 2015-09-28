/**
 * Created by developer123 on 24.02.15.
 */
var AppDispatcher = require('../dispatcher/AppDispatcher');
var TemplatesConstants = require('../constants/TemplatesConstants');

var TemplatesActions = {

    saveList: function (list) {
        AppDispatcher.dispatch({
            actionType: TemplatesConstants.SAVE_TEMPLATES,
            list: list
        });
    },

    uploadedTemplate: function (tmpl) {
        AppDispatcher.dispatch({
            actionType: TemplatesConstants.UPLOAD_TEMPLATE,
            template: tmpl
        });
    },

    reloadTemplates: function () {
        AppDispatcher.dispatch({
            actionType: TemplatesConstants.RELOAD_TEMPLATES
        });
    },

    selectTemplate: function (Id) {
        AppDispatcher.dispatch({
            actionType: TemplatesConstants.SELECT_OBJECT,
            Id: Id
        });
    },

    clearSelection: function () {
        AppDispatcher.dispatch({
            actionType: TemplatesConstants.CLEAR_SELECTION
        });
    }

};

module.exports = TemplatesActions;