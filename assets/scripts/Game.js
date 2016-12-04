var Common = require('JoystickCommon');

cc.Class({
    extends: cc.Component,

    properties: {
        stick: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点',
        },
        stickBG: {
            default: null,
            type: cc.Node,
            displayName: '摇杆背景节点',
        },
        stickX: {
            default: 0,
            displayName: '摇杆X位置',
        },

        stickY: {
            default: 0,
            displayName: '摇杆Y位置',
        },
        touchType: {
            default: Common.TouchType.DEFAULT,
            type: Common.TouchType,
            displayName: '触摸类型',
        },   
        directionType: {
            default: Common.DirectionType.ALL,
            type: Common.DirectionType,
            displayName: '方向类型',

        },   
        sprite: {
            default: null,
            type: cc.Node,
            displayName: '操控的目标',

        },      
    },

    // use this for initialization
    onLoad: function () {
        this._createStickSprite();

    },
    _createStickSprite: function()
    {
        //调整摇杆的位置
        //this.stickBG.setPosition(this.stickX, this.stickY);
        //this.stick.setPosition(this.stickX, this.stickY);
        this.node.setPosition(this.stickX, this.stickY);

    },

});
