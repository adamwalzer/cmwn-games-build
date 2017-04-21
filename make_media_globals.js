(function (gameName) {
    // remove window.MEDIA once no games reference it
    var MEDIA = window.MEDIA = {
        BASE: ENVIRONMENT.MEDIA
    };

    const GAME = 'games/';
    const EFFECT = 'sound-assets/effects/';
    const VO = 'sound-assets/vos/';
    const IMAGE = 'image-assets/';
    const SPRITE = 'sprites-animations/';
    const FRAME = 'frames/';
    const VIDEO = 'videos/';
    const FONT = 'fonts/';
    const SHARED = 'shared/';
    const MOCK_GAME = 'mock-game/';

    MEDIA.FONT = MEDIA.BASE + FONT;
    MEDIA.SHARED = MEDIA.BASE + GAME + SHARED;

    MEDIA.GAME = MEDIA.BASE + GAME + gameName + '/';
    MEDIA.EFFECT = MEDIA.GAME + EFFECT;
    MEDIA.VO = MEDIA.GAME + VO;
    MEDIA.IMAGE = MEDIA.GAME + IMAGE;
    MEDIA.SPRITE = MEDIA.GAME + SPRITE;
    MEDIA.FRAME = MEDIA.GAME + FRAME;
    MEDIA.VIDEO = MEDIA.GAME + VIDEO;
    MEDIA.FONT = MEDIA.GAME + FONT;

    MEDIA.MOCK = {};
    MEDIA.MOCK.GAME = MEDIA.BASE + GAME + MOCK_GAME;
    MEDIA.MOCK.EFFECT = MEDIA.MOCK.GAME + EFFECT;
    MEDIA.MOCK.VO = MEDIA.MOCK.GAME + VO;
    MEDIA.MOCK.IMAGE = MEDIA.MOCK.GAME + IMAGE;
    MEDIA.MOCK.SPRITE = MEDIA.MOCK.GAME + SPRITE;
    MEDIA.MOCK.FRAME = MEDIA.MOCK.GAME + FRAME;
    MEDIA.MOCK.VIDEO = MEDIA.MOCK.GAME + VIDEO;
    MEDIA.MOCK.FONT = MEDIA.MOCK.GAME + FONT;

    window.CMWN.MEDIA = MEDIA;
}(window.CMWN.gameFolder));
