/* eslint-disable no-undef */
pl.game.component('screen-ios-splash', function () {

    this.on('ready', function (_e) {
        if (!this.is(_e.target)) return;

        if (this.game && this.game.title.state('READY')) {
            this.splash();
        }
    });

    this.splash = function () {
        this.close(this.game.loader);

        if (this.game.hasClass('iOS')) {
            this.open();
            this.ball.delay(0, this.ball.open);
        } else {
            this.game.title.open();
        }
    };

    this.next = function () {
        var nextScreen = this.proto();

        if (nextScreen) {
            this.screen.leave();
            nextScreen.open();
            this.game.audio.sfx.button.play();
        }

        return nextScreen;
    };

    this.complete = function () {
        this.game.audio.sfx.play('screenComplete');
        return this.proto();
    };

    this.startGame = function () {
        if (!this.hasClass('FINISHED')) return;
        this.game.addClass('STARTED');
        this.delay('2.5s', function () {
            this.next();
        });
    };

    this.on('animationend', function (_e) {
        if (!this.ball.is(_e.target)) return;
        this.addClass('FINISHED');
    });
});
/* eslint-enable no-undef */
