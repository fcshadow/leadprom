/**
 * Created by developer123 on 17.02.15.
 */
 var React = require('react');
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Button = require('react-bootstrap').Button;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;
var ProgressBar = require('react-bootstrap').ProgressBar;
var $ = require('jquery');
var _ = require('underscore');
var ModalActions = require('../actions/ModalActions');
var AlertActions = require('../actions/AlertActions');
var TemplatesActions = require('../actions/TemplatesActions');
var TemplatesStore = require('../stores/TemplatesStore');
var fluorineurl = Storage('api') || "";

var TemplatesControlPanel = React.createClass({

    getInitialState:function() {
        return {
            mode:""
        }
    },

    uploadSimulation: function (event) {
        event.preventDefault();
        $('#tmplupload').click();
    },

    handleUpload: function () {
        var filename = $('input#tmplupload')[0].files[0].name;
        var flag = TemplatesStore.isInList(filename);
        if (!flag) {
            var fd = new FormData($('form.uploadform')[0]),
                over=this,
                headers = JSON.parse(Storage('defaultheaders'));
            sendRequest(fluorineurl + '/admin/templates', "POST", fd, headers, function (data) {
                over.setState({mode: "uploaded"}, null);
                if (data.status != 'ok')
                    if (data.statusCode != 200)
                        AlertActions.showError(data.error, "danger");
                    else
                        AlertActions.showError(data.status, "danger");
                else {
                    AlertActions.showError("File is succesfully uploaded", "success");
                    TemplatesActions.reloadTemplates();
                }
            }, true, function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    over.setState({mode: "uploading"}, null);
                    myXhr.upload.addEventListener('progress', function showProgress(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = (evt.loaded / evt.total) * 100;
                            over.setState({nowperc: percentComplete}, null);
                        }
                    }, false);
                } else
                    console.warn("Uploadress is not supported.");
                return myXhr;
            }, false, "!true");
        } else AlertActions.showError("Template with this name is already uploaded", "danger");
        $('#tmplupload').val('');
    },

    render: function () {
        if (this.state.mode == "uploading")
            return (
                <ProgressBar className="uploadbar" bsStyle="warning" active min={0} max={100} now={this.state.nowperc} label='%(percent)s%' />
            );
        else
        return (
            <div className="controlpanel">
                <form className="uploadform">
                    <input id="tmplupload" name="file" type="file" multiple onChange={this.handleUpload} accept=".dwg,.dwt,application/acad,image/vnd.dwg,image/vnd.dwt" />
                </form>
                <ButtonToolbar>
                    <ButtonGroup>
                        <OverlayTrigger  placement="top" overlay={<Tooltip className="lefttooltip">Upload template</Tooltip>}>
                            <Button className="imginner" onClick={this.uploadSimulation}>
                                <img src={Storage('path') + "images/upload.png"} />
                            </Button>
                        </OverlayTrigger>
                    </ButtonGroup>
                </ButtonToolbar>
            </div>
        )
    }
});

module.exports = TemplatesControlPanel;