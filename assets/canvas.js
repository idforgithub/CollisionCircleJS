let canvas = document.querySelector("canvas")

canvas.width = innerWidth
canvas.height = innerHeight

let context = canvas.getContext('2d')

let mouseVector = {
    x: undefined,
    y: undefined
}

addEventListener('mousemove', function (event) {
    mouseVector.x = event.x
    mouseVector.y = event.y
})

addEventListener('mouseout', function (event) {
    mouseVector.x = undefined
    mouseVector.y = undefined
})

class Circle{

    velocity = {
        x: undefined,
        y: undefined
    }

    //speedX = undefined
    //speedY = undefined

    tick = 1
    mass = 1

    constructor(x = 0, y = 0, radius = 0, color = 'black'){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color

        this.#fixPosition()
        this.randomSpeed(false)
    }

    #fixPosition(){
        this.x = (this.x + this.radius) > innerWidth ? (this.x - this.radius) : this.x
        this.x = (this.x - this.radius) < 0 ? (this.x + this.radius) : this.x
        
        this.y = (this.y + this.radius > innerHeight) ? (this.y - this.radius) : this.y
        this.y = (this.y - this.radius) < 0 ? (this.y + this.radius) : this.y
    }

    randomSpeed(isRandom = true){
        this.velocity.x = (isRandom ? Math.random().toFixed(1) : 1) * (Math.random() < 0.5 ? this.tick : -this.tick)
        this.velocity.y = (isRandom ? Math.random().toFixed(1) : 1) * (Math.random() < 0.5 ? this.tick : -this.tick)
    }

    number = undefined
    setNumber(setIndex = 0){
        this.number = setIndex
    }

    draw(){
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, Math.pow(Math.PI, 2))
        context.strokeStyle = this.color

        if(undefined != this.number){
            context.font = "10px Arial"
            context.fillText(""+this.number, this.x, this.y)
        }

        context.stroke()
        context.closePath()
    }

    circleArray = []
    setCollide(circles){
        this.circleArray = circles
    }

    collideUpdate(){
        if(this.circleArray.length != 0){
            this.circleArray.forEach(circleFromArray => {
                if(this !== circleFromArray){
                    const distance = distanceBetweenCircle(this, circleFromArray)
                    if(distance < 0){
                        //console.log("collide")
                        resolveCollision(this, circleFromArray)
                    }
                }
                
            })
        }
        this.update()
    }

    update(){
        if( this.x + this.radius > innerWidth || this.x - this.radius < 0)
            this.velocity.x = -this.velocity.x
        
        if( this.y + this.radius > innerHeight || this.y - this.radius < 0)
            this.velocity.y = -this.velocity.y
        
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }
}

function rotate(velocity = {x: undefined, y: undefined}, angle = undefined){
    return {
        x: (velocity.x * Math.cos(angle)) - (velocity.y * Math.sin(angle)),
        y: (velocity.x * Math.sin(angle)) - (velocity.y * Math.cos(angle)),
    }
}

function resolveCollision(circle1, circle2){
    const xVelocityDiff = circle1.velocity.x - circle2.velocity.x
    const yVelocityDiff = circle1.velocity.y - circle2.velocity.y

    const xDist = circle1.x - circle2.x
    const yDist = circle1.y - circle2.y

    if( xVelocityDiff * xDist + yVelocityDiff * yDist >= 0){
        const angle = -Math.atan2(circle2.y - circle1.y, circle2.x - circle1.x)

        const m1 = circle1.mass
        const m2 = circle2.mass

        const u1 = this.rotate(circle1.velocity, angle)
        const u2 = this.rotate(circle2.velocity, angle)

        const v1 = { 
            x: (u1.x * (m1 - m2) + ((m2 * 2) * u2.x)) / (m1 + m2),
            y: u1.y
        }
        const v2 = {
            x: (u2.x * (m2 - m1) + ((m1 * 2) * u1.x)) / (m1 + m2),
            y: u2.y
        }

        const finalVelolicy1 = rotate(v1, -angle)
        const finalVelolicy2 = rotate(v2, -angle)

        circle1.velocity.x = finalVelolicy1.x
        circle1.velocity.y = finalVelolicy1.y

        circle2.velocity.x = finalVelolicy2.x
        circle2.velocity.y = finalVelolicy2.y
    }
}

function strColorRGBA(red = 0, green = 0, blue = 0, alpha = 1.0) {
    return "rgba("+red+", "+green+", "+blue+", "+alpha+")"
}

function randomNumber(number1, number2, rounding = false) {
    return rounding ? 
        Math.floor( randomNumber(number1, number2, false)) : 
        Math.random() * (number2 - number1) + number1
}

const circles = []

function instantiate(target = 0, index = 0) {
    if(index < target){
        let rngRadius = randomNumber(20, 50)
        let circle = new Circle(
            randomNumber(rngRadius, innerWidth - rngRadius), 
            randomNumber(rngRadius, innerHeight - rngRadius),
            rngRadius, 
            "black"/*
            strColorRGBA(
                randomNumber(0, 255, true),
                randomNumber(0, 255, true),
                randomNumber(0, 255, true),
                randomNumber(0.2, 1.0),
            )
            */
        )
        circle.tick = randomNumber(5, 10)
        circle.randomSpeed()
        circle.setNumber(index)

        circles.push(checkElement(circle))
        circle.setCollide(circles)
        
        return instantiate(target, index+1)
    }
}

// if using recursive it will reach maximum callback!!!
function checkElement(circle) {
    if(circles.length == 0)
        return circle
    
    circles.forEach(circleFromArray => {
        const distance = distanceBetweenCircle(circle, circleFromArray)
        if(distance < 0){
            circle.x = randomNumber(circle.radius, innerWidth - circle.radius, true)
            circle.y = randomNumber(circle.radius, innerHeight - circle.radius, true)
            return checkElement(circle)
        }
    })
    return circle
}

function distanceBetweenCircle(circle1, circle2) {
    return calculateDistance(circle1.x, circle1.y, circle2.x, circle2.y) - Math.hypot(circle1.radius, circle2.radius) * 2
}

function calculateDistance(x1 = 0, y1 = 0, x2 = 0, y2 = 0){
    return Math.hypot(x2 - x1, y2 - y1)
}

function animation(){
    requestAnimationFrame(animation)
    context.clearRect(0, 0, canvas.width, canvas.height)

    circles.forEach(c => {
        c.collideUpdate()
    })
}

// target = (how much circle to instantiate)
instantiate(target = 5)
// run animation
animation()