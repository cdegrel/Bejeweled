(function($){
    const GRID_SIZE = 8,
        COLORS = {
            0:"white",
            1:"green",
            2:"orange",
            3:"purple",
            4:"red",
            5:"yellow",
            6:"blue",
            7:"black"
        };
        URL = "app/score.php";

    var canvas, ctx, bejeweled, images, grille, over
        selectPosX = undefined,
        selectPosY = undefined;

    var progress = $('progress#progress'),
        interval;

    $(document).ready(function(){
        canvas = document.querySelector('canvas#bejeweled');
        ctx = canvas.getContext('2d');
        setInterval(drawProgress, 3000);

        initGame();
    });

    /**
     * Constructeurs
     */

    function Bejeweled(){
        this.score = 0;
        this.level = 1;
        this.tries = 15;
        this.time = 50;
        this.pause = true;
    }

    function Cellule(image, color){
        this.image = image;
        this.color = color;
    }

    /**
     * Initialisation
     */

    function initGame(){
        bejeweled = new Bejeweled();
        ctx.clearRect(0,0,1200,800);
        canvas.addEventListener("mousedown", clickCeil);

        loadImages(8);
    }

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

    function initGrid(){
        var row, random;
        grille = [[]];

        grille.length = 0;
        for(var x=0; x<GRID_SIZE; x++){
            row = [];
            grille.push(row);

            for(var y=0; y<GRID_SIZE; y++){
                random = Math.floor(Math.random()*8);
                if (x > 2 && y > 2) {
                    grille[x][y] = new Cellule(images[random], COLORS[random]);
                    while ((grille[x][y].color == (grille[x - 1][y].color)
                    && grille[x][y].color == (grille[x - 2][y].color)
                    || grille[x][y].color == (grille[x][y - 1].color)
                    && grille[x][y].color == (grille[x][y - 2].color))) {
                        random = Math.floor(Math.random()*8);
                        grille[x][y] = new Cellule(images[random], COLORS[random]);
                    }
                }
                if (x <= 2 && y >= 2){
                    random = Math.floor(Math.random()*8);
                    grille[x][y] = new Cellule(images[random], COLORS[random]);
                    while (grille[x][y].color == (grille[x][y - 1].color) && grille[x][y].color == (grille[x][y - 2].color)){
                        random = Math.floor(Math.random()*8);
                        grille[x][y] = new Cellule(images[random], COLORS[random]);
                    }
                }
                if (x >= 2 && y <= 2){
                    random = Math.floor(Math.random()*8);
                    grille[x][y] = new Cellule(images[random], COLORS[random]);
                    while (grille[x][y].color == (grille[x - 1][y].color) && grille[x][y].color == (grille[x - 2][y].color)){
                        random = Math.floor(Math.random()*8);
                        grille[x][y] = new Cellule(images[random], COLORS[random]);
                    }
                }
                if(x < 2 && y < 2){
                    random = Math.floor(Math.random()*8);
                    grille[x][y] = new Cellule(images[random], COLORS[random]);
                }
            }
        }

        drawGrid();
        drawScore();
        drawLevel();
        drawTries();
    }

    /**
     * Evénement
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
                return false;
            }
        }
    }

    function clickOver(e){
        var pos = getMousePosition(e,canvas);
        posX = pos[0], posY = pos[1];

        if(posX >= 478 && posX <= 730 && posY >= 686 && posY <= 733){
            playPressButton();
            canvas.removeEventListener("mousedown",clickOver);
            initGame();
        }
    }

    function swapCeil(posX, posY){
        var tmp = grille[selectPosX][selectPosY];
        grille[selectPosX][selectPosY] = grille[posX][posY];
        grille[posX][posY] = tmp;
        drawSwapCeil(posX,posY);
    }

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
     * Update
     */

    function updateScore(n){
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
     * Alignement
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
                    updateScore(compteur);
                    compteur = 1;
                    verifOk = true;
                }else{
                    compteur = 1;
                }
                if(compteur >= 3 && y == 7){
                    for(var j=0; j<compteur; j++){
                        grille[x][y-j-1] = undefined;
                        ctx.clearRect(x*100+10,(y-j)*100+10,80,80);
                    }
                    updateScore(compteur);
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
                    updateScore(compteur);
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
                    updateScore(compteur);
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
     * Gravité
     */

    function dropGems(){
        for(var x=7; x>=0; x--)
            for(var y=7; y>=0; y--)
                if(grille[x][y] == undefined)
                    grille[x][y] = gravite(x,y);
    }

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
     * Dessin
     */

    function drawGrid(){
        ctx.clearRect(0,0,800,800);
        for(var x=0; x<GRID_SIZE; x++)
            for(var y=0; y<GRID_SIZE; y++)
                ctx.drawImage(grille[x][y].image, x*100+10, y*100+10, 80, 80);
    }

    function drawSwapCeil(posX, posY){
        ctx.clearRect(selectPosX*100+10,selectPosY*100+10,80,80);
        ctx.clearRect(posX*100+10,posY*100+10,80,80);
        ctx.drawImage(grille[posX][posY].image,posX*100+10,posY*100+10,80,80);
        ctx.drawImage(grille[selectPosX][selectPosY].image,selectPosX*100+10,selectPosY*100+10,80,80);
    }

    function drawCeil(random, x, y){
        ctx.drawImage(images[random], x*100+10, y*100+10, 80, 80);
    }

    function drawSelect(){
        var select = new Image();
        select.onload = function(){
            ctx.drawImage(select, selectPosX*100, selectPosY*100,100,100);
        };
        select.src = "app/images/select.png";
    }

    function drawScore(){
        ctx.clearRect(895,75,500,60);
        ctx.font = "25px Verdana";
        ctx.strokeStyle = "#FFF";
        ctx.strokeText(bejeweled.score,999,132);
        ctx.textAlign = "center";
    }

    function drawLevel(){
    	ctx.clearRect(970,150,50,50);
        ctx.font = "23px Verdana";
        ctx.fillStyle = "#FFF";
        ctx.fillText(bejeweled.level,1000,171);
        ctx.textAlign = "center";
    }

    function drawTries(){
        ctx.clearRect(850,250,300,150);
        ctx.font = "23px Verdana";
        ctx.strokeStyle = "#fff";
        ctx.strokeText("Tentative(s) : "+bejeweled.tries,1000,300);
        ctx.textAlign = "center";
    }

    function drawProgress(){
    	if(!bejeweled.pause){
    		if(bejeweled.time <= 0){
    			bejeweled.pause = true;
    			stopPartie();
    		}else if(bejeweled.time >= 100){
    			bejeweled.level++;
                playLevelUp();
                drawLevel();
    			bejeweled.time = 50;
    		}else{
    			bejeweled.time -= bejeweled.level;
    		}
    	}
    	$('#progress').val(bejeweled.time);
    }

    function drawMenu(){
        ctx.clearRect(0,0,800,800);
        var menu = new Image();
        menu.onload = function(){
              ctx.drawImage(menu, 90,140);
        };
        menu.src = "app/images/menu.png";
    }

    function drawOver(){
        ctx.drawImage(over,100,10,1000,790);

        ctx.fillStyle = "#fff";
        ctx.fillText(bejeweled.level,550,390);
        ctx.fillText(bejeweled.score,550,420);
        ctx.textAlign = "center";
    }

    /**
     * Sons
     */
    
    function playLevelUp(){
        $('audio#level-up').trigger('play');
    }

    function playTries(){
        $('audio#tries-down').trigger('play');
    }

    function playDestroyGems(){
        var destroyGems = $('audio#destroyGems');
        destroyGems.trigger('currentTime',0);
        destroyGems.trigger('play');
    }

    function playDestroyGems4(){
        var destroyGems = $('audio#destroyGems4');
        destroyGems.trigger('currentTime',0);
        destroyGems.trigger('play');
    }

    function playPressButton(){
        $('audio#pressButton').trigger('play');
    }

    function playOver(){
        $('audio#over').trigger('play');
    }

    /**
     * Coordonnées
     */

    function resetCeil(){
        selectPosX = undefined;
        selectPosY = undefined;
    }

    var getCoordonneCeil = function(posX,posY){
        if(posX < 100) var x=0;
        else if(posX > 1000) x = parseInt(posX.toString().substr(0,2));
        else x = parseInt(posX.toString().substr(0,1));

        if(posY < 100) var y=0;
        else if(posY > 1000) y = parseInt(posY.toString().substr(0,2));
        else y = parseInt(posY.toString().substr(0,1));

        return [x,y];
    }

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

    var getMousePosition = function(e,canvasElement){
        OFFSET = getOffsetPosition(canvasElement);

        mouseX = (e.pageX || (e.clientX + document.body.scrollLeft +  document.documentElement.scrollLeft)) - OFFSET[0];
        mouseY = (e.pageY || (e.clientY + document.body.scrollTop + document.documentElement.scrollTop)) - OFFSET[1];

        return [mouseX,mouseY];
    }

    /**
     * Requête
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