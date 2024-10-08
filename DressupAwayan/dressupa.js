​//This program uses images to simulate an interactive dressup game.
//It allows users to click on items which will then jump to the 
//front of the screen via reordering of the array. Users can drag 
//clothing close to the body, where it will then snap into place
//in a smooth motion. When a shirt is snapped onto the body, a button
//will appear that allows the user to recolor the shirt (if clothing is 
//layered, only the top layer will be recolored). There is additional
//functionality for resetting the canvas and randomizing outfits.

//stores figure and clothing image links
var croquisLink = "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/figure.png";

var hairLinks = ["https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/transparent.png", 
                 "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/transparent.png", 
                 "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/transparent.png", 
                 "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/transparent.png", 
                ];

var shirtLinks = ["https://i.imgur.com/vNLNc6V.png", 
                 "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/sweater.png", 
                 "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/polo.png", 
                 "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/tshirt.png"
                ];

var pantsLinks = ["https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/dark.png", 
                 "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/blackpants.png", 
                 "https://i.imgur.com/mF21MeN.png", 
                  "https://file.garden/ZlwiKgzAvyz0wLRz/DressupAwayan/joggingpants.png"
                ];

var shoesLinks = ["https://i.imgur.com/EMbMtDy.png", 
                 "https://i.imgur.com/IZaU3Ls.png", 
                 "https://i.imgur.com/xa3Rrjs.png", 
                 "https://i.imgur.com/S8GJRGa.png"
                ];

//loads images for figure and clothing
var croquis;
var hair = [];
var shirt = [];
var pants = [];
var shoes = [];

//stores clothing objects
var blouse = [];
var bottom = [];
var feet = [];

//positions for figure and clothing
var bodyCenter = 120;
var headCenterY = 87;
var shirtCenter = 224;
var pantsCenter = 389;
var shoesCenter = 544;

//stores colors for clothing
var wheel = ["white", "red", "turquoise", "green"];
//image link for color wheel
var colorLink = "https://upload.wikimedia.org/wikipedia/commons/d/dc/Eight-colour-wheel-2D.png";
//stores color wheel image
var colorWheel;
//positions for wheel
var wheelX = 40;
var wheelY = 140;

//positions for random button
var randomX = 490;
var randomY = 580;

//positions for direction button
var infoX = 560;
var infoY = 580;

//counters for changing hair style and clothing color
var hairClick = 0;
var colorClick = 0;

//reset and random button color
var buttonColor = 255;

//indicate that pants and shoes are not being dragged
var dragBottom = false;
var dragFeet = false;

//array position of shirt on body
var wearing;

//display directions
var showInfo = false;
//------------------------------------------------------------------

//loads images into variables and arrays
function preload() {
    croquis = loadImage(croquisLink);
    colorWheel = loadImage(colorLink);
    for (var i = 0; i < hairLinks.length; i++) {
        hair[i] = loadImage(hairLinks[i]);
        shirt[i] = loadImage(shirtLinks[i]);
        pants[i] = loadImage(pantsLinks[i]);
        shoes[i] = loadImage(shoesLinks[i]);
    }
}


function setup() {
    createCanvas(600, 600);
    //calls function to make clothing objects and arrange on the page
    clothesSetup();
}


//fills shirt, shoes and pants arrays with objects containing images and positions
//serves as a reset function when mix() and reset() are called
function clothesSetup() {
    hairClick = 0;
    for (var i = 0; i < 4; i++) {
        blouse[i] = makeItem(shirt[i], width * 0.48 + 81 * i, 
                             height * 0.15 + 20 * i, shirtCenter);
        bottom[i] = makeItem(pants[i], width * 0.49 + 77 * i, 
                             height * 0.55 + 10 * i, pantsCenter);
        feet[i] = makeItem(shoes[i], width * 0.49 + 77 * i, 
                             height * 0.85 + 5 * i, shoesCenter);
    }
}


