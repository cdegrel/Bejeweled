/**
 * @description [Jeu de type Bejeweled via l'élément Canvas d'HTML5]
 * @author [Cédric Degrelle] <cedric.degrelle-dev@hotmail.com>
 * @version [1.3]
 * @date [23 Mars 2016]
 */

(function($){
    const URL = "app/score.php",
        COLORS = {
            0:"white",
            1:"green",
            2:"orange",
            3:"purple",
            4:"red",
            5:"yellow",
            6:"blue",
            7:"black"
        },
        CANVAS_WIDTH = 1200, CANVAS_HEIGHT = 800, GRILLE_SIZE = 800, GRID_SIZE = GRILLE_SIZE/100;

    var canvas, ctx, bejeweled, images, grille, over
        selectPosX = undefined,
        selectPosY = undefined;

    $(document).ready(function(){
        canvas = document.querySelector('canvas#bejeweled');
        ctx = canvas.getContext('2d');
        setInterval(drawProgress, 3000);
        
        initGame();
    });


    function Bejeweled(){
        this.score = 0;
        this.level = 1;
        this.tries = 5;
        this.time  = 50;
        this.pause = true;
    }

    function Cellule(image, color){
        this.image = image;
        this.color = color;
    }

    /**
     * [initGame Initialise la partie]
     */
    function initGame(){
        bejeweled = new Bejeweled();
        $('#progress').val(bejeweled.time);
        ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        canvas.addEventListener("mousedown", clickCeil);

        loadImages(8);
    }

    /**
     * [loadImages Charge toute les images nécessaire avant d'initialiser la grille]
     * @param  {[Integer]} nbImg
     */
    function loadImages(nbImg){
        images = [];

        over = new Image();
        over.src = "app/images/over.png";

        for(var i=0; i<nbImg; i++){
            var gems = new Image();
            gems.src = "app/images/gems"+i+".png";
            gems.onload = function() {
                images.push(this);
                if(--nbImg==0) initGrid();
            };
        }
    }

    /**
     * [initGrid Initialise la grille et dessine le jeu]
     */
    function initGrid(){
        var row, random;
        grille = [[]];

        grille.length = 0;
        for(var x=0; x<GRID_SIZE; x++){
            row = [];
            grille.push(row);

            for(var y=0; y<GRID_SIZE; y++){
                do{
                    var random = Math.floor(Math.random()*8);
                    grille[x][y] = new Cellule(images[random], COLORS[random]);
                    var test = testInitGrid(x, y);
                }while(test);
            }
        }

        drawGrid();
        drawScore();
        drawLevel();
        drawTries();
    }

    /**
     * [testInitGrid Test l'alignement de 3 cellules à l'initialisation]
     * @param  {[Integer]} x
     * @param  {[Integer]} y
     * @return {[Boolean]}
     */
    function testInitGrid(x, y){
        var nbrVertical = 0, nbrHorizontal = 0;

        if(x >= 2)
            for(var i=x-1; i>-1 && i>x-3; i--)
                if(Object.is(grille[x][y].color, grille[i][y].color))
                    nbrVertical++;

        if(y >= 2)
            for(var j=y-1; j>-1 && j>y-3; j--)
                if(Object.is(grille[x][y].color, grille[x][j].color))
                    nbrHorizontal++;

        if(nbrVertical === 2 || nbrHorizontal === 2) return true;

        return false;
    }

    /**
     * [clickCeil Ecoute les cliques sur le canvas]
     * @param  {[EventListener]} e
     */
    function clickCeil(e){
        var coord = getMousePosition(e,canvas);
        if(coord[0] >= 875 && coord[0] <= 1130 && coord[1] >= 700 && coord[1] <= 755){
            playPressButton();
            bejeweled.pause = true;
            canvas.removeEventListener("mousedown",clickCeil);
            canvas.addEventListener("mousedown",clickMenu);
            drawMenu();
        }

        var pos = getCoordonneCeil(coord[0],coord[1]);
        posX = pos[0], posY = pos[1];

        if(posX < 8){
            bejeweled.pause = false;
            if(selectPosX == undefined && selectPosY == undefined){
                selectPosX = posX, selectPosY = posY;
                drawSelect();
            }else{
                if(selectPosX+1 == posX && selectPosY == posY || selectPosX-1 == posX && selectPosY == posY || selectPosX == posX && selectPosY+1 == posY || selectPosX == posX && selectPosY-1 == posY){
                    swapCeil(posX,posY);
                    if(!verifAlignement()){
                        swapCeil(posX, posY);
                        bejeweled.tries--;
                        drawTries();
                        playTries();
                        if(bejeweled.tries == 0)
                            stopPartie();
                    }
                    resetCeil();
                    drawGrid();
                }else{
                    resetCeil();
                    drawGrid();
                    bejeweled.tries--;
                    drawTries();
                    playTries();
                    if(bejeweled.tries == 0)
                        stopPartie();
                }
            }
        }
    }

    /**
     * [clickMenu Ecoute les cliques sur le menu]
     * @param  {[EventListener]} e
     */
    function clickMenu(e){
        var pos = getMousePosition(e,canvas);

        posX = pos[0], posY = pos[1];
        // Reprendre
        if(posX >= 200 && posX <= 614 && posY >= 544 && posY <= 595){
            playPressButton();
            bejeweled.pause = false;
            canvas.removeEventListener("mousedown",clickMenu);
            canvas.addEventListener("mousedown",clickCeil);
            drawGrid();
        }

        if(posY >= 460 && posY <= 510){
            // New
            if(posX >= 200 && posX <= 390){
                playPressButton();
                canvas.removeEventListener("mousedown",clickMenu);
                initGame();
            }

            // Scores
            if(posX >= 428 && posX <= 615){
                playPressButton();
                var width = 480, height = 200,
                    left = (document.body.clientWidth-width)/2,
                    top = (document.body.clientHeight-height)/2;
                window.open("app/views/score.html", 'score', 'menubar=no, scrollbar=no, top='+top+', left='+left+', width='+width+', height='+height);
            }
        }
    }

    /**
     * [clickOver Ecoute les cliques sur le menu de fin de partie]
     * @param  {[EventListener]} e
     */
    function clickOver(e){
        var pos = getMousePosition(e,canvas);
        posX = pos[0], posY = pos[1];

        if(posX >= 478 && posX <= 730 && posY >= 686 && posY <= 733){
            playPressButton();
            canvas.removeEventListener("mousedown",clickOver);
            initGame();
        }
    }

    /**
     * [swapCeil Inverse deux cellules entre elles]
     * @param  {[Integer]} posX
     * @param  {[Integer]} posY
     */
    function swapCeil(posX, posY){
        var tmp = grille[selectPosX][selectPosY];
        grille[selectPosX][selectPosY] = grille[posX][posY];
        grille[posX][posY] = tmp;
        drawSwapCeil(posX,posY);
    }

    /**
     * [stopPartie Stop la partie et affiche les statistiques]
     */
    function stopPartie(){
        playOver();
        bejeweled.pause = true;
        canvas.removeEventListener("mousedown",clickCeil);
        canvas.addEventListener("mousedown",clickOver);
        drawOver();
        var pseudo = prompt('Votre pseudo');
        updateScores(pseudo);
    }

    /**
     * [updatePartie Met à jour les variables du jeu]
     * @param  {[Integer]} n
     */
    function updatePartie(n){
        switch(n){
            case 3:
                playDestroyGems();
                bejeweled.score += 100*bejeweled.level;
                bejeweled.time += 5;
                drawScore();
                break;
            case 4:
                playDestroyGems4();
                bejeweled.score += 300*bejeweled.level;
                bejeweled.time += 10;
                drawScore(bejeweled.score);
                break;
            case 5:
                playDestroyGems4();
                bejeweled.score += 1000*bejeweled.level;
                bejeweled.time += 25;
                drawScore(bejeweled.score);
                break;
        }
    }

    /**
     * [verifAlignement Vérifie en vertical puis en horizontal si 3 ou plusieurs cellules sont identique]
     * @return {[Boolean]}
     */
    function verifAlignement(){
        var verifOk = false,
            compteur = undefined;

        /* Vertical */
        for(var x=0; x<GRID_SIZE; x++){
            compteur = 1;
            for(var y=1; y<GRID_SIZE; y++){
                if(grille[x][y].color == grille[x][y-1].color && grille[x][y].color != undefined) {
                    compteur++;
                }else if(compteur >= 3){
                    for(var i=0; i<compteur; i++){

                        grille[x][y-i-1] = undefined;
                        ctx.clearRect(x*100+10,(y-i-1)*100+10,80,80);
                    }
                    updatePartie(compteur);
                    compteur = 1;
                    verifOk = true;
                }else{
                    compteur = 1;
                }
                if(compteur >= 3 && y == 7){
                    for(var j=0; j<compteur; j++){
                        grille[x][y-j] = undefined;
                        ctx.clearRect(x*100+10,(y-j)*100+10,80,80);
                    }
                    updatePartie(compteur);
                    compteur = 1;
                    verifOk = true;
                }
            }
        }
        if(verifOk) dropGems();
        /* Horizontal */
        for(var y=0; y<GRID_SIZE; y++){
            compteur = 1;
            for(var x=1; x<GRID_SIZE; x++){
                if(grille[x][y].color == grille[x-1][y].color && grille[x][y].color != undefined){
                    compteur++;
                }else if(compteur >= 3){
                    for(var i=0; i<compteur; i++){
                        grille[x-i-1][y] = undefined;
                        ctx.clearRect((x-i-1)*100+10,y*100+10,80,80);
                    }
                    updatePartie(compteur);
                    compteur = 1;
                    verifOk = true;
                }else{
                    compteur = 1;
                }
                if(compteur >= 3 && x == 7){
                    for(var j=0; j<compteur; j++){
                        grille[x-j][y] = undefined;
                        ctx.clearRect((x-j)*100+10,y*100+10,80,80);
                    }
                    updatePartie(compteur);
                    compteur = 1;
                    verifOk = true;
                }
            }
        }

        if(verifOk){
            dropGems();
            verifAlignement();
        }

        $('#progress').val(bejeweled.time);
        return verifOk; 
    }

    /**
     * [dropGems Parcour la grille à la recherche de cellule de type undefined]
     */
    function dropGems(){
        for(var x=7; x>=0; x--)
            for(var y=7; y>=0; y--)
                if(grille[x][y] == undefined)
                    grille[x][y] = gravite(x,y);
    }

    /**
     * [gravite Créer de nouvelles cellules tous en gardant celle du dessus]
     * @param  {[Integer]} x
     * @param  {[Integer]} y
     * @return {[Cellule]}
     */
    function gravite(x,y){
        if(y == 0){
            var random = Math.floor(Math.random()*8);
            drawCeil(random, x, y);
            return new Cellule(images[random], COLORS[random]);
        }else{
            if(grille[x][y-1] == undefined){
                return gravite(x,y-1);
            }else{
                var tmp = grille[x][y-1];
                grille[x][y-1] = undefined;
                return new Cellule(tmp.image, tmp.color);
            }
        }
    }

    /**
     * [drawGrid Dessine la grille]
     */
    function drawGrid(){
        ctx.clearRect(0,0,GRILLE_SIZE,GRILLE_SIZE);
        for(var x=0; x<GRID_SIZE; x++)
            for(var y=0; y<GRID_SIZE; y++)
                ctx.drawImage(grille[x][y].image, x*100+10, y*100+10, 80, 80);
    }

    /**
     * [drawGrid Dessine l'inversement des cellules]
     * @param  {[Integer]} posX
     * @param  {[Integer]} posY
     */
    function drawSwapCeil(posX, posY){
        ctx.clearRect(selectPosX*100+10,selectPosY*100+10,80,80);
        ctx.clearRect(posX*100+10,posY*100+10,80,80);
        ctx.drawImage(grille[posX][posY].image,posX*100+10,posY*100+10,80,80);
        ctx.drawImage(grille[selectPosX][selectPosY].image,selectPosX*100+10,selectPosY*100+10,80,80);
    }

    /**
     * [drawCeil Dessine une cellule]
     * @param  {[Random]} random
     * @param  {[Integer]} x
     * @param  {[Integer]} y
     */
    function drawCeil(random, x, y){
        ctx.drawImage(images[random], x*100+10, y*100+10, 80, 80);
    }

    /**
     * [drawSelect Dessine la sélection d'une cellule]
     */
    function drawSelect(){
        var select = new Image();
        select.onload = function(){
            ctx.drawImage(select, selectPosX*100, selectPosY*100,100,100);
        };
        select.src = "app/images/select.png";
    }

    /**
     * [drawScore Dessine le score]
     */
    function drawScore(){
        ctx.clearRect(895,75,500,60);
        ctx.font = "25px Verdana";
        ctx.strokeStyle = "#FFF";
        ctx.strokeText(bejeweled.score,999,132);
        ctx.textAlign = "center";
    }

    /**
     * [drawLevel Dessine le level]
     */
    function drawLevel(){
    	ctx.clearRect(970,150,50,50);
        ctx.font = "23px Verdana";
        ctx.fillStyle = "#FFF";
        ctx.fillText(bejeweled.level,1000,171);
        ctx.textAlign = "center";
    }

    /**
     * [drawLevel Dessine les essais]
     */
    function drawTries(){
        ctx.clearRect(850,250,300,150);
        ctx.font = "23px Verdana";
        ctx.strokeStyle = "#fff";
        ctx.strokeText(bejeweled.tries != 1 ? "Tentatives : "+bejeweled.tries : "Tentative : " +bejeweled.tries,1000,300);
        ctx.textAlign = "center";
    }

    /**
     * [drawLevel Dessine le progressBar]
     */
    function drawProgress(){
        if(bejeweled.pause) return;

        if(bejeweled.time >= 100){
            bejeweled.time = 50;
            bejeweled.level++;
            playLevelUp();
            drawLevel();
            initGrid();
        }else{
            bejeweled.time -= bejeweled.level;
        }
        $('#progress').val(bejeweled.time);

        if(bejeweled.time <= 0){
            stopPartie()
        }
    }

    /**
     * [drawLevel Dessine le menu]
     */
    function drawMenu(){
        ctx.clearRect(0,0,GRILLE_SIZE,GRILLE_SIZE);
        var menu = new Image();
        menu.onload = function(){
              ctx.drawImage(menu, 90,140);
        };
        menu.src = "app/images/menu.png";
    }

    /**
     * [drawLevel Dessine le menu de fin de partie]
     */
    function drawOver(){
        ctx.drawImage(over,100,10,1000,790);

        ctx.fillStyle = "#fff";
        ctx.fillText(bejeweled.level,550,390);
        ctx.fillText(bejeweled.score,550,420);
        ctx.textAlign = "center";
    }

    /**
     * [drawLevel Son level passé ]
     */
    function playLevelUp(){
        $('audio#level-up').trigger('play');
    }

    /**
     * [drawLevel Son erreur ]
     */
    function playTries(){
        $('audio#tries-down').trigger('play');
    }

    /**
     * [drawLevel Son destuction 3 cellules ]
     */
    function playDestroyGems(){
        var destroyGems = $('audio#destroyGems');
        destroyGems.trigger('currentTime',0);
        destroyGems.trigger('play');
    }

    /**
     * [drawLevel Son destuction >3 cellules ]
     */
    function playDestroyGems4(){
        var destroyGems = $('audio#destroyGems4');
        destroyGems.trigger('currentTime',0);
        destroyGems.trigger('play');
    }

    /**
     * [drawLevel Son bouton ]
     */
    function playPressButton(){
        $('audio#pressButton').trigger('play');
    }

    /**
     * [drawLevel Son fin de partie ]
     */
    function playOver(){
        $('audio#over').trigger('play');
    }

    /**
     * [resetCeil Supprime les coordonnées cellule 1]
     */
    function resetCeil(){
    	console.log(grille);
        selectPosX = undefined;
        selectPosY = undefined;
    }

    /**
     * [getCoordonneCeil Coordonnées d'une cellule]
     * @param  {[Integer]} posX
     * @param  {[Integer]} posY
     * @return {[Integer]}
     */
    var getCoordonneCeil = function(posX,posY){
        if(posX < 100) var x=0;
        else if(posX > 1000) x = parseInt(posX.toString().substr(0,2));
        else x = parseInt(posX.toString().substr(0,1));

        if(posY < 100) var y=0;
        else if(posY > 1000) y = parseInt(posY.toString().substr(0,2));
        else y = parseInt(posY.toString().substr(0,1));

        return [x,y];
    }

    /**
     * [getOffsetPosition Coordonnées offset canvas]
     * @param  {[Canvas]} obj
     * @return {[Integer]}
     */
    var getOffsetPosition = function(obj){
        var offsetX = offsetY = 0;

        if (obj.offsetParent) {
            do {
                offsetX += obj.offsetLeft;
                offsetY += obj.offsetTop;
            } while(obj = obj.offsetParent);
        }
        return [offsetX,offsetY];
    }

    /**
     * [getMousePosition Coordonnée canvas]
     * @param  {[EventListener]} e
     * @param  {[Canvas]} canvasElement
     * @return {[Integer]}
     */
    var getMousePosition = function(e,canvasElement){
        OFFSET = getOffsetPosition(canvasElement);

        mouseX = (e.pageX || (e.clientX + document.body.scrollLeft +  document.documentElement.scrollLeft)) - OFFSET[0];
        mouseY = (e.pageY || (e.clientY + document.body.scrollTop + document.documentElement.scrollTop)) - OFFSET[1];

        return [mouseX,mouseY];
    }

    /**
     * [updateScores Mise à jour des scores dans la base de données]
     * @param  {[String]} pseudo
     */
    function updateScores(pseudo){
        $.post(
            URL, {action:"updateScores", score:bejeweled.score, pseudo:pseudo},
            function(data){
                var posY = 390;
                $(data).find('player').each(function(){
                    ctx.fillText($(this).find('rank').text(),635,posY);
                    ctx.fillText($(this).find('pseudo').text(),800,posY);
                    ctx.fillText($(this).find('score').text(),980,posY);
                    posY+=50;
                });
            },
            'xml'
        )
    }

})(jQuery);