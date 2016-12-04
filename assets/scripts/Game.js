var Common = require('JoystickCommon');
var JoystickBG = require('JoystickBG');

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
            type: JoystickBG,
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
        // this._stickBG = this.node.parent.getComponent('Game');
        this._initTouchEvent();
    },
    _createStickSprite: function()
    {
        //调整摇杆的位置
        this.stickBG.node.setPosition(this.stickX, this.stickY);
        this.stick.setPosition(this.stickX, this.stickY);
        //this.node.setPosition(this.stickX, this.stickY);

    },
    //对圆圈的触摸监听
    _initTouchEvent: function()
    {
        var self = this;
        self.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            var touchPos = self.node.convertToNodeSpaceAR(event.getLocation());
            if(self.touchType == Common.TouchType.FOLLOW){
                self.stickBG.node.setPosition(touchPos);
                self.stick.setPosition(touchPos);
                self._ww = touchPos;
            }
        }, self);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if(self.touchType == Common.TouchType.FOLLOW){
                var touchPos = self.stickBG.node.convertToNodeSpaceAR(event.getLocation());
                var distance = self.stickBG._getDistance(touchPos,cc.p(0,0));
                var radius = self.stickBG.node.width / 2;
                if(radius > distance)
                {
                    var x = self._ww.x + touchPos.x;
                    var y = self._ww.y + touchPos.y;
                    self.stick.setPosition(cc.p(x, y));
                }
                else
                {
                    //控杆永远保持在圈内，并在圈内跟随触摸更新角度
                    //cc.log(self.node.getPosition());
                    //var x = self.stickBG.node.getPositionX() + Math.cos(self.stickBG._getRadian(touchPos)) * radius;
                    //var y = self.stickBG.node.getPositionY() + Math.sin(self.stickBG._getRadian(touchPos)) * radius;
                    var x =  self._ww.x + touchPos.x+ Math.cos(self.stickBG._getRadian(touchPos)) * radius;
                    var y =  self._ww.y + touchPos.y+ Math.sin(self.stickBG._getRadian(touchPos)) * radius;
                    self.stick.setPosition(cc.p(x, y));
                }
                //更新角度
                self.stickBG._getAngle(touchPos);
                //设置实际速度
                self.stickBG._setSpeed(touchPos);
            }
        }, self);
        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.stick.setPosition(self.stickBG.node.getPosition());
            self.stickBG._speed = 0;
        }, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            self.stick.setPosition(self.stickBG.node.getPosition());
            self.stickBG._speed = 0;
        }, self);
        
    } 

});
