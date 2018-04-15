let Common = require('JoystickCommon');
let RoleControl = require('RoleControl');

cc.Class({
    extends: cc.Component,

    properties: {
        dot: {
            default: null,
            type: cc.Node,
            displayName: '摇杆操纵点',
        },
        ring: {
            default: null,
            type: cc.Node,
            displayName: '摇杆背景节点',
        },
        player: {
            default: null,
            type: RoleControl,
            displayName: '操控的角色',
        },

        stickX: {
            default: 0,
            displayName: '摇杆 X 位置',
        },
        stickY: {
            default: 0,
            displayName: '摇杆 Y 位置',
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
    
        _stickPos: {
            default: null,
            type: cc.Node,
            displayName: '摇杆当前位置',
        },   

        _touchLocation: {
            default: null,
            type: cc.Node,
            displayName: '摇杆当前位置',

        },

        _angle: {
            default: 90,
            displayName: '当前触摸的角度',
        },

        _radian: {
            default: null,
            displayName: '弧度',
        },
    },

    onLoad: function () {
        this._radius = this.ring.width / 2;
        this._createStickSprite();

        if(this.touchType == Common.TouchType.DEFAULT) {
            this._initTouchEvent();
        } 
        else if(this.touchType == Common.TouchType.FOLLOW) {
            this._initTouchEvent();
            this.node.opacity = 0;
        }
    },

    update (dt) {
        switch (this.directionType)
        {
            case Common.DirectionType.ALL:   
                this._allDirectionsMove();
                break;
            default :
                break;
        }
    },

    //全方向移动
    _allDirectionsMove () {
        this.player.node.x += Math.cos(this._angle * (Math.PI/180)) * this.player.moveSpeed;
        this.player.node.y += Math.sin(this._angle * (Math.PI/180)) * this.player.moveSpeed;

        this._roleRotate();
    },

    // 旋转
    _roleRotate () {
        let degree = 90 - this._angle;
        this.player.node.rotation = degree;
    },

    _createStickSprite: function()
    {
        //调整摇杆的位置
        this.ring.setPosition(this.stickX, this.stickY);
        this.dot.setPosition(this.stickX, this.stickY);
    },

    _initTouchEvent: function()
    {
        let self = this;

        self.node.on(cc.Node.EventType.TOUCH_START, self._touchStartEvent, self);
        self.node.on(cc.Node.EventType.TOUCH_MOVE, self._touchMoveEvent, self);

        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, self._touchEndEvent,self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, self._touchEndEvent,self);

    },

    _touchStartEvent: function(event) {
        this.player.isStop = false;
        
        // 记录触摸的世界坐标，给touch move使用
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());

        if(this.touchType == Common.TouchType.DEFAULT) {
            this._stickPos = this.ring.getPosition();
            //触摸点与圆圈中心的距离
            let distance = cc.pDistance(touchPos,cc.p(0,0));
            let posX = this.ring.getPosition().x + touchPos.x;
            let posY = this.ring.getPosition().y + touchPos.y;
            //手指在圆圈内触摸,控杆跟随触摸点
            if(this._radius > distance)
            {
                this.dot.setPosition(cc.p(posX, posY));
                return true;
            }
            return false;
        }

        if(this.touchType == Common.TouchType.FOLLOW) {
            // 记录摇杆位置，给touch move使用
            this._stickPos = touchPos;
            this.node.opacity = 255;
            this._touchLocation = event.getLocation();
             // 更改摇杆的位置
            this.ring.setPosition(touchPos);
            this.dot.setPosition(touchPos);
        }
    },

    _touchMoveEvent: function(event) {

        if(this.touchType == Common.TouchType.FOLLOW) {
            // 如果touch start位置和touch move相同，禁止移动
            if (this._touchLocation.x == event.getLocation().x && this._touchLocation.y == event.getLocation().y){
                return false;
            }
        }
        
        // 以圆圈为锚点获取触摸坐标
        let touchPos = this.ring.convertToNodeSpaceAR(event.getLocation());
        let distance = cc.pDistance(touchPos,cc.p(0,0));

        // 由于摇杆的postion是以父节点为锚点，所以定位要加上touch start时的位置
        let posX = this._stickPos.x + touchPos.x;
        let posY = this._stickPos.y + touchPos.y;
        if(this._radius > distance) {
            this.dot.setPosition(cc.p(posX, posY));
        } else {
            //控杆永远保持在圈内，并在圈内跟随触摸更新角度
            var x = this._stickPos.x + Math.cos(cc.pToAngle( cc.pSub(cc.p(posX,posY), this.ring.getPosition() ))) * this._radius;
            var y = this._stickPos.y + Math.sin(cc.pToAngle( cc.pSub(cc.p(posX,posY), this.ring.getPosition() ))) * this._radius;
            this.dot.setPosition(cc.p(x, y));
        }
        //更新角度
        this._angle = cc.radiansToDegrees( cc.pToAngle( cc.pSub(cc.p(posX,posY), this.ring.getPosition())) )
        //设置实际速度
        this._setSpeed(cc.p(posX,posY));
    },

    _touchEndEvent: function(){
        this.dot.setPosition(this.ring.getPosition());
        if(this.touchType == Common.TouchType.FOLLOW) {
            this.node.opacity = 0;
        }
        this.player.isStop = true;
    },

    // methods

    //设置实际速度
    _setSpeed: function(point)
    {
        //触摸点和遥控杆中心的距离
        let distance = cc.pDistance(point, this.ring.getPosition());
        //如果半径
        if (distance < this._radius) {
            this.player.moveSpeed = this.player.normalSpeed;
        } else {
            this.player.moveSpeed = this.player.accelSpeed;
        }
    },
});
