cc.Class({
    extends: cc.Component,

    properties: {
        isStop: {
            default: true,
            displayName: '是否停止'
        },

        moveSpeed: {
            default: 0,
            displayName: '初始移动速度'
        },

        normalSpeed: {
            default: 1,
            displayName: '正常速度'
        },

        accelSpeed: {
            default: 2,
            displayName: '加速速度'
        },
    },

    // use this for initialization
    onLoad () {
        this.index = 0
        this.isStop = true;
    },


    // // called every frame, uncomment this function to activate update callback
    update (dt) {
        if (this.isStop) {
            if (this.moveSpeed > 0) {
                this.moveSpeed -= 0.01;
            } else {
                this.moveSpeed = 0;
            }
        }
    },
});