function draw() {
    background(206, 255, 181);
    imageMode(CENTER);

    //displays figure
    image(croquis, bodyCenter, height / 2, 225, 600);

    //displays clothing
    for (var i = 0; i < shirt.length; i++) {
        //draws current hair style
        image(hair[hairClick % 4], bodyCenter, headCenterY);
        //draws all pants, shirts and shoes
        bottom[i].draw();
        blouse[i].draw();
        feet[i].draw();

        //if shirt is on the body, store index and make color wheel appear
        if (blouse[i].x == bodyCenter) {
            drawWheel();
            wearing = i;
        }
    }

    //calls function to fit clothing on the figure
    snap(blouse);
    snap(bottom);
    snap(feet);

    //calls reset function
    reset();
    //calls direction function
    directions();

    //If the mouse is not being pressed, reset drag state to false
    //Note: this will be utilized in the mouseDragged function to prevent
    //multiple items from being "picked up" at once
    if (!mouseIsPressed) {
        dragBottom = false;
        dragFeet = false;
    }

    //draw random button
    drawButton("random", randomX, randomY, buttonColor);
    drawButton("directions", infoX, infoY, buttonColor);
}


function mousePressed() {
    //HAIR STYLE----------------------------------------------------
    //distance from mouse to head
    var dHair = dist(mouseX, mouseY, bodyCenter, headCenterY);

    //if hair is clicked, increase counter to display different style
    if (dHair < 60) hairClick++;

    //--------------------------------------------------------------

    var click = false; //tracks if a clothing item has been selected
    var selection; //stores type of selected item

    //SHIRT---------------------------------------------
    //cycle through shirt positions
    for (var i = 0; i < blouse.length; i++) { 
        var dBlouse = dist(mouseX, mouseY, blouse[i].x, blouse[i].y);
        //if shirt is clicked, store the array and index
        if (dBlouse < 75) {
            index = i;
            click = true;
            selection = blouse;
        }
    }

    //PANTS-------------------------------------------
    //cycle through pants positions
    for (var i = 0; i < bottom.length; i++) { 
        var dBottomX = abs(mouseX - bottom[i].x);
        var dBottomY = abs(mouseY - bottom[i].y);
        //if pants are clicked, store the array and index
        if (dBottomX < 60 && dBottomY < 150) {
            index = i;
            click = true;
            selection = bottom;
        }
    }

    //SHOES-------------------------------------------
    //cycle through shoes positions
    for (var i = 0; i < feet.length; i++) { 
        var dFeetX = abs(mouseX - feet[i].x);
        var dFeetY = abs(mouseY - feet[i].y);
        //if shoes is clicked, store the array and index
        if (dFeetX < 60 && dFeetY < 40) {
            index = i;
            click = true;
            selection = feet;
        }
    }

    //if an item is selected, display it on top of other items
    if (click) bringToFront(selection, index);  
    //---------------------------------------------------------------

    //RECOLORING-----------------------------------------
    //distance from mouse to button
    var dTint = dist(mouseX, mouseY, wheelX, wheelY);
    //if button is clicked, recolor item
    if (dTint < 20) recolor(3);

    //RANDOM OUTFIT--------------------------------------
    //distance from mouse to button
    var dRandomX = abs(randomX - mouseX);
    var dRandomY = abs(randomY - mouseY);

    //if button is clicked, assemble a random outfit
    if (dRandomX < 30 && dRandomY < 12) mix();

    //DIRECTIONS-----------------------------------------
    //distance from mouse to button
    var dInfoX = abs(infoX - mouseX);
    var dInfoY = abs(infoY - mouseY);

    //if button is clicked, display info
    if (dInfoX < 30 && dInfoY < 12) showInfo = !showInfo;
}


//if an item is selected, push it to the end of the array
//and remove it from its original position.
//Reordering the array allows item to displayed "on top"
function bringToFront(item, index) {
    item.push(item[index]);
    item.splice(index, 1);   
}


function mouseDragged() {
    //distance between mouse and "most recent" shirt, pants and shoe positions
    var dBlouse = dist(mouseX, mouseY, blouse[3].x, blouse[3].y);
    var dBottomX = abs(mouseX - bottom[3].x);
    var dBottomY = abs(mouseY - bottom[3].y);
    var dFeetX = abs(mouseX - feet[3].x);
    var dFeetY = abs(mouseY - feet[3].y);

    //If mouse is on the shirt and no pants or shoes are 
    //already selected, call function to allow dragging.
    //Establishing items as "true" when they are selected prevents
    //other items from being picked up while the mouse is dragged.
    if (dBlouse < 80 && !dragBottom && !dragFeet) {
        dragItem(blouse, 30);
    }
        // if only shoes are selected, allow them to be dragged
    else if (dFeetX < 60 && dFeetY < 50 && !dragBottom) {
        dragFeet = true;
        dragItem(feet, 0);
    }
    // if only pants are selected, allow them to be dragged
    else if (dBottomX < 60 && dBottomY < 140 && !dragFeet) {
        dragBottom = true;
        dragItem(bottom, 90);
    }
}


