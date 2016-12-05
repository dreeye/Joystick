var Common = require('JoystickCommon');
var JoystickBG = require('JoystickBG');

cc.Class({
    extends: cc.Component,

    properties: {
        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆节点',
        },
        ring: {
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
    
        _stickPos: {
            default: null,
            type: cc.Node,
            displayName: '摇杆当前位置',
        },   

        _touchLocation: {
            default: null,
            type: cc.Node,
            displayName: '摇杆当前位置',

        }
    },

    onLoad: function () {
        this._createStickSprite();
        //当触摸类型为FOLLOW会在此对圆圈的触摸监听
        if(this.touchType == Common.TouchType.FOLLOW){
            this._initTouchEvent();
        }
    },

    _createStickSprite: function()
    {
        //调整摇杆的位置
        this.ring.node.setPosition(this.stickX, this.stickY);
        this.dot.setPosition(this.stickX, this.stickY);
    },

    _initTouchEvent: function()
    {
        var self = this;

        self.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            // 记录触摸的世界坐标，给touch move使用
            self._touchLocation = event.getLocation();
            var touchPos = self.node.convertToNodeSpaceAR(event.getLocation());
            // 更改摇杆的位置
            self.ring.node.setPosition(touchPos);
            self.dot.setPosition(touchPos);
            // 记录摇杆位置，给touch move使用
            self._stickPos = touchPos;
        }, self);

        self.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            // 如果touch start位置和touch move相同，禁止移动
            if (self._touchLocation.x == event.getLocation().x && self._touchLocation.y == event.getLocation().y){
                return false;
            }
            // 以圆圈为锚点获取触摸坐标
            var touchPos = self.ring.node.convertToNodeSpaceAR(event.getLocation());
            var distance = self.ring._getDistance(touchPos,cc.p(0,0));
            var radius = self.ring.node.width / 2;

            // 由于摇杆的postion是以父节点为锚点，所以定位要加上touch start时的位置
            var posX = self._stickPos.x + touchPos.x;
            var posY = self._stickPos.y + touchPos.y;
            if(radius > distance)
            {
                self.dot.setPosition(cc.p(posX, posY));
            }
            else
            {
                //控杆永远保持在圈内，并在圈内跟随触摸更新角度
                var x = self._stickPos.x + Math.cos(self.ring._getRadian(cc.p(posX,posY))) * radius;
                var y = self._stickPos.y + Math.sin(self.ring._getRadian(cc.p(posX,posY))) * radius;
                self.dot.setPosition(cc.p(x, y));
            }
            //更新角度
            self.ring._getAngle(cc.p(posX,posY));
            //设置实际速度
            self.ring._setSpeed(cc.p(posX,posY));
        }, self);
        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            self.dot.setPosition(self.ring.node.getPosition());
            self.ring._speed = 0;
        }, self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            self.dot.setPosition(self.ring.node.getPosition());
            self.ring._speed = 0;
        }, self);

        
    } 

});
