import Phaser = require('phaser');

module Game {
    "use strict";
    export module Application {

        let current = 0;

        var height : any;
        var width : any;
        var game: Phaser.Game;

        export function initialize() {
            this.height = (window).window.innerHeight;
            this.width = (window).window.innerWidth;
            this.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, 'game-canvas', { preload: preload.bind(this), update: update.bind(this), create: create.bind(this) },true);

            //Triggered when the project is on a mobile device and cordova is included.
            document.addEventListener('deviceready', onDeviceReady.bind(this), false);
        }

        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            // document.addEventListener('pause', onPause, false);
            // document.addEventListener('resume', onResume, false);
            
        }

        function preload() 
        {

        }
        

        function create() 
        {

         }

        function update() 
        {

        }

    }

    window.onload = () => {
        Application.initialize();
    }
}