//allows selected item to be dragged
function dragItem(item, offset) {
    item[3].x = mouseX;
    item[3].y = mouseY + offset;
}


//snaps items near the body to their fixed positions
function snap(item) {
    //measures distance from item to target position
    var dx = bodyCenter - item[3].x;
    var dy = item[3].center - item[3].y;
    var D = sqrt(dx*dx + dy*dy);

    //when an item is near its target and the mouse is released,
    //snap it into position with a smooth motion
    if (D < 50 && !mouseIsPressed) {
        dirX = dx / max(1, D);
        dirY = dy / max(1, D);
        item[3].x += dirX;
        item[3].y += dirY;
    }
}


//BUTTON FUNCTIONS-------------------------------------

//draw button with label, position, and color parameters
function drawButton(type, x, y, col) {
    //button
    stroke(0);
    strokeWeight(2);
    fill(col);
    rectMode(CENTER);
    rect(x, y, 60, 24, 10);
    //text
    noStroke();
    fill("MAGENTA");
    textAlign(CENTER);
    text(type, x, y + 5);
}


//provides button to reset clothes to original position
function reset() {
    //button position
    var buttonX = 420;
    var buttonY = 580;

    //distance from mouse to center of button
    var dResetX = abs(buttonX - mouseX);
    var dResetY = abs(buttonY - mouseY);

    //if button is clicked, recall setup and draw "clicked" button
    if (mouseIsPressed && dResetX < 30 && dResetY < 12) {
        drawButton("reset", buttonX, buttonY, buttonColor - 80);
        clothesSetup();
    }
    //else, draw button in unclicked state
    else drawButton("reset", buttonX, buttonY, buttonColor);
}


//draw color wheel with an outline
function drawWheel() {
    image(colorWheel, wheelX, wheelY, 40, 40);
    noFill();
    stroke(0);
    strokeWeight(2);
    ellipse(wheelX, wheelY, 37, 37); 
}


//recolors shirt when wheel is clicked
function recolor() {
    //increase color counter and assign tint
    colorClick++;
    blouse[wearing].tint = wheel[colorClick % 4];
}


//provides button to assemble a random outfit
function mix() {
    //selects a random shirt, pants and shoe pairing
    var randBlouse = round(random(3));
    var randBottom = round(random(3));
    var randShoes = round(random(3));

    //draw button in "clicked" mode
    //call setup to remove any clothes on the body
    clothesSetup();
    //selects random hair style
    hairClick = round(random(3));

    //positions random shirt on the body
    blouse[randBlouse].x = bodyCenter;
    blouse[randBlouse].y = shirtCenter;
    //positions random pants on the body
    bottom[randBottom].x = bodyCenter;
    bottom[randBottom].y = pantsCenter;
    //positions random shoes on the body
    feet[randShoes].x = bodyCenter;
    feet[randShoes].y = shoesCenter; 
}


//displays directions for game
function directions() {
    if (showInfo) {
        stroke(0);
        strokeWeight(10);
        fill(255);
        rect(width / 2, height / 2, 400, 150, 30);
        noStroke();
        fill("MAGENTA");
        text("Drag and drop the clothes to dress up Arjay", width / 2, height / 2 - 20);
        text("Click the color wheel to recolor shirts", width / 2, height / 2 + 20);
        text("(Press any key to escape)", width / 2, height / 2 + 60);
    }
    //exits directions when a key is pressed
    if (keyIsPressed) showInfo = false;
}

//---------------------------------------------------------------------

//OBJECT CREATION AND CLOTHING DISPLAY

//Creates objects with parameters for
//image, initial position, and center relative to the body.
function makeItem(ipic, ix, iy, icenter) {
    return {pic: ipic, x: ix, y: iy, 
            center: icenter, 
            tint: 255,
            draw: drawItem,
            };
}


//draw image and recolor with specified tint
function drawItem() {
    tint(this.tint);
    image(this.pic, this.x, this.y);
    noTint();
}



